<?php

declare(strict_types=1);

use App\Jobs\CreateShiprocketOrderJob;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\ShiprocketService;
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
    beforeEach(fn () => config()->set('services.shiprocket.webhook_token', 'hook_token'));

    it('updates the order status from an AWB push', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-TRACK', 'awb_code' => 'AWB999',
            'status' => 'confirmed', 'user_id' => null,
        ]);

        $this->withHeader('x-api-key', 'hook_token')->postJson('/api/v1/webhooks/shiprocket', [
            'awb' => 'AWB999', 'current_status' => 'Delivered',
        ])->assertOk();

        $order->refresh();

        expect($order->status)->toBe('delivered')
            ->and($order->shiprocket_status)->toBe('Delivered');
    });

    it('maps in-transit style statuses to shipped', function (string $status): void {
        $order = Order::factory()->create(['awb_code' => 'AWB1', 'status' => 'confirmed', 'user_id' => null]);

        $this->withHeader('x-api-key', 'hook_token')->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB1', 'current_status' => $status])
            ->assertOk();

        expect($order->fresh()->status)->toBe('shipped');
    })->with(['Shipped', 'In Transit', 'Out for delivery']);

    it('ignores an unknown AWB', function (): void {
        $this->withHeader('x-api-key', 'hook_token')->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'NOPE', 'current_status' => 'Delivered'])
            ->assertOk()
            ->assertJsonPath('message', 'Ignored.');
    });

    it('ignores a payload with no AWB', function (): void {
        $this->withHeader('x-api-key', 'hook_token')->postJson('/api/v1/webhooks/shiprocket', ['current_status' => 'Delivered'])
            ->assertOk()
            ->assertJsonPath('message', 'Ignored.');
    });

    it('leaves the order status alone for an unrecognised status', function (): void {
        $order = Order::factory()->create(['awb_code' => 'AWB2', 'status' => 'confirmed', 'user_id' => null]);

        $this->withHeader('x-api-key', 'hook_token')->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB2', 'current_status' => 'Label Generated'])
            ->assertOk();

        expect($order->fresh()->status)->toBe('confirmed');
    });
});

describe('fulfilment dispatch', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        config()->set('services.razorpay.secret', 'test_secret');

        // /verify is behind the Sanctum guard, and the order has to belong to
        // whoever is verifying it.
        $this->payer = User::factory()->create();
        Sanctum::actingAs($this->payer);
    });

    it('books a shipment once payment is verified', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-PAYOK', 'razorpay_order_id' => 'order_1',
            'payment_status' => 'pending', 'user_id' => $this->payer->id,
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
            'payment_status' => 'pending', 'user_id' => $this->payer->id,
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

describe('Shiprocket order payload', function (): void {
    beforeEach(function (): void {
        config()->set('services.shiprocket.dry_run', false);
        config()->set('services.shiprocket.email', 'api@example.com');
        config()->set('services.shiprocket.password', 'secret');
        config()->set('services.shiprocket.pickup_location', 'Home');
    });

    /**
     * Shiprocket 422s the whole order when `billing_last_name` is absent, which
     * surfaces only as a failed queue job — the customer has already been shown
     * a confirmation by then. This asserts the key is always sent.
     */
    it('splits the stored full name and always sends a surname', function (
        ?string $fullName,
        string $expectedFirst,
        string $expectedLast,
    ): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/orders/create/adhoc' => Http::response(['order_id' => 1, 'shipment_id' => 2]),
        ]);

        $order = Order::factory()->create([
            'shipping_address' => ['full_name' => $fullName, 'line1' => 'A', 'city' => 'B', 'pincode' => '360002', 'state' => 'C'],
        ]);

        app(ShiprocketService::class)->createOrder($order);

        Http::assertSent(function ($request) use ($expectedFirst, $expectedLast): bool {
            if (! str_contains($request->url(), '/orders/create/adhoc')) {
                return false;
            }

            return array_key_exists('billing_last_name', $request->data())
                && $request['billing_customer_name'] === $expectedFirst
                && $request['billing_last_name'] === $expectedLast;
        });
    })->with([
        'first and last' => ['Harsh Mandaliya', 'Harsh', 'Mandaliya'],
        'three parts' => ['Harsh Kumar Mandaliya', 'Harsh', 'Kumar Mandaliya'],
        'single word' => ['Harsh', 'Harsh', ''],
        'extra whitespace' => ['  Harsh   Mandaliya  ', 'Harsh', 'Mandaliya'],
        'missing entirely' => [null, 'Customer', ''],
    ]);

    it('sends the configured pickup location rather than a hardcoded one', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/orders/create/adhoc' => Http::response(['order_id' => 1]),
        ]);

        app(ShiprocketService::class)->createOrder(Order::factory()->create());

        Http::assertSent(fn ($request) => ! str_contains($request->url(), '/orders/create/adhoc')
            || $request['pickup_location'] === 'Home');
    });
});

