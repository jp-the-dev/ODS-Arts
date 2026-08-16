<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Mail\OrderConfirmation;
use App\Models\ArtMaterialVariant;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Services\Gst;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * POST /api/v1/orders — place an order.
     *
     * Works for guests and signed-in customers; when a Sanctum token is present
     * the order is attached to that user so it appears in their history.
     *
     * Line prices are recomputed from the database. The client sends
     * `unitPricePaise`, but it is never trusted — a tampered payload would
     * otherwise let a buyer set their own price. The submitted subtotal is only
     * compared against the authoritative total and reported back on mismatch.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $resolved = [];
        $subtotal = 0;

        foreach ($validated['items'] as $line) {
            $item = $this->resolveLine($line['itemType'], $line['variantId'], (int) $line['quantity']);

            if ($item === null) {
                return response()->json([
                    'message' => 'One or more items are no longer available.',
                    'errors' => ['items' => ["Unknown variant: {$line['variantId']}"]],
                ], 422);
            }

            if ($item['stock_qty'] < $line['quantity']) {
                return response()->json([
                    'message' => "Only {$item['stock_qty']} left of {$item['name']}.",
                    'errors' => ['items' => ["Insufficient stock for {$item['name']}"]],
                ], 422);
            }

            $subtotal += $item['subtotal_paise'];
            $resolved[] = $item;
        }

        // Catalogue prices include GST, so the line totals already are what the
        // customer pays. Splitting here rather than adding on top keeps `total`
        // — and the amount sent to Razorpay — exactly as it was, while giving
        // the order a real tax figure for the admin and the invoice.
        $gst = Gst::split($subtotal);

        $order = DB::transaction(function () use ($request, $validated, $resolved, $subtotal, $gst): Order {
            $order = Order::create([
                'user_id' => $request->user()?->id,
                'order_number' => $this->generateOrderNumber(),
                'email' => $validated['customer']['email'],
                'phone' => $validated['customer']['phone'],
                'status' => 'pending',
                'payment_status' => 'pending',
                'subtotal' => $gst['taxable'],
                'tax' => $gst['tax'],
                'shipping_cost' => 0,
                'discount' => 0,
                'total' => $subtotal,
                'currency' => $validated['currency'],
                'shipping_address' => $this->addressPayload($validated),
                'billing_address' => $this->addressPayload($validated),
                'notes' => $validated['notes'] ?? null,
                'ordered_at' => now(),
            ]);

            foreach ($resolved as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'name' => $item['name'],
                    'sku' => $item['sku'],
                    'unit_price_paise' => $item['unit_price_paise'],
                    'quantity' => $item['quantity'],
                    'subtotal_paise' => $item['subtotal_paise'],
                    'options' => $item['options'],
                ]);

                $item['variant']->decrement('stock_qty', $item['quantity']);
            }

            return $order;
        });

        $order->load(['items', 'invoice']);

        // Queued so a slow or failing mail host can never break checkout. The
        // order is already committed at this point; a send failure is logged and
        // swallowed rather than surfaced to the buyer.
        try {
            Mail::to($order->email)->queue(new OrderConfirmation($order));
        } catch (\Throwable $e) {
            Log::error('Order confirmation could not be queued', [
                'order' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'data' => [
                'orderReference' => $order->order_number,
                'placedAt' => $order->ordered_at?->toIso8601String(),
                'estimatedDeliveryDays' => ['min' => 7, 'max' => 14],
                'contactEmail' => config('mail.from.address', 'hello@odsarts.in'),
                'totalPaise' => (int) $order->total,
                // Surfaced so the storefront can warn if its cart drifted from
                // server pricing (stale prices, edited payload).
                'subtotalMatchedClient' => (int) $validated['subtotalPaise'] === $subtotal,
            ],
            'message' => 'Order placed successfully.',
        ], 201);
    }

    /** GET /api/v1/auth/orders — the signed-in customer's order history */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()
            ->with(['items', 'invoice'])
            ->latest('ordered_at')
            ->get();

        return OrderResource::collection($orders);
    }

    /** GET /api/v1/auth/orders/{orderNumber} — a single order the customer owns */
    public function show(Request $request, string $orderNumber): OrderResource|JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->with(['items', 'invoice'])
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return new OrderResource($order);
    }

    /**
     * Resolve a cart line to authoritative pricing.
     *
     * `itemType` selects the table. The two variant tables have independent
     * auto-increment ids, so id 1 exists in both — resolving by id alone would
     * silently price and ship a frame for an art order.
     *
     * @return array<string, mixed>|null
     */
    private function resolveLine(string $itemType, string $variantId, int $quantity): ?array
    {
        if ($itemType === 'frame' && $variant = ProductVariant::with('product')->find($variantId)) {
            return [
                'variant' => $variant,
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'name' => trim(($variant->product->name ?? 'Frame').' — '.$variant->size_label),
                'sku' => $variant->sku,
                'unit_price_paise' => $variant->base_price_paise,
                'quantity' => $quantity,
                'subtotal_paise' => $variant->base_price_paise * $quantity,
                'stock_qty' => $variant->stock_qty,
                'options' => ['type' => 'frame', 'size' => $variant->size_label],
            ];
        }

        if ($itemType === 'art' && $variant = ArtMaterialVariant::with('artProduct')->find($variantId)) {
            return [
                'variant' => $variant,
                // Art is not a `products` row, so the FK stays null and the line
                // is described by its denormalised name/sku/options.
                'product_id' => null,
                'product_variant_id' => null,
                'name' => trim(($variant->artProduct->name ?? 'Art print').' — '.$variant->size_label),
                'sku' => $variant->sku,
                'unit_price_paise' => $variant->price_paise,
                'quantity' => $quantity,
                'subtotal_paise' => $variant->price_paise * $quantity,
                'stock_qty' => $variant->stock_qty,
                'options' => [
                    'type' => 'art',
                    'size' => $variant->size_label,
                    'material' => $variant->material,
                    'art_product_id' => $variant->art_product_id,
                    // The FK above stays null, so without this the line records
                    // no way back to the variant whose stock it took.
                    'art_material_variant_id' => $variant->id,
                ],
            ];
        }

        return null;
    }

    /** @param  array<string, mixed>  $validated */
    private function addressPayload(array $validated): array
    {
        return [
            'full_name' => $validated['customer']['fullName'],
            'email' => $validated['customer']['email'],
            'phone' => $validated['customer']['phone'],
            'line1' => $validated['address']['line1'],
            'line2' => $validated['address']['line2'] ?? null,
            'city' => $validated['address']['city'],
            'state' => $validated['address']['state'],
            'pincode' => $validated['address']['pincode'],
            'country' => $validated['address']['country'] ?? 'IN',
        ];
    }

    /** Human-readable, collision-checked reference, e.g. ODS-8F3K2A9Q. */
    private function generateOrderNumber(): string
    {
        do {
            $number = 'ODS-'.Str::upper(Str::random(8));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
