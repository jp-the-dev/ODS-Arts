<?php

namespace App\Services;

use App\Models\ArtMaterialVariant;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Shiprocket integration, over plain HTTP (no vendor SDK).
 *
 * Every method honours `services.shiprocket.dry_run`, which defaults to **true**.
 * In dry-run the service logs the call it would have made and returns
 * deterministic placeholder data, so checkout and fulfilment can be exercised
 * end to end before a Shiprocket account exists — and so a misconfigured
 * production deploy cannot silently book real shipments.
 */
class ShiprocketService
{
    private const TOKEN_CACHE_KEY = 'shiprocket.token';

    /** Shiprocket tokens last 10 days; refreshed well before that. */
    private const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

    /** Couriers derive volumetric weight as (L x B x H) / 5000 for domestic air/surface. */
    private const VOLUMETRIC_DIVISOR = 5000;

    /** Padding added to the largest item's face so the box is not undersized. */
    private const PACKING_MARGIN_CM = 4.0;

    /** Depth of a single boxed frame, and of each additional one stacked on it. */
    private const BOX_DEPTH_CM = 5.0;

    private const STACK_DEPTH_CM = 2.0;

    /** Used when a line records no variant weight at all. */
    private const FALLBACK_ITEM_GRAMS = 1000;

    /** Shiprocket rejects anything lighter. */
    private const MIN_BILLABLE_KG = 0.5;

    public function isDryRun(): bool
    {
        return (bool) config('services.shiprocket.dry_run', true);
    }

    public function isConfigured(): bool
    {
        return filled(config('services.shiprocket.email'))
            && filled(config('services.shiprocket.password'));
    }

