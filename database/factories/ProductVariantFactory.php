<?php

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
            'sku' => strtoupper(Str::random(8)),
            'size_label' => fake()->randomElement(['8×10', '11×14', '16×20']),
            'dimensions_cm' => fake()->randomElement(['20×25', '28×36', '40×50']),
            'base_price_paise' => fake()->numberBetween(10000, 50000),
            'stock_qty' => 10,
            'weight_grams' => 500,
            'sort_order' => 0,
        ];
    }
}
