<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Product;

describe('GET /api/v1/collections', function (): void {
    it('returns active collections', function (): void {
        Collection::factory()->create(['name' => 'Alpha', 'slug' => 'alpha']);

        $response = $this->getJson('/api/v1/collections');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'alpha');
    });

    it('excludes inactive collections', function (): void {
        Collection::factory()->create(['slug' => 'visible']);
        Collection::factory()->create(['slug' => 'hidden', 'is_active' => false]);

        $this->getJson('/api/v1/collections')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'visible');
    });

    it('orders collections by sort_order', function (): void {
        Collection::factory()->create(['slug' => 'second', 'sort_order' => 20]);
        Collection::factory()->create(['slug' => 'first', 'sort_order' => 10]);

        $this->getJson('/api/v1/collections')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'first')
            ->assertJsonPath('data.1.slug', 'second');
    });

    it('exposes the documented resource shape', function (): void {
        Collection::factory()->create(['slug' => 'shape']);

        $this->getJson('/api/v1/collections')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    ['id', 'slug', 'name', 'number', 'eyebrow', 'tagline',
                        'description', 'long_description', 'materials',
                        'features', 'image_src', 'image_alt', 'image_position'],
                ],
            ]);
    });

    it('returns an empty list when nothing exists', function (): void {
        $this->getJson('/api/v1/collections')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });
});

describe('GET /api/v1/collections/{slug}', function (): void {
    it('returns a single collection with its active products', function (): void {
        $collection = Collection::factory()->create(['slug' => 'walnut']);
        Product::factory()->for($collection)->create(['slug' => 'in-stock']);
        Product::factory()->for($collection)->create(['slug' => 'archived', 'is_active' => false]);

        $response = $this->getJson('/api/v1/collections/walnut');

        $response->assertOk()
            ->assertJsonPath('data.slug', 'walnut')
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.slug', 'in-stock');
    });

    it('404s for an unknown slug', function (): void {
        $this->getJson('/api/v1/collections/does-not-exist')
            ->assertNotFound()
            ->assertJsonPath('message', 'Collection not found.');
    });

    it('404s for an inactive collection', function (): void {
        Collection::factory()->create(['slug' => 'hidden', 'is_active' => false]);

        $this->getJson('/api/v1/collections/hidden')->assertNotFound();
    });
});
