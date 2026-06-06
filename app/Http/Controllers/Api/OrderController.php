<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Mail\OrderConfirmation;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $orderNumber): OrderResource
    {
        $order = $request->user()->orders()
            ->with('items')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return new OrderResource($order);
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        $payload = $request->validated();

        $subtotal = (int) $payload['subtotalPaise'];
        $tax = (int) round($subtotal * 0.18);
        $total = $subtotal + $tax;

        $order = Order::create([
            'user_id' => $request->user()->id,
            'order_number' => 'ODS-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
            'status' => 'pending_payment',
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping_cost' => 0,
            'discount' => 0,
            'total' => $total,
            'payment_status' => 'pending',
            'payment_method' => null,
            'shipping_address' => [
                'full_name' => $payload['customer']['fullName'],
                'email' => $payload['customer']['email'],
                'phone' => $payload['customer']['phone'],
                'line1' => $payload['address']['line1'],
                'line2' => $payload['address']['line2'] ?? null,
                'city' => $payload['address']['city'],
                'state' => $payload['address']['state'],
                'pincode' => $payload['address']['pincode'],
                'country' => $payload['address']['country'] ?? 'IN',
            ],
            'billing_address' => null,
            'currency' => $payload['currency'] ?? 'INR',
            'notes' => $payload['notes'] ?? null,
            'ordered_at' => now(),
        ]);

        foreach ($payload['items'] as $item) {
            $quantity = (int) $item['quantity'];
            $unitPrice = (int) $item['unitPricePaise'];

            $order->items()->create([
                'product_id' => (int) $item['productId'] === 0 ? null : (int) $item['productId'],
                'product_variant_id' => (int) $item['variantId'] === 0 ? null : (int) $item['variantId'],
                'name' => $item['productSlug'],
                'sku' => null,
                'unit_price_paise' => $unitPrice,
                'quantity' => $quantity,
                'subtotal_paise' => $unitPrice * $quantity,
                'options' => isset($item['finishId']) && $item['finishId'] ? ['finish_id' => $item['finishId']] : null,
            ]);
        }

        $order->load('items');

        Mail::to($payload['customer']['email'])->send(new OrderConfirmation($order));

        return new OrderResource($order);
    }
}
