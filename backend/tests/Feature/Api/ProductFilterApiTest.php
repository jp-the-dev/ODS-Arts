<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;

/** Three products in two collections, spanning price, size and delivery. */
function seedCatalogue(): void
{
    $walnut = Collection::factory()->create(['slug' => 'walnut']);
    $gallery = Collection::factory()->create(['slug' => 'gallery']);

    $cheap = Product::factory()->for($walnut)->create([
        'slug' => 'cheap-small', 'name' => 'Classic Box', 'tagline' => 'Deep grain.',
        'price_in_paise' => 100000, 'dimensions' => '8" × 10"', 'delivery_days' => 21,
        'sort_order' => 30, 'material' => 'Solid Walnut',
    ]);
    $mid = Product::factory()->for($walnut)->create([
        'slug' => 'mid-large', 'name' => 'Slim Box', 'tagline' => 'Understated.',
        'price_in_paise' => 200000, 'dimensions' => '11" × 14"', 'delivery_days' => 14,
        'sort_order' => 20, 'material' => 'Solid Oak',
    ]);
    $dear = Product::factory()->for($gallery)->create([
        'slug' => 'dear-small', 'name' => 'Gallery Float', 'tagline' => 'Floating mount.',
        'price_in_paise' => 300000, 'dimensions' => '8" × 10"', 'delivery_days' => 10,
        'sort_order' => 10, 'material' => 'Museum Glass',
    ]);

    // Cheapest variant defines the product's effective price and its sizes.
    ProductVariant::factory()->for($cheap)->size('8" × 10"', 100000)->create(['sku' => 'CHEAP-S']);
    ProductVariant::factory()->for($mid)->size('11" × 14"', 200000)->create(['sku' => 'MID-L']);
    ProductVariant::factory()->for($dear)->size('8" × 10"', 300000)->create(['sku' => 'DEAR-S']);
}

function slugsFrom(array $json): array
{
    return array_column($json['data'], 'slug');
}

describe('GET /api/v1/products — filtering', function (): void {
    beforeEach(fn () => seedCatalogue());

    it('returns everything when no filters are given', function (): void {
        $this->getJson('/api/v1/products')->assertOk()->assertJsonCount(3, 'data');
    });

    it('filters by a single collection slug', function (): void {
        $response = $this->getJson('/api/v1/products?c=gallery')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['dear-small']);
    });

    it('filters by several comma-separated collection slugs', function (): void {
        $this->getJson('/api/v1/products?c=walnut,gallery')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });

    it('returns nothing for an unknown collection slug', function (): void {
        $this->getJson('/api/v1/products?c=nonexistent')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('filters by pipe-separated size labels', function (): void {
        $response = $this->getJson('/api/v1/products?s='.urlencode('8" × 10"'))->assertOk();

        expect(slugsFrom($response->json()))->toEqualCanonicalizing(['cheap-small', 'dear-small']);
    });

    it('filters by a minimum price in paise, inclusive', function (): void {
        $response = $this->getJson('/api/v1/products?min=200000')->assertOk();

        expect(slugsFrom($response->json()))->toEqualCanonicalizing(['mid-large', 'dear-small']);
    });

    it('filters by a maximum price in paise, inclusive', function (): void {
        $response = $this->getJson('/api/v1/products?max=200000')->assertOk();

        expect(slugsFrom($response->json()))->toEqualCanonicalizing(['cheap-small', 'mid-large']);
    });

    it('filters by a price range', function (): void {
        $response = $this->getJson('/api/v1/products?min=150000&max=250000')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['mid-large']);
    });

    it('combines collection and price filters', function (): void {
        $response = $this->getJson('/api/v1/products?c=walnut&max=150000')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['cheap-small']);
    });

    it('searches name, tagline and material', function (string $term, string $expected): void {
        $response = $this->getJson('/api/v1/products?q='.urlencode($term))->assertOk();

        expect(slugsFrom($response->json()))->toBe([$expected]);
    })->with([
        ['Gallery', 'dear-small'],
        ['Understated', 'mid-large'],
        ['Walnut', 'cheap-small'],
    ]);

    it('returns nothing when the search matches no product', function (): void {
        $this->getJson('/api/v1/products?q=zzzznomatch')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('still excludes inactive products when filtering', function (): void {
        Product::factory()->create(['slug' => 'archived', 'is_active' => false, 'price_in_paise' => 100000]);

        $response = $this->getJson('/api/v1/products?max=100000')->assertOk();

        expect(slugsFrom($response->json()))->not->toContain('archived');
    });
});

describe('GET /api/v1/products — sorting', function (): void {
    beforeEach(fn () => seedCatalogue());

    it('sorts by price ascending', function (): void {
        $response = $this->getJson('/api/v1/products?sort=price_asc')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['cheap-small', 'mid-large', 'dear-small']);
    });

    it('sorts by price descending', function (): void {
        $response = $this->getJson('/api/v1/products?sort=price_desc')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['dear-small', 'mid-large', 'cheap-small']);
    });

    it('sorts by fastest delivery', function (): void {
        $response = $this->getJson('/api/v1/products?sort=delivery_asc')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['dear-small', 'mid-large', 'cheap-small']);
    });

    it('defaults to sort_order when no sort is given', function (): void {
        $response = $this->getJson('/api/v1/products')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['dear-small', 'mid-large', 'cheap-small']);
    });

    it('treats recommended as the sort_order default', function (): void {
        $response = $this->getJson('/api/v1/products?sort=recommended')->assertOk();

        expect(slugsFrom($response->json()))->toBe(['dear-small', 'mid-large', 'cheap-small']);
    });
});

describe('GET /api/v1/products — pagination', function (): void {
    beforeEach(fn () => seedCatalogue());

    it('is opt-out by default — the full collection is returned unwrapped', function (): void {
        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonMissingPath('meta.per_page');
    });

    it('paginates when per_page is supplied', function (): void {
        $this->getJson('/api/v1/products?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 2);
    });

    it('returns the requested page', function (): void {
        $first = $this->getJson('/api/v1/products?per_page=2&page=1')->assertOk();
        $second = $this->getJson('/api/v1/products?per_page=2&page=2')->assertOk();

        expect($second->json('data'))->toHaveCount(1)
            ->and(slugsFrom($second->json()))->not->toEqualCanonicalizing(slugsFrom($first->json()));
    });

    it('keeps filters applied while paginating', function (): void {
        $this->getJson('/api/v1/products?c=walnut&per_page=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 2);
    });
});

describe('GET /api/v1/products — validation', function (): void {
    it('rejects an unknown sort key', function (): void {
        $this->getJson('/api/v1/products?sort=bogus')
            ->assertStatus(422)
            ->assertJsonValidationErrors('sort');
    });

    it('rejects a negative price bound', function (): void {
        $this->getJson('/api/v1/products?min=-5')
            ->assertStatus(422)
            ->assertJsonValidationErrors('min');
    });

    it('rejects a non-numeric price bound', function (): void {
        $this->getJson('/api/v1/products?max=abc')
            ->assertStatus(422)
            ->assertJsonValidationErrors('max');
    });

    it('rejects an oversized per_page', function (): void {
        $this->getJson('/api/v1/products?per_page=500')
            ->assertStatus(422)
            ->assertJsonValidationErrors('per_page');
    });

    it('accepts stock=1 and keeps in-stock products', function (): void {
        seedCatalogue();

        $this->getJson('/api/v1/products?stock=1')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    });
});
