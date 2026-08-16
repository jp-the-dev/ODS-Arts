<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\ShiprocketService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * CreateShiprocketOrderJob
 *
 * Dispatched asynchronously after payment verification.
 * Creates a Shiprocket order and (if auto mode) assigns AWB.
 * Updates the Order model with returned shiprocket fields.
 *
 * In DRY_RUN mode, this job logs the would-be call and exits.
 * Retries up to 3 times on failure with 60s delay.
 */
class CreateShiprocketOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(private readonly Order $order) {}

    public function handle(ShiprocketService $shiprocket): void
    {
        // Load relationships needed for order creation
        $this->order->loadMissing('items.productVariant');

        try {
            $result = $shiprocket->createOrder($this->order);

            // Persist Shiprocket data back to the order
            $this->order->update(array_filter([
                'shiprocket_order_id' => $result['shiprocket_order_id'] ?? null,
                'shiprocket_shipment_id' => $result['shipment_id'] ?? null,
                'awb_code' => $result['awb_code'] ?? null,
                'courier_id' => $result['courier_id'] ?? null,
                'courier_name' => $result['courier_name'] ?? null,
                'estimated_delivery_date' => $result['estimated_delivery_date'] ?? null,
                'pickup_pincode' => config('services.shiprocket.pickup_postcode'),
            ], fn ($v) => ! is_null($v)));

            Log::info('CreateShiprocketOrderJob completed', [
                'order_number' => $this->order->order_number,
                'awb_code' => $result['awb_code'] ?? 'pending',
                'courier_name' => $result['courier_name'] ?? 'pending',
                'dry_run' => $result['dry_run'] ?? false,
            ]);

        } catch (Throwable $e) {
            Log::error('CreateShiprocketOrderJob failed', [
                'order_number' => $this->order->order_number,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw so the queue system retries
            throw $e;
        }
    }
}
