<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** An order that has started payment, so it has a Razorpay order id to match. */
function orderAwaitingPayment(array $overrides = []): Order
{
    // Owned by whoever is signed in. An ownerless order would pass the ownership
    // check without ever exercising it, which is how a real customer being
    // locked out of their own order went unnoticed.
    return Order::factory()->create(array_merge([
        'user_id' => auth()->id(),
        'status' => 'pending',
        'payment_status' => 'pending',
        'razorpay_order_id' => 'order_RZP123',
    ], $overrides));
}

describe('reporting a failed payment', function (): void {
    beforeEach(fn () => Sanctum::actingAs(User::factory()->create()));
    it('records the failure the browser saw', function (): void {
        // Razorpay reports a decline to the browser only. Without this the order
        // stayed "pending" — indistinguishable from one simply abandoned — and
        // so still looked placed everywhere downstream.
        $order = orderAwaitingPayment();

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [
            'razorpay_order_id' => 'order_RZP123',
            'reason' => 'Card declined',
        ])->assertOk()->assertJsonPath('data.paymentStatus', 'failed');

        expect($order->fresh()->payment_status)->toBe('failed');
    });

    it('refuses a report that does not know the razorpay order id', function (): void {
        // The reference alone is a weak capability — it appears in emails and
        // URLs. The Razorpay id is issued at payment time and is not guessable.
        $order = orderAwaitingPayment();

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [
            'razorpay_order_id' => 'order_GUESSED',
        ])->assertNotFound();

        expect($order->fresh()->payment_status)->toBe('pending');
    });

    it('never downgrades an order that has genuinely been paid', function (): void {
        // The webhook can confirm capture before a stale browser reports failure.
        $order = orderAwaitingPayment([
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [
            'razorpay_order_id' => 'order_RZP123',
        ])->assertOk()->assertJsonPath('data.paymentStatus', 'paid');

        expect($order->fresh()->payment_status)->toBe('paid')
            ->and($order->fresh()->status)->toBe('confirmed');
    });

    it('404s for an order that does not exist', function (): void {
        $this->postJson('/api/v1/orders/ODS-NOPE/payment-failed', [
            'razorpay_order_id' => 'order_RZP123',
        ])->assertNotFound();
    });

    it('404s when payment was never started', function (): void {
        $order = orderAwaitingPayment(['razorpay_order_id' => null]);

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [
            'razorpay_order_id' => 'order_RZP123',
        ])->assertNotFound();
    });

    it('requires the razorpay order id', function (): void {
        $order = orderAwaitingPayment();

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [])
            ->assertStatus(422);
    });

    it('leaves another customer\'s order alone', function (): void {
        $order = orderAwaitingPayment(['user_id' => User::factory()->create()->id]);

        $this->postJson("/api/v1/orders/{$order->order_number}/payment-failed", [
            'razorpay_order_id' => 'order_RZP123',
        ])->assertNotFound();

        expect($order->fresh()->payment_status)->toBe('pending');
    });
});

describe('tracking a failed order', function (): void {
    beforeEach(fn () => Sanctum::actingAs(User::factory()->create()));
    it('tells the customer the payment failed rather than showing it as placed', function (): void {
        // status stays "pending" for a failed payment — the order is still
        // recoverable — so payment status is the only thing that distinguishes
        // "awaiting payment" from "payment refused".
        $order = orderAwaitingPayment(['payment_status' => 'failed']);

        $this->getJson("/api/v1/orders/{$order->order_number}/tracking")
            ->assertOk()
            ->assertJsonPath('data.paymentStatus', 'failed');
    });

    it('reports a paid order as paid', function (): void {
        $order = orderAwaitingPayment(['payment_status' => 'paid', 'status' => 'confirmed']);

        $this->getJson("/api/v1/orders/{$order->order_number}/tracking")
            ->assertOk()
            ->assertJsonPath('data.paymentStatus', 'paid');
    });
});

describe('guest checkout is closed', function (): void {
    it('refuses to create an order without an account', function (): void {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create([
            'base_price_paise' => 899900,
            'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', [
            'customer' => ['fullName' => 'Guest Buyer', 'email' => 'guest@example.com', 'phone' => '9876543210'],
            'address' => [
                'line1' => '1 Test Road', 'city' => 'Rajkot',
                'state' => 'Gujarat', 'pincode' => '360002', 'country' => 'IN',
            ],
            'items' => [[
                'itemType' => 'frame',
                'productId' => (string) $product->id,
                'productSlug' => $product->slug,
                'variantId' => (string) $variant->id,
                'quantity' => 1,
                'unitPricePaise' => 899900,
            ]],
            'subtotalPaise' => 899900,
            'currency' => 'INR',
        ])->assertUnauthorized();

        expect(Order::where('email', 'guest@example.com')->exists())->toBeFalse()
            // Stock must not move for an order that was never created.
            ->and($variant->fresh()->stock_qty)->toBe(5);
    });
});
