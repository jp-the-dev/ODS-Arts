<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;

beforeEach(function (): void {
    // Paying requires the Sanctum guard on the route, and the order must belong
    // to whoever is paying. Every order below is owned by this customer: tests
    // using ownerless orders passed straight through the ownership check and so
    // never exercised the path a real customer takes.
    $this->payer = User::factory()->create();
    Sanctum::actingAs($this->payer);

    config()->set('services.razorpay.key', 'rzp_test_key');
    config()->set('services.razorpay.secret', 'test_secret');
    config()->set('services.razorpay.webhook_secret', 'hook_secret');
    config()->set('services.razorpay.base_url', 'https://api.razorpay.com/v1');
});

function signature(string $razorpayOrderId, string $paymentId, string $secret = 'test_secret'): string
{
    return hash_hmac('sha256', $razorpayOrderId.'|'.$paymentId, $secret);
}

describe('POST /orders/{orderNumber}/pay', function (): void {
    it('creates a razorpay order for the exact order total', function (): void {
        Http::fake(['api.razorpay.com/*' => Http::response(['id' => 'order_RZP123'], 200)]);
        $order = Order::factory()->create(['order_number' => 'ODS-AAA', 'total' => 899900, 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-AAA/pay')
            ->assertOk()
            ->assertJsonPath('data.razorpayOrderId', 'order_RZP123')
            ->assertJsonPath('data.amountPaise', 899900)
            ->assertJsonPath('data.razorpayKey', 'rzp_test_key');

        expect($order->fresh()->razorpay_order_id)->toBe('order_RZP123');

        // Amount must come from the database, in paise, untouched.
        Http::assertSent(fn ($request) => $request['amount'] === 899900
            && $request['receipt'] === 'ODS-AAA');
    });

    it('reuses an existing razorpay order instead of creating a second one', function (): void {
        Http::fake();
        Order::factory()->create([
            'order_number' => 'ODS-BBB', 'total' => 100000,
            'razorpay_order_id' => 'order_EXISTING', 'user_id' => $this->payer->id,
        ]);

        $this->postJson('/api/v1/orders/ODS-BBB/pay')
            ->assertOk()
            ->assertJsonPath('data.razorpayOrderId', 'order_EXISTING');

        Http::assertNothingSent();
    });

    it('404s for an unknown order', function (): void {
        $this->postJson('/api/v1/orders/ODS-NOPE/pay')->assertNotFound();
    });

    it('409s when the order is already paid', function (): void {
        Order::factory()->create(['order_number' => 'ODS-PAID', 'payment_status' => 'paid', 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-PAID/pay')->assertStatus(409);
    });

    it('503s when razorpay credentials are missing', function (): void {
        config()->set('services.razorpay.key', null);
        Order::factory()->create(['order_number' => 'ODS-CCC', 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-CCC/pay')->assertStatus(503);
    });

    it('502s when razorpay rejects the request', function (): void {
        Http::fake(['api.razorpay.com/*' => Http::response(['error' => 'bad'], 400)]);
        Order::factory()->create(['order_number' => 'ODS-DDD', 'total' => 1000, 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-DDD/pay')->assertStatus(502);
    });

    it('lets the order owner start payment', function (): void {
        // The regression this guards: the route had no auth middleware, so
        // $request->user() read the session guard, never saw the bearer token,
        // and returned null — making every owned order look like someone
        // else's. The customer got "order not found" for their own order and
        // the Razorpay window never opened.
        Http::fake(['api.razorpay.com/*' => Http::response(['id' => 'order_OWNER'], 200)]);

        Order::factory()->for($this->payer)->create(['order_number' => 'ODS-MINE', 'total' => 500000]);

        $this->postJson('/api/v1/orders/ODS-MINE/pay')
            ->assertOk()
            ->assertJsonPath('data.razorpayOrderId', 'order_OWNER');
    });

    it('401s when nobody is signed in', function (): void {
        // This is the only test here that can detect the route losing its
        // auth:sanctum middleware. Sanctum::actingAs authenticates the default
        // guard directly, so every other test passes with or without it — which
        // is exactly how the missing guard reached production. Do not remove it.
        Http::fake();
        app()['auth']->forgetGuards();

        Order::factory()->create(['order_number' => 'ODS-ANON']);

        $this->postJson('/api/v1/orders/ODS-ANON/pay')->assertUnauthorized();
    });

    it('lets a customer retry after a refused payment', function (): void {
        // The Razorpay order is reused, so retrying does not create a second
        // order for the same basket.
        Http::fake();

        Order::factory()->for($this->payer)->create([
            'order_number' => 'ODS-RETRY', 'razorpay_order_id' => 'order_FIRST',
            'payment_status' => 'failed', 'status' => 'pending',
        ]);

        $this->postJson('/api/v1/orders/ODS-RETRY/pay')
            ->assertOk()
            ->assertJsonPath('data.razorpayOrderId', 'order_FIRST');

        // And it no longer reads as failed while the retry is in progress.
        expect(Order::where('order_number', 'ODS-RETRY')->first()->payment_status)
            ->toBe('pending');
    });

    it('refuses a retry once the order was cancelled and its stock returned', function (): void {
        // Those units are back on the shelf and may since have been sold.
        Http::fake();

        Order::factory()->for($this->payer)->create([
            'order_number' => 'ODS-GONE', 'razorpay_order_id' => 'order_OLD',
            'payment_status' => 'failed', 'status' => 'cancelled',
            'stock_released_at' => now()->subHour(),
        ]);

        $this->postJson('/api/v1/orders/ODS-GONE/pay')
            ->assertStatus(409)
            ->assertJsonPath('message', 'This order was cancelled because payment was not completed in time. Please place a new order.');
    });

    it('does not let one customer pay another customer order', function (): void {
        Http::fake();
        $owner = User::factory()->create();
        Order::factory()->for($owner)->create(['order_number' => 'ODS-OWNED']);

        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/orders/ODS-OWNED/pay')->assertNotFound();
    });
});

describe('POST /orders/{orderNumber}/verify', function (): void {
    it('marks the order paid when the signature is valid', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-EEE', 'razorpay_order_id' => 'order_RZP1',
            'payment_status' => 'pending', 'status' => 'pending', 'user_id' => $this->payer->id,
        ]);

        $this->postJson('/api/v1/orders/ODS-EEE/verify', [
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature' => signature('order_RZP1', 'pay_123'),
        ])->assertOk()->assertJsonPath('data.paymentStatus', 'paid');

        $order->refresh();

        expect($order->payment_status)->toBe('paid')
            ->and($order->status)->toBe('confirmed')
            ->and($order->razorpay_payment_id)->toBe('pay_123');
    });

    it('rejects a forged signature and does not mark the order paid', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-FFF', 'razorpay_order_id' => 'order_RZP1',
            'payment_status' => 'pending', 'user_id' => $this->payer->id,
        ]);

        $this->postJson('/api/v1/orders/ODS-FFF/verify', [
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature' => 'totally-made-up',
        ])->assertStatus(422);

        expect($order->fresh()->payment_status)->toBe('failed');
    });

    it('rejects a signature computed with the wrong secret', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-GGG', 'razorpay_order_id' => 'order_RZP1', 'user_id' => $this->payer->id,
        ]);

        $this->postJson('/api/v1/orders/ODS-GGG/verify', [
            'razorpay_payment_id' => 'pay_123',
            'razorpay_signature' => signature('order_RZP1', 'pay_123', 'attacker_secret'),
        ])->assertStatus(422);
    });

    it('cannot be downgraded by a forged signature once paid', function (): void {
        // A paid order must survive a later bad /verify — otherwise anyone could
        // flip a genuine payment to failed by replaying the endpoint.
        $order = Order::factory()->create([
            'order_number' => 'ODS-SETTLED', 'razorpay_order_id' => 'order_RZP9',
            'payment_status' => 'paid', 'status' => 'confirmed', 'user_id' => $this->payer->id,
        ]);

        $this->postJson('/api/v1/orders/ODS-SETTLED/verify', [
            'razorpay_payment_id' => 'pay_evil',
            'razorpay_signature' => 'forged',
        ])->assertOk()->assertJsonPath('data.paymentStatus', 'paid');

        $order->refresh();

        expect($order->payment_status)->toBe('paid')
            ->and($order->status)->toBe('confirmed')
            ->and($order->razorpay_payment_id)->not->toBe('pay_evil');
    });

    it('is idempotent when a valid verify is retried', function (): void {
        Order::factory()->create([
            'order_number' => 'ODS-RETRY', 'razorpay_order_id' => 'order_RZPR',
            'payment_status' => 'pending', 'user_id' => $this->payer->id,
        ]);

        $body = [
            'razorpay_payment_id' => 'pay_ok',
            'razorpay_signature' => signature('order_RZPR', 'pay_ok'),
        ];

        $this->postJson('/api/v1/orders/ODS-RETRY/verify', $body)->assertOk();
        $this->postJson('/api/v1/orders/ODS-RETRY/verify', $body)
            ->assertOk()
            ->assertJsonPath('data.paymentStatus', 'paid');
    });

    it('422s when payment was never started', function (): void {
        Order::factory()->create(['order_number' => 'ODS-HHH', 'razorpay_order_id' => null, 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-HHH/verify', [
            'razorpay_payment_id' => 'pay_1',
            'razorpay_signature' => 'x',
        ])->assertStatus(422);
    });

    it('requires the payment id and signature', function (): void {
        Order::factory()->create(['order_number' => 'ODS-III', 'user_id' => $this->payer->id]);

        $this->postJson('/api/v1/orders/ODS-III/verify', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['razorpay_payment_id', 'razorpay_signature']);
    });
});

