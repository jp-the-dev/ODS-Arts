<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Wishlist: unauthenticated ──────────────────────────────────────────────────

it('requires authentication for wishlist', function () {
    $this->getJson('/api/v1/auth/wishlist')->assertUnauthorized();
    $this->postJson('/api/v1/auth/wishlist', ['slug' => 'some-slug'])->assertUnauthorized();
});

// ── Wishlist: index ────────────────────────────────────────────────────────────

it('returns empty wishlist for new user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/v1/auth/wishlist');

    $response->assertOk()->assertJson(['data' => []]);
});

// ── Wishlist: store ────────────────────────────────────────────────────────────

it('adds a product to wishlist', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/wishlist', ['slug' => $product->slug]);

    $response->assertCreated()
        ->assertJsonPath('data.product.slug', $product->slug);
});

it('validates product slug when adding to wishlist', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/wishlist', ['slug' => 'non-existent']);

    $response->assertUnprocessable();
});

it('does not duplicate wishlist items', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/v1/auth/wishlist', ['slug' => $product->slug]);
    $this->actingAs($user)->postJson('/api/v1/auth/wishlist', ['slug' => $product->slug]);

    $this->assertDatabaseCount('wishlist_items', 1);
});

// ── Wishlist: destroy ──────────────────────────────────────────────────────────

it('removes a product from wishlist', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $item = $this->actingAs($user)->postJson('/api/v1/auth/wishlist', ['slug' => $product->slug]);
    $itemId = $item->json('data.id');

    $response = $this->actingAs($user)
        ->deleteJson("/api/v1/auth/wishlist/{$itemId}");

    $response->assertSuccessful();
    $this->assertDatabaseCount('wishlist_items', 0);
});

it('prevents removing another users wishlist item', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $product = Product::factory()->create();

    $item = $this->actingAs($user1)->postJson('/api/v1/auth/wishlist', ['slug' => $product->slug]);
    $itemId = $item->json('data.id');

    $response = $this->actingAs($user2)
        ->deleteJson("/api/v1/auth/wishlist/{$itemId}");

    $response->assertForbidden();
});
