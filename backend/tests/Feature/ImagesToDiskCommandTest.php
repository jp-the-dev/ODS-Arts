<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;

/** Put a real file where the command expects to find the storefront's copy. */
function storefrontImage(string $path): void
{
    $full = base_path('../frontend/public').$path;

    if (! is_dir(dirname($full))) {
        mkdir(dirname($full), 0777, true);
    }

    file_put_contents($full, 'fake-png-bytes');
}

describe('odsarts:images-to-disk', function (): void {
    beforeEach(function (): void {
        Storage::fake('public');
        storefrontImage('/images/testing/shared.png');
    });

    afterEach(fn () => @unlink(base_path('../frontend/public/images/testing/shared.png')));

    it('copies the file onto the disk and repoints the row', function (): void {
        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => '/images/testing/shared.png',
        ]);

        $this->artisan('odsarts:images-to-disk')->assertSuccessful();

        $image->refresh();

        expect($image->path)->toStartWith('products/')
            ->and(Storage::disk('public')->exists($image->path))->toBeTrue();
    });

    it('gives each row its own copy of a shared source', function (): void {
        // Replacing or deleting one product's image must not affect another's.
        $images = ProductImage::factory()->count(2)->for(Product::factory())->create([
            'path' => '/images/testing/shared.png',
        ]);

        $this->artisan('odsarts:images-to-disk')->assertSuccessful();

        $paths = $images->map->fresh()->pluck('path');

        expect($paths->unique())->toHaveCount(2);
    });

    it('logs the path it moved from, not the one it moved to', function (): void {
        ProductImage::factory()->for(Product::factory())->create([
            'path' => '/images/testing/shared.png',
        ]);

        $this->artisan('odsarts:images-to-disk')
            ->expectsOutputToContain('/images/testing/shared.png')
            ->assertSuccessful();
    });

    it('changes nothing on a dry run', function (): void {
        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => '/images/testing/shared.png',
        ]);

        $this->artisan('odsarts:images-to-disk --dry-run')->assertSuccessful();

        expect($image->fresh()->path)->toBe('/images/testing/shared.png')
            ->and(Storage::disk('public')->allFiles())->toBeEmpty();
    });

    it('reports a path with no file behind it instead of repointing it', function (): void {
        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => '/images/testing/does-not-exist.png',
        ]);

        $this->artisan('odsarts:images-to-disk')
            ->expectsOutputToContain('no such file')
            ->assertSuccessful();

        expect($image->fresh()->path)->toBe('/images/testing/does-not-exist.png');
    });

    it('leaves images already on the disk alone, so it can be re-run', function (): void {
        $image = ProductImage::factory()->for(Product::factory())->create([
            'path' => 'products/already-uploaded.jpg',
        ]);

        $this->artisan('odsarts:images-to-disk')
            ->expectsOutputToContain('already on the disk')
            ->assertSuccessful();

        expect($image->fresh()->path)->toBe('products/already-uploaded.jpg');
    });
});
