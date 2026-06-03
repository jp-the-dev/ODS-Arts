<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CollectionSeeder extends Seeder
{
    /** @var array<int, array{name: string, tagline: string, description: string, products: list<array{name: string, material: string, dimensions: string, price: int, featured: bool}>}> */
    private static array $data = [
        [
            'name' => 'Walnut Series',
            'tagline' => 'Timeless craftsmanship in solid walnut.',
            'description' => 'Our flagship collection — each frame is hand-cut from sustainably sourced solid walnut. The natural grain patterns ensure no two frames are identical. Available in a range of sizes to suit every portrait and print.',
            'products' => [
                ['name' => 'Walnut Classic 8×10', 'material' => 'Solid Walnut', 'dimensions' => '8×10 inches', 'price' => 249900, 'featured' => true],
                ['name' => 'Walnut Classic 12×16', 'material' => 'Solid Walnut', 'dimensions' => '12×16 inches', 'price' => 349900, 'featured' => true],
                ['name' => 'Walnut Classic 16×20', 'material' => 'Solid Walnut', 'dimensions' => '16×20 inches', 'price' => 449900, 'featured' => false],
                ['name' => 'Walnut Classic 20×24', 'material' => 'Solid Walnut', 'dimensions' => '20×24 inches', 'price' => 599900, 'featured' => false],
            ],
        ],
        [
            'name' => 'Gallery Edition',
            'tagline' => 'Museum-quality framing for the discerning collector.',
            'description' => 'Inspired by the finest art galleries in the world. These frames feature a deep shadow-box profile with hand-finished edges, designed to give your photographs and artwork the gravitas they deserve.',
            'products' => [
                ['name' => 'Gallery Float 11×14', 'material' => 'Solid Oak', 'dimensions' => '11×14 inches', 'price' => 299900, 'featured' => true],
                ['name' => 'Gallery Float 16×20', 'material' => 'Solid Oak', 'dimensions' => '16×20 inches', 'price' => 399900, 'featured' => false],
                ['name' => 'Gallery Float 20×24', 'material' => 'Solid Oak', 'dimensions' => '20×24 inches', 'price' => 549900, 'featured' => false],
            ],
        ],
        [
            'name' => 'Heritage Oak',
            'tagline' => 'The warmth of hand-finished oak, built to last generations.',
            'description' => 'Rooted in tradition and built for longevity. The Heritage Oak collection uses solid English oak, hand-planed and waxed to bring out its natural character. A frame worthy of becoming a family heirloom.',
            'products' => [
                ['name' => 'Heritage Oak 12×12', 'material' => 'Hand-Finished Oak', 'dimensions' => '12×12 inches', 'price' => 279900, 'featured' => false],
                ['name' => 'Heritage Oak 16×16', 'material' => 'Hand-Finished Oak', 'dimensions' => '16×16 inches', 'price' => 379900, 'featured' => true],
                ['name' => 'Heritage Oak 20×20', 'material' => 'Hand-Finished Oak', 'dimensions' => '20×20 inches', 'price' => 499900, 'featured' => false],
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::$data as $sortOrder => $collectionData) {
            /** @var Collection $collection */
            $collection = Collection::create([
                'name' => $collectionData['name'],
                'slug' => Str::slug($collectionData['name']),
                'tagline' => $collectionData['tagline'],
                'description' => $collectionData['description'],
                'cover_image' => null,
                'is_active' => true,
                'sort_order' => ($sortOrder + 1) * 10,
            ]);

            foreach ($collectionData['products'] as $productOrder => $productData) {
                Product::create([
                    'collection_id' => $collection->id,
                    'name' => $productData['name'],
                    'slug' => Str::slug($productData['name']),
                    'description' => 'Hand-crafted in our studio. '.$collectionData['description'],
                    'material' => $productData['material'],
                    'dimensions' => $productData['dimensions'],
                    'price_in_paise' => $productData['price'],
                    'is_featured' => $productData['featured'],
                    'is_active' => true,
                    'sort_order' => ($productOrder + 1) * 10,
                ]);
            }
        }
    }
}
