<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\FinishOption;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CollectionSeeder extends Seeder
{
    private static array $collections = [
        [
            'slug' => 'box-frame',
            'name' => 'The Box Frame Collection',
            'display_number' => '01',
            'eyebrow' => 'Classic Depth',
            'tagline' => 'Timeless craftsmanship in solid walnut.',
            'description' => 'Crafted from rich natural walnut, designed for timeless family portraits and heirloom memories. The warmth of the wood perfectly complements both black-and-white and color photography.',
            'long_description' => 'The Box Frame Collection represents our commitment to natural beauty and enduring craftsmanship. Each frame is cut from solid, sustainably sourced American walnut, selected for its distinct grain patterns and deep, warming tones. We employ a hand-rubbed oil finish that nourishes the wood and allows it to age gracefully over generations.',
            'materials' => ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
            'features' => ['Hand-rubbed oil finish', 'Spline-joined corners for heirloom strength', 'Custom depths available for floating artwork'],
            'image_path' => '/images/collections/walnut.png',
            'image_alt' => 'Close up of a luxury walnut wood picture frame',
            'image_position' => 'left',
            'finishes' => [
                ['name' => 'Natural Walnut', 'slug' => 'natural-walnut', 'swatch_hex' => '#8B6914', 'price_delta_paise' => 0],
                ['name' => 'Dark Walnut', 'slug' => 'dark-walnut', 'swatch_hex' => '#3E2723', 'price_delta_paise' => 100000],
            ],
            'products' => [
                [
                    'name' => 'Classic Box',
                    'tagline' => 'Wide profile. Deep grain. Timeless.',
                    'care' => ['Wipe with a soft dry cloth.', 'Re-oil annually with food-safe walnut oil.', 'Keep away from direct moisture.'],
                    'delivery_days' => 14,
                    'material' => 'Solid Walnut',
                    'materials' => ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
                    'featured' => true,
                    'variants' => [
                        ['sku' => 'BOX_CL_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 899900, 'weight' => 800],
                        ['sku' => 'BOX_CL_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1299900, 'weight' => 1200],
                        ['sku' => 'BOX_CL_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 1899900, 'weight' => 1800],
                        ['sku' => 'BOX_CL_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 2499900, 'weight' => 2400],
                    ],
                ],
                [
                    'name' => 'Slim Box',
                    'tagline' => 'Understated. Refined. Effortless.',
                    'care' => ['Wipe with a soft dry cloth.', 'Re-oil annually with food-safe walnut oil.', 'Keep away from direct moisture.'],
                    'delivery_days' => 14,
                    'material' => 'Solid Walnut',
                    'materials' => ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
                    'featured' => true,
                    'variants' => [
                        ['sku' => 'BOX_SL_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 749900, 'weight' => 600],
                        ['sku' => 'BOX_SL_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1099900, 'weight' => 900],
                        ['sku' => 'BOX_SL_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 1599900, 'weight' => 1400],
                        ['sku' => 'BOX_SL_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 2099900, 'weight' => 1900],
                    ],
                ],
                [
                    'name' => 'Box Float',
                    'tagline' => 'Floating depth. Modern shadow box.',
                    'care' => ['Wipe with a soft dry cloth.', 'Re-oil annually with food-safe walnut oil.', 'Keep away from direct moisture.'],
                    'delivery_days' => 14,
                    'material' => 'Solid Walnut',
                    'materials' => ['Solid American Walnut', 'Museum-Grade Anti-Reflective Glass', 'Acid-Free Archival Matting'],
                    'featured' => false,
                    'variants' => [
                        ['sku' => 'BOX_BF_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 1099900, 'weight' => 1000],
                        ['sku' => 'BOX_BF_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1599900, 'weight' => 1500],
                        ['sku' => 'BOX_BF_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 2299900, 'weight' => 2200],
                        ['sku' => 'BOX_BF_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 2999900, 'weight' => 3000],
                    ],
                ],
            ],
        ],
        [
            'slug' => 'gallery-frame',
            'name' => 'The Gallery Frame Collection',
            'display_number' => '02',
            'eyebrow' => 'Minimalist Architecture',
            'tagline' => 'Museum-quality framing for the discerning collector.',
            'description' => 'Ultra-thin, structural, and unapologetically modern. The Gallery Frame Collection uses powder-coated aluminum to let your artwork or photography speak entirely for itself.',
            'long_description' => 'When the image must command the room entirely, The Gallery Frame Collection steps back. Engineered from aerospace-grade aluminum, the profile is astonishingly thin yet perfectly rigid, capable of supporting massive oversized prints without bowing. Finished in a matte, light-absorbing powder coat, these frames create a razor-sharp boundary that elevates contemporary photography and abstract art to a gallery standard.',
            'materials' => ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
            'features' => ['Ultra-thin 5mm face profile', 'Matte black light-absorbing finish', 'Rigid structure for oversized prints'],
            'image_path' => '/images/collections/gallery.png',
            'image_alt' => 'A minimalist gallery wall with multiple thin black frames',
            'image_position' => 'right',
            'finishes' => [
                ['name' => 'Matte Black', 'slug' => 'matte-black', 'swatch_hex' => '#1C1C1C', 'price_delta_paise' => 0],
                ['name' => 'Brushed Silver', 'slug' => 'brushed-silver', 'swatch_hex' => '#C0C0C0', 'price_delta_paise' => 150000],
            ],
            'products' => [
                [
                    'name' => 'Gallery Classic',
                    'tagline' => 'Clean lines. Bold presence.',
                    'care' => ['Clean with a dry microfibre cloth.', 'No abrasive cleaners.', 'Avoid metal-on-metal contact.'],
                    'delivery_days' => 10,
                    'material' => 'Powder-Coated Aluminum',
                    'materials' => ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
                    'featured' => true,
                    'variants' => [
                        ['sku' => 'GAL_CL_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 699900, 'weight' => 400],
                        ['sku' => 'GAL_CL_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 999900, 'weight' => 600],
                        ['sku' => 'GAL_CL_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 1499900, 'weight' => 900],
                        ['sku' => 'GAL_CL_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 1999900, 'weight' => 1300],
                    ],
                ],
                [
                    'name' => 'Gallery Float',
                    'tagline' => 'The art levitates. The frame holds space.',
                    'care' => ['Clean with a dry microfibre cloth.', 'No abrasive cleaners.', 'Avoid metal-on-metal contact.'],
                    'delivery_days' => 10,
                    'material' => 'Powder-Coated Aluminum',
                    'materials' => ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
                    'featured' => true,
                    'variants' => [
                        ['sku' => 'GAL_FL_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 849900, 'weight' => 500],
                        ['sku' => 'GAL_FL_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1249900, 'weight' => 750],
                        ['sku' => 'GAL_FL_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 1799900, 'weight' => 1100],
                        ['sku' => 'GAL_FL_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 2399900, 'weight' => 1600],
                    ],
                ],
                [
                    'name' => 'Gallery Ledge',
                    'tagline' => 'Floating ledge. Minimal footprint.',
                    'care' => ['Clean with a dry microfibre cloth.', 'No abrasive cleaners.', 'Avoid metal-on-metal contact.'],
                    'delivery_days' => 10,
                    'material' => 'Powder-Coated Aluminum',
                    'materials' => ['Aerospace-Grade Aluminum', 'UV-Protective Acrylic', 'Floating Mount Spacers'],
                    'featured' => false,
                    'variants' => [
                        ['sku' => 'GAL_LG_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 549900, 'weight' => 300],
                        ['sku' => 'GAL_LG_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 799900, 'weight' => 480],
                        ['sku' => 'GAL_LG_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 1099900, 'weight' => 700],
                        ['sku' => 'GAL_LG_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 1499900, 'weight' => 950],
                    ],
                ],
            ],
        ],
        [
            'slug' => 'glass-frame',
            'name' => 'The Glass Frame Collection',
            'display_number' => '03',
            'eyebrow' => 'Vintage Opulence',
            'tagline' => 'The warmth of hand-finished oak, built to last generations.',
            'description' => 'Ornate, gilded, and meticulously detailed. The Glass Frame Collection brings museum-quality grandeur into your home, perfect for classical paintings or bold statement portraiture.',
            'long_description' => 'The Glass Frame Collection is a love letter to the golden age of framing. Each piece is intricately molded and hand-gilded by our master artisans using traditional water gilding techniques. The resulting finish catches the light with a warmth and depth that modern machinery simply cannot replicate. Designed for statement portraiture, oil paintings, and spaces that demand undeniable grandeur.',
            'materials' => ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
            'features' => ['Traditional water gilding technique', 'Intricate relief detailing', 'Subtle antiquing to highlight depth'],
            'image_path' => '/images/collections/heritage.png',
            'image_alt' => 'A beautiful vintage ornate gold heritage picture frame',
            'image_position' => 'left',
            'finishes' => [
                ['name' => 'Antique Gold', 'slug' => 'antique-gold', 'swatch_hex' => '#D4A017', 'price_delta_paise' => 0],
                ['name' => 'Aged Silver', 'slug' => 'aged-silver', 'swatch_hex' => '#C0C0C0', 'price_delta_paise' => 200000],
            ],
            'products' => [
                [
                    'name' => 'Heritage Grand',
                    'tagline' => 'The room will know.',
                    'care' => ['Dust only with a natural-bristle brush.', 'Never use a cloth — it lifts gold leaf.', 'Professional cleaning every 5 years.'],
                    'delivery_days' => 21,
                    'material' => 'Hand-Finished Oak',
                    'materials' => ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
                    'featured' => true,
                    'variants' => [
                        ['sku' => 'GLS_GR_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 1499900, 'weight' => 1600],
                        ['sku' => 'GLS_GR_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 2199900, 'weight' => 2200],
                        ['sku' => 'GLS_GR_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 3299900, 'weight' => 3200],
                        ['sku' => 'GLS_GR_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 4499900, 'weight' => 4100],
                    ],
                ],
                [
                    'name' => 'Heritage Slim',
                    'tagline' => 'Restrained opulence. For the discerning eye.',
                    'care' => ['Dust only with a natural-bristle brush.', 'Never use a cloth — it lifts gold leaf.', 'Professional cleaning every 5 years.'],
                    'delivery_days' => 21,
                    'material' => 'Hand-Finished Oak',
                    'materials' => ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
                    'featured' => false,
                    'variants' => [
                        ['sku' => 'GLS_SL_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 999900, 'weight' => 1000],
                        ['sku' => 'GLS_SL_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1499900, 'weight' => 1500],
                        ['sku' => 'GLS_SL_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 2199900, 'weight' => 2100],
                        ['sku' => 'GLS_SL_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 2999900, 'weight' => 2800],
                    ],
                ],
                [
                    'name' => 'Heritage Noir',
                    'tagline' => 'Where grandeur meets shadow.',
                    'care' => ['Dust only with a natural-bristle brush.', 'Never use a cloth — it lifts gold leaf.', 'Professional cleaning every 5 years.'],
                    'delivery_days' => 21,
                    'material' => 'Hand-Finished Oak',
                    'materials' => ['Hand-Gilded 22k Gold Leaf', 'Archival Backing Board', '8-Ply Beveled Museum Matting'],
                    'featured' => false,
                    'variants' => [
                        ['sku' => 'GLS_NO_8X10', 'size_label' => '8" × 10"', 'dimensions_cm' => '20 × 25 cm', 'price' => 1299900, 'weight' => 1400],
                        ['sku' => 'GLS_NO_11X14', 'size_label' => '11" × 14"', 'dimensions_cm' => '28 × 36 cm', 'price' => 1899900, 'weight' => 1900],
                        ['sku' => 'GLS_NO_16X20', 'size_label' => '16" × 20"', 'dimensions_cm' => '41 × 51 cm', 'price' => 2799900, 'weight' => 2700],
                        ['sku' => 'GLS_NO_20X24', 'size_label' => '20" × 24"', 'dimensions_cm' => '51 × 61 cm', 'price' => 3799900, 'weight' => 3500],
                    ],
                ],
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::$collections as $sortOrder => $data) {
            $collection = Collection::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'display_number' => $data['display_number'],
                'eyebrow' => $data['eyebrow'],
                'tagline' => $data['tagline'],
                'description' => $data['description'],
                'long_description' => $data['long_description'],
                'materials' => $data['materials'],
                'features' => $data['features'],
                'cover_image' => null,
                'image_path' => $data['image_path'],
                'image_alt' => $data['image_alt'],
                'image_position' => $data['image_position'],
                'is_active' => true,
                'sort_order' => ($sortOrder + 1) * 10,
            ]);

            foreach ($data['finishes'] as $finishOrder => $finish) {
                FinishOption::create([
                    'collection_id' => $collection->id,
                    'name' => $finish['name'],
                    'slug' => $finish['slug'],
                    'swatch_hex' => $finish['swatch_hex'],
                    'price_delta_paise' => $finish['price_delta_paise'],
                    'sort_order' => ($finishOrder + 1) * 10,
                ]);
            }

            $lifestyleImages = [
                '/images/lifestyle/1.png',
                '/images/lifestyle/2.png',
                '/images/lifestyle/3.png',
            ];

            foreach ($data['products'] as $productOrder => $productData) {
                $product = Product::create([
                    'collection_id' => $collection->id,
                    'name' => $productData['name'],
                    'tagline' => $productData['tagline'],
                    'slug' => Str::slug($data['slug'].'-'.$productData['name']),
                    'description' => 'Hand-crafted in our studio. '.$data['description'],
                    'delivery_days' => $productData['delivery_days'],
                    'care_instructions' => $productData['care'],
                    'material' => $productData['material'],
                    'materials' => $productData['materials'],
                    'dimensions' => $productData['variants'][0]['size_label'],
                    'price_in_paise' => $productData['variants'][0]['price'],
                    'is_featured' => $productData['featured'],
                    'is_active' => true,
                    'sort_order' => ($productOrder + 1) * 10,
                ]);

                foreach ($productData['variants'] as $varOrder => $variantData) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantData['sku'],
                        'size_label' => $variantData['size_label'],
                        'dimensions_cm' => $variantData['dimensions_cm'],
                        'base_price_paise' => $variantData['price'],
                        'stock_qty' => 10,
                        'weight_grams' => $variantData['weight'],
                        'sort_order' => ($varOrder + 1) * 10,
                    ]);
                }

                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $data['image_path'],
                    'alt' => $data['image_alt'].' — front view',
                    'sort_order' => 10,
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => '/images/craft/workshop.png',
                    'alt' => 'Crafting the '.$productData['name'].' in our studio',
                    'sort_order' => 20,
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $lifestyleImages[$productOrder % count($lifestyleImages)],
                    'alt' => 'Frame in natural light',
                    'sort_order' => 30,
                ]);
            }
        }
    }
}
