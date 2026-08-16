<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ArtCategory;
use App\Models\ArtProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ArtProduct>
 */
class ArtProductFactory extends Factory
{
    protected $model = ArtProduct::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);

        return [
            'art_category_id' => ArtCategory::factory(),
            'slug' => Str::slug($name),
            'name' => Str::title($name),
            'tagline' => $this->faker->sentence(5),
            'description' => $this->faker->paragraph(),
            'artist' => 'ODSArts Studio',
            'medium' => 'Digital illustration',
            'delivery_days' => 7,
            'tags' => ['art', 'print'],
            'is_featured' => false,
            'is_active' => true,
            'sort_order' => 10,
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (): array => ['is_featured' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
