<?php

declare(strict_types=1);

use App\Models\FrameOption;

describe('POST /api/v1/framing/calculate-price', function (): void {
    it('adds each selected modifier to the base price', function (): void {
        FrameOption::factory()->withModifier(2000)->create(['slug' => 'walnut-dark', 'name' => 'Walnut Dark']);
        FrameOption::factory()->glass()->withModifier(8000)->create(['slug' => 'museum-uv', 'name' => 'Museum UV']);

        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 149900,
            'wood_slug' => 'walnut-dark',
            'glass_slug' => 'museum-uv',
        ])
            ->assertOk()
            ->assertJsonPath('data.base_price', 1499)
            ->assertJsonPath('data.total_price', 1599)
            ->assertJsonPath('data.breakdown.wood.name', 'Walnut Dark')
            ->assertJsonPath('data.breakdown.glass.modifier', 80);
    });

    it('applies negative modifiers as discounts', function (): void {
        FrameOption::factory()->mat()->withModifier(-2000)->create(['slug' => 'no-mat', 'name' => 'No Mat']);

        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 100000,
            'mat_slug' => 'no-mat',
        ])
            ->assertOk()
            ->assertJsonPath('data.total_price', 980);
    });

    it('returns the base price when no options are selected', function (): void {
        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 149900,
        ])
            ->assertOk()
            ->assertJsonPath('data.total_price', 1499)
            ->assertJsonPath('data.breakdown', []);
    });

    it('never returns a negative total', function (): void {
        FrameOption::factory()->withModifier(-500000)->create(['slug' => 'absurd-discount']);

        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 10000,
            'wood_slug' => 'absurd-discount',
        ])
            ->assertOk()
            ->assertJsonPath('data.total_price', 0);
    });

    it('requires a base price', function (): void {
        $this->postJson('/api/v1/framing/calculate-price', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('base_price_in_paise');
    });

    it('rejects a negative base price', function (): void {
        $this->postJson('/api/v1/framing/calculate-price', ['base_price_in_paise' => -1])
            ->assertStatus(422)
            ->assertJsonValidationErrors('base_price_in_paise');
    });

    it('rejects a slug that does not exist', function (): void {
        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 10000,
            'wood_slug' => 'not-a-real-option',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('wood_slug');
    });

    it('ignores an inactive option even when the slug exists', function (): void {
        FrameOption::factory()->inactive()->withModifier(5000)->create(['slug' => 'retired']);

        $this->postJson('/api/v1/framing/calculate-price', [
            'base_price_in_paise' => 10000,
            'wood_slug' => 'retired',
        ])
            ->assertOk()
            ->assertJsonPath('data.total_price', 100);
    });
});
