<?php

declare(strict_types=1);

use App\Jobs\CreateShiprocketOrderJob;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

describe('GET /shipping/rates', function (): void {
    it('returns a standard option in dry run without calling Shiprocket', function (): void {
        config()->set('services.shiprocket.dry_run', true);
        Http::fake();

        $this->getJson('/api/v1/shipping/rates?pincode=400020')
            ->assertOk()
            ->assertJsonPath('data.dry_run', true)
            ->assertJsonPath('data.rates.0.courier_name', 'Standard Delivery');

        Http::assertNothingSent();
    });

    it('requires a six digit pincode', function (string $pincode): void {
        $this->getJson('/api/v1/shipping/rates?pincode='.$pincode)
            ->assertStatus(422)
            ->assertJsonValidationErrors('pincode');
    })->with(['123', '1234567', 'abcdef']);

    it('requires a pincode at all', function (): void {
        $this->getJson('/api/v1/shipping/rates')
            ->assertStatus(422)
            ->assertJsonValidationErrors('pincode');
    });

    it('falls back to standard delivery when the courier lookup fails', function (): void {
        // Live mode with credentials, but Shiprocket errors — checkout must not break.
        config()->set('services.shiprocket.dry_run', false);
        config()->set('services.shiprocket.email', 'ops@example.com');
        config()->set('services.shiprocket.password', 'secret');
        Http::fake(['*' => Http::response([], 500)]);

        $this->getJson('/api/v1/shipping/rates?pincode=400020')
            ->assertOk()
            ->assertJsonPath('data.rates.0.courier_name', 'Standard Delivery');
    });
});

describe('GET /orders/{orderNumber}/tracking', function (): void {
    beforeEach(fn () => config()->set('services.shiprocket.dry_run', true));

    it('404s for an unknown order', function (): void {
        $this->getJson('/api/v1/orders/ODS-NOPE/tracking')->assertNotFound();
    });

    it('reports not-yet-shipped when there is no AWB', function (): void {
        Order::factory()->create(['order_number' => 'ODS-NEW', 'awb_code' => null, 'user_id' => null]);

        $this->getJson('/api/v1/orders/ODS-NEW/tracking')
            ->assertOk()
            ->assertJsonPath('data.awbCode', null)
            ->assertJsonPath('data.currentStatus', 'Not yet shipped')
            ->assertJsonPath('data.checkpoints', []);
    });

    it('returns tracking for a shipped order', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-SHIPPED', 'awb_code' => 'AWB123',
            'courier_name' => 'Delhivery', 'user_id' => null,
        ]);

        $this->getJson('/api/v1/orders/ODS-SHIPPED/tracking')
            ->assertOk()
            ->assertJsonPath('data.awbCode', 'AWB123')
            ->assertJsonPath('data.courierName', 'Delhivery');
    });

    it('does not expose another customer order', function (): void {
        Order::factory()->for(User::factory())->create(['order_number' => 'ODS-THEIRS']);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/orders/ODS-THEIRS/tracking')->assertNotFound();
    });

    it('lets a guest track by reference', function (): void {
        Order::factory()->create(['order_number' => 'ODS-GUEST', 'user_id' => null]);

        $this->getJson('/api/v1/orders/ODS-GUEST/tracking')->assertOk();
    });
});

describe('POST /webhooks/shiprocket', function (): void {
    it('updates the order status from an AWB push', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-TRACK', 'awb_code' => 'AWB999',
            'status' => 'confirmed', 'user_id' => null,
        ]);

        $this->postJson('/api/v1/webhooks/shiprocket', [
            'awb' => 'AWB999', 'current_status' => 'Delivered',
        ])->assertOk();

        $order->refresh();

        expect($order->status)->toBe('delivered')
            ->and($order->shiprocket_status)->toBe('Delivered');
    });

    it('maps in-transit style statuses to shipped', function (string $status): void {
        $order = Order::factory()->create(['awb_code' => 'AWB1', 'status' => 'confirmed', 'user_id' => null]);

        $this->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB1', 'current_status' => $status])
            ->assertOk();

        expect($order->fresh()->status)->toBe('shipped');
    })->with(['Shipped', 'In Transit', 'Out for delivery']);

    it('ignores an unknown AWB', function (): void {
        $this->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'NOPE', 'current_status' => 'Delivered'])
            ->assertOk()
            ->assertJsonPath('message', 'Ignored.');
    });

    it('ignores a payload with no AWB', function (): void {
        $this->postJson('/api/v1/webhooks/shiprocket', ['current_status' => 'Delivered'])
            ->assertOk()
            ->assertJsonPath('message', 'Ignored.');
    });

    it('leaves the order status alone for an unrecognised status', function (): void {
        $order = Order::factory()->create(['awb_code' => 'AWB2', 'status' => 'confirmed', 'user_id' => null]);

        $this->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB2', 'current_status' => 'Label Generated'])
            ->assertOk();

        expect($order->fresh()->status)->toBe('confirmed');
    });
});

describe('fulfilment dispatch', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        config()->set('services.razorpay.secret', 'test_secret');
    });

    it('books a shipment once payment is verified', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-PAYOK', 'razorpay_order_id' => 'order_1',
            'payment_status' => 'pending', 'user_id' => null,
        ]);

        $this->postJson('/api/v1/orders/ODS-PAYOK/verify', [
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature' => hash_hmac('sha256', 'order_1|pay_1', 'test_secret'),
        ])->assertOk();

        Queue::assertPushed(CreateShiprocketOrderJob::class);
    });

    it('does not book a shipment when verification fails', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-PAYBAD', 'razorpay_order_id' => 'order_2',
            'payment_status' => 'pending', 'user_id' => null,
        ]);

        $this->postJson('/api/v1/orders/ODS-PAYBAD/verify', [
            'razorpay_payment_id' => 'pay_2', 'razorpay_signature' => 'forged',
        ])->assertStatus(422);

        Queue::assertNothingPushed();
    });

    it('books only once when the webhook is delivered twice', function (): void {
        config()->set('services.razorpay.webhook_secret', 'hook_secret');

        Order::factory()->create([
            'order_number' => 'ODS-HOOK', 'razorpay_order_id' => 'order_3',
            'payment_status' => 'pending', 'user_id' => null,
        ]);

        $body = json_encode([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => ['id' => 'pay_3', 'order_id' => 'order_3']]],
        ], JSON_THROW_ON_ERROR);

        $send = fn () => $this->call(
            'POST', '/api/v1/webhooks/razorpay', [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_RAZORPAY_SIGNATURE' => hash_hmac('sha256', $body, 'hook_secret')],
            $body,
        );

        $send()->assertOk();
        $send()->assertOk();

        // Retried webhooks must not book a second shipment.
        Queue::assertPushed(CreateShiprocketOrderJob::class, 1);
    });
});
