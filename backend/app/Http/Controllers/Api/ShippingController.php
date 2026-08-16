<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ShippingController extends Controller
{
    public function __construct(private readonly ShiprocketService $shiprocket) {}

    /**
     * GET /api/v1/shipping/rates?pincode=400020&weight=1.5
     *
     * Public: quoted at checkout, before an order or payment exists.
     *
     * A courier lookup failure must never block checkout, so an upstream error
     * degrades to the flat standard option rather than surfacing a 5xx.
     */
    public function rates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pincode' => ['required', 'string', 'regex:/^\d{6}$/'],
            'weight' => ['sometimes', 'numeric', 'min:0.1', 'max:50'],
            'cod' => ['sometimes', 'boolean'],
        ]);

        try {
            $result = $this->shiprocket->rates(
                $validated['pincode'],
                (float) ($validated['weight'] ?? 1.0),
                (bool) ($validated['cod'] ?? false),
            );
        } catch (Throwable $e) {
            Log::warning('Shipping rate lookup failed; falling back to standard', [
                'pincode' => $validated['pincode'],
                'error' => $e->getMessage(),
            ]);

            $result = [
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

        return response()->json(['data' => $result]);
    }

    /**
     * POST /api/v1/webhooks/shiprocket
     *
     * Status pushes from Shiprocket. Matched on AWB code, which is the only
     * identifier the payload reliably carries.
     */
    public function webhook(Request $request): JsonResponse
    {
        $awb = (string) ($request->input('awb') ?? $request->input('awb_code') ?? '');
        $status = (string) ($request->input('current_status') ?? $request->input('status') ?? '');

        if (blank($awb)) {
            return response()->json(['message' => 'Ignored.']);
        }

        $order = Order::where('awb_code', $awb)->first();

        if (! $order) {
            return response()->json(['message' => 'Ignored.']);
        }

        $order->update(array_filter([
            'shiprocket_status' => $status ?: null,
            'status' => $this->mapStatus($status),
        ], fn ($value) => ! is_null($value)));

        return response()->json(['message' => 'Handled.']);
    }

    /** Translate Shiprocket's vocabulary into our own order statuses. */
    private function mapStatus(string $shiprocketStatus): ?string
    {
        return match (strtolower($shiprocketStatus)) {
            'delivered' => 'delivered',
            'shipped', 'in transit', 'out for delivery' => 'shipped',
            'cancelled', 'canceled' => 'cancelled',
            'rto initiated', 'rto delivered' => 'returned',
            default => null,
        };
    }
}