describe('CreateShiprocketOrderJob write-back', function (): void {
    beforeEach(function (): void {
        config()->set('services.shiprocket.dry_run', false);
        config()->set('services.shiprocket.email', 'api@example.com');
        config()->set('services.shiprocket.password', 'secret');
    });

    /**
     * An adhoc booking comes back with empty strings for the courier fields,
     * which MySQL rejects for the integer courier_id. That threw *after* the
     * shipment was booked, so the ids were lost and the job re-ran.
     */
    it('stores the ids and ignores the empty courier fields', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/orders/create/adhoc' => Http::response([
                'order_id' => 1521213821,
                'shipment_id' => 1517434257,
                'awb_code' => '',
                'courier_company_id' => '',
                'courier_name' => '',
            ]),
            // Assignment succeeds but names no courier — still no '' allowed
            // into the integer courier_id.
            '*/courier/serviceability*' => Http::response(['data' => ['available_courier_companies' => []]]),
            '*/courier/assign/awb' => Http::response(['awb_assign_status' => 1, 'response' => ['data' => [
                'awb_code' => 'AWB-OK', 'courier_company_id' => '', 'courier_name' => '',
            ]]]),
        ]);

        $order = Order::factory()->create(['shiprocket_order_id' => null]);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        $order->refresh();
        expect($order->shiprocket_order_id)->toBe('1521213821')
            ->and($order->shiprocket_shipment_id)->toBe('1517434257')
            ->and($order->awb_code)->toBe('AWB-OK')
            ->and($order->courier_id)->toBeNull();
    });

    it('does not rebook an order that already has a shiprocket id', function (): void {
        Http::fake();

        $order = Order::factory()->create(['shiprocket_order_id' => '999']);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        Http::assertNothingSent();
    });
});