    /**
     * Courier options for a destination pincode.
     *
     * @return array{rates: list<array{courier_id: int|null, courier_name: string, rate: float, estimated_days: string|null, cod_available: bool}>, dry_run: bool}
     */
    public function rates(string $deliveryPostcode, float $weightKg = 1.0, bool $cod = false): array
    {
        $pickup = (string) config('services.shiprocket.pickup_postcode');

        if ($this->isDryRun() || ! $this->isConfigured()) {
            Log::info('Shiprocket rates (dry run)', compact('pickup', 'deliveryPostcode', 'weightKg', 'cod'));

            return [
                'rates' => [[
                    'courier_id' => null,
                    'courier_name' => 'Standard Delivery',
                    'rate' => 0.0,
                    'estimated_days' => '7-14',
                    'cod_available' => false,
                ]],
                'dry_run' => true,
            ];
        }

        $response = $this->client()->get('/courier/serviceability/', [
            'pickup_postcode' => $pickup,
            'delivery_postcode' => $deliveryPostcode,
            'weight' => $weightKg,
            'cod' => $cod ? 1 : 0,
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Shiprocket serviceability lookup failed: '.$response->status());
        }

        $couriers = $response->json('data.available_courier_companies', []) ?? [];

        return [
            'rates' => array_map(fn (array $courier): array => [
                'courier_id' => $courier['courier_company_id'] ?? null,
                'courier_name' => $courier['courier_name'] ?? 'Courier',
                'rate' => (float) ($courier['rate'] ?? 0),
                'estimated_days' => $courier['estimated_delivery_days'] ?? null,
                'cod_available' => (bool) ($courier['cod'] ?? false),
            ], $couriers),
            'dry_run' => false,
        ];
    }

    /**
     * Book a shipment for a paid order.
     *
     * @return array<string, mixed>
     */
    public function createOrder(Order $order): array
    {
        if ($this->isDryRun() || ! $this->isConfigured()) {
            Log::info('Shiprocket createOrder (dry run)', ['order_number' => $order->order_number]);

            return [
                'shiprocket_order_id' => null,
                'shipment_id' => null,
                'awb_code' => null,
                'courier_id' => null,
                'courier_name' => 'Standard Delivery',
                'estimated_delivery_date' => null,
                'dry_run' => true,
            ];
        }

        $response = $this->client()->post('/orders/create/adhoc', $this->orderPayload($order));

        if ($response->failed()) {
            throw new RuntimeException('Shiprocket order creation failed: '.$response->body());
        }

        return [
            'shiprocket_order_id' => $response->json('order_id'),
            'shipment_id' => $response->json('shipment_id'),
            'awb_code' => $response->json('awb_code'),
            'courier_id' => $response->json('courier_company_id'),
            'courier_name' => $response->json('courier_name'),
            'estimated_delivery_date' => null,
            'dry_run' => false,
        ];
    }

    /**
     * Assign a courier and AWB to a shipment that has already been booked.
     *
     * `/orders/create/adhoc` returns an unassigned shipment — no courier, no AWB
     * — and the AWB is what the status webhook matches on and what tracking
     * needs. Without this step both are permanently dead.
     *
     * Passing no courier lets Shiprocket pick using the account's own rules.
     *
     * @return array{awb_code: string|null, courier_id: int|null, courier_name: string|null, dry_run: bool}
     */
    public function assignAwb(string|int $shipmentId, ?int $courierId = null): array
    {
        if ($this->isDryRun() || ! $this->isConfigured()) {
            Log::info('Shiprocket assignAwb (dry run)', ['shipment_id' => $shipmentId, 'courier_id' => $courierId]);

            return ['awb_code' => null, 'courier_id' => null, 'courier_name' => null, 'dry_run' => true];
        }

        $response = $this->client()->post('/courier/assign/awb', array_filter([
            'shipment_id' => $shipmentId,
            'courier_id' => $courierId,
        ], fn ($value) => filled($value)));

        if ($response->failed()) {
            throw new RuntimeException('Shiprocket AWB assignment failed: '.$response->body());
        }

        // The useful part is nested under response.data.
        $data = $response->json('response.data', []) ?? [];

        // Shiprocket reports assignment failures with HTTP 200 and
        // awb_assign_status = 0 — an empty wallet is the common one. Returning
        // quietly here would leave the order with no AWB, which silently kills
        // its webhook and tracking for good, so this has to be loud.
        if ((int) $response->json('awb_assign_status', 0) !== 1 || blank($data['awb_code'] ?? null)) {
            throw new RuntimeException('Shiprocket AWB assignment failed: '.(
                $data['awb_assign_error']
                    ?? $response->json('message')
                    ?? $response->body()
            ));
        }

        return [
            'awb_code' => filled($data['awb_code'] ?? null) ? (string) $data['awb_code'] : null,
            'courier_id' => filled($data['courier_company_id'] ?? null) ? (int) $data['courier_company_id'] : null,
            'courier_name' => filled($data['courier_name'] ?? null) ? (string) $data['courier_name'] : null,
            'dry_run' => false,
        ];
    }

    /**
     * Which courier to ask for, honouring `services.shiprocket.courier_mode`.
     *
     * Returns null to let Shiprocket choose — which is also what happens if the
     * rate lookup fails. Picking a courier is an optimisation; refusing to ship
     * because we could not price the options would be the worse outcome.
     */
    public function preferredCourierId(Order $order): ?int
    {
        if (config('services.shiprocket.courier_mode') !== 'auto_cheapest') {
            return null;
        }

        $pincode = $order->shipping_address['pincode'] ?? null;

        if (blank($pincode)) {
            return null;
        }

        try {
            $rates = $this->rates((string) $pincode, $this->billableWeightKg($order))['rates'];
        } catch (Throwable $e) {
            Log::warning('Shiprocket rate lookup failed while choosing a courier', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        $priced = array_values(array_filter(
            $rates,
            fn (array $rate): bool => filled($rate['courier_id'] ?? null),
        ));

        if ($priced === []) {
            return null;
        }

        usort($priced, fn (array $a, array $b): int => $a['rate'] <=> $b['rate']);

        return (int) $priced[0]['courier_id'];
    }

    /**
     * Live tracking for a shipment.
     *
     * @return array<string, mixed>
     */
    public function track(string $awbCode): array
    {
        if ($this->isDryRun() || ! $this->isConfigured()) {
            Log::info('Shiprocket track (dry run)', ['awb' => $awbCode]);

            return [
                'awb_code' => $awbCode,
                'current_status' => 'In Transit',
                'checkpoints' => [],
                'dry_run' => true,
            ];
        }

        $response = $this->client()->get("/courier/track/awb/{$awbCode}");

        if ($response->failed()) {
            throw new RuntimeException('Shiprocket tracking failed: '.$response->status());
        }

        $data = $response->json('tracking_data', []) ?? [];

        return [
            'awb_code' => $awbCode,
            'current_status' => $data['shipment_track'][0]['current_status'] ?? 'Unknown',
            'checkpoints' => $data['shipment_track_activities'] ?? [],
            'dry_run' => false,
        ];
    }

    /** Authenticated client. The token is cached — Shiprocket rate-limits logins. */
    private function client(): PendingRequest
    {
        return Http::withToken($this->token())
            ->acceptJson()
            ->baseUrl((string) config('services.shiprocket.base_url'))
            ->timeout(20);
    }

    private function token(): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, self::TOKEN_TTL_SECONDS, function (): string {
            $response = Http::acceptJson()
                ->baseUrl((string) config('services.shiprocket.base_url'))
                ->post('/auth/login', [
                    'email' => config('services.shiprocket.email'),
                    'password' => config('services.shiprocket.password'),
                ]);

            if ($response->failed() || blank($response->json('token'))) {
                throw new RuntimeException('Shiprocket authentication failed.');
            }

            return (string) $response->json('token');
        });
    }

    /** @return array<string, mixed> */
    private function orderPayload(Order $order): array
    {
        $parcel = $this->parcel($order);

        $address = $order->shipping_address ?? [];

        // We store one `full_name`; Shiprocket wants it split, and rejects the
        // whole order with `billing_last_name: validation.present` if the key is
        // absent. A single-word name is legitimate, so the surname may be empty
        // — it only has to be *present*.
        $parts = preg_split('/\s+/', trim((string) ($address['full_name'] ?? '')), 2) ?: [];
        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? '';

        return [
            'order_id' => $order->order_number,
            'order_date' => $order->ordered_at?->format('Y-m-d H:i') ?? now()->format('Y-m-d H:i'),
            'pickup_location' => (string) config('services.shiprocket.pickup_location'),
            'billing_customer_name' => $firstName !== '' ? $firstName : 'Customer',
            'billing_last_name' => $lastName,
            'billing_address' => $address['line1'] ?? '',
            'billing_address_2' => $address['line2'] ?? '',
            'billing_city' => $address['city'] ?? '',
            'billing_pincode' => $address['pincode'] ?? '',
            'billing_state' => $address['state'] ?? '',
            'billing_country' => 'India',
            'billing_email' => $order->email ?? ($address['email'] ?? ''),
            'billing_phone' => $order->phone ?? ($address['phone'] ?? ''),
            'shipping_is_billing' => true,
            'order_items' => $order->items->map(fn ($item): array => [
                'name' => $item->name,
                'sku' => $item->sku ?? 'SKU',
                'units' => $item->quantity,
                // Shiprocket expects rupees, while orders are stored in paise.
                'selling_price' => $item->unit_price_paise / 100,
            ])->all(),
            'payment_method' => 'Prepaid',
            'sub_total' => $order->total / 100,
            // Declared parcel, derived from the contents rather than assumed —
            // the weight below is volumetric-aware and must match these dims.
            'length' => $parcel['length'],
            'breadth' => $parcel['breadth'],
            'height' => $parcel['height'],
            'weight' => $this->billableWeightKg($order),
        ];
    }

    /** Billable weight. One boxed frame per unit, with a floor courers accept. */
    /**
     * The parcel we declare to the courier: outer dimensions in cm.
     *
     * Previously hardcoded at 40 x 30 x 6 for every order regardless of contents,
     * which gave a volumetric weight of 1.44 kg on even a single 8x10 frame and
     * pushed cheap shipments into an expensive slab. Derived from the largest
     * item instead, with a packing margin — under-declaring is worse than
     * over-declaring, because couriers re-measure and surcharge.
     *
     * @return array{length: float, breadth: float, height: float}
     */
    public function parcel(Order $order): array
    {
        $widest = 0.0;
        $tallest = 0.0;
        $units = 0;

        foreach ($order->items as $item) {
            $units += max(1, (int) $item->quantity);

            [$w, $h] = $this->itemFaceCm($item);
            $widest = max($widest, $w);
            $tallest = max($tallest, $h);
        }

        // Fall back to the old default when nothing declares a size, so an
        // unmeasurable order still ships rather than declaring a 0 cm box.
        if ($widest <= 0.0 || $tallest <= 0.0) {
            return ['length' => 40.0, 'breadth' => 30.0, 'height' => 6.0];
        }

        return [
            'length' => round($widest + self::PACKING_MARGIN_CM, 1),
            'breadth' => round($tallest + self::PACKING_MARGIN_CM, 1),
            // Frames stack flat: one box depth plus a little for each extra unit.
            'height' => round(self::BOX_DEPTH_CM + (max(0, $units - 1) * self::STACK_DEPTH_CM), 1),
        ];
    }

    /**
     * What the courier actually bills: the greater of real and volumetric weight.
     *
     * This was `max(0.5, count($items) * 1.0)` — a flat kilo per line that
     * ignored both the recorded per-variant weights and the parcel dimensions.
     * It quoted the customer for 1.0 kg while Shiprocket billed 1.44 kg, so
     * every order silently undercharged shipping.
     */
    public function billableWeightKg(Order $order): float
    {
        $actual = $this->actualWeightKg($order);
        $parcel = $this->parcel($order);
        $volumetric = ($parcel['length'] * $parcel['breadth'] * $parcel['height']) / self::VOLUMETRIC_DIVISOR;

        return max(self::MIN_BILLABLE_KG, round(max($actual, $volumetric), 2));
    }

    /** Summed real weight of the contents, from the variants' recorded grams. */
    private function actualWeightKg(Order $order): float
    {
        $grams = 0;

        foreach ($order->items as $item) {
            $grams += $this->itemGrams($item) * max(1, (int) $item->quantity);
        }

        return $grams / 1000;
    }

    /**
     * Recorded weight of one unit.
     *
     * Frame lines carry product_variant_id. Art lines cannot — art is not a
     * `products` row, so OrderController leaves the FK null and records the
     * variant id under options instead; reading only the relation would weigh
     * every art print at the fallback.
     */
    private function itemGrams(OrderItem $item): int
    {
        if ($item->productVariant?->weight_grams) {
            return (int) $item->productVariant->weight_grams;
        }

        $artVariantId = $item->options['art_material_variant_id'] ?? null;

        if ($artVariantId && $variant = ArtMaterialVariant::find($artVariantId)) {
            return (int) $variant->weight_grams;
        }

        return self::FALLBACK_ITEM_GRAMS;
    }

    /**
     * Face size of one unit in cm, parsed from the variant's `dimensions_cm`
     * (stored for display as e.g. "20 x 25 cm").
     *
     * @return array{0: float, 1: float}
     */
    private function itemFaceCm(OrderItem $item): array
    {
        $raw = $item->productVariant?->dimensions_cm;

        if (! $raw) {
            $artVariantId = $item->options['art_material_variant_id'] ?? null;
            $raw = $artVariantId ? ArtMaterialVariant::find($artVariantId)?->dimensions_cm : null;
        }

        if (! $raw || ! preg_match('/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/', (string) $raw, $m)) {
            return [0.0, 0.0];
        }

        return [(float) $m[1], (float) $m[2]];
    }
}
