<?php

declare(strict_types=1);

use App\Mail\OrderConfirmation;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

describe('odsarts:mail-test', function (): void {
    beforeEach(fn () => Mail::fake());

    it('sends the real order confirmation mailable', function (): void {
        $order = Order::factory()->create(['order_number' => 'ODS-MAILTEST']);
        $order->items()->create([
            'name' => 'Classic Box — 8" × 10"', 'sku' => 'BOX-1',
            'unit_price_paise' => 899900, 'quantity' => 1, 'subtotal_paise' => 899900,
        ]);

        $this->artisan('odsarts:mail-test buyer@example.com')
            ->assertSuccessful();

        Mail::assertSent(
            OrderConfirmation::class,
            fn (OrderConfirmation $mail): bool => $mail->hasTo('buyer@example.com')
        );
    });

    it('rejects a malformed address before attempting delivery', function (): void {
        Order::factory()->create();

        $this->artisan('odsarts:mail-test not-an-email')
            ->expectsOutputToContain('not a valid email')
            ->assertFailed();

        Mail::assertNothingSent();
    });

    it('warns when the mailer would discard the message', function (): void {
        Order::factory()->create();
        config()->set('mail.default', 'log');

        $this->artisan('odsarts:mail-test buyer@example.com')
            ->expectsOutputToContain('nothing will actually be delivered')
            ->assertSuccessful();
    });

    it('fails clearly when there is no order to render', function (): void {
        $this->artisan('odsarts:mail-test buyer@example.com')
            ->expectsOutputToContain('No orders exist')
            ->assertFailed();
    });

    it('queues instead of sending with --queue, matching checkout', function (): void {
        Order::factory()->create();

        $this->artisan('odsarts:mail-test buyer@example.com --queue')
            ->assertSuccessful();

        // Checkout queues rather than sends, so this path is what proves a
        // worker is running — not just that SMTP credentials are valid.
        Mail::assertQueued(OrderConfirmation::class);
        Mail::assertNotSent(OrderConfirmation::class);
    });

    it('substitutes a line item when the order has none', function (): void {
        // An empty table would render fine and hide a broken loop.
        Order::factory()->create(['order_number' => 'ODS-EMPTY']);

        $this->artisan('odsarts:mail-test buyer@example.com')->assertSuccessful();

        Mail::assertSent(
            OrderConfirmation::class,
            fn (OrderConfirmation $mail): bool => $mail->order->items->isNotEmpty()
        );
    });
});
