<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ArtImage;
use App\Models\ArtProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ArtImage>
 */
class ArtImageFactory extends Factory
{
    protected $model = ArtImage::class;

    public function definition(): array
    {
        return [
            'art_product_id' => ArtProduct::factory(),
            'path' => '/images/art/'.$this->faker->uuid().'.png',
            'alt' => $this->faker->sentence(4),
            'role' => 'hero',
            'sort_order' => 10,
        ];
    }
}
