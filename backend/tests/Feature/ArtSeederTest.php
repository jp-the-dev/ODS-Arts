<?php

declare(strict_types=1);

use App\Models\ArtCategory;
use App\Models\ArtImage;
use App\Models\ArtMaterialVariant;
use App\Models\ArtProduct;
use Database\Seeders\ArtSeeder;

describe('ArtSeeder', function (): void {
    it('seeds the whole art catalogue', function (): void {
        $this->seed(ArtSeeder::class);

        expect(ArtCategory::count())->toBe(6)
            ->and(ArtProduct::count())->toBe(18)
            // 5 materials x 4 sizes for each of the 18 pieces.
            ->and(ArtMaterialVariant::count())->toBe(360)
            ->and(ArtImage::count())->toBeGreaterThan(0);
    });

    /**
     * The catalogue seeders use create(), so a second db:seed would insert the
     * whole art catalogue again. This one guards against that.
     */
    it('does not duplicate the catalogue when run twice', function (): void {
        $this->seed(ArtSeeder::class);
        $this->seed(ArtSeeder::class);

        expect(ArtProduct::count())->toBe(18)
            ->and(ArtCategory::count())->toBe(6);
    });

    /**
     * The storefront prerenders art paths from its MOCK_ART fixture, so a slug
     * the seeder does not produce becomes a 404 that the build still reports as
     * green — flipping NEXT_PUBLIC_ART_API_READY would silently break the
     * section. These are the six categories the frontend builds paths for.
     */
    it('produces the category slugs the storefront prerenders', function (): void {
        $this->seed(ArtSeeder::class);

        expect(ArtCategory::pluck('slug')->sort()->values()->all())
            ->toBe(['automotive', 'business', 'cultural', 'entertainment', 'modern', 'nature']);
    });

    it('gives every variant a unique sku and every product a category', function (): void {
        $this->seed(ArtSeeder::class);

        expect(ArtMaterialVariant::distinct()->count('sku'))->toBe(360)
            ->and(ArtProduct::whereNull('art_category_id')->count())->toBe(0);
    });
});
