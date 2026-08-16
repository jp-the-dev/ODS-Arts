<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ArtCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ArtCategory>
 */
class ArtCategoryFactory extends Factory
{
    protected $model = ArtCategory::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->words(2, true);

        return [
            'slug' => Str::slug($title),
            'display_number' => '01',
            'eyebrow' => 'Curated',
            'title' => Str::title($title),
            'tagline' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(),
            'cover_image' => null,
            'cover_image_alt' => null,
            'accent_color' => '#C9A96E',
            'is_active' => true,
            'sort_order' => 10,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
