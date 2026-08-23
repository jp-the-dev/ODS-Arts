<?php

declare(strict_types=1);

use App\Models\ArtMaterialVariant;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ShiprocketService;

function shipWeighOrder(array $lines): Order
{
    $order = Order::factory()->create(['user_id' => null]);

    foreach ($lines as $line) {
        $order->items()->create($line);
    }

    return $order->fresh(['items.productVariant']);
}

function shipFrameVariant(int $grams, string $dimensions): ProductVariant
{
    return ProductVariant::factory()->create([
        'product_id' => Product::factory(),
        'weight_grams' => $grams,
        'dimensions_cm' => $dimensions,
    ]);
}

function shipService(): ShiprocketService
{
    config()->set('services.shiprocket.dry_run', true);

    return app(ShiprocketService::class);
}

describe('billable shipment weight', function (): void {
    it('uses the recorded variant weight instead of a flat kilo per line', function (): void {
        // The old rule was count($items) * 1.0kg, which ignored weight_grams
        // entirely — a 950g frame and a 2.5kg one weighed the same.
        $variant = shipFrameVariant(950, '20 × 25 cm');

        $order = shipWeighOrder([[
            'product_variant_id' => $variant->id,
            'name' => 'Walnut Classic', 'sku' => 'W-1',
            'unit_price_paise' => 249900, 'quantity' => 1, 'subtotal_paise' => 249900,
        ]]);

        expect(shipService()->billableWeightKg($order))->toBe(0.95);
    });

    it('multiplies by quantity', function (): void {
        $variant = shipFrameVariant(950, '20 × 25 cm');

        $order = shipWeighOrder([[
            'product_variant_id' => $variant->id,
            'name' => 'Walnut Classic', 'sku' => 'W-1',
            'unit_price_paise' => 249900, 'quantity' => 3, 'subtotal_paise' => 749700,
        ]]);

        // 3 × 950g = 2.85kg, which exceeds the volumetric weight of the stack.
        expect(shipService()->billableWeightKg($order))->toBe(2.85);
    });

    it('bills the volumetric weight when the box is bulky but light', function (): void {
        // A large, light print: couriers charge for the space it occupies, and
        // quoting the real weight is exactly how we undercharged before.
        $variant = shipFrameVariant(300, '100 × 100 cm');

        $order = shipWeighOrder([[
            'product_variant_id' => $variant->id,
            'name' => 'Oversized print', 'sku' => 'BIG-1',
            'unit_price_paise' => 500000, 'quantity' => 1, 'subtotal_paise' => 500000,
        ]]);

        $service = shipService();
        $parcel = $service->parcel($order);
        $volumetric = ($parcel['length'] * $parcel['breadth'] * $parcel['height']) / 5000;

        expect($service->billableWeightKg($order))
            ->toBeGreaterThan(0.3)
            ->toBe(round($volumetric, 2));
    });

    it('never declares less than Shiprocket accepts', function (): void {
        $variant = shipFrameVariant(50, '5 × 5 cm');

        $order = shipWeighOrder([[
            'product_variant_id' => $variant->id,
            'name' => 'Tiny', 'sku' => 'T-1',
            'unit_price_paise' => 10000, 'quantity' => 1, 'subtotal_paise' => 10000,
        ]]);

        expect(shipService()->billableWeightKg($order))->toBe(0.5);
    });

    it('weighs an art line, which carries no product_variant_id', function (): void {
        // Art is not a `products` row, so OrderController leaves the FK null and
        // records the variant under options. Reading only the relation weighed
        // every art print at the 1kg fallback.
        $variant = ArtMaterialVariant::factory()->create([
            'weight_grams' => 320,
            'dimensions_cm' => '28 × 36 cm',
        ]);

        $order = shipWeighOrder([[
            'product_variant_id' => null,
            'name' => 'Chromatic Drift — 11" × 14"', 'sku' => $variant->sku,
            'unit_price_paise' => 299900, 'quantity' => 1, 'subtotal_paise' => 299900,
            'options' => ['type' => 'art', 'art_material_variant_id' => $variant->id],
        ]]);

        // 0.32kg actual vs (32 × 40 × 5)/5000 = 1.28kg volumetric.
        expect(shipService()->billableWeightKg($order))->toBe(1.28);
    });

    it('falls back to a sane parcel when nothing records a size', function (): void {
        $order = shipWeighOrder([[
            'product_variant_id' => null,
            'name' => 'Mystery item', 'sku' => 'X-1',
            'unit_price_paise' => 10000, 'quantity' => 1, 'subtotal_paise' => 10000,
        ]]);

        expect(shipService()->parcel($order))
            ->toBe(['length' => 40.0, 'breadth' => 30.0, 'height' => 6.0]);
    });
});

describe('declared parcel', function (): void {
    it('sizes the box to the contents rather than a fixed 40x30x6', function (): void {
        // The hardcoded box gave a single 8×10 frame a 1.44kg volumetric weight,
        // pushing a ₹138 shipment into a ₹204 slab.
        $variant = shipFrameVariant(950, '20 × 25 cm');

        $order = shipWeighOrder([[
            'product_variant_id' => $variant->id,
            'name' => 'Walnut Classic', 'sku' => 'W-1',
            'unit_price_paise' => 249900, 'quantity' => 1, 'subtotal_paise' => 249900,
        ]]);

        $parcel = shipService()->parcel($order);

        expect($parcel['length'])->toBe(24.0)
            ->and($parcel['breadth'])->toBe(29.0)
            ->and($parcel['height'])->toBe(5.0);

        $volumetric = ($parcel['length'] * $parcel['breadth'] * $parcel['height']) / 5000;
        expect($volumetric)->toBeLessThan(1.44);
    });

    it('grows the box depth as units stack', function (): void {
        $variant = shipFrameVariant(950, '20 × 25 cm');

        $single = shipWeighOrder([[
            'product_variant_id' => $variant->id, 'name' => 'W', 'sku' => 'W-1',
            'unit_price_paise' => 1, 'quantity' => 1, 'subtotal_paise' => 1,
        ]]);
        $triple = shipWeighOrder([[
            'product_variant_id' => $variant->id, 'name' => 'W', 'sku' => 'W-2',
            'unit_price_paise' => 1, 'quantity' => 3, 'subtotal_paise' => 3,
        ]]);

        $service = shipService();

        expect($service->parcel($triple)['height'])
            ->toBeGreaterThan($service->parcel($single)['height']);
    });
});
