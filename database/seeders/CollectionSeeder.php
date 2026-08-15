<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CollectionSeeder extends Seeder
{
    /** @var array<int, array{slug: string, name: string, display_number: string, eyebrow: string, tagline: string, description: string, long_description: string, materials: list<string>, features: list<string>, image_path: string, image_alt: string, image_position: string, products: list<array{name: string, tagline: string, material: string, dimensions: string, price: int, featured: bool}>}> */
    private static array $data = [
        [
            'slug' => 'walnut',
            'name' => 'The Walnut Series',
            'display_number' => '01',
            'eyebrow' => 'Signature Wood',
            'tagline' => 'Timeless craftsmanship in solid walnut.',
            'description' => 'Crafted from rich natural walnut, designed for timeless family portraits and heirloom memories. The warmth of the wood perfectly complements both black-and-white and color photography.',
            'long_description' => 'The Walnut Series represents our commitment to natural beauty and enduring craftsmanship. Each frame is cut from solid, sustainably sourced American walnut, selected for its distinct grain patterns and deep, warming tones. We employ a hand-rubbed oil finish that nourishes the wood and allows it to age gracefully over generations. This series doesn\'t just display a photograph; it grounds it with an organic, tactile presence that grounds a room.',
            'materials' => ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
            'features' => ['Hand-rubbed oil finish', 'Spline-joined corners for heirloom strength', 'Custom depths available for floating artwork'],
            'image_path' => '/images/collections/walnut.png',
            'image_alt' => 'Close up of a luxury walnut wood picture frame',
            'image_position' => 'left',
            'products' => [
                [
                    'name' => 'Walnut Classic 8×10', 'tagline' => 'Wide profile. Deep grain. Timeless.',
                    'material' => 'Solid Walnut', 'dimensions' => '8×10 inches', 'price' => 249900, 'featured' => true,
                ],
                [
                    'name' => 'Walnut Classic 12×16', 'tagline' => 'The classic in a medium footprint.',
                    'material' => 'Solid Walnut', 'dimensions' => '12×16 inches', 'price' => 349900, 'featured' => true,
                ],
                [
                    'name' => 'Walnut Classic 16×20', 'tagline' => 'Commanding presence. Deep grain character.',
                    'material' => 'Solid Walnut', 'dimensions' => '16×20 inches', 'price' => 449900, 'featured' => false,
                ],
                [
                    'name' => 'Walnut Classic 20×24', 'tagline' => 'The heirloom statement piece.',
                    'material' => 'Solid Walnut', 'dimensions' => '20×24 inches', 'price' => 599900, 'featured' => false,
                ],
            ],
        ],
        [
            'slug' => 'gallery',
            'name' => 'The Gallery Series',
            'display_number' => '02',
            'eyebrow' => 'Minimalist Architecture',
            'tagline' => 'Museum-quality framing for the discerning collector.',
            'description' => 'Ultra-thin, structural, and unapologetically modern. The Gallery Series uses powder-coated aluminum to let your artwork or photography speak entirely for itself.',
            'long_description' => 'When the image must command the room entirely, The Gallery Series steps back. Engineered from aerospace-grade aluminum, the profile is astonishingly thin yet perfectly rigid, capable of supporting massive oversized prints without bowing. Finished in a matte, light-absorbing powder coat, these frames create a razor-sharp boundary that elevates contemporary photography and abstract art to a gallery standard.',
            'materials' => ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
            'features' => ['Ultra-thin 5mm face profile', 'Matte black light-absorbing finish', 'Rigid structure for oversized prints'],
            'image_path' => '/images/collections/gallery.png',
            'image_alt' => 'A minimalist gallery wall with multiple thin black frames',
            'image_position' => 'right',
            'products' => [
                [
                    'name' => 'Gallery Float 11×14', 'tagline' => 'Flat. Precise. Invisible.',
                    'material' => 'Solid Oak', 'dimensions' => '11×14 inches', 'price' => 299900, 'featured' => true,
                ],
                [
                    'name' => 'Gallery Float 16×20', 'tagline' => 'The art levitates. The frame holds space.',
                    'material' => 'Solid Oak', 'dimensions' => '16×20 inches', 'price' => 399900, 'featured' => false,
                ],
                [
                    'name' => 'Gallery Float 20×24', 'tagline' => 'Museum scale. Minimal presence.',
                    'material' => 'Solid Oak', 'dimensions' => '20×24 inches', 'price' => 549900, 'featured' => false,
                ],
            ],
        ],
        [
            'slug' => 'heritage',
            'name' => 'The Heritage Collection',
            'display_number' => '03',
            'eyebrow' => 'Vintage Opulence',
            'tagline' => 'The warmth of hand-finished oak, built to last generations.',
            'description' => 'Ornate, gilded, and meticulously detailed. The Heritage Collection brings museum-quality grandeur into your home, perfect for classical paintings or bold statement portraiture.',
            'long_description' => 'The Heritage Collection is a love letter to the golden age of framing. Each piece is intricately molded and hand-gilded by our master artisans using traditional water gilding techniques. The resulting finish catches the light with a warmth and depth that modern machinery simply cannot replicate. Designed for statement portraiture, oil paintings, and spaces that demand undeniable grandeur.',
            'materials' => ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
            'features' => ['Traditional water gilding technique', 'Intricate relief detailing', 'Subtle antiquing to highlight depth'],
            'image_path' => '/images/collections/heritage.png',
            'image_alt' => 'A beautiful vintage ornate gold heritage picture frame',
            'image_position' => 'left',
            'products' => [
                [
                    'name' => 'Heritage Oak 12×12', 'tagline' => 'The room will know.',
                    'material' => 'Hand-Finished Oak', 'dimensions' => '12×12 inches', 'price' => 279900, 'featured' => false,
                ],
                [
                    'name' => 'Heritage Oak 16×16', 'tagline' => 'Restrained opulence. For the discerning eye.',
                    'material' => 'Hand-Finished Oak', 'dimensions' => '16×16 inches', 'price' => 379900, 'featured' => true,
                ],
                [
                    'name' => 'Heritage Oak 20×20', 'tagline' => 'Where grandeur meets shadow.',
                    'material' => 'Hand-Finished Oak', 'dimensions' => '20×20 inches', 'price' => 499900, 'featured' => false,
                ],
            ],
        ],
    ];

    /** @var array<string, list<string>> */
    private static array $collectionCare = [
        'walnut' => ['Wipe with a soft dry cloth.', 'Re-oil annually with food-safe walnut oil.', 'Keep away from direct moisture.'],
        'gallery' => ['Clean with a dry microfibre cloth.', 'No abrasive cleaners.', 'Avoid metal-on-metal contact.'],
        'heritage' => ['Dust only with a natural-bristle brush.', 'Never use a cloth — it lifts gold leaf.', 'Professional cleaning every 5 years.'],
    ];

    /** @var list<array{path: string, alt: string, sort: int}> */
    private static array $lifestyleImages = [
        ['path' => '/images/lifestyle/ahmedabad.png', 'alt' => 'Frame in a modern living room', 'sort' => 2],
        ['path' => '/images/lifestyle/mumbai.png', 'alt' => 'Frame displayed on a gallery wall', 'sort' => 3],
        ['path' => '/images/lifestyle/surat.png', 'alt' => 'Frame in natural light', 'sort' => 4],
    ];

    public function run(): void
    {
        foreach (self::$data as $sortOrder => $collectionData) {
            $collectionSlug = $collectionData['slug'];

            /** @var Collection $collection */
            $collection = Collection::create([
                'name' => $collectionData['name'],
                'slug' => $collectionSlug,
                'display_number' => $collectionData['display_number'],
                'tagline' => $collectionData['tagline'],
                'eyebrow' => $collectionData['eyebrow'],
                'description' => $collectionData['description'],
                'long_description' => $collectionData['long_description'],
                'materials' => $collectionData['materials'],
                'features' => $collectionData['features'],
                'cover_image' => null,
                'image_path' => $collectionData['image_path'],
                'image_alt' => $collectionData['image_alt'],
                'image_position' => $collectionData['image_position'],
                'is_active' => true,
                'sort_order' => ($sortOrder + 1) * 10,
            ]);

            $careInstructions = self::$collectionCare[$collectionSlug] ?? [];
            $collectionMaterials = $collectionData['materials'];

            foreach ($collectionData['products'] as $productOrder => $productData) {
                /** @var Product $product */
                $product = Product::create([
                    'collection_id' => $collection->id,
                    'name' => $productData['name'],
                    'tagline' => $productData['tagline'],
                    'slug' => Str::slug($productData['name']),
                    'description' => 'Hand-crafted in our studio. '.$collectionData['description'],
                    'delivery_days' => $collectionSlug === 'heritage' ? 21 : ($collectionSlug === 'gallery' ? 10 : 14),
                    'care_instructions' => $careInstructions,
                    'material' => $productData['material'],
                    'materials' => $collectionMaterials,
                    'dimensions' => $productData['dimensions'],
                    'price_in_paise' => $productData['price'],
                    'is_featured' => $productData['featured'],
                    'is_active' => true,
                    'sort_order' => ($productOrder + 1) * 10,
                ]);

                // Seed hero image (collection hero)
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $collectionData['image_path'],
                    'alt' => $collectionData['image_alt'].' — front view',
                    'sort_order' => 1,
                ]);

                // Seed a workshop/detail image
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => '/images/craft/workshop.png',
                    'alt' => 'Crafting the '.$productData['name'].' in our studio',
                    'sort_order' => 2,
                ]);

                // Seed one lifestyle image (rotate through the 3 available)
                $lifestyle = self::$lifestyleImages[$productOrder % count(self::$lifestyleImages)];
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $lifestyle['path'],
                    'alt' => $lifestyle['alt'],
                    'sort_order' => 3,
                ]);
            }
        }
    }
}
