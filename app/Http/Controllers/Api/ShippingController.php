<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    public function __construct(private readonly ShiprocketService $shiprocket) {}

    /**
     * GET /api/v1/shipping/rates
     *
     * Returns available couriers and rates for a delivery pincode.
     * Called from the checkout page before payment to show shipping cost.
     *
     * Query params:
     *   delivery_postcode  (required) — 6-digit customer pincode
     *   weight             (optional) — total cart weight in grams (default 500)
     */
    public function rates(Request $request): JsonResponse
    {
        $request->validate([
            'delivery_postcode' => ['required', 'digits:6'],
            'weight'            => ['sometimes', 'integer', 'min:100', 'max:30000'],
        ]);

        $deliveryPostcode = $request->query('delivery_postcode');
        $weightGrams      = (int) $request->query('weight', 500);

        try {
            $result = $this->shiprocket->getServiceability(
                deliveryPostcode: $deliveryPostcode,
                weightGrams: $weightGrams,
                codAmount: 0,   // ODSArts uses Razorpay prepaid only
            );

            return response()->json([
                'pickup_postcode'   => config('services.shiprocket.pickup_postcode'),
                'delivery_postcode' => $deliveryPostcode,
                'weight_grams'      => $weightGrams,
                'couriers'          => $result['couriers'],
                'recommended'       => $result['recommended'],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Shipping rates fetch failed', ['error' => $e->getMessage()]);
            return response()->json([
                'couriers'    => [],
                'recommended' => null,
                'message'     => 'Unable to fetch shipping rates. Please try again.',
            ], 200);   // 200 so checkout doesn't break — show fallback
        }
    }

    /**
     * POST /api/v1/webhooks/shiprocket
     *
     * Receives tracking event updates from Shiprocket.
     * Updates the order's shiprocket_status in the DB.
     *
     * Shiprocket sends POST with Content-Type: application/json.
     * No signature verification on Shiprocket's end — we validate AWB exists.
     */
    public function webhook(Request $request): JsonResponse
    {
        $awb    = $request->input('awb');
        $status = $request->input('current_status');
        $etd    = $request->input('etd');

        if (! $awb) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $order = Order::where('awb_code', $awb)->first();

        if (! $order) {
            Log::info('Shiprocket webhook: AWB not found in orders', ['awb' => $awb]);
            return response()->json(['status' => 'not_found'], 200);
        }

        $updates = ['shiprocket_status' => $status];

        // Map Shiprocket status to our order status
        if ($status === 'Delivered') {
            $updates['status'] = 'delivered';
        } elseif (in_array($status, ['Pickup Scheduled', 'Pickup Generated', 'Pickup Queued'])) {
            $updates['status'] = 'processing';
        } elseif (in_array($status, ['In Transit', 'Out for Delivery'])) {
            $updates['status'] = 'shipped';
        }

        if ($etd) {
            $updates['estimated_delivery_date'] = $etd;
        }

        $order->update($updates);

        Log::info('Shiprocket webhook processed', [
            'awb'    => $awb,
            'status' => $status,
            'order'  => $order->order_number,
        ]);

        return response()->json(['status' => 'ok']);
    }
}
