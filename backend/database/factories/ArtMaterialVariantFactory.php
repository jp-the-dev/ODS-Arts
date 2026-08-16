<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ArtMaterialVariant;
use App\Models\ArtProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ArtMaterialVariant>
 */
class ArtMaterialVariantFactory extends Factory
{
    protected $model = ArtMaterialVariant::class;

    public function definition(): array
    {
        return [
            'art_product_id' => ArtProduct::factory(),
            'sku' => Str::upper(Str::random(10)),
            'material' => 'canvas',
            'size_label' => '8" × 10"',
            'dimensions_cm' => '20 × 25 cm',
            'price_paise' => 249900,
            'stock_qty' => 10,
            'weight_grams' => 400,
            'sort_order' => 10,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn (): array => ['stock_qty' => 0]);
    }

    public function material(string $material, int $pricePaise): static
    {
        return $this->state(fn (): array => [
            'material' => $material,
            'price_paise' => $pricePaise,
        ]);
    }
}
