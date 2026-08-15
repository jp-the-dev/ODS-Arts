<?php

declare(strict_types=1);

use App\Mail\OrderConfirmation;
use App\Models\ArtMaterialVariant;
use App\Models\ArtProduct;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;

function orderPayload(array $items, array $overrides = []): array
{
    return array_merge([
        'customer' => [
            'fullName' => 'Priya Mehta',
            'email' => 'priya@example.com',
            'phone' => '+91 9876543210',
        ],
        'address' => [
            'line1' => '12 Marine Drive',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400020',
            'country' => 'IN',
        ],
        'items' => $items,
        'subtotalPaise' => array_sum(array_map(
            fn (array $i): int => $i['unitPricePaise'] * $i['quantity'],
            $items,
        )),
        'currency' => 'INR',
    ], $overrides);
}

function frameLine(ProductVariant $variant, int $qty = 1, ?int $claimedPrice = null): array
{
    return [
        'itemType' => 'frame',
        'productId' => (string) $variant->product_id,
        'productSlug' => $variant->product->slug,
        'variantId' => (string) $variant->id,
        'finishId' => 'natural-walnut',
        'quantity' => $qty,
        'unitPricePaise' => $claimedPrice ?? $variant->base_price_paise,
    ];
}

describe('POST /api/v1/orders', function (): void {
    beforeEach(function (): void {
        Mail::fake();
        // Checkout requires an account — guest checkout was removed.
        Sanctum::actingAs(User::factory()->create());
    });

    it('refuses an order from someone who is not signed in', function (): void {
        // The route is the enforcement point; the storefront's sign-in wall is
        // only the courteous half of the same rule.
        app()['auth']->forgetGuards();

        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant)]))
            ->assertUnauthorized();

        $this->assertDatabaseCount('orders', 0);
    });

    it('queues a confirmation email to the buyer', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant)]))->assertCreated();

        Mail::assertQueued(
            OrderConfirmation::class,
            fn (OrderConfirmation $mail): bool => $mail->hasTo('priya@example.com')
        );
    });

    it('places an order and returns a reference', function (): void {
        $product = Product::factory()->create(['name' => 'Classic Box']);
        $variant = ProductVariant::factory()->for($product)->create([
            'sku' => 'BOX-8X10', 'base_price_paise' => 899900, 'stock_qty' => 5,
        ]);

        $response = $this->postJson('/api/v1/orders', orderPayload([frameLine($variant, 2)]));

        $response->assertCreated()
            ->assertJsonPath('data.totalPaise', 1799800)
            ->assertJsonPath('data.subtotalMatchedClient', true)
            ->assertJsonStructure(['data' => ['orderReference', 'placedAt', 'estimatedDeliveryDays', 'contactEmail']]);

        $this->assertDatabaseHas('orders', [
            'email' => 'priya@example.com',
            // Every order now belongs to the customer who placed it.
            'user_id' => auth()->id(),
            'total' => 1799800,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    });

    it('stores each line with its resolved name, sku and subtotal', function (): void {
        $product = Product::factory()->create(['name' => 'Classic Box']);
        $variant = ProductVariant::factory()->for($product)->create([
            'sku' => 'BOX-8X10', 'size_label' => '8" × 10"', 'base_price_paise' => 899900, 'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant, 2)]))->assertCreated();

        $this->assertDatabaseHas('order_items', [
            'sku' => 'BOX-8X10',
            'name' => 'Classic Box — 8" × 10"',
            'unit_price_paise' => 899900,
            'quantity' => 2,
            'subtotal_paise' => 1799800,
        ]);
    });

    it('ignores a tampered client price and charges the database price', function (): void {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create([
            'sku' => 'BOX-8X10', 'base_price_paise' => 899900, 'stock_qty' => 5,
        ]);

        // Buyer claims the frame costs ₹1.
        $payload = orderPayload([frameLine($variant, 1, claimedPrice: 100)]);

        $response = $this->postJson('/api/v1/orders', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.totalPaise', 899900)
            ->assertJsonPath('data.subtotalMatchedClient', false);

        $this->assertDatabaseHas('order_items', ['unit_price_paise' => 899900]);
    });

    it('decrements variant stock', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX-8X10', 'base_price_paise' => 100000, 'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant, 3)]))->assertCreated();

        expect($variant->fresh()->stock_qty)->toBe(2);
    });

    it('rejects an order that exceeds available stock', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX-8X10', 'base_price_paise' => 100000, 'stock_qty' => 1,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant, 5)]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        expect($variant->fresh()->stock_qty)->toBe(1)
            ->and(Order::count())->toBe(0);
    });

    it('rejects an unknown variant', function (): void {
        $line = [
            'itemType' => 'frame',
            'productId' => '1', 'productSlug' => 'ghost', 'variantId' => '999999',
            'finishId' => null, 'quantity' => 1, 'unitPricePaise' => 1000,
        ];

        $this->postJson('/api/v1/orders', orderPayload([$line]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        expect(Order::count())->toBe(0);
    });

    it('accepts an art line and records it without a product FK', function (): void {
        $art = ArtProduct::factory()->create(['name' => 'Rajasthani Folk Dance']);
        $variant = ArtMaterialVariant::factory()->for($art, 'artProduct')->create([
            'sku' => 'ART-CANVAS-8X10', 'size_label' => '8" × 10"',
            'price_paise' => 249900, 'stock_qty' => 10,
        ]);

        $line = [
            'itemType' => 'art',
            'productId' => (string) $art->id, 'productSlug' => $art->slug,
            'variantId' => (string) $variant->id, 'finishId' => null,
            'quantity' => 1, 'unitPricePaise' => 249900,
        ];

        $this->postJson('/api/v1/orders', orderPayload([$line]))->assertCreated();

        $this->assertDatabaseHas('order_items', [
            'sku' => 'ART-CANVAS-8X10',
            'product_id' => null,
            'unit_price_paise' => 249900,
        ]);
    });

    it('handles a mixed frame + art cart', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'F1', 'base_price_paise' => 500000, 'stock_qty' => 5,
        ]);
        $art = ArtProduct::factory()->create();
        $artVariant = ArtMaterialVariant::factory()->for($art, 'artProduct')->create([
            'sku' => 'A1', 'price_paise' => 250000, 'stock_qty' => 5,
        ]);

        $payload = orderPayload([
            frameLine($variant, 1),
            ['itemType' => 'art', 'productId' => (string) $art->id, 'productSlug' => $art->slug,
                'variantId' => (string) $artVariant->id, 'finishId' => null, 'quantity' => 2, 'unitPricePaise' => 250000],
        ]);

        $this->postJson('/api/v1/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('data.totalPaise', 1000000);

        expect(Order::first()->items)->toHaveCount(2);
    });

    it('does not confuse an art variant with a frame variant of the same id', function (): void {
        // Both tables auto-increment independently, so id 1 exists in each.
        $frameVariant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'FRAME-1', 'base_price_paise' => 900000, 'stock_qty' => 5,
        ]);
        $artVariant = ArtMaterialVariant::factory()->for(ArtProduct::factory(), 'artProduct')->create([
            'sku' => 'ART-1', 'price_paise' => 100000, 'stock_qty' => 5,
        ]);

        expect($frameVariant->id)->toBe($artVariant->id);

        $art = $artVariant->artProduct;
        $payload = orderPayload([[
            'itemType' => 'art', 'productId' => (string) $art->id, 'productSlug' => $art->slug,
            'variantId' => (string) $artVariant->id, 'finishId' => null,
            'quantity' => 1, 'unitPricePaise' => 100000,
        ]]);

        $this->postJson('/api/v1/orders', $payload)
            ->assertCreated()
            ->assertJsonPath('data.totalPaise', 100000);

        $this->assertDatabaseHas('order_items', ['sku' => 'ART-1']);
        $this->assertDatabaseMissing('order_items', ['sku' => 'FRAME-1']);
    });

    it('rejects a line with a missing or invalid itemType', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 5,
        ]);
        $line = frameLine($variant);
        unset($line['itemType']);

        $this->postJson('/api/v1/orders', orderPayload([$line]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('items.0.itemType');
    });

    it('attaches the order to the signed-in customer', function (): void {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 5,
        ]);

        $this->postJson('/api/v1/orders', orderPayload([frameLine($variant)]))->assertCreated();

        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    });

    it('generates a unique order reference per order', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 50,
        ]);

        $first = $this->postJson('/api/v1/orders', orderPayload([frameLine($variant)]))->json('data.orderReference');
        $second = $this->postJson('/api/v1/orders', orderPayload([frameLine($variant)]))->json('data.orderReference');

        expect($first)->not->toBe($second)->and($first)->toStartWith('ODS-');
    });

    it('requires customer, address and items', function (): void {
        $this->postJson('/api/v1/orders', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['customer.fullName', 'customer.email', 'address.line1', 'items']);
    });
});

describe('order history', function (): void {
    it('rejects unauthenticated access', function (): void {
        $this->getJson('/api/v1/auth/orders')->assertUnauthorized();
    });

    it('returns only the signed-in customer orders', function (): void {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Order::factory()->for($user)->create(['order_number' => 'ODS-MINE']);
        Order::factory()->for($other)->create(['order_number' => 'ODS-THEIRS']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/orders')->assertOk();

        expect(array_column($response->json('data'), 'order_number'))->toBe(['ODS-MINE']);
    });

    it('404s when fetching an order belonging to someone else', function (): void {
        $user = User::factory()->create();
        Order::factory()->for(User::factory())->create(['order_number' => 'ODS-THEIRS']);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/auth/orders/ODS-THEIRS')->assertNotFound();
    });
});
