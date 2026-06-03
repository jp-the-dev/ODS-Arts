<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Collection>
 */
class CollectionFactory extends Factory
{
    protected $model = Collection::class;

    /** @var array<string, string> */
    private static array $collections = [
        'Walnut Series' => 'Timeless craftsmanship in solid walnut.',
        'Gallery Edition' => 'Museum-quality framing for the discerning collector.',
        'Heritage Oak' => 'The warmth of hand-finished oak, built to last generations.',
        'Ivory & Brass' => 'Minimalist elegance with brass accents.',
    ];

    public function definition(): array
    {
        static $index = 0;

        $names = array_keys(self::$collections);
        $taglines = array_values(self::$collections);

        $name = $names[$index % count($names)];
        $tagline = $taglines[$index % count($names)];
        $index++;

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'tagline' => $tagline,
            'description' => $this->faker->paragraphs(2, true),
            'cover_image' => null,
            'is_active' => true,
            'sort_order' => $index * 10,
        ];
    }
}
