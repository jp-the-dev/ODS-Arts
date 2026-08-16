<?php

declare(strict_types=1);

use App\Models\ArtMaterialVariant;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\OrderStock;

/** An unpaid order holding `quantity` units of a frame variant. */
function abandonedOrder(ProductVariant $variant, array $overrides = [], int $quantity = 2): Order
{
    $order = Order::factory()->create(array_merge([
        'user_id' => null,
        'status' => 'pending',
        'payment_status' => 'pending',
        'created_at' => now()->subHours(3),
    ], $overrides));

    $order->items()->create([
        'product_id' => $variant->product_id,
        'product_variant_id' => $variant->id,
        'name' => 'Classic Box — 8" × 10"',
        'sku' => $variant->sku,
        'unit_price_paise' => 899900,
        'quantity' => $quantity,
        'subtotal_paise' => 899900 * $quantity,
    ]);

    // Checkout decrements at creation, so mirror that starting position.
    $variant->decrement('stock_qty', $quantity);

    return $order->fresh('items');
}

function frameVariant(int $stock = 10): ProductVariant
{
    return ProductVariant::factory()->for(Product::factory())->create(['stock_qty' => $stock]);
}

describe('releasing stock from unpaid orders', function (): void {
    it('returns the units an abandoned order was holding', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        expect($variant->fresh()->stock_qty)->toBe(8);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(10)
            ->and($order->fresh()->stock_released_at)->not->toBeNull()
            ->and($order->fresh()->status)->toBe('cancelled');
    });

    it('releases an order whose payment was refused', function (): void {
        $variant = frameVariant(10);
        abandonedOrder($variant, ['payment_status' => 'failed']);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(10);
    });

    it('never touches a paid order', function (): void {
        $variant = frameVariant(10);
        abandonedOrder($variant, ['payment_status' => 'paid', 'status' => 'confirmed']);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(8);
    });

    it('leaves an order that is still within the window', function (): void {
        $variant = frameVariant(10);
        abandonedOrder($variant, ['created_at' => now()->subMinutes(5)]);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(8);
    });

    it('credits nothing on a second pass', function (): void {
        // The job runs on a schedule; crediting again each time would inflate
        // inventory without limit.
        $variant = frameVariant(10);
        abandonedOrder($variant);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();
        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();
        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(10);
    });

    it('changes nothing on a dry run', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        $this->artisan('odsarts:release-abandoned-stock --dry-run')->assertSuccessful();

        expect($variant->fresh()->stock_qty)->toBe(8)
            ->and($order->fresh()->stock_released_at)->toBeNull();
    });

    it('honours a custom window', function (): void {
        $variant = frameVariant(10);
        abandonedOrder($variant, ['created_at' => now()->subMinutes(30)]);

        $this->artisan('odsarts:release-abandoned-stock --minutes=600')->assertSuccessful();
        expect($variant->fresh()->stock_qty)->toBe(8);

        $this->artisan('odsarts:release-abandoned-stock --minutes=10')->assertSuccessful();
        expect($variant->fresh()->stock_qty)->toBe(10);
    });

    it('rejects a nonsense window rather than releasing everything', function (): void {
        $this->artisan('odsarts:release-abandoned-stock --minutes=0')->assertFailed();
    });

    it('returns art stock, which carries no foreign key', function (): void {
        // Art lines store product_variant_id as null, so they are resolved by
        // the variant id in options.
        $art = ArtMaterialVariant::factory()->create(['stock_qty' => 5]);

        $order = Order::factory()->create([
            'user_id' => null,
            'payment_status' => 'pending',
            'created_at' => now()->subHours(3),
        ]);

        $order->items()->create([
            'product_id' => null,
            'product_variant_id' => null,
            'name' => 'Art print — A3',
            'sku' => $art->sku,
            'unit_price_paise' => 250000,
            'quantity' => 2,
            'subtotal_paise' => 500000,
            'options' => ['type' => 'art', 'art_material_variant_id' => $art->id],
        ]);

        $art->decrement('stock_qty', 2);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($art->fresh()->stock_qty)->toBe(5);
    });

    it('falls back to the sku for art lines recorded before the id was stored', function (): void {
        $art = ArtMaterialVariant::factory()->create(['stock_qty' => 5]);

        $order = Order::factory()->create([
            'user_id' => null,
            'payment_status' => 'pending',
            'created_at' => now()->subHours(3),
        ]);

        $order->items()->create([
            'product_id' => null,
            'product_variant_id' => null,
            'name' => 'Art print — A3',
            'sku' => $art->sku,
            'unit_price_paise' => 250000,
            'quantity' => 1,
            'subtotal_paise' => 250000,
            'options' => ['type' => 'art'],
        ]);

        $art->decrement('stock_qty', 1);

        $this->artisan('odsarts:release-abandoned-stock')->assertSuccessful();

        expect($art->fresh()->stock_qty)->toBe(5);
    });
});

