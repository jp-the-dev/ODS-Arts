<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(10000, 50000);
        $tax = (int) round($subtotal * 0.18);
        $shippingCost = 0;
        $discount = 0;
        $total = $subtotal + $tax + $shippingCost - $discount;

        return [
            'user_id' => User::factory(),
            'order_number' => 'ODS-'.now()->format('Ymd').'-'.Str::random(6),
            'status' => 'pending',
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping_cost' => $shippingCost,
            'discount' => $discount,
            'total' => $total,
            'payment_status' => 'pending',
            'payment_method' => null,
            'billing_address' => null,
            'shipping_address' => null,
            'notes' => null,
            'currency' => 'INR',
            'ordered_at' => now(),
        ];
    }

    public function hasItems(int $count = 1): static
    {
        return $this->has(OrderItemFactory::new()->count($count), 'items');
    }
}
