<?php

declare(strict_types=1);

use App\Models\ArtProduct;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;

describe('GET /api/v1/search', function (): void {
    it('finds frames by name', function (): void {
        // ProductFactory cycles a fixed list whose materials include "Solid
        // Walnut", so both fields are pinned to keep this about the name only.
        Product::factory()->create([
            'name' => 'Classic Walnut', 'slug' => 'classic-walnut',
            'material' => 'Oak', 'materials' => [], 'description' => 'Plain.',
        ]);
        Product::factory()->create([
            'name' => 'Gallery Float', 'slug' => 'gallery-float',
            'material' => 'Aluminium', 'materials' => [], 'description' => 'Plain.',
        ]);

        $response = $this->getJson('/api/v1/search?q=walnut')->assertOk();

        expect(array_column($response->json('data.products'), 'slug'))->toBe(['classic-walnut'])
            ->and($response->json('data.total'))->toBe(1);
    });

    it('finds frames by material and tagline', function (string $term): void {
        Product::factory()->create([
            'slug' => 'target', 'name' => 'Plain', 'tagline' => 'Understated restraint.',
            'material' => 'Solid Oak',
        ]);

        $response = $this->getJson('/api/v1/search?q='.urlencode($term))->assertOk();

        expect(array_column($response->json('data.products'), 'slug'))->toBe(['target']);
    })->with(['Oak', 'restraint']);

    it('finds art by name, medium and tags', function (string $term): void {
        ArtProduct::factory()->create([
            'slug' => 'folk-dance', 'name' => 'Folk Dance',
            'medium' => 'Digital illustration', 'tags' => ['rajasthan', 'heritage'],
        ]);

        $response = $this->getJson('/api/v1/search?q='.urlencode($term))->assertOk();

        expect(array_column($response->json('data.art'), 'slug'))->toBe(['folk-dance']);
    })->with(['Folk', 'illustration', 'rajasthan']);

    it('searches frames and art together in one call', function (): void {
        Product::factory()->create(['slug' => 'walnut-frame', 'name' => 'Walnut Frame']);
        ArtProduct::factory()->create(['slug' => 'walnut-study', 'name' => 'Walnut Study']);

        $response = $this->getJson('/api/v1/search?q=walnut')->assertOk();

        expect($response->json('data.products'))->toHaveCount(1)
            ->and($response->json('data.art'))->toHaveCount(1)
            ->and($response->json('data.total'))->toBe(2);
    });

    it('excludes inactive frames and art', function (): void {
        Product::factory()->create(['name' => 'Walnut Hidden', 'is_active' => false]);
        ArtProduct::factory()->create(['name' => 'Walnut Hidden Art', 'is_active' => false]);

        $this->getJson('/api/v1/search?q=walnut')
            ->assertOk()
            ->assertJsonPath('data.total', 0);
    });

    it('caps returned results at the limit but reports the true total', function (): void {
        $collection = Collection::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            Product::factory()->for($collection)->create([
                'name' => "Walnut {$i}", 'slug' => "walnut-{$i}",
            ]);
        }

        $response = $this->getJson('/api/v1/search?q=walnut&limit=2')->assertOk();

        expect($response->json('data.products'))->toHaveCount(2)
            ->and($response->json('data.total'))->toBe(5);
    });

    it('lets art fill the remaining limit after frames', function (): void {
        Product::factory()->create(['name' => 'Walnut Frame', 'slug' => 'wf']);
        ArtProduct::factory()->create(['name' => 'Walnut Art A', 'slug' => 'wa-a']);
        ArtProduct::factory()->create(['name' => 'Walnut Art B', 'slug' => 'wa-b']);

        $response = $this->getJson('/api/v1/search?q=walnut&limit=2')->assertOk();

        expect($response->json('data.products'))->toHaveCount(1)
            ->and($response->json('data.art'))->toHaveCount(1)
            ->and($response->json('data.total'))->toBe(3);
    });

    it('can be narrowed to art only', function (): void {
        Product::factory()->create(['name' => 'Walnut Frame']);
        ArtProduct::factory()->create(['name' => 'Walnut Art', 'slug' => 'wa']);

        $response = $this->getJson('/api/v1/search?q=walnut&type=art')->assertOk();

        expect($response->json('data.products'))->toBeEmpty()
            ->and($response->json('data.art'))->toHaveCount(1);
    });

    it('can be narrowed to frames only', function (): void {
        Product::factory()->create(['name' => 'Walnut Frame', 'slug' => 'wf']);
        ArtProduct::factory()->create(['name' => 'Walnut Art']);

        $response = $this->getJson('/api/v1/search?q=walnut&type=frames')->assertOk();

        expect($response->json('data.art'))->toBeEmpty()
            ->and($response->json('data.products'))->toHaveCount(1);
    });

    it('returns empty results rather than erroring on no match', function (): void {
        Product::factory()->create(['name' => 'Walnut']);

        $this->getJson('/api/v1/search?q=zzzznothing')
            ->assertOk()
            ->assertJsonPath('data.total', 0)
            ->assertJsonPath('data.products', [])
            ->assertJsonPath('data.art', []);
    });

    it('returns frames in the full product shape, with variants', function (): void {
        $product = Product::factory()->create(['name' => 'Walnut Frame', 'slug' => 'wf']);
        ProductVariant::factory()->for($product)->create(['sku' => 'WF-1']);

        $this->getJson('/api/v1/search?q=walnut')
            ->assertOk()
            ->assertJsonPath('data.products.0.variants.0.sku', 'WF-1')
            ->assertJsonStructure([
                'data' => ['products' => [['id', 'slug', 'name', 'price', 'images', 'variants']]],
            ]);
    });

    it('requires a query', function (): void {
        $this->getJson('/api/v1/search')
            ->assertStatus(422)
            ->assertJsonValidationErrors('q');
    });

    it('rejects an oversized limit', function (): void {
        $this->getJson('/api/v1/search?q=a&limit=500')
            ->assertStatus(422)
            ->assertJsonValidationErrors('limit');
    });
});
