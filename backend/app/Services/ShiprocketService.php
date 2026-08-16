<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

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
        $address = $order->shipping_address ?? [];

        return [
            'order_id' => $order->order_number,
            'order_date' => $order->ordered_at?->format('Y-m-d H:i') ?? now()->format('Y-m-d H:i'),
            'pickup_location' => 'Primary',
            'billing_customer_name' => $address['full_name'] ?? 'Customer',
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
            // Dimensions are per-parcel; a single boxed frame is the default.
            'length' => 40,
            'breadth' => 30,
            'height' => 6,
            'weight' => max(0.5, $order->items->sum('quantity') * 1.0),
        ];
    }
}
