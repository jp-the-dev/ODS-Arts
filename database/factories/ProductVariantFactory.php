<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => Str::upper(Str::random(10)),
            'size_label' => '8" × 10"',
            'dimensions_cm' => '20 × 25 cm',
            'base_price_paise' => 899900,
            'stock_qty' => 10,
            'weight_grams' => 950,
            'sort_order' => 10,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn (): array => ['stock_qty' => 0]);
    }

    public function size(string $label, int $pricePaise): static
    {
        return $this->state(fn (): array => [
            'size_label' => $label,
            'base_price_paise' => $pricePaise,
        ]);
    }
}
