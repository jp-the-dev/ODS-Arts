<?php

declare(strict_types=1);

use App\Models\ArtCategory;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageUrl;
use App\Services\StoredImage;
use App\Services\UploadLimits;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

describe('image urls', function (): void {
    it('makes an uploaded path absolute against the API', function (): void {
        // The storefront runs on another origin, so a relative URL would resolve
        // against the storefront and 404.
        URL::forceScheme('https');
        URL::forceRootUrl('https://api.odsarts.in');

        expect(ImageUrl::for('products/abc.jpg'))
            ->toBe('https://api.odsarts.in/storage/products/abc.jpg');
    });

    it('passes a storefront-relative path through untouched', function (): void {
        // Prefixing it would produce /storage//images/hero.png and 404.
        expect(ImageUrl::for('/images/hero.png'))->toBe('/images/hero.png');
    });

    it('resolves a storefront path against the storefront for the admin', function (): void {
        config()->set('app.frontend_url', 'https://odsarts.in');

        expect(ImageUrl::forAdmin('/images/hero.png'))->toBe('https://odsarts.in/images/hero.png');
    });

    it('returns null rather than a broken url for a missing path', function (): void {
        expect(ImageUrl::for(null))->toBeNull()
            ->and(ImageUrl::for(''))->toBeNull();
    });

    it('applies the same rule on every endpoint that exposes an image', function (): void {
        // These disagreed before: the art category resource returned the raw
        // column while the collection resource always prefixed /storage.
        $category = ArtCategory::factory()->create(['cover_image' => '/images/art/modern.png']);
        $collection = Collection::factory()->create(['cover_image' => 'collections/cover.png']);

        $this->getJson('/api/v1/art/categories')
            ->assertOk()
            ->assertJsonPath('data.0.cover_image', '/images/art/modern.png');

        $this->getJson("/api/v1/collections/{$collection->slug}")
            ->assertOk()
            ->assertJsonPath('data.cover_image', asset('storage/collections/cover.png'));

        expect($category->fresh()->cover_image)->toBe('/images/art/modern.png');
    });
});

describe('upload limits', function (): void {
    it('never advertises more than the server will accept', function (): void {
        // PHP rejects an oversized upload before Laravel runs, so a form
        // promising more than php.ini allows fails with no usable message.
        $phpLimit = (int) (ini_get('upload_max_filesize') ? (int) ini_get('upload_max_filesize') * 1024 : 0);

        if ($phpLimit > 0) {
            expect(UploadLimits::maxKilobytes())->toBeLessThanOrEqual($phpLimit);
        }

        expect(UploadLimits::maxKilobytes())
            ->toBeLessThanOrEqual(UploadLimits::PREFERRED_KILOBYTES)
            ->toBeGreaterThan(0);
    });

    it('describes the limit in a form a person can read', function (): void {
        expect(UploadLimits::describe())->toMatch('/^[\d.]+(MB|KB)$/');
    });
});

describe('orphaned files', function (): void {
    beforeEach(fn () => Storage::fake('public'));

    it('deletes the file when its row is deleted', function (): void {
        Storage::disk('public')->put('products/lonely.jpg', 'bytes');

        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => 'products/lonely.jpg',
        ]);

        $image->delete();

        expect(Storage::disk('public')->exists('products/lonely.jpg'))->toBeFalse();
    });

    it('deletes the replaced file when a row is repointed', function (): void {
        Storage::disk('public')->put('products/old.jpg', 'bytes');
        Storage::disk('public')->put('products/new.jpg', 'bytes');

        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => 'products/old.jpg',
        ]);

        $image->update(['path' => 'products/new.jpg']);

        expect(Storage::disk('public')->exists('products/old.jpg'))->toBeFalse()
            ->and(Storage::disk('public')->exists('products/new.jpg'))->toBeTrue();
    });

    it('collects image files when the product itself is deleted', function (): void {
        // product_images cascades in the database, so the image models' own
        // delete events never fire — this is the case that leaked.
        Storage::disk('public')->put('products/cascade.jpg', 'bytes');

        $product = Product::factory()->create();
        ProductImage::factory()->for($product)->create(['path' => 'products/cascade.jpg']);

        $product->delete();

        expect(Storage::disk('public')->exists('products/cascade.jpg'))->toBeFalse();
    });

    it('keeps a file another row still points at', function (): void {
        Storage::disk('public')->put('products/shared.jpg', 'bytes');

        $product = Product::factory()->create();
        $first = ProductImage::factory()->for($product)->create(['path' => 'products/shared.jpg']);
        ProductImage::factory()->for($product)->create(['path' => 'products/shared.jpg']);

        $first->delete();

        expect(Storage::disk('public')->exists('products/shared.jpg'))->toBeTrue();
    });

    it('never touches the storefront public folder', function (): void {
        // Those files are version-controlled and shipped with the frontend.
        Storage::disk('public')->put('images/hero.png', 'bytes');

        StoredImage::forget('/images/hero.png', ProductImage::class);

        expect(Storage::disk('public')->exists('images/hero.png'))->toBeTrue();
    });

    it('deletes a replaced collection cover', function (): void {
        Storage::disk('public')->put('collections/old.png', 'bytes');

        $collection = Collection::factory()->create(['cover_image' => 'collections/old.png']);
        $collection->update(['cover_image' => 'collections/new.png']);

        expect(Storage::disk('public')->exists('collections/old.png'))->toBeFalse();
    });
});
