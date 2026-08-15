<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('product images', function (): void {
    it('serves a seeded storefront path unchanged to the storefront', function (): void {
        $image = ProductImage::factory()->create(['path' => '/images/collections/walnut.png']);

        expect($image->url)->toBe('/images/collections/walnut.png');
    });

    it('makes a storefront path absolute for the admin', function (): void {
        // The admin is served from the API origin, where /images/... is absent.
        config()->set('app.frontend_url', 'https://odsarts.in');
        $image = ProductImage::factory()->create(['path' => '/images/collections/walnut.png']);

        expect($image->admin_url)->toBe('https://odsarts.in/images/collections/walnut.png');
    });

    it('builds an absolute storage URL for an uploaded image', function (): void {
        config()->set('app.url', 'http://localhost:8000');
        $image = ProductImage::factory()->create(['path' => 'products/frame.png']);

        // The storefront is on another origin, so a relative URL would 404 there.
        expect($image->url)->toBe('http://localhost:8000/storage/products/frame.png')
            ->and($image->admin_url)->toBe($image->url);
    });

    it('exposes the storefront URL through the API', function (): void {
        $product = Product::factory()->create(['slug' => 'framed']);
        ProductImage::factory()->for($product)->create(['path' => 'products/frame.png']);

        $this->getJson('/api/v1/products/framed')
            ->assertOk()
            ->assertJsonPath('data.images.0.url', asset('storage/products/frame.png'));
    });

    it('stores an upload on the public disk where it can be served', function (): void {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('frame.jpg', 800, 1000);
        $path = $file->store('products', 'public');

        Storage::disk('public')->assertExists($path);

        $image = ProductImage::factory()->create(['path' => $path]);

        expect($image->url)->toContain('/storage/products/')
            ->and($image->path)->not->toStartWith('/');
    });

    it('renders the products table for both image shapes', function (): void {
        $this->actingAs(User::factory()->admin()->create());

        $seeded = Product::factory()->create(['slug' => 'seeded']);
        ProductImage::factory()->for($seeded)->create(['path' => '/images/collections/walnut.png']);

        $uploaded = Product::factory()->create(['slug' => 'uploaded']);
        ProductImage::factory()->for($uploaded)->create(['path' => 'products/frame.png']);

        $noImage = Product::factory()->create(['slug' => 'no-image']);

        $this->get('/admin/products')->assertOk();
        $this->get("/admin/products/{$seeded->id}/edit")->assertOk();
        $this->get("/admin/products/{$uploaded->id}/edit")->assertOk();
        $this->get("/admin/products/{$noImage->id}/edit")->assertOk();
    });
});
