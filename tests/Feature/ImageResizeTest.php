<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;

describe('upload resizing', function (): void {
    beforeEach(fn () => $this->actingAs(User::factory()->admin()->create()));

    it('sends the resize settings to the product upload field', function (): void {
        $product = Product::factory()->create();
        // The field lives inside a Repeater, which renders nothing until there
        // is an item — so an image must exist for the config to reach the page.
        ProductImage::factory()->for($product)->create(['path' => 'products/frame.png']);

        // The resize runs client-side in FilePond, so the configuration has to
        // reach the browser — asserting on the component alone would not prove it.
        $html = $this->get("/admin/products/{$product->id}/edit")->assertOk()->getContent();

        expect($html)->toContain('1600')
            ->and($html)->toContain('2000')
            ->and($html)->toContain('contain');
    });

    it('sends the wider settings to the collection cover field', function (): void {
        $collection = Collection::factory()->create();

        $html = $this->get("/admin/collections/{$collection->id}/edit")->assertOk()->getContent();

        expect($html)->toContain('1920')
            ->and($html)->toContain('1080');
    });

    it('still renders the create forms', function (): void {
        $this->get('/admin/products/create')->assertOk();
        $this->get('/admin/collections/create')->assertOk();
    });
});
