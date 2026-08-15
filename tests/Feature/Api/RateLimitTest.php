<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ProductVariant;

describe('rate limiting', function (): void {
    it('throttles the contact form after 5 submissions a minute', function (): void {
        $payload = ['name' => 'Spam', 'email' => 'spam@example.com', 'message' => 'hello'];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/enquiries', $payload)->assertCreated();
        }

        $this->postJson('/api/v1/enquiries', $payload)
            ->assertStatus(429)
            ->assertHeader('Retry-After');
    });

    it('throttles the newsletter form on the same budget', function (): void {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/newsletter/subscribe', ['email' => "a{$i}@example.com"])->assertOk();
        }

        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'last@example.com'])
            ->assertStatus(429);
    });

    it('throttles checkout after 10 attempts a minute', function (): void {
        $variant = ProductVariant::factory()->for(Product::factory())->create([
            'sku' => 'BOX', 'base_price_paise' => 100000, 'stock_qty' => 500,
        ]);
        $payload = [
            'customer' => ['fullName' => 'Buyer', 'email' => 'b@example.com', 'phone' => '+91 9876543210'],
            'address' => ['line1' => '1 Road', 'city' => 'Mumbai', 'state' => 'MH', 'pincode' => '400001', 'country' => 'IN'],
            'items' => [[
                'itemType' => 'frame', 'productId' => (string) $variant->product_id,
                'productSlug' => $variant->product->slug, 'variantId' => (string) $variant->id,
                'finishId' => null, 'quantity' => 1, 'unitPricePaise' => 100000,
            ]],
            'subtotalPaise' => 100000, 'currency' => 'INR',
        ];

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/orders', $payload)->assertCreated();
        }

        $this->postJson('/api/v1/orders', $payload)->assertStatus(429);
    });

    it('leaves catalogue reads generously available', function (): void {
        for ($i = 0; $i < 30; $i++) {
            $this->getJson('/api/v1/products')->assertOk();
        }
    });
});
