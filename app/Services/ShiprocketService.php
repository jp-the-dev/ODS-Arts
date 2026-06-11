<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * ODSArts — ShiprocketService
 *
 * Handles all communication with the Shiprocket API v2.
 * Token is cached for 9 days (Shiprocket tokens expire in 10 days).
 *
 * Config (config/services.php → 'shiprocket'):
 *   email, password, pickup_postcode, courier_mode, dry_run, base_url
 */
class ShiprocketService
{
    private string $baseUrl;
    private string $pickupPostcode;
    private string $courierMode;
    private bool   $dryRun;

    public function __construct()
    {
        $this->baseUrl        = config('services.shiprocket.base_url', 'https://apiv2.shiprocket.in/v1/external');
        $this->pickupPostcode = config('services.shiprocket.pickup_postcode', '360002');
        $this->courierMode    = config('services.shiprocket.courier_mode', 'auto_cheapest');
        $this->dryRun         = (bool) config('services.shiprocket.dry_run', true);
    }

    // ── Token Management ─────────────────────────────────────────────────────

    /**
     * Get a valid Shiprocket Bearer token.
     * Cached for 9 days (token expires in 10 days).
     */
    public function getToken(): string
    {
        return Cache::remember('shiprocket_token', now()->addDays(9), function () {
            $response = Http::post("{$this->baseUrl}/auth/login", [
                'email'    => config('services.shiprocket.email'),
                'password' => config('services.shiprocket.password'),
            ]);

            if (! $response->successful() || empty($response->json('token'))) {
                Log::error('Shiprocket auth failed', ['response' => $response->body()]);
                throw new RuntimeException('Shiprocket authentication failed: ' . $response->body());
            }

            Log::info('Shiprocket token refreshed successfully.');
            return $response->json('token');
        });
    }

    /**
     * Force-refresh the cached token (call after 401 responses).
     */
    public function refreshToken(): string
    {
        Cache::forget('shiprocket_token');
        return $this->getToken();
    }

