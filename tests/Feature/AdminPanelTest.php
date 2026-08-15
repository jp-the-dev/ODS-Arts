<?php

declare(strict_types=1);

use App\Models\ArtCategory;
use App\Models\ArtProduct;
use App\Models\Order;
use App\Models\User;

/**
 * The admin resources were assembled from a partial source, so these assert the
 * pages actually render rather than merely registering routes.
 */
describe('Filament admin', function (): void {
    beforeEach(fn () => $this->actingAs(User::factory()->admin()->create()));

    it('renders each resource index', function (string $path): void {
        $this->get("/admin/{$path}")->assertOk();
    })->with([
        'collections',
        'products',
        'orders',
        'art-categories',
        'art-products',
        'enquiries',
        'subscribers',
        'testimonials',
        'frame-options',
    ]);

    it('renders the orders list with a real order', function (): void {
        $order = Order::factory()->create(['order_number' => 'ODS-ADMIN']);
        $order->items()->create([
            'name' => 'Classic Box — 8" × 10"', 'sku' => 'BOX-1',
            'unit_price_paise' => 899900, 'quantity' => 1, 'subtotal_paise' => 899900,
        ]);

        $this->get('/admin/orders')->assertOk();
        $this->get("/admin/orders/{$order->id}")->assertOk();
    });

    it('renders art resources with real records', function (): void {
        $category = ArtCategory::factory()->create();
        $art = ArtProduct::factory()->for($category, 'category')->create();

        $this->get('/admin/art-categories')->assertOk();
        $this->get("/admin/art-products/{$art->id}")->assertOk();
        $this->get("/admin/art-products/{$art->id}/edit")->assertOk();
    });

    it('redirects anonymous visitors to the login screen', function (): void {
        auth()->logout();

        $this->get('/admin/orders')->assertRedirect();
    });

    it('denies a storefront customer, who is not staff', function (): void {
        // Registration is public, so panel access must be an explicit flag —
        // otherwise any customer could reach the admin.
        auth()->logout();
        $this->actingAs(User::factory()->create(['is_admin' => false]));

        $this->get('/admin/orders')->assertForbidden();
    });
});