describe('AWB assignment', function (): void {
    beforeEach(function (): void {
        config()->set('services.shiprocket.dry_run', false);
        config()->set('services.shiprocket.email', 'api@example.com');
        config()->set('services.shiprocket.password', 'secret');
        config()->set('services.shiprocket.courier_mode', 'auto_cheapest');
    });

    it('books, picks the cheapest courier and stores the awb', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/orders/create/adhoc' => Http::response(['order_id' => 111, 'shipment_id' => 222, 'awb_code' => '']),
            '*/courier/serviceability*' => Http::response(['data' => ['available_courier_companies' => [
                ['courier_company_id' => 10, 'courier_name' => 'Pricey', 'rate' => 199.0],
                ['courier_company_id' => 33, 'courier_name' => 'Cheapest', 'rate' => 106.36],
            ]]]),
            '*/courier/assign/awb' => Http::response(['awb_assign_status' => 1, 'response' => ['data' => [
                'awb_code' => 'AWB123456', 'courier_company_id' => 33, 'courier_name' => 'Cheapest',
            ]]]),
        ]);

        $order = Order::factory()->create([
            'shiprocket_order_id' => null,
            'shipping_address' => ['full_name' => 'A B', 'line1' => 'X', 'city' => 'Y', 'state' => 'Z', 'pincode' => '395007'],
        ]);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        $order->refresh();
        expect($order->awb_code)->toBe('AWB123456')
            ->and($order->courier_id)->toBe(33)
            ->and($order->courier_name)->toBe('Cheapest');

        // The cheapest courier must be the one we asked for.
        Http::assertSent(fn ($request) => ! str_contains($request->url(), '/courier/assign/awb')
            || ($request['shipment_id'] === 222 && $request['courier_id'] === 33));
    });

    it('resumes at assignment when the order is already booked', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/courier/serviceability*' => Http::response(['data' => ['available_courier_companies' => []]]),
            '*/courier/assign/awb' => Http::response(['awb_assign_status' => 1, 'response' => ['data' => ['awb_code' => 'AWB999']]]),
        ]);

        $order = Order::factory()->create([
            'shiprocket_order_id' => '111', 'shiprocket_shipment_id' => '222', 'awb_code' => null,
        ]);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        expect($order->refresh()->awb_code)->toBe('AWB999');
        Http::assertNotSent(fn ($request) => str_contains($request->url(), '/orders/create/adhoc'));
    });

    it('does not reassign an awb it already has', function (): void {
        Http::fake();

        $order = Order::factory()->create([
            'shiprocket_order_id' => '111', 'shiprocket_shipment_id' => '222', 'awb_code' => 'AWB-EXISTING',
        ]);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        Http::assertNothingSent();
    });

    it('still assigns when the rate lookup fails, letting Shiprocket choose', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/courier/serviceability*' => Http::response([], 500),
            '*/courier/assign/awb' => Http::response(['awb_assign_status' => 1, 'response' => ['data' => ['awb_code' => 'AWB777']]]),
        ]);

        $order = Order::factory()->create([
            'shiprocket_order_id' => '111', 'shiprocket_shipment_id' => '222', 'awb_code' => null,
            'shipping_address' => ['pincode' => '395007'],
        ]);

        (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class));

        expect($order->refresh()->awb_code)->toBe('AWB777');
        Http::assertSent(fn ($request) => ! str_contains($request->url(), '/courier/assign/awb')
            || ! array_key_exists('courier_id', $request->data()));
    });
});

describe('AWB assignment failures', function (): void {
    beforeEach(function (): void {
        config()->set('services.shiprocket.dry_run', false);
        config()->set('services.shiprocket.email', 'api@example.com');
        config()->set('services.shiprocket.password', 'secret');
        config()->set('services.shiprocket.courier_mode', 'manual');
    });

    /**
     * Shiprocket answers 200 with awb_assign_status = 0 when it will not assign
     * — an empty wallet being the usual cause. Swallowing that would leave the
     * order with no AWB, silently killing its webhook and tracking forever.
     */
    it('throws when Shiprocket refuses to assign despite a 200', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/courier/assign/awb' => Http::response([
                'status_code' => 350,
                'message' => 'Please recharge your ShipRocket wallet. The minimum required balance is Rs 100',
                'awb_assign_status' => 0,
                'response' => ['data' => ['courier_id' => '', 'awb_assign_error' => 'Please recharge your ShipRocket wallet. The minimum required balance is Rs 100']],
            ]),
        ]);

        expect(fn () => app(ShiprocketService::class)->assignAwb(222))
            ->toThrow(RuntimeException::class, 'recharge your ShipRocket wallet');
    });

    it('leaves the booking intact so a retry resumes at assignment', function (): void {
        Http::fake([
            '*/auth/login' => Http::response(['token' => 'tok']),
            '*/orders/create/adhoc' => Http::response(['order_id' => 111, 'shipment_id' => 222]),
            '*/courier/assign/awb' => Http::response(['awb_assign_status' => 0, 'message' => 'wallet empty']),
        ]);

        $order = Order::factory()->create(['shiprocket_order_id' => null]);

        expect(fn () => (new CreateShiprocketOrderJob($order))->handle(app(ShiprocketService::class)))
            ->toThrow(RuntimeException::class);

        // The booking must have been kept, or the retry would order again.
        $order->refresh();
        expect($order->shiprocket_order_id)->toBe('111')
            ->and($order->shiprocket_shipment_id)->toBe('222')
            ->and($order->awb_code)->toBeNull();
    });
});

