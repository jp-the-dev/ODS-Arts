<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\FrameOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FrameOptionSeeder extends Seeder
{
    /**
     * @var array<string, list<array{name: string, material: string, finish: string, price_modifier: int}>>
     */
    private static array $options = [
        'wood' => [
            ['name' => 'Walnut Standard', 'material' => 'Solid Walnut', 'finish' => 'Satin', 'price_modifier' => 0],
            ['name' => 'Walnut Dark', 'material' => 'Solid Walnut', 'finish' => 'Ebony Stain', 'price_modifier' => 2000],
            ['name' => 'Natural Oak', 'material' => 'Solid Oak', 'finish' => 'Natural Wax', 'price_modifier' => -1000],
            ['name' => 'Whitewashed Oak', 'material' => 'Solid Oak', 'finish' => 'Whitewash', 'price_modifier' => 1500],
            ['name' => 'Ebony', 'material' => 'Solid Ash', 'finish' => 'Ebony Paint', 'price_modifier' => 3000],
        ],
        'mat' => [
            ['name' => 'No Mat', 'material' => 'None', 'finish' => 'None', 'price_modifier' => -2000],
            ['name' => 'Ivory Single Mat', 'material' => 'Conservation Board', 'finish' => 'Ivory', 'price_modifier' => 0],
            ['name' => 'Ivory Double Mat', 'material' => 'Conservation Board', 'finish' => 'Ivory / Cream', 'price_modifier' => 2000],
            ['name' => 'Black Single Mat', 'material' => 'Conservation Board', 'finish' => 'Matte Black', 'price_modifier' => 1500],
        ],
        'glass' => [
            ['name' => 'Standard Clear', 'material' => 'Float Glass', 'finish' => 'Clear', 'price_modifier' => 0],
            ['name' => 'Anti-Reflective', 'material' => 'Coated Glass', 'finish' => 'Anti-Glare', 'price_modifier' => 3000],
            ['name' => 'Museum UV', 'material' => 'Museum Glass', 'finish' => 'UV-Protective Anti-Reflective', 'price_modifier' => 8000],
            ['name' => 'Acrylic', 'material' => 'Optium Acrylic', 'finish' => 'Lightweight / Shatter-Resistant', 'price_modifier' => 5000],
        ],
    ];

    public function run(): void
    {
        foreach (self::$options as $type => $options) {
            foreach ($options as $sortOrder => $option) {
                FrameOption::updateOrCreate(['slug' => Str::slug($option['name'])], [
                    'type' => $type,
                    'name' => $option['name'],
                    'material' => $option['material'],
                    'finish' => $option['finish'],
                    'price_modifier_in_paise' => $option['price_modifier'],
                    'is_active' => true,
                    'sort_order' => ($sortOrder + 1) * 10,
                ]);
            }
        }
    }
}