describe('the release itself, called directly', function (): void {
    // The command filters released orders out in its query, so these guards are
    // invisible to any test that goes through the command — removing either one
    // left the whole suite green.

    it('credits once when called twice', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        expect(OrderStock::release($order->fresh()))->toBe(2)
            ->and(OrderStock::release($order->fresh()))->toBe(0)
            ->and($variant->fresh()->stock_qty)->toBe(10);
    });

    it('credits nothing when the row was released by a concurrent pass', function (): void {
        // The in-memory model still says unreleased; the database disagrees.
        // This is the overlap the locking re-check exists for.
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        $stale = $order->fresh();
        OrderStock::release($order->fresh());

        expect(OrderStock::release($stale))->toBe(0)
            ->and($variant->fresh()->stock_qty)->toBe(10);
    });

    it('refuses to release a paid order', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant, ['payment_status' => 'paid']);

        expect(OrderStock::release($order->fresh()))->toBe(0)
            ->and($variant->fresh()->stock_qty)->toBe(8);
    });
});

describe('a payment that lands after the stock was released', function (): void {
    it('takes the units back off the shelf', function (): void {
        // Otherwise they are counted twice: once in the catalogue and once in a
        // box being shipped.
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        OrderStock::release($order->fresh());
        expect($variant->fresh()->stock_qty)->toBe(10);

        OrderStock::retake($order->fresh());

        expect($variant->fresh()->stock_qty)->toBe(8)
            ->and($order->fresh()->stock_released_at)->toBeNull();
    });

    it('is a no-op for an order whose stock was never released', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant);

        OrderStock::retake($order->fresh());

        expect($variant->fresh()->stock_qty)->toBe(8);
    });

    it('un-cancels the order when the webhook confirms capture', function (): void {
        $variant = frameVariant(10);
        $order = abandonedOrder($variant, ['razorpay_order_id' => 'order_LATE']);

        OrderStock::release($order->fresh());
        expect($order->fresh()->status)->toBe('cancelled');

        config()->set('services.razorpay.webhook_secret', 'hook-secret');

        $payload = json_encode([
            'event' => 'payment.captured',
            'payload' => ['payment' => ['entity' => [
                'id' => 'pay_LATE', 'order_id' => 'order_LATE',
            ]]],
        ], JSON_THROW_ON_ERROR);

        $this->call('POST', '/api/v1/webhooks/razorpay', [], [], [], [
            'HTTP_X-Razorpay-Signature' => hash_hmac('sha256', $payload, 'hook-secret'),
            'CONTENT_TYPE' => 'application/json',
        ], $payload)->assertOk();

        expect($order->fresh()->payment_status)->toBe('paid')
            ->and($order->fresh()->status)->toBe('confirmed')
            ->and($order->fresh()->stock_released_at)->toBeNull()
            ->and($variant->fresh()->stock_qty)->toBe(8);
    });
});
