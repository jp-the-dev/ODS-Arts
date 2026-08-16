<?php

namespace App\Services;

use App\Models\ArtMaterialVariant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Returns and re-takes the stock an order holds.
 *
 * Checkout decrements stock when the order is created, before payment, so the
 * units are reserved for a customer who may never pay. Nothing gave them back:
 * an abandoned or declined checkout held its stock permanently, and the
 * storefront reported items as sold out that nobody had bought.
 *
 * Every operation is guarded by orders.stock_released_at, so releasing twice
 * credits nothing the second time — which matters because this runs on a
 * schedule and a slow pass can overlap the next one.
 */
final class OrderStock
{
    /**
     * Give an unpaid order's stock back to the catalogue.
     *
     * @return int units returned, 0 if there was nothing to do
     */
    public static function release(Order $order): int
    {
        return DB::transaction(function () use ($order): int {
            // Re-read under a lock rather than trusting the instance passed in.
            // A payment can land between selecting an order and releasing it,
            // and a slow pass can overlap the next scheduled one — in both cases
            // the row on disk is the only thing that knows the truth. Checking
            // the in-memory model first would be redundant, not defensive: it
            // cannot see either of those changes.
            /** @var Order $fresh */
            $fresh = Order::whereKey($order->getKey())->lockForUpdate()->first();

            if ($fresh->payment_status === 'paid' || $fresh->stock_released_at !== null) {
                return 0;
            }

            $returned = self::returnUnits($fresh);

            $fresh->update([
                'stock_released_at' => now(),
                // The order is kept, not deleted — the customer may ask about it
                // and the reference is their only handle on it.
                'status' => 'cancelled',
            ]);

            return $returned;
        });
    }

    /**
     * Give a *paid* order's stock back after it was cancelled or returned.
     *
     * `release()` refuses a paid order on purpose — it exists for checkouts that
     * were never paid for. But a courier cancellation or an RTO is the same
     * problem arriving from the other end: the units are back on the shelf while
     * the catalogue still counts them as sold, and nothing here noticed until a
     * stock count did.
     *
     * The status is left to the caller, so an RTO stays 'returned' rather than
     * being flattened to 'cancelled'.
     *
     * @return int units returned, 0 if there was nothing to do
     */
    public static function restock(Order $order, string $reason): int
    {
        return DB::transaction(function () use ($order, $reason): int {
            /** @var Order $fresh */
            $fresh = Order::whereKey($order->getKey())->lockForUpdate()->first();

            // Shiprocket can deliver the same status push more than once, and
            // stock_released_at is what stops the second one crediting again.
            if ($fresh->stock_released_at !== null) {
                return 0;
            }

            $returned = self::returnUnits($fresh);

            $fresh->update(['stock_released_at' => now()]);

            Log::info('Stock returned for a cancelled or returned order', [
                'order' => $fresh->order_number,
                'reason' => $reason,
                'units' => $returned,
            ]);

            return $returned;
        });
    }

    /** Credit every line back to its variant. Caller owns the transaction. */
    private static function returnUnits(Order $order): int
    {
        $returned = 0;

        foreach ($order->items as $item) {
            $variant = self::variantFor($item);

            if (! $variant) {
                Log::warning('Could not resolve a variant to return stock to', [
                    'order' => $order->order_number,
                    'item' => $item->id,
                    'sku' => $item->sku,
                ]);

                continue;
            }

            $variant->increment('stock_qty', $item->quantity);
            $returned += $item->quantity;
        }

        return $returned;
    }

    /**
     * Take the stock back off the shelf for an order that was paid after its
     * stock had already been returned.
     *
     * Rare but real: a customer completes a payment link, or a webhook arrives
     * late, after the release has run. Without this the units would be counted
     * twice — once in the catalogue and once in a box being shipped.
     */
    public static function retake(Order $order): void
    {
        if ($order->stock_released_at === null) {
            return;
        }

        DB::transaction(function () use ($order): void {
            foreach ($order->items as $item) {
                $variant = self::variantFor($item);

                $variant?->decrement('stock_qty', $item->quantity);
            }

            $order->update(['stock_released_at' => null]);
        });

        // Worth a human's attention: the catalogue advertised these units as
        // available in the meantime, so it may now be oversold.
        Log::warning('Stock re-taken for an order paid after release', [
            'order' => $order->order_number,
        ]);
    }

    /**
     * Frames carry a real foreign key. Art does not — it is not a `products`
     * row, so the line is identified by the variant id recorded in its options,
     * falling back to the SKU, which is unique on art_material_variants and is
     * the only handle older rows have.
     */
    private static function variantFor(OrderItem $item): ProductVariant|ArtMaterialVariant|null
    {
        if ($item->product_variant_id !== null) {
            return ProductVariant::find($item->product_variant_id);
        }

        $artVariantId = $item->options['art_material_variant_id'] ?? null;

        if ($artVariantId !== null) {
            return ArtMaterialVariant::find($artVariantId);
        }

        return blank($item->sku)
            ? null
            : ArtMaterialVariant::where('sku', $item->sku)->first();
    }
}
