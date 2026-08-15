<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\FrameOption;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FrameOption>
 */
class FrameOptionFactory extends Factory
{
    protected $model = FrameOption::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'type' => 'wood',
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'material' => 'Solid Walnut',
            'finish' => 'Satin',
            'price_modifier_in_paise' => 0,
            'is_active' => true,
            'sort_order' => 10,
        ];
    }

    /** A mat option rather than the default wood. */
    public function mat(): static
    {
        return $this->state(fn (): array => [
            'type' => 'mat',
            'material' => 'Conservation Board',
            'finish' => 'Ivory',
        ]);
    }

    /** A glass option rather than the default wood. */
    public function glass(): static
    {
        return $this->state(fn (): array => [
            'type' => 'glass',
            'material' => 'Museum Glass',
            'finish' => 'UV-Protective',
        ]);
    }

    /** Carries a price surcharge (or discount, if negative). */
    public function withModifier(int $paise): static
    {
        return $this->state(fn (): array => ['price_modifier_in_paise' => $paise]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
