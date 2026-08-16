<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Testimonial;

describe('GET /api/v1/testimonials', function (): void {
    it('returns active testimonials', function (): void {
        Testimonial::factory()->create(['author' => 'Priya Mehta']);

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.author', 'Priya Mehta');
    });

    it('excludes inactive testimonials', function (): void {
        Testimonial::factory()->create(['author' => 'Shown']);
        Testimonial::factory()->create(['author' => 'Hidden', 'is_active' => false]);

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.author', 'Shown');
    });

    it('embeds the related product when one is attached', function (): void {
        $product = Product::factory()->create(['slug' => 'classic-box']);
        Testimonial::factory()->for($product)->create();

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('handles testimonials with no product', function (): void {
        Testimonial::factory()->create(['product_id' => null]);

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('returns an empty list when nothing exists', function (): void {
        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('does not paginate unless asked', function (): void {
        Testimonial::factory()->count(3)->create();

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonMissingPath('meta.per_page');
    });

    it('paginates on request', function (): void {
        Testimonial::factory()->count(3)->create();

        $this->getJson('/api/v1/testimonials?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 3);
    });
});
