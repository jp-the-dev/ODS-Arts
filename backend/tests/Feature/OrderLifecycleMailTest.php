<?php

declare(strict_types=1);

use App\Mail\OrderCancelled;
use App\Mail\OrderDelivered;
use App\Mail\OrderReturned;
use App\Mail\OrderShipped;
use App\Mail\PaymentConfirmed;
use App\Models\Order;
use App\Models\User;
use App\Services\Money;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

beforeEach(function (): void {
    Mail::fake();

    config()->set('services.razorpay.secret', 'test_secret');
    config()->set('services.razorpay.webhook_secret', 'hook_secret');
    config()->set('services.shiprocket.webhook_token', 'hook_token');
    config()->set('services.shiprocket.dry_run', true);
});

function lifecycleOrder(array $overrides = []): Order
{
    $order = Order::factory()->create(array_merge([
        'order_number' => 'ODS-LIFECYCLE',
        'email' => 'customer@example.com',
        'user_id' => null,
        'status' => 'confirmed',
        'payment_status' => 'paid',
        'subtotal' => 899900,
        'discount' => 0,
        'shipping_cost' => 0,
        'tax' => 96418,
        'total' => 996318,
        'shipping_address' => [
            'full_name' => 'Samir Chavda',
            'line1' => 'office no. 314 novas complex',
            'city' => 'Rajkot',
            'state' => 'Gujarat',
            'pincode' => '360002',
        ],
    ], $overrides));

    $order->items()->create([
        'name' => 'Classic Box — 8" × 10"',
        'sku' => 'BOX-1',
        'unit_price_paise' => 899900,
        'quantity' => 1,
        'subtotal_paise' => 899900,
    ]);

    return $order->fresh('items');
}

function shiprocketPush(string $awb, string $status): void
{
    test()->withHeader('x-api-key', 'hook_token')
        ->postJson('/api/v1/webhooks/shiprocket', ['awb' => $awb, 'current_status' => $status])
        ->assertOk();
}

describe('payment confirmation mail', function (): void {
    it('sends the receipt to the customer when /verify settles the payment', function (): void {
        $payer = User::factory()->create();
        Sanctum::actingAs($payer);

        $order = lifecycleOrder([
            'order_number' => 'ODS-PAYOK',
            'user_id' => $payer->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'razorpay_order_id' => 'order_RZP1',
        ]);

        $this->postJson('/api/v1/orders/ODS-PAYOK/verify', [
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature' => hash_hmac('sha256', 'order_RZP1|pay_123', 'test_secret'),
        ])->assertOk();

        Mail::assertQueued(
            PaymentConfirmed::class,
            fn (PaymentConfirmed $mail): bool => $mail->hasTo($order->email)
                && $mail->order->order_number === 'ODS-PAYOK',
        );
    });

    it('sends exactly one receipt when the webhook lands after /verify', function (): void {
        // Both settlement paths confirm payment, and Razorpay may deliver the
        // webhook after the browser has already called /verify. The customer
        // must not be billed one payment and mailed two receipts.
        $payer = User::factory()->create();
        Sanctum::actingAs($payer);

        lifecycleOrder([
            'order_number' => 'ODS-BOTH',
            'user_id' => $payer->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'razorpay_order_id' => 'order_RZPB',
        ]);

        $this->postJson('/api/v1/orders/ODS-BOTH/verify', [
            'razorpay_payment_id' => 'pay_b',
            'razorpay_signature' => hash_hmac('sha256', 'order_RZPB|pay_b', 'test_secret'),
        ])->assertOk();

        $payload = json_encode([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => ['id' => 'pay_b', 'order_id' => 'order_RZPB']]],
        ], JSON_THROW_ON_ERROR);

        $this->call(
            'POST', '/api/v1/webhooks/razorpay', [], [], [],
            ['CONTENT_TYPE' => 'application/json',
                'HTTP_X_RAZORPAY_SIGNATURE' => hash_hmac('sha256', $payload, 'hook_secret')],
            $payload,
        )->assertOk();

        Mail::assertQueuedCount(1);
    });

    it('carries the GST invoice as a PDF attachment', function (): void {
        config()->set('invoice.gst_enabled', true);

        $payer = User::factory()->create();
        Sanctum::actingAs($payer);

        lifecycleOrder([
            'order_number' => 'ODS-INV',
            'user_id' => $payer->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'razorpay_order_id' => 'order_RZPI',
        ]);

        $this->postJson('/api/v1/orders/ODS-INV/verify', [
            'razorpay_payment_id' => 'pay_i',
            'razorpay_signature' => hash_hmac('sha256', 'order_RZPI|pay_i', 'test_secret'),
        ])->assertOk();

        Mail::assertQueued(PaymentConfirmed::class, function (PaymentConfirmed $mail): bool {
            // The invoice is raised moments before the mail is queued, so this
            // is really asserting that the relation was reloaded rather than
            // resolved to a stale null.
            expect($mail->order->invoice)->not->toBeNull();

            $attachments = $mail->attachments();
            expect($attachments)->toHaveCount(1);

            // Resolve the attachment rather than just counting it. fromData()
            // is lazy, so a PDF that throws while rendering would still count
            // as one attachment here and only blow up inside the queue worker.
            $pdf = $attachments[0]->attachWith(
                fn () => null,
                fn (Closure $data): string => $data(),
            );

            expect($pdf)->toStartWith('%PDF');

            return true;
        });
    });
});

