<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ArtCategory;
use App\Models\ArtImage;
use App\Models\ArtMaterialVariant;
use App\Models\ArtProduct;
use Illuminate\Database\Seeder;

class ArtSeeder extends Seeder
{
    private const BASE_PRICES = [
        'canvas' => 299900,
        'fine-art' => 249900,
        'metallic' => 199900,
        'photo-paper' => 129900,
        'foam-board' => 79900,
    ];

    private const SIZES = [
        ['label' => '8" × 10"', 'cm' => '20 × 25 cm', 'mult' => 1.0, 'wg' => 180],
        ['label' => '11" × 14"', 'cm' => '28 × 36 cm', 'mult' => 1.5, 'wg' => 320],
        ['label' => '16" × 20"', 'cm' => '41 × 51 cm', 'mult' => 2.2, 'wg' => 550],
        ['label' => '20" × 24"', 'cm' => '51 × 61 cm', 'mult' => 3.0, 'wg' => 820],
    ];

    private const MATERIALS = ['canvas', 'fine-art', 'metallic', 'photo-paper', 'foam-board'];

    private static int $skuCounter = 1000;

    /** @var array<string, array{cat: array, products: list<array>}> */
    private static array $artData = [
        'cultural' => [
            'cat' => [
                'slug' => 'cultural', 'display_number' => '01', 'eyebrow' => 'Heritage & Tradition',
                'title' => 'Cultural Art', 'tagline' => 'Stories etched in colour, craft, and memory.',
                'description' => 'Vibrant artworks celebrating the richness of Indian and global cultural heritage.',
                'cover_image' => '/images/art/cultural.png',
                'cover_image_alt' => 'Rajasthani folk dancers in vibrant traditional attire',
                'accent_color' => '#C9502E',
            ],
            'products' => [
                [
                    'slug' => 'rajasthani-folk-dance', 'name' => 'Rajasthani Folk Dance',
                    'tagline' => 'The spin of tradition, frozen in colour.',
                    'description' => 'An expressive painterly celebration of Rajasthan\'s Ghoomar dance — vibrant lehengas in crimson and cobalt, peacock feathers catching the golden afternoon light. Each brushstroke honours the rhythm of a living cultural legacy.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital illustration',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/cultural.png', 'alt' => 'Rajasthani folk dancers in traditional attire', 'role' => 'hero'],
                        ['path' => '/images/art/cultural.png', 'alt' => 'Detail of the folk dance artwork', 'role' => 'detail'],
                    ],
                    'tags' => ['rajasthan', 'folk', 'dance', 'india', 'cultural', 'vibrant'],
                ],
                [
                    'slug' => 'ancient-stepwell', 'name' => 'The Ancient Stepwell',
                    'tagline' => 'Architecture as meditation.',
                    'description' => 'The geometric grandeur of a Gujarati vav rendered in warm stone tones and deep shadow — each descending level a study in symmetry, devotion, and time.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/cultural.png', 'alt' => 'Ancient Indian stepwell architectural study', 'role' => 'hero'],
                    ],
                    'tags' => ['stepwell', 'architecture', 'india', 'gujarat', 'geometric', 'heritage'],
                ],
                [
                    'slug' => 'diya-festival-night', 'name' => 'Diya Festival Night',
                    'tagline' => 'A thousand flames. One memory.',
                    'description' => 'Hundreds of oil lamps reflected in dark water — the warmth of Diwali captured in deep amber, terracotta, and gold. A composition that glows from the wall even in daylight.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital painting',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/cultural.png', 'alt' => 'Diya festival lamps on dark water', 'role' => 'hero'],
                    ],
                    'tags' => ['diwali', 'diya', 'festival', 'india', 'gold', 'light'],
                ],
            ],
        ],
        'modern' => [
            'cat' => [
                'slug' => 'modern', 'display_number' => '02', 'eyebrow' => 'Contemporary Expression',
                'title' => 'Modern Art', 'tagline' => 'Geometry, tension, and the beauty of abstraction.',
                'description' => 'Bold geometric compositions, fluid abstractions, and colour field works that bring a gallery-contemporary sensibility to any interior.',
                'cover_image' => '/images/art/modern.png',
                'cover_image_alt' => 'Bold geometric abstract artwork in navy and gold',
                'accent_color' => '#1C2F5E',
            ],
            'products' => [
                [
                    'slug' => 'chromatic-drift', 'name' => 'Chromatic Drift',
                    'tagline' => 'Where form loses itself in colour.',
                    'description' => 'Bold navy planes bisected by gold arcs — a dynamic composition that draws the eye inward, then releases it outward.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital geometric illustration',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/modern.png', 'alt' => 'Bold geometric abstract in navy and gold', 'role' => 'hero'],
                        ['path' => '/images/art/modern.png', 'alt' => 'Chromatic Drift close up detail', 'role' => 'detail'],
                    ],
                    'tags' => ['abstract', 'geometric', 'navy', 'gold', 'modern', 'minimal'],
                ],
                [
                    'slug' => 'abstract-silence', 'name' => 'Abstract Silence',
                    'tagline' => 'The art of saying nothing. And meaning everything.',
                    'description' => 'Vast fields of warm ivory interrupted by a single vertical charcoal brushstroke — the quiet power of restraint.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital oil study',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/modern.png', 'alt' => 'Minimalist ivory canvas with single brushstroke', 'role' => 'hero'],
                    ],
                    'tags' => ['minimal', 'abstract', 'ivory', 'black', 'silence', 'meditative'],
                ],
                [
                    'slug' => 'urban-geometry', 'name' => 'Urban Geometry',
                    'tagline' => 'The city, deconstructed.',
                    'description' => 'Architectural forms stripped to their essential angles — a cubist meditation on the built environment.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/modern.png', 'alt' => 'Cubist urban geometry in slate and sienna', 'role' => 'hero'],
                    ],
                    'tags' => ['urban', 'geometric', 'architecture', 'cubist', 'slate', 'modern'],
                ],
            ],
        ],
        'business' => [
            'cat' => [
                'slug' => 'business', 'display_number' => '03', 'eyebrow' => 'Ambition & Vision',
                'title' => 'Business Art', 'tagline' => 'Commanding art for spaces that mean business.',
                'description' => 'Sophisticated cityscapes, architectural studies, and abstract works curated for boardrooms, executive offices, and professional environments.',
                'cover_image' => '/images/art/business.png',
                'cover_image_alt' => 'Dramatic cityscape at dusk with glass skyscrapers',
                'accent_color' => '#2C3E50',
            ],
            'products' => [
                [
                    'slug' => 'city-at-dusk', 'name' => 'City at Dusk',
                    'tagline' => 'Where ambition meets the horizon.',
                    'description' => 'Glass towers catching the final amber light of the day — a powerful editorial photograph elevated to fine art.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Fine art photography',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/business.png', 'alt' => 'Glass skyscrapers at dusk with golden light', 'role' => 'hero'],
                        ['path' => '/images/art/business.png', 'alt' => 'City at Dusk detail', 'role' => 'detail'],
                    ],
                    'tags' => ['city', 'skyline', 'business', 'corporate', 'dusk', 'architecture'],
                ],
                [
                    'slug' => 'blueprint-mind', 'name' => 'Blueprint Mind',
                    'tagline' => 'Every great thing begins as a line.',
                    'description' => 'Technical blueprints layered over a warm charcoal wash — the poetry of planning.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Mixed media illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/business.png', 'alt' => 'Blueprint technical drawing overlay on charcoal', 'role' => 'hero'],
                    ],
                    'tags' => ['blueprint', 'planning', 'technical', 'navy', 'corporate', 'precision'],
                ],
                [
                    'slug' => 'market-pulse', 'name' => 'Market Pulse',
                    'tagline' => 'The rhythm of capital.',
                    'description' => 'Abstract data visualisation elevated to art — glowing lines charting ascent across a dark field.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital data art',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/business.png', 'alt' => 'Abstract data visualization glowing lines on dark field', 'role' => 'hero'],
                    ],
                    'tags' => ['data', 'chart', 'finance', 'abstract', 'gold', 'business'],
                ],
            ],
        ],
        'nature' => [
            'cat' => [
                'slug' => 'nature', 'display_number' => '04', 'eyebrow' => 'The Living World',
                'title' => 'Nature Art', 'tagline' => 'The silence of mountains. The poetry of light.',
                'description' => 'Sweeping landscapes, intimate botanicals, and elemental studies of the natural world — from Himalayan peaks to desert blooms.',
                'cover_image' => '/images/art/nature.png',
                'cover_image_alt' => 'Himalayan mountain peaks at golden hour watercolour',
                'accent_color' => '#4A6741',
            ],
            'products' => [
                [
                    'slug' => 'himalayan-light', 'name' => 'Himalayan Light',
                    'tagline' => 'The mountain does not need to speak.',
                    'description' => 'Misty Himalayan peaks catching the first gold of dawn — rendered in layered watercolour washes.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Watercolour illustration',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/nature.png', 'alt' => 'Himalayan mountain peaks at golden hour watercolour', 'role' => 'hero'],
                        ['path' => '/images/art/nature.png', 'alt' => 'Himalayan Light detail of mist', 'role' => 'detail'],
                    ],
                    'tags' => ['himalaya', 'mountain', 'watercolour', 'nature', 'india', 'calm'],
                ],
                [
                    'slug' => 'monsoon-forest', 'name' => 'Monsoon Forest',
                    'tagline' => 'Green and alive and wet and endless.',
                    'description' => 'The primordial green of a monsoon forest — every leaf catching and releasing light, the air itself rendered visible.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital oil painting',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/nature.png', 'alt' => 'Dense monsoon forest in vibrant emerald green', 'role' => 'hero'],
                    ],
                    'tags' => ['forest', 'monsoon', 'green', 'india', 'nature', 'rain'],
                ],
                [
                    'slug' => 'desert-bloom', 'name' => 'Desert Bloom',
                    'tagline' => 'Life insists on the impossible.',
                    'description' => 'A single desert rose against cracked ochre earth and an impossibly blue sky.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital watercolour',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/nature.png', 'alt' => 'Desert rose blooming against ochre earth', 'role' => 'hero'],
                    ],
                    'tags' => ['desert', 'flower', 'bloom', 'ochre', 'nature', 'minimalist'],
                ],
            ],
        ],
        'entertainment' => [
            'cat' => [
                'slug' => 'entertainment', 'display_number' => '05', 'eyebrow' => 'Stage & Screen',
                'title' => 'Entertainment Art', 'tagline' => 'The moment before the final note.',
                'description' => 'Theatrical, cinematic, and musical artworks that capture the electricity of performance.',
                'cover_image' => '/images/art/entertainment.png',
                'cover_image_alt' => 'Jazz musician on a glowing stage with spotlight',
                'accent_color' => '#4A1A6E',
            ],
            'products' => [
                [
                    'slug' => 'stage-at-midnight', 'name' => 'Stage at Midnight',
                    'tagline' => 'The song does not end. It just stops being audible.',
                    'description' => 'A saxophonist bathed in a single golden spotlight, the audience rendered in impressionist shadow behind.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Impressionist digital painting',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/entertainment.png', 'alt' => 'Jazz saxophonist on stage with golden spotlight', 'role' => 'hero'],
                        ['path' => '/images/art/entertainment.png', 'alt' => 'Stage at Midnight close up', 'role' => 'detail'],
                    ],
                    'tags' => ['jazz', 'music', 'stage', 'saxophone', 'performance', 'gold'],
                ],
                [
                    'slug' => 'film-reel-dreams', 'name' => 'Film Reel Dreams',
                    'tagline' => 'Every frame, a world.',
                    'description' => 'Cinematic frames within frames — a meditation on storytelling and the magic of cinema.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/entertainment.png', 'alt' => 'Film reel and cinema frames in noir style', 'role' => 'hero'],
                    ],
                    'tags' => ['cinema', 'film', 'noir', 'art deco', 'movies', 'gold'],
                ],
                [
                    'slug' => 'the-encore', 'name' => 'The Encore',
                    'tagline' => 'When the crowd refuses to let go.',
                    'description' => 'A concert stage overwhelmed by light — beams of white and gold cutting through darkness, the implied sound almost physical.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital photography art',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/entertainment.png', 'alt' => 'Concert stage with dramatic light beams', 'role' => 'hero'],
                    ],
                    'tags' => ['concert', 'music', 'light', 'energy', 'performance', 'gold'],
                ],
            ],
        ],
        'automotive' => [
            'cat' => [
                'slug' => 'automotive', 'display_number' => '06', 'eyebrow' => 'Speed & Craft',
                'title' => 'Automotive Art', 'tagline' => 'Where engineering becomes sculpture.',
                'description' => 'Expressive paintings and illustrations of iconic machines — vintage rally cars, modern hypercars, and the raw beauty of mechanical form.',
                'cover_image' => '/images/art/automotive.png',
                'cover_image_alt' => 'Sleek vintage sports car in dramatic chiaroscuro',
                'accent_color' => '#1A1A1A',
            ],
            'products' => [
                [
                    'slug' => 'vintage-rally', 'name' => 'Vintage Rally',
                    'tagline' => 'Built to last. Driven to legend.',
                    'description' => 'A classic British sports car rendered in expressive oil — deep navy bodywork, chrome catching warm studio light.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital oil painting',
                    'delivery_days' => 7, 'is_featured' => true,
                    'images' => [
                        ['path' => '/images/art/automotive.png', 'alt' => 'Classic British vintage sports car in navy and gold', 'role' => 'hero'],
                        ['path' => '/images/art/automotive.png', 'alt' => 'Vintage Rally chrome detail', 'role' => 'detail'],
                    ],
                    'tags' => ['vintage', 'car', 'british', 'classic', 'chrome', 'navy'],
                ],
                [
                    'slug' => 'velocity-lines', 'name' => 'Velocity Lines',
                    'tagline' => 'Speed is the most honest form of ambition.',
                    'description' => 'Pure motion captured in line — a supercar reduced to its essential aerodynamic form, trailing light through darkness.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Digital illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/automotive.png', 'alt' => 'Supercar trailing light in dark minimalist illustration', 'role' => 'hero'],
                    ],
                    'tags' => ['speed', 'supercar', 'motion', 'minimal', 'dark', 'lines'],
                ],
                [
                    'slug' => 'engine-heart', 'name' => 'Engine Heart',
                    'tagline' => 'The machine, alive.',
                    'description' => 'A V12 engine cross-section rendered with the obsessive detail of a Renaissance anatomical study.',
                    'artist' => 'ODSArts Studio', 'medium' => 'Technical illustration',
                    'delivery_days' => 7, 'is_featured' => false,
                    'images' => [
                        ['path' => '/images/art/automotive.png', 'alt' => 'V12 engine cross-section in dramatic chiaroscuro', 'role' => 'hero'],
                    ],
                    'tags' => ['engine', 'mechanical', 'technical', 'car', 'detail', 'chiaroscuro'],
                ],
            ],
        ],
    ];

    public function run(): void
    {
        // The catalogue seeders use create(), so a second db:seed would insert
        // the whole art catalogue again rather than doing nothing. Skipping when
        // the categories are already there makes this one safe to re-run, which
        // matters because it is the seeder most likely to be run again as art
        // content is added.
        if (ArtCategory::query()->exists()) {
            $this->command?->info('  Art catalogue already seeded — skipping.');

            return;
        }

        foreach (self::$artData as $catSlug => $data) {
            $category = ArtCategory::create([
                'slug' => $data['cat']['slug'],
                'display_number' => $data['cat']['display_number'],
                'eyebrow' => $data['cat']['eyebrow'],
                'title' => $data['cat']['title'],
                'tagline' => $data['cat']['tagline'],
                'description' => $data['cat']['description'],
                'cover_image' => $data['cat']['cover_image'],
                'cover_image_alt' => $data['cat']['cover_image_alt'],
                'accent_color' => $data['cat']['accent_color'],
                'is_active' => true,
                'sort_order' => (int) $data['cat']['display_number'] * 10,
            ]);

            foreach ($data['products'] as $order => $pData) {
                $artProduct = ArtProduct::create([
                    'art_category_id' => $category->id,
                    'slug' => $pData['slug'],
                    'name' => $pData['name'],
                    'tagline' => $pData['tagline'],
                    'description' => $pData['description'],
                    'artist' => $pData['artist'],
                    'medium' => $pData['medium'],
                    'delivery_days' => $pData['delivery_days'],
                    'tags' => $pData['tags'],
                    'is_featured' => $pData['is_featured'],
                    'is_active' => true,
                    'sort_order' => ($order + 1) * 10,
                ]);

                foreach ($pData['images'] as $imgOrder => $imgData) {
                    ArtImage::create([
                        'art_product_id' => $artProduct->id,
                        'path' => $imgData['path'],
                        'alt' => $imgData['alt'],
                        'role' => $imgData['role'],
                        'sort_order' => ($imgOrder + 1) * 10,
                    ]);
                }

                foreach (self::MATERIALS as $matOrder => $material) {
                    foreach (self::SIZES as $szOrder => $size) {
                        self::$skuCounter++;
                        ArtMaterialVariant::create([
                            'art_product_id' => $artProduct->id,
                            'sku' => 'ART-'.self::$skuCounter,
                            'material' => $material,
                            'size_label' => $size['label'],
                            'dimensions_cm' => $size['cm'],
                            'price_paise' => (int) round(self::BASE_PRICES[$material] * $size['mult'] / 100) * 100,
                            'stock_qty' => $material === 'foam-board' ? 0 : fake()->numberBetween(5, 24),
                            'weight_grams' => $size['wg'],
                            'sort_order' => ($szOrder + 1) * 10,
                        ]);
                    }
                }
            }
        }
    }
}