    // ── HTTP Helper ───────────────────────────────────────────────────────────

    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withToken($this->getToken())
            ->acceptJson()
            ->contentType('application/json');
    }

    // ── Serviceability / Rates ────────────────────────────────────────────────

    /**
     * Get available couriers and rates for a given delivery pincode.
     *
     * @param  string  $deliveryPostcode  6-digit pincode where customer receives
     * @param  int     $weightGrams       Total shipment weight in grams
     * @param  int     $codAmount         0 for prepaid (Razorpay), non-zero for COD
     * @return array   { couriers: [...], recommended: {...} }
     */
    public function getServiceability(
        string $deliveryPostcode,
        int $weightGrams = 500,
        int $codAmount = 0,
    ): array {
        $weightKg = max(0.1, round($weightGrams / 1000, 2));

        $response = $this->http()->get("{$this->baseUrl}/courier/serviceability/", [
            'pickup_postcode'   => $this->pickupPostcode,
            'delivery_postcode' => $deliveryPostcode,
            'weight'            => $weightKg,
            'cod'               => $codAmount > 0 ? 1 : 0,
        ]);

        if (! $response->successful()) {
            Log::warning('Shiprocket serviceability failed', [
                'delivery_postcode' => $deliveryPostcode,
                'response'          => $response->body(),
            ]);
            return ['couriers' => [], 'recommended' => null];
        }

        $couriers = $response->json('data.available_courier_companies') ?? [];

        if (empty($couriers)) {
            return ['couriers' => [], 'recommended' => null];
        }

        // Normalize and sort by rate
        $normalized = collect($couriers)
            ->map(fn ($c) => [
                'courier_id'             => $c['courier_company_id'],
                'courier_name'           => $c['courier_name'],
                'rate_paise'             => (int) round(($c['rate'] ?? 0) * 100),
                'estimated_delivery_days'=> (int) ($c['estimated_delivery_days'] ?? 5),
                'etd'                    => $c['etd'] ?? null,
                'cod_charges'            => $c['cod_charges'] ?? 0,
                'is_surface'             => str_contains(strtolower($c['courier_name']), 'surface'),
            ])
            ->sortBy('rate_paise')
            ->values()
            ->toArray();

        return [
            'couriers'    => $normalized,
            'recommended' => $normalized[0] ?? null,  // cheapest by default
        ];
    }

    // ── Create Order ─────────────────────────────────────────────────────────

    /**
     * Create a Shiprocket order after payment is confirmed.
     *
     * @param  Order  $order  Eloquent order with items + shipping_address loaded
     * @return array  { shiprocket_order_id, shipment_id, status, awb_code (if auto-assigned) }
     */
    public function createOrder(Order $order): array
    {
        if ($this->dryRun) {
            Log::info('Shiprocket DRY RUN: skipping order creation', [
                'order_number' => $order->order_number,
            ]);
            return [
                'shiprocket_order_id' => 'DRY-' . $order->order_number,
                'shipment_id'         => null,
                'awb_code'            => null,
                'courier_name'        => null,
                'dry_run'             => true,
            ];
        }

        $address = $order->shipping_address ?? [];
        $items   = $order->items;

        // Build line items for Shiprocket
        $orderItems = $items->map(fn ($item) => [
            'name'        => $item->name,
            'sku'         => $item->sku ?? $item->name,
            'units'       => $item->quantity,
            'selling_price' => round($item->unit_price_paise / 100, 2),
        ])->toArray();

        // Total weight: sum of items weight_grams (fallback 500g/item)
        $totalWeightGrams = $items->sum(function ($item) {
            return ($item->productVariant?->weight_grams ?? 500) * $item->quantity;
        });
        $totalWeightKg = max(0.1, round($totalWeightGrams / 1000, 2));

        $payload = [
            'order_id'             => $order->order_number,
            'order_date'           => $order->ordered_at->format('Y-m-d H:i'),
            'pickup_location'      => 'Primary',   // must match pickup address name in Shiprocket
            'billing_customer_name'=> $address['full_name'] ?? 'Customer',
            'billing_last_name'    => '',
            'billing_address'      => $address['line1'] ?? '',
            'billing_address_2'    => $address['line2'] ?? '',
            'billing_city'         => $address['city'] ?? '',
            'billing_pincode'      => $address['pincode'] ?? '',
            'billing_state'        => $address['state'] ?? '',
            'billing_country'      => $address['country'] ?? 'India',
            'billing_email'        => $address['email'] ?? '',
            'billing_phone'        => $address['phone'] ?? '',
            'shipping_is_billing'  => true,
            'order_items'          => $orderItems,
            'payment_method'       => 'Prepaid',
            'sub_total'            => round($order->subtotal / 100, 2),
            'length'               => 30,   // cm — default frame box
            'breadth'              => 5,
            'height'               => 40,
            'weight'               => $totalWeightKg,
        ];

        $response = $this->http()->post("{$this->baseUrl}/orders/create/adhoc", $payload);

        if (! $response->successful()) {
            Log::error('Shiprocket createOrder failed', [
                'order_number' => $order->order_number,
                'response'     => $response->body(),
            ]);
            throw new RuntimeException('Shiprocket order creation failed: ' . $response->body());
        }

        $data = $response->json();

        Log::info('Shiprocket order created', [
            'order_number'        => $order->order_number,
            'shiprocket_order_id' => $data['order_id'] ?? null,
            'shipment_id'         => $data['shipment_id'] ?? null,
        ]);

        $result = [
            'shiprocket_order_id' => (string) ($data['order_id'] ?? ''),
            'shipment_id'         => (string) ($data['shipment_id'] ?? ''),
            'awb_code'            => null,
            'courier_id'          => null,
            'courier_name'        => null,
            'estimated_delivery_date' => null,
            'dry_run'             => false,
        ];

        // Auto-assign courier if configured
        if ($this->courierMode !== 'manual' && ! empty($result['shipment_id'])) {
            $awbResult = $this->assignBestCourier(
                $result['shipment_id'],
                $address['pincode'] ?? '',
                $totalWeightGrams,
            );
            $result = array_merge($result, $awbResult);
        }

        return $result;
    }

    // ── Courier Assignment ────────────────────────────────────────────────────

    /**
     * Find the best courier and assign AWB to a shipment.
     */
    public function assignBestCourier(
        string $shipmentId,
        string $deliveryPostcode,
        int $weightGrams = 500,
    ): array {
        // Get serviceability to find best courier
        $serviceability = $this->getServiceability($deliveryPostcode, $weightGrams);
        $bestCourier    = $serviceability['recommended'] ?? null;

        if (! $bestCourier) {
            Log::warning('No couriers available for AWB assignment', ['shipment_id' => $shipmentId]);
            return ['awb_code' => null, 'courier_id' => null, 'courier_name' => null, 'estimated_delivery_date' => null];
        }

        return $this->assignAWB($shipmentId, $bestCourier['courier_id']);
    }

    /**
     * Assign AWB to a shipment with a specific courier.
     */
    public function assignAWB(string $shipmentId, int $courierId): array
    {
        $response = $this->http()->post("{$this->baseUrl}/courier/assign/awb", [
            'shipment_id' => $shipmentId,
            'courier_id'  => (string) $courierId,
        ]);

        if (! $response->successful()) {
            Log::error('Shiprocket AWB assignment failed', [
                'shipment_id' => $shipmentId,
                'courier_id'  => $courierId,
                'response'    => $response->body(),
            ]);
            return ['awb_code' => null, 'courier_id' => $courierId, 'courier_name' => null, 'estimated_delivery_date' => null];
        }

        $data = $response->json('response.data') ?? [];

        Log::info('Shiprocket AWB assigned', [
            'shipment_id' => $shipmentId,
            'awb_code'    => $data['awb_code'] ?? null,
        ]);

        return [
            'awb_code'               => $data['awb_code'] ?? null,
            'courier_id'             => $courierId,
            'courier_name'           => $data['courier_name'] ?? null,
            'estimated_delivery_date'=> $data['etd'] ?? null,
        ];
    }

    // ── Tracking ──────────────────────────────────────────────────────────────

    /**
     * Get tracking events for an AWB code.
     *
     * @param  string  $awb  Airway Bill number
     * @return array   { awb_code, courier_name, current_status, tracking_events[] }
     */
    public function trackByAWB(string $awb): array
    {
        $response = $this->http()->get("{$this->baseUrl}/courier/track/awb/{$awb}");

        if (! $response->successful()) {
            Log::warning('Shiprocket tracking failed', ['awb' => $awb, 'status' => $response->status()]);
            return ['awb_code' => $awb, 'current_status' => 'UNKNOWN', 'tracking_events' => []];
        }

        $data            = $response->json('tracking_data') ?? [];
        $shipmentTrack   = $data['shipment_track'][0] ?? [];
        $trackActivities = $data['shipment_track_activities'] ?? [];

        return [
            'awb_code'       => $awb,
            'courier_name'   => $shipmentTrack['courier_name'] ?? null,
            'current_status' => $shipmentTrack['current_status'] ?? 'UNKNOWN',
            'etd'            => $shipmentTrack['etd'] ?? null,
            'tracking_events'=> collect($trackActivities)->map(fn ($a) => [
                'date'     => $a['date'] ?? null,
                'activity' => $a['activity'] ?? null,
                'location' => $a['location'] ?? null,
                'sr_status'=> $a['sr-status'] ?? null,
            ])->toArray(),
        ];
    }
}
