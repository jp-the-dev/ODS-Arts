<?php

declare(strict_types=1);

use App\Models\ArtCategory;
use App\Models\ArtMaterialVariant;
use App\Models\ArtProduct;

function seedArt(): void
{
    $cultural = ArtCategory::factory()->create(['slug' => 'cultural']);
    $modern = ArtCategory::factory()->create(['slug' => 'modern']);

    $cheap = ArtProduct::factory()->for($cultural, 'category')->create([
        'slug' => 'folk-dance', 'name' => 'Folk Dance', 'medium' => 'Digital illustration',
        'tags' => ['rajasthan'], 'sort_order' => 20, 'description' => 'A.',
    ]);
    $dear = ArtProduct::factory()->for($modern, 'category')->create([
        'slug' => 'city-lines', 'name' => 'City Lines', 'medium' => 'Photography',
        'tags' => ['urban'], 'sort_order' => 10, 'description' => 'B.',
    ]);

    ArtMaterialVariant::factory()->for($cheap, 'artProduct')
        ->create(['sku' => 'FD-C', 'material' => 'canvas', 'size_label' => '8" × 10"', 'price_paise' => 100000, 'stock_qty' => 5]);
    ArtMaterialVariant::factory()->for($dear, 'artProduct')
        ->create(['sku' => 'CL-M', 'material' => 'metallic', 'size_label' => '16" × 20"', 'price_paise' => 300000, 'stock_qty' => 0]);
}

function artSlugs(array $json): array
{
    return array_column($json['data'], 'slug');
}

describe('GET /api/v1/art — filtering', function (): void {
    beforeEach(fn () => seedArt());

    it('returns everything unfiltered', function (): void {
        $this->getJson('/api/v1/art')->assertOk()->assertJsonCount(2, 'data');
    });

    it('filters by category style', function (): void {
        $response = $this->getJson('/api/v1/art?style=cultural')->assertOk();

        expect(artSlugs($response->json()))->toBe(['folk-dance']);
    });

    it('filters by print material', function (): void {
        $response = $this->getJson('/api/v1/art?material=metallic')->assertOk();

        expect(artSlugs($response->json()))->toBe(['city-lines']);
    });

    it('filters by size label', function (): void {
        $response = $this->getJson('/api/v1/art?size='.urlencode('8" × 10"'))->assertOk();

        expect(artSlugs($response->json()))->toBe(['folk-dance']);
    });

    it('filters by price on the cheapest variant', function (): void {
        $response = $this->getJson('/api/v1/art?max_price=150000')->assertOk();

        expect(artSlugs($response->json()))->toBe(['folk-dance']);
    });

    it('filters to in-stock only', function (): void {
        $response = $this->getJson('/api/v1/art?in_stock=1')->assertOk();

        expect(artSlugs($response->json()))->toBe(['folk-dance']);
    });

    it('searches name, medium and tags', function (string $term, string $expected): void {
        $response = $this->getJson('/api/v1/art?q='.urlencode($term))->assertOk();

        expect(artSlugs($response->json()))->toBe([$expected]);
    })->with([
        ['Folk', 'folk-dance'],
        ['Photography', 'city-lines'],
        ['rajasthan', 'folk-dance'],
    ]);

    it('sorts by cheapest variant ascending', function (): void {
        $response = $this->getJson('/api/v1/art?sort=price_asc')->assertOk();

        expect(artSlugs($response->json()))->toBe(['folk-dance', 'city-lines']);
    });

    it('sorts by cheapest variant descending', function (): void {
        $response = $this->getJson('/api/v1/art?sort=price_desc')->assertOk();

        expect(artSlugs($response->json()))->toBe(['city-lines', 'folk-dance']);
    });

    it('defaults to sort_order', function (): void {
        $response = $this->getJson('/api/v1/art')->assertOk();

        expect(artSlugs($response->json()))->toBe(['city-lines', 'folk-dance']);
    });

    it('excludes inactive art even when filtering', function (): void {
        ArtProduct::factory()->create(['slug' => 'hidden', 'name' => 'Folk Hidden', 'is_active' => false]);

        $response = $this->getJson('/api/v1/art?q=Folk')->assertOk();

        expect(artSlugs($response->json()))->not->toContain('hidden');
    });

    it('rejects an unknown sort key', function (): void {
        $this->getJson('/api/v1/art?sort=bogus')
            ->assertStatus(422)
            ->assertJsonValidationErrors('sort');
    });

    it('rejects a negative price bound', function (): void {
        $this->getJson('/api/v1/art?min_price=-1')
            ->assertStatus(422)
            ->assertJsonValidationErrors('min_price');
    });
});
