<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function __construct(private readonly ShiprocketService $shiprocket) {}

    /**
     * GET /api/v1/auth/orders/{orderNumber}/tracking
     *
     * Returns live tracking information for a user's order.
     * Auth required — users can only track their own orders.
     *
     * Response shape:
     * {
     *   order_number, awb_code, courier_name, current_status,
     *   estimated_delivery_date, shiprocket_status,
     *   tracking_events: [{ date, activity, location }]
     * }
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Base response from our DB (always available)
        $base = [
            'order_number'            => $order->order_number,
            'awb_code'                => $order->awb_code,
            'courier_name'            => $order->courier_name,
            'shiprocket_status'       => $order->shiprocket_status,
            'estimated_delivery_date' => $order->estimated_delivery_date?->format('Y-m-d'),
            'tracking_events'         => [],
        ];

        // If no AWB yet, return what we have (order might not be shipped yet)
        if (! $order->awb_code) {
            return response()->json(array_merge($base, [
                'current_status' => $order->status === 'confirmed' ? 'Order confirmed — preparing for shipment' : $order->status,
                'message'        => 'Tracking information will be available once the shipment is picked up.',
            ]));
        }

        // Fetch live tracking from Shiprocket
        try {
            $tracking = $this->shiprocket->trackByAWB($order->awb_code);

            return response()->json(array_merge($base, [
                'current_status'  => $tracking['current_status'],
                'etd'             => $tracking['etd'],
                'tracking_events' => $tracking['tracking_events'],
            ]));
        } catch (\Throwable $e) {
            // Graceful fallback — return DB data if Shiprocket API is unavailable
            return response()->json(array_merge($base, [
                'current_status' => $order->shiprocket_status ?? $order->status,
                'message'        => 'Live tracking temporarily unavailable. Please check back shortly.',
            ]));
        }
    }
}