describe('Shiprocket webhook authentication', function (): void {
    /**
     * The endpoint drives an order to shipped, delivered, cancelled or returned
     * and now returns stock, so an unauthenticated push is a way to vandalise
     * fulfilment for anyone who learns an AWB.
     */
    it('rejects a push with no token', function (): void {
        config()->set('services.shiprocket.webhook_token', 'hook_token');

        $order = Order::factory()->create(['awb_code' => 'AWB-SEC', 'status' => 'confirmed', 'user_id' => null]);

        $this->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-SEC', 'current_status' => 'Delivered'])
            ->assertStatus(401);

        expect($order->fresh()->status)->toBe('confirmed');
    });

    it('rejects a push with the wrong token', function (): void {
        config()->set('services.shiprocket.webhook_token', 'hook_token');

        $order = Order::factory()->create(['awb_code' => 'AWB-SEC2', 'status' => 'confirmed', 'user_id' => null]);

        $this->withHeader('x-api-key', 'guessed')
            ->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-SEC2', 'current_status' => 'Delivered'])
            ->assertStatus(401);

        expect($order->fresh()->status)->toBe('confirmed');
    });

    /** An unconfigured token must fail closed, not fall back to accepting anyone. */
    it('fails closed when no token is configured', function (): void {
        config()->set('services.shiprocket.webhook_token', null);

        $order = Order::factory()->create(['awb_code' => 'AWB-SEC3', 'status' => 'confirmed', 'user_id' => null]);

        $this->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-SEC3', 'current_status' => 'Delivered'])
            ->assertStatus(503);

        expect($order->fresh()->status)->toBe('confirmed');
    });
});

describe('stock returns on cancellation and RTO', function (): void {
    beforeEach(fn () => config()->set('services.shiprocket.webhook_token', 'hook_token'));

    function paidOrderHoldingStock(string $awb, int $qty = 2): array
    {
        $variant = ProductVariant::factory()->create(['stock_qty' => 5]);

        $order = Order::factory()->create([
            'awb_code' => $awb, 'status' => 'shipped', 'payment_status' => 'paid',
            'stock_released_at' => null, 'user_id' => null,
        ]);

        $order->items()->create([
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->id,
            'name' => 'Frame', 'sku' => $variant->sku,
            'unit_price_paise' => 1000, 'quantity' => $qty, 'subtotal_paise' => 1000 * $qty,
        ]);

        return [$order, $variant];
    }

    it('returns the units when a shipment is cancelled', function (): void {
        [$order, $variant] = paidOrderHoldingStock('AWB-CANCEL');

        $this->withHeader('x-api-key', 'hook_token')
            ->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-CANCEL', 'current_status' => 'Cancelled'])
            ->assertOk();

        expect($variant->fresh()->stock_qty)->toBe(7)
            ->and($order->fresh()->status)->toBe('cancelled')
            ->and($order->fresh()->stock_released_at)->not->toBeNull();
    });

    /** An RTO must stay 'returned' — not be flattened to 'cancelled'. */
    it('returns the units on an RTO and keeps the status', function (string $status): void {
        [$order, $variant] = paidOrderHoldingStock('AWB-RTO');

        $this->withHeader('x-api-key', 'hook_token')
            ->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-RTO', 'current_status' => $status])
            ->assertOk();

        expect($variant->fresh()->stock_qty)->toBe(7)
            ->and($order->fresh()->status)->toBe('returned');
    })->with(['RTO Initiated', 'RTO Delivered']);

    it('does not credit twice when the push is repeated', function (): void {
        [, $variant] = paidOrderHoldingStock('AWB-TWICE');

        foreach (range(1, 3) as $ignored) {
            $this->withHeader('x-api-key', 'hook_token')
                ->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-TWICE', 'current_status' => 'Cancelled'])
                ->assertOk();
        }

        expect($variant->fresh()->stock_qty)->toBe(7);
    });

    it('leaves stock alone for a delivery', function (): void {
        [, $variant] = paidOrderHoldingStock('AWB-DONE');

        $this->withHeader('x-api-key', 'hook_token')
            ->postJson('/api/v1/webhooks/shiprocket', ['awb' => 'AWB-DONE', 'current_status' => 'Delivered'])
            ->assertOk();

        expect($variant->fresh()->stock_qty)->toBe(5);
    });
});
