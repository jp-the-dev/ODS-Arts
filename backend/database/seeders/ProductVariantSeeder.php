<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Backfills size variants and finish options onto whatever products already
 * exist, deriving each variant's price from the product's own `price_in_paise`
 * (which becomes the smallest size).
 *
 * Idempotent — keyed on SKU and collection+slug — so it is safe to re-run and
 * safe against hand-edited catalogue data.
 */
class ProductVariantSeeder extends Seeder
{
    /** Size ladder: label, cm, price multiplier vs. the base price, weight, stock. */
    private const SIZES = [
        ['8" × 10"', '20 × 25 cm', 1.00, 950, 12],
        ['11" × 14"', '28 × 36 cm', 1.44, 1350, 8],
        ['16" × 20"', '41 × 51 cm', 2.11, 1900, 5],
        ['20" × 24"', '51 × 61 cm', 2.78, 2500, 3],
    ];

    /** Finish sets keyed by collection slug, with a sensible default. */
    private const FINISHES = [
        'walnut' => [
            ['Natural Walnut', '#5C3A21', 0],
            ['Dark Walnut', '#2C1A0E', 100000],
        ],
        'gallery' => [
            ['Matte Black', '#0E0D0B', 0],
            ['Brushed Silver', '#A8A9AD', 150000],
        ],
        'heritage' => [
            ['Antique Gold', '#C9A96E', 0],
            ['Aged Silver', '#B0B0B0', 200000],
        ],
    ];

    private const DEFAULT_FINISHES = [
        ['Natural', '#5C3A21', 0],
        ['Noir', '#0E0D0B', 100000],
    ];

    public function run(): void
    {
        // Only backfill what is missing — the catalogue may already carry
        // hand-authored variants with their own SKU scheme.
        foreach (Product::doesntHave('variants')->get() as $product) {
            $this->seedVariants($product);
        }

        foreach (Collection::doesntHave('finishOptions')->get() as $collection) {
            $this->seedFinishes($collection);
        }
    }

    private function seedVariants(Product $product): void
    {
        $base = $product->price_in_paise;
        // Use the whole slug: truncating to 8 characters dropped the size suffix
        // that distinguishes walnut-classic-810 from walnut-classic-1216, so every
        // product in a family derived the same prefix and collided on the unique
        // sku index — updateOrCreate is scoped to one product and cannot see it.
        $prefix = Str::upper(preg_replace('/[^a-z0-9]/i', '', $product->slug) ?: 'SKU');

        foreach (self::SIZES as $index => [$label, $cm, $multiplier, $weight, $stock]) {
            $product->variants()->updateOrCreate(
                ['sku' => $prefix.'-'.Str::upper(Str::slug($label))],
                [
                    'size_label' => $label,
                    'dimensions_cm' => $cm,
                    'base_price_paise' => (int) round($base * $multiplier, -2),
                    'stock_qty' => $stock,
                    'weight_grams' => $weight,
                    'sort_order' => ($index + 1) * 10,
                ],
            );
        }
    }

    private function seedFinishes(Collection $collection): void
    {
        $finishes = self::FINISHES[$collection->slug] ?? self::DEFAULT_FINISHES;

        foreach ($finishes as $index => [$name, $hex, $delta]) {
            $collection->finishOptions()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'swatch_hex' => $hex,
                    'price_delta_paise' => $delta,
                    'sort_order' => ($index + 1) * 10,
                ],
            );
        }
    }
}
