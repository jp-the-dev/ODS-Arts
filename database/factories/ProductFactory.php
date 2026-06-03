<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /** @var array<int, array{name: string, material: string, dimensions: string, price: int}> */
    private static array $products = [
        ['name' => 'Classic Walnut 8×10', 'material' => 'Solid Walnut', 'dimensions' => '8×10 inches', 'price' => 249900],
        ['name' => 'Classic Walnut 12×16', 'material' => 'Solid Walnut', 'dimensions' => '12×16 inches', 'price' => 349900],
        ['name' => 'Classic Walnut 16×20', 'material' => 'Solid Walnut', 'dimensions' => '16×20 inches', 'price' => 449900],
        ['name' => 'Gallery Float 11×14', 'material' => 'Solid Oak', 'dimensions' => '11×14 inches', 'price' => 299900],
        ['name' => 'Gallery Float 16×20', 'material' => 'Solid Oak', 'dimensions' => '16×20 inches', 'price' => 399900],
        ['name' => 'Heritage Oak 12×12', 'material' => 'Hand-Finished Oak', 'dimensions' => '12×12 inches', 'price' => 279900],
        ['name' => 'Heritage Oak 20×20', 'material' => 'Hand-Finished Oak', 'dimensions' => '20×20 inches', 'price' => 499900],
        ['name' => 'Ivory Brass 8×10', 'material' => 'Ivory MDF + Brass Inlay', 'dimensions' => '8×10 inches', 'price' => 199900],
    ];

    public function definition(): array
    {
        static $index = 0;

        $product = self::$products[$index % count(self::$products)];
        $index++;

        return [
            'collection_id' => Collection::factory(),
            'name' => $product['name'],
            'slug' => Str::slug($product['name']).'-'.Str::random(4),
            'description' => $this->faker->paragraphs(2, true),
            'material' => $product['material'],
            'dimensions' => $product['dimensions'],
            'price_in_paise' => $product['price'],
            'is_featured' => $this->faker->boolean(30),
            'is_active' => true,
            'sort_order' => $index * 10,
        ];
    }
}
