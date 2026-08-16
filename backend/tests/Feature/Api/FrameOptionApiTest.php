<?php

declare(strict_types=1);

use App\Models\FrameOption;

describe('GET /api/v1/frame-options', function (): void {
    it('groups active options by type', function (): void {
        FrameOption::factory()->create(['name' => 'Walnut', 'slug' => 'walnut']);
        FrameOption::factory()->mat()->create(['name' => 'Ivory', 'slug' => 'ivory']);
        FrameOption::factory()->glass()->create(['name' => 'Museum', 'slug' => 'museum']);

        $this->getJson('/api/v1/frame-options')
            ->assertOk()
            ->assertJsonCount(1, 'data.wood')
            ->assertJsonCount(1, 'data.mat')
            ->assertJsonCount(1, 'data.glass')
            ->assertJsonPath('data.wood.0.slug', 'walnut');
    });

    it('always returns all three groups, even when empty', function (): void {
        $this->getJson('/api/v1/frame-options')
            ->assertOk()
            ->assertJsonPath('data.wood', [])
            ->assertJsonPath('data.mat', [])
            ->assertJsonPath('data.glass', []);
    });

    it('excludes inactive options', function (): void {
        FrameOption::factory()->create(['slug' => 'shown']);
        FrameOption::factory()->inactive()->create(['slug' => 'hidden']);

        $this->getJson('/api/v1/frame-options')
            ->assertOk()
            ->assertJsonCount(1, 'data.wood')
            ->assertJsonPath('data.wood.0.slug', 'shown');
    });

    it('orders options within a group by sort_order', function (): void {
        FrameOption::factory()->create(['slug' => 'second', 'sort_order' => 20]);
        FrameOption::factory()->create(['slug' => 'first', 'sort_order' => 10]);

        $this->getJson('/api/v1/frame-options')
            ->assertOk()
            ->assertJsonPath('data.wood.0.slug', 'first');
    });
});
