<?php

use App\Mail\OrderConfirmation;
use App\Models\Collection;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

// ── Orders: unauthenticated ────────────────────────────────────────────────────

it('requires authentication for orders', function () {
    $this->getJson('/api/v1/auth/orders')->assertUnauthorized();
});

// ── Orders: index ──────────────────────────────────────────────────────────────

it('returns empty orders list for new user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/v1/auth/orders');

    $response->assertOk()->assertJson(['data' => []]);
});

it('returns users orders', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Order::factory()->count(2)->create(['user_id' => $user->id]);
    Order::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/auth/orders');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

// ── Orders: show ───────────────────────────────────────────────────────────────

it('shows a single order by order number', function () {
    $user = User::factory()->create();
    $order = Order::factory()
        ->hasItems(2)
        ->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->getJson("/api/v1/auth/orders/{$order->order_number}");

    $response->assertOk()
        ->assertJsonPath('data.order_number', $order->order_number);
});

it('prevents viewing another users order', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user1->id]);

    $response = $this->actingAs($user2)
        ->getJson("/api/v1/auth/orders/{$order->order_number}");

    $response->assertNotFound();
});

// ── Orders: store ───────────────────────────────────────────────────────────────

it('requires authentication to create an order', function () {
    $this->postJson('/api/v1/auth/orders', [])->assertUnauthorized();
});

it('creates an order with items', function () {
    $user = User::factory()->create();
    $collection = Collection::factory()->create();
    $product1 = Product::factory()->create([
        'collection_id' => $collection->id,
        'name' => 'Classic Walnut 8×10',
        'slug' => 'classic-walnut-frame',
    ]);
    $product2 = Product::factory()->create([
        'collection_id' => $collection->id,
        'name' => 'Modern Gallery Frame',
        'slug' => 'modern-gallery-frame',
    ]);
    $variant1 = ProductVariant::factory()->create([
        'product_id' => $product1->id,
    ]);
    $variant2 = ProductVariant::factory()->create([
        'product_id' => $product2->id,
    ]);

    $payload = [
        'customer' => [
            'fullName' => 'Priya Sharma',
            'email' => 'priya@example.com',
            'phone' => '+919876543210',
        ],
        'address' => [
            'line1' => '42, Sunrise Apartments',
            'line2' => 'Satellite Road',
            'city' => 'Ahmedabad',
            'state' => 'Gujarat',
            'pincode' => '380015',
            'country' => 'IN',
        ],
        'items' => [
            [
                'productId' => (string) $product1->id,
                'productSlug' => 'classic-walnut-frame',
                'variantId' => (string) $variant1->id,
                'finishId' => '5',
                'quantity' => 2,
                'unitPricePaise' => 24900,
            ],
            [
                'productId' => (string) $product2->id,
                'productSlug' => 'modern-gallery-frame',
                'variantId' => (string) $variant2->id,
                'finishId' => null,
                'quantity' => 1,
                'unitPricePaise' => 35000,
            ],
        ],
        'subtotalPaise' => 84800,
        'currency' => 'INR',
        'notes' => 'Gift wrap please',
    ];

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/orders', $payload);

    $response->assertCreated()
        ->assertJsonStructure([
            'data' => [
                'id',
                'order_number',
                'status',
                'subtotal',
                'tax',
                'total',
                'payment_status',
                'ordered_at',
                'items',
            ],
        ]);

    $orderNumber = $response->json('data.order_number');
    expect($orderNumber)->toMatch('/^ODS-\d{8}-[A-Z0-9]{6}$/');

    expect($response->json('data.status'))->toBe('pending_payment');
    expect($response->json('data.subtotal'))->toBe(84800);
    expect($response->json('data.tax'))->toBe(15264);
    expect($response->json('data.total'))->toBe(100064);
    expect($response->json('data.payment_status'))->toBe('pending');

    expect($response->json('data.items'))->toHaveCount(2);
    expect($response->json('data.items.0.name'))->toBe('classic-walnut-frame');
    expect($response->json('data.items.0.quantity'))->toBe(2);
    expect($response->json('data.items.0.subtotal_paise'))->toBe(49800);

    expect($response->json('data.notes'))->toBe('Gift wrap please');

    $this->assertDatabaseHas('orders', [
        'order_number' => $orderNumber,
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('order_items', [
        'name' => 'classic-walnut-frame',
        'quantity' => 2,
    ]);
});

it('validates required fields when creating an order', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/orders', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors([
            'customer.fullName',
            'customer.email',
            'customer.phone',
            'address.line1',
            'address.city',
            'address.state',
            'address.pincode',
            'items',
            'subtotalPaise',
            'currency',
        ]);
});

it('requires at least one item in the order', function () {
    $user = User::factory()->create();

    $payload = [
        'customer' => [
            'fullName' => 'Priya Sharma',
            'email' => 'priya@example.com',
            'phone' => '+919876543210',
        ],
        'address' => [
            'line1' => '42, Sunrise Apartments',
            'city' => 'Ahmedabad',
            'state' => 'Gujarat',
            'pincode' => '380015',
            'country' => 'IN',
        ],
        'items' => [],
        'subtotalPaise' => 0,
        'currency' => 'INR',
    ];

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/orders', $payload);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['items']);
});

it('sends a confirmation email when an order is created', function () {
    Mail::fake();

    $user = User::factory()->create();
    $collection = Collection::factory()->create();
    $product = Product::factory()->create(['collection_id' => $collection->id]);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

    $payload = [
        'customer' => [
            'fullName' => 'Priya Sharma',
            'email' => 'priya@example.com',
            'phone' => '+919876543210',
        ],
        'address' => [
            'line1' => '42, Sunrise Apartments',
            'line2' => 'Satellite Road',
            'city' => 'Ahmedabad',
            'state' => 'Gujarat',
            'pincode' => '380015',
            'country' => 'IN',
        ],
        'items' => [
            [
                'productId' => (string) $product->id,
                'productSlug' => 'classic-walnut-frame',
                'variantId' => (string) $variant->id,
                'quantity' => 1,
                'unitPricePaise' => 10000,
            ],
        ],
        'subtotalPaise' => 10000,
        'currency' => 'INR',
    ];

    $this->actingAs($user)->postJson('/api/v1/auth/orders', $payload);

    Mail::assertSent(OrderConfirmation::class);
});