describe('shipping status mail', function (): void {
    it('mails the customer when the parcel ships', function (): void {
        lifecycleOrder(['order_number' => 'ODS-SHIP', 'awb_code' => 'AWBS', 'courier_name' => 'Delhivery']);

        shiprocketPush('AWBS', 'Shipped');

        Mail::assertQueued(
            OrderShipped::class,
            fn (OrderShipped $mail): bool => $mail->hasTo('customer@example.com'),
        );
    });

    it('mails only once across in-transit pushes that all mean shipped', function (): void {
        // Shiprocket sends 'Shipped', then 'In Transit', then 'Out for delivery'
        // — three pushes, one status. Mailing per push would send three
        // identical "on its way" emails for a single parcel.
        lifecycleOrder(['order_number' => 'ODS-MULTI', 'awb_code' => 'AWBM']);

        shiprocketPush('AWBM', 'Shipped');
        shiprocketPush('AWBM', 'In Transit');
        shiprocketPush('AWBM', 'Out for delivery');

        Mail::assertQueuedCount(1);
    });

    it('mails on delivery', function (): void {
        lifecycleOrder(['order_number' => 'ODS-DEL', 'awb_code' => 'AWBD', 'status' => 'shipped']);

        shiprocketPush('AWBD', 'Delivered');

        Mail::assertQueued(OrderDelivered::class);
    });

    it('mails on a courier cancellation', function (): void {
        lifecycleOrder(['order_number' => 'ODS-CAN', 'awb_code' => 'AWBC']);

        shiprocketPush('AWBC', 'Cancelled');

        Mail::assertQueued(OrderCancelled::class);
        Mail::assertNotQueued(OrderReturned::class);
    });

    it('mails a distinct notice on an RTO rather than a cancellation', function (): void {
        // An RTO means something different to the customer than a cancellation:
        // nobody cancelled anything, the delivery failed.
        lifecycleOrder(['order_number' => 'ODS-RTO', 'awb_code' => 'AWBR']);

        shiprocketPush('AWBR', 'RTO Initiated');

        Mail::assertQueued(OrderReturned::class);
        Mail::assertNotQueued(OrderCancelled::class);
    });

    it('stays silent for a status that does not change the order', function (): void {
        lifecycleOrder(['order_number' => 'ODS-QUIET', 'awb_code' => 'AWBQ']);

        shiprocketPush('AWBQ', 'Label Generated');

        Mail::assertNothingQueued();
    });
});

describe('rendered content', function (): void {
    it('shows the courier and tracking number on the shipped mail', function (): void {
        $order = lifecycleOrder(['awb_code' => 'AWB12345', 'courier_name' => 'Delhivery']);

        $html = (new OrderShipped($order))->render();

        expect($html)->toContain('AWB12345')->toContain('Delhivery');
    });

    it('tells a paid customer their refund is coming when cancelled', function (): void {
        $order = lifecycleOrder(['payment_status' => 'paid', 'total' => 996318]);

        $text = preg_replace('/\s+/', ' ', html_entity_decode(strip_tags((new OrderCancelled($order))->render()))) ?? '';

        expect($text)->toContain(Money::rupees(996318))->toContain('refund');
    });

    it('does not promise a refund on an unpaid cancellation', function (): void {
        // An abandoned checkout was never charged, so telling them money is on
        // its way would be a lie that generates a support ticket.
        $order = lifecycleOrder(['payment_status' => 'pending']);

        $text = strip_tags((new OrderCancelled($order))->render());

        expect($text)->not->toContain('refund');
    });

    it('renders every lifecycle mail without error', function (string $mailable): void {
        $order = lifecycleOrder(['awb_code' => 'AWB1', 'courier_name' => 'Delhivery']);

        expect((new $mailable($order))->render())->toBeString()->not->toBeEmpty();
    })->with([
        PaymentConfirmed::class,
        OrderShipped::class,
        OrderDelivered::class,
        OrderCancelled::class,
        OrderReturned::class,
    ]);
});