describe('POST /webhooks/razorpay', function (): void {
    function webhookPost(array $body, string $secret = 'hook_secret'): TestResponse
    {
        $json = json_encode($body, JSON_THROW_ON_ERROR);

        return test()->call(
            'POST', '/api/v1/webhooks/razorpay', [], [], [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_RAZORPAY_SIGNATURE' => hash_hmac('sha256', $json, $secret)],
            $json,
        );
    }

    it('marks an order paid on payment.captured', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-JJJ', 'razorpay_order_id' => 'order_HOOK',
            'payment_status' => 'pending', 'status' => 'pending', 'user_id' => null,
        ]);

        webhookPost([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => ['id' => 'pay_hook', 'order_id' => 'order_HOOK']]],
        ])->assertOk();

        $order->refresh();

        expect($order->payment_status)->toBe('paid')
            ->and($order->status)->toBe('confirmed')
            ->and($order->razorpay_payment_id)->toBe('pay_hook');
    });

    it('marks an order failed on payment.failed', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-KKK', 'razorpay_order_id' => 'order_HOOK2', 'user_id' => null,
        ]);

        webhookPost([
            'event' => 'payment.failed',
            'payload' => ['payment' => ['entity' => ['id' => 'p', 'order_id' => 'order_HOOK2']]],
        ])->assertOk();

        expect($order->fresh()->payment_status)->toBe('failed');
    });

    it('rejects a webhook signed with the wrong secret', function (): void {
        $order = Order::factory()->create([
            'order_number' => 'ODS-LLL', 'razorpay_order_id' => 'order_HOOK3',
            'payment_status' => 'pending', 'user_id' => null,
        ]);

        webhookPost([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => ['id' => 'p', 'order_id' => 'order_HOOK3']]],
        ], secret: 'wrong_secret')->assertUnauthorized();

        expect($order->fresh()->payment_status)->toBe('pending');
    });

    it('ignores an event for an unknown razorpay order', function (): void {
        webhookPost([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => ['id' => 'p', 'order_id' => 'order_UNKNOWN']]],
        ])->assertOk();
    });
});
