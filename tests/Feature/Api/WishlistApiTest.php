<?php

declare(strict_types=1);

use App\Models\ArtProduct;
use App\Models\Product;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

describe('wishlist', function (): void {
    it('requires authentication', function (): void {
        $this->getJson('/api/v1/auth/wishlist')->assertUnauthorized();
    });

    it('saves a frame', function (): void {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create(['slug' => 'classic-box']);

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'classic-box', 'type' => 'frame'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'frame')
            ->assertJsonPath('data.product.slug', 'classic-box');

        $this->assertDatabaseHas('wishlist_items', [
            'product_id' => $product->id,
            'art_product_id' => null,
        ]);
    });

    it('saves an art print', function (): void {
        Sanctum::actingAs(User::factory()->create());
        $art = ArtProduct::factory()->create(['slug' => 'folk-dance']);

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'folk-dance', 'type' => 'art'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'art')
            ->assertJsonPath('data.product.slug', 'folk-dance');

        $this->assertDatabaseHas('wishlist_items', [
            'art_product_id' => $art->id,
            'product_id' => null,
        ]);
    });

    it('does not confuse a frame and an art print sharing a slug', function (): void {
        // Slugs are unique per catalogue, not across both.
        Sanctum::actingAs(User::factory()->create());
        Product::factory()->create(['slug' => 'heritage']);
        $art = ArtProduct::factory()->create(['slug' => 'heritage']);

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'heritage', 'type' => 'art'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'art');

        $this->assertDatabaseHas('wishlist_items', [
            'art_product_id' => $art->id,
            'product_id' => null,
        ]);
    });

    it('defaults to a frame when no type is given', function (): void {
        Sanctum::actingAs(User::factory()->create());
        Product::factory()->create(['slug' => 'classic-box']);

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'classic-box'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'frame');
    });

    it('is idempotent — saving twice keeps one row', function (): void {
        Sanctum::actingAs(User::factory()->create());
        Product::factory()->create(['slug' => 'classic-box']);

        // 201 the first time, 200 on the repeat — Laravel only reports "created"
        // for a genuinely new record, which is exactly the signal we want here.
        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'classic-box'])->assertCreated();
        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'classic-box'])->assertOk();

        $this->assertDatabaseCount('wishlist_items', 1);
    });

    it('lists both frames and art together', function (): void {
        Sanctum::actingAs(User::factory()->create());
        Product::factory()->create(['slug' => 'classic-box']);
        ArtProduct::factory()->create(['slug' => 'folk-dance']);

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'classic-box', 'type' => 'frame'])->assertCreated();
        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'folk-dance', 'type' => 'art'])->assertCreated();

        $response = $this->getJson('/api/v1/auth/wishlist')->assertOk();

        expect(array_column($response->json('data'), 'type'))->toEqualCanonicalizing(['frame', 'art']);
    });

    it('404s for an unknown slug', function (): void {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'ghost'])->assertNotFound();
    });

    it('rejects an unknown type', function (): void {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/auth/wishlist', ['slug' => 'x', 'type' => 'sculpture'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('type');
    });

    it('only lists the signed-in customer items', function (): void {
        $mine = User::factory()->create();
        $product = Product::factory()->create(['slug' => 'mine']);
        $other = Product::factory()->create(['slug' => 'theirs']);

        $mine->wishlistItems()->create(['product_id' => $product->id]);
        User::factory()->create()->wishlistItems()->create(['product_id' => $other->id]);

        Sanctum::actingAs($mine);

        $response = $this->getJson('/api/v1/auth/wishlist')->assertOk();

        expect($response->json('data'))->toHaveCount(1);
    });

    it('404s when removing another customer item', function (): void {
        $product = Product::factory()->create();
        $theirs = User::factory()->create()->wishlistItems()->create(['product_id' => $product->id]);

        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/v1/auth/wishlist/{$theirs->id}")->assertNotFound();

        $this->assertDatabaseHas('wishlist_items', ['id' => $theirs->id]);
    });

    it('removes an item', function (): void {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $item = $user->wishlistItems()->create(['product_id' => $product->id]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/auth/wishlist/{$item->id}")->assertOk();

        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
    });
});
