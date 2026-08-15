<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\FinishOption;
use App\Models\Product;
use App\Models\ProductVariant;

describe('variants in the product payload', function (): void {
    it('exposes variants in sort order with paise pricing', function (): void {
        $product = Product::factory()->create(['slug' => 'framed']);
        ProductVariant::factory()->for($product)->create([
            'sku' => 'BIG', 'size_label' => '16" × 20"', 'base_price_paise' => 1899900, 'sort_order' => 20,
        ]);
        ProductVariant::factory()->for($product)->create([
            'sku' => 'SMALL', 'size_label' => '8" × 10"', 'base_price_paise' => 899900, 'sort_order' => 10,
        ]);

        $this->getJson('/api/v1/products/framed')
            ->assertOk()
            ->assertJsonCount(2, 'data.variants')
            ->assertJsonPath('data.variants.0.sku', 'SMALL')
            ->assertJsonPath('data.variants.0.base_price_paise', 899900)
            ->assertJsonStructure([
                'data' => ['variants' => [
                    ['id', 'sku', 'size_label', 'dimensions_cm', 'base_price_paise', 'stock_qty', 'weight_grams'],
                ]],
            ]);
    });

    it('exposes the collection finish options on each product', function (): void {
        $collection = Collection::factory()->create(['slug' => 'walnut']);
        FinishOption::factory()->for($collection)->create([
            'name' => 'Natural Walnut', 'slug' => 'natural-walnut', 'swatch_hex' => '#5C3A21', 'sort_order' => 10,
        ]);
        FinishOption::factory()->for($collection)->withDelta(100000)->create([
            'name' => 'Dark Walnut', 'slug' => 'dark-walnut', 'swatch_hex' => '#2C1A0E', 'sort_order' => 20,
        ]);
        Product::factory()->for($collection)->create(['slug' => 'framed']);

        $this->getJson('/api/v1/products/framed')
            ->assertOk()
            ->assertJsonCount(2, 'data.finish_options')
            ->assertJsonPath('data.finish_options.0.id', 'natural-walnut')
            ->assertJsonPath('data.finish_options.0.swatch_hex', '#5C3A21')
            ->assertJsonPath('data.finish_options.1.price_delta_paise', 100000);
    });

    it('shares one finish set across every product in a collection', function (): void {
        $collection = Collection::factory()->create();
        FinishOption::factory()->for($collection)->create(['slug' => 'shared']);
        Product::factory()->for($collection)->create(['slug' => 'one']);
        Product::factory()->for($collection)->create(['slug' => 'two']);

        foreach (['one', 'two'] as $slug) {
            $this->getJson("/api/v1/products/{$slug}")
                ->assertOk()
                ->assertJsonPath('data.finish_options.0.id', 'shared');
        }
    });

    it('returns empty arrays for a product with no variants or finishes', function (): void {
        Product::factory()->create(['slug' => 'bare']);

        $this->getJson('/api/v1/products/bare')
            ->assertOk()
            ->assertJsonPath('data.variants', [])
            ->assertJsonPath('data.finish_options', []);
    });

    it('includes variants on the collection detail payload', function (): void {
        $collection = Collection::factory()->create(['slug' => 'walnut']);
        $product = Product::factory()->for($collection)->create(['slug' => 'framed']);
        ProductVariant::factory()->for($product)->create(['sku' => 'ONLY']);

        $this->getJson('/api/v1/collections/walnut')
            ->assertOk()
            ->assertJsonPath('data.products.0.variants.0.sku', 'ONLY');
    });
});

describe('stock filtering via variants', function (): void {
    it('excludes products whose every variant is out of stock', function (): void {
        $inStock = Product::factory()->create(['slug' => 'available']);
        ProductVariant::factory()->for($inStock)->create(['sku' => 'A', 'stock_qty' => 3]);

        $sold = Product::factory()->create(['slug' => 'sold-out']);
        ProductVariant::factory()->for($sold)->outOfStock()->create(['sku' => 'B']);

        $response = $this->getJson('/api/v1/products?stock=1')->assertOk();

        expect(array_column($response->json('data'), 'slug'))->toBe(['available']);
    });

    it('keeps a product when only some variants are out of stock', function (): void {
        $product = Product::factory()->create(['slug' => 'partial']);
        ProductVariant::factory()->for($product)->outOfStock()->create(['sku' => 'C']);
        ProductVariant::factory()->for($product)->create(['sku' => 'D', 'stock_qty' => 5]);

        $this->getJson('/api/v1/products?stock=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('keeps variant-less products listed rather than hiding them', function (): void {
        Product::factory()->create(['slug' => 'legacy']);

        $this->getJson('/api/v1/products?stock=1')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'legacy');
    });
});

describe('price filtering uses the cheapest variant', function (): void {
    it('matches on the lowest variant price, not the highest', function (): void {
        $product = Product::factory()->create(['slug' => 'wide-range', 'price_in_paise' => 5000000]);
        ProductVariant::factory()->for($product)->size('8" × 10"', 100000)->create(['sku' => 'LOW']);
        ProductVariant::factory()->for($product)->size('20" × 24"', 9000000)->create(['sku' => 'HIGH']);

        $this->getJson('/api/v1/products?max=150000')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('falls back to the product price when it has no variants', function (): void {
        Product::factory()->create(['slug' => 'legacy', 'price_in_paise' => 250000]);

        $this->getJson('/api/v1/products?min=200000&max=300000')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('sorts by the cheapest variant', function (): void {
        $a = Product::factory()->create(['slug' => 'a', 'sort_order' => 10]);
        ProductVariant::factory()->for($a)->size('8" × 10"', 500000)->create(['sku' => 'A1']);
        $b = Product::factory()->create(['slug' => 'b', 'sort_order' => 20]);
        ProductVariant::factory()->for($b)->size('8" × 10"', 100000)->create(['sku' => 'B1']);

        $response = $this->getJson('/api/v1/products?sort=price_asc')->assertOk();

        expect(array_column($response->json('data'), 'slug'))->toBe(['b', 'a']);
    });
});
