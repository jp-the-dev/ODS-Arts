<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(5000, 25000);
        $quantity = fake()->numberBetween(1, 3);
        $product = Product::factory()->create();

        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'sku' => strtoupper(Str::random(8)),
            'size_label' => fake()->randomElement(['8×10', '11×14', '16×20']),
            'dimensions_cm' => fake()->randomElement(['20×25', '28×36', '40×50']),
            'base_price_paise' => $unitPrice,
        ]);

        return [
            'order_id' => Order::factory(),
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'name' => $product->name,
            'sku' => $variant->sku,
            'unit_price_paise' => $unitPrice,
            'quantity' => $quantity,
            'subtotal_paise' => $unitPrice * $quantity,
            'options' => null,
        ];
    }
}
