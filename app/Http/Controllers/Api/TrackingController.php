<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class TrackingController extends Controller
{
    public function __construct(private readonly ShiprocketService $shiprocket) {}

    /**
     * GET /api/v1/orders/{orderNumber}/tracking
     *
     * Open to the order's owner, or to any holder of the reference when the
     * order was placed as a guest — guests have no account to authenticate
     * against, and this returns no payment or personal data.
     *
     * An order with no AWB yet is a normal state, not an error: it simply has
     * not been handed to a courier.
     */
    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // Ask the sanctum guard by name. This route carries no auth middleware,
        // so the default guard is the session one, which never inspects a bearer
        // token — $request->user() would be null even for the order's owner, and
        // every order with an owner would 404 for everybody.
        if ($order->user_id !== null && $order->user_id !== $request->user('sanctum')?->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (blank($order->awb_code)) {
            return response()->json([
                'data' => [
                    'orderReference' => $order->order_number,
                    'status' => $order->status,
                    // Without this the page cannot distinguish an order awaiting
                    // payment from one whose payment was refused — both read as
                    // status "pending" and look successfully placed.
                    'paymentStatus' => $order->payment_status,
                    'awbCode' => null,
                    'courierName' => $order->courier_name,
                    'currentStatus' => 'Not yet shipped',
                    'checkpoints' => [],
                ],
            ]);
        }

        try {
            $tracking = $this->shiprocket->track($order->awb_code);
        } catch (Throwable $e) {
            Log::warning('Tracking lookup failed', [
                'order' => $order->order_number,
                'error' => $e->getMessage(),
            ]);

            // Fall back to the last status we stored rather than erroring —
            // stale information beats none on an order-tracking screen.
            $tracking = [
                'current_status' => $order->shiprocket_status ?: 'Unavailable',
                'checkpoints' => [],
            ];
        }

        return response()->json([
            'data' => [
                'orderReference' => $order->order_number,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'awbCode' => $order->awb_code,
                'courierName' => $order->courier_name,
                'currentStatus' => $tracking['current_status'] ?? 'Unknown',
                'estimatedDelivery' => $order->estimated_delivery_date?->toDateString(),
                'checkpoints' => $tracking['checkpoints'] ?? [],
            ],
        ]);
    }
}
