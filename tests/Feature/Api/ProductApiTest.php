<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;

describe('GET /api/v1/products', function (): void {
    it('returns active products', function (): void {
        Product::factory()->create(['slug' => 'live']);
        Product::factory()->create(['slug' => 'archived', 'is_active' => false]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'live');
    });

    it('embeds the parent collection and ordered images', function (): void {
        $collection = Collection::factory()->create(['slug' => 'walnut']);
        $product = Product::factory()->for($collection)->create(['slug' => 'framed']);
        ProductImage::factory()->for($product)->create(['sort_order' => 20, 'alt' => 'second']);
        ProductImage::factory()->for($product)->create(['sort_order' => 10, 'alt' => 'first']);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('data.0.collection.slug', 'walnut')
            ->assertJsonCount(2, 'data.0.images')
            ->assertJsonPath('data.0.images.0.alt', 'first');
    });

    it('exposes price in rupees, converted from paise', function (): void {
        Product::factory()->create(['price_in_paise' => 249900]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('data.0.price', 2499);
    });

    it('exposes the documented resource shape', function (): void {
        Product::factory()->create();

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    ['id', 'slug', 'name', 'tagline', 'description', 'delivery_days',
                        'care_instructions', 'material', 'materials', 'dimensions',
                        'price', 'is_featured', 'collection', 'images'],
                ],
            ]);
    });
});

describe('GET /api/v1/products/featured', function (): void {
    it('returns only featured active products', function (): void {
        Product::factory()->create(['slug' => 'star', 'is_featured' => true]);
        Product::factory()->create(['slug' => 'plain', 'is_featured' => false]);

        $this->getJson('/api/v1/products/featured')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'star');
    });

    it('excludes featured products that are inactive', function (): void {
        Product::factory()->create(['is_featured' => true, 'is_active' => false]);

        $this->getJson('/api/v1/products/featured')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });
});

describe('GET /api/v1/products/{slug}', function (): void {
    it('returns a single product', function (): void {
        Product::factory()->create(['slug' => 'classic-box']);

        $this->getJson('/api/v1/products/classic-box')
            ->assertOk()
            ->assertJsonPath('data.slug', 'classic-box');
    });

    it('404s for an unknown slug', function (): void {
        $this->getJson('/api/v1/products/nope')
            ->assertNotFound()
            ->assertJsonPath('message', 'Product not found.');
    });

    it('404s for an inactive product', function (): void {
        Product::factory()->create(['slug' => 'archived', 'is_active' => false]);

        $this->getJson('/api/v1/products/archived')->assertNotFound();
    });

    it('resolves the featured route before the slug wildcard', function (): void {
        // Guards against `/products/featured` being captured by `/products/{slug}`.
        Product::factory()->create(['slug' => 'anything', 'is_featured' => true]);

        $this->getJson('/api/v1/products/featured')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });
});
