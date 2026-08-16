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
            // Two steps, each guarded on its own result. A retry after the AWB
            // call fails must resume at the assignment rather than skip it
            // because the booking already succeeded — or re-book because the
            // AWB is still missing.
            $this->book($shiprocket);
            $this->assignAwb($shiprocket);

            Log::info('CreateShiprocketOrderJob completed', [
                'order_number' => $this->order->order_number,
                'shiprocket_order_id' => $this->order->shiprocket_order_id ?? 'pending',
                'awb_code' => $this->order->awb_code ?? 'pending',
                'courier_name' => $this->order->courier_name ?? 'pending',
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

    /**
     * Create the order in Shiprocket, unless it is already there.
     *
     * Shiprocket keys on the order_id we send, so a repeat call returns the same
     * booking rather than duplicating it — but there is no reason to spend the
     * round trip, and this keeps the guard on our side of the wire.
     */
    private function book(ShiprocketService $shiprocket): void
    {
        if (filled($this->order->shiprocket_order_id)) {
            return;
        }

        $result = $shiprocket->createOrder($this->order);

        // An adhoc order has no courier yet, and Shiprocket signals that with
        // empty strings rather than nulls. `! is_null()` let those through and
        // MySQL rejected '' for the integer courier_id — so the booking
        // succeeded and the write-back threw, losing the ids and re-running the
        // whole job. Treat empty as absent.
        $this->order->update(array_filter([
            'shiprocket_order_id' => $result['shiprocket_order_id'] ?? null,
            'shiprocket_shipment_id' => $result['shipment_id'] ?? null,
            'awb_code' => $result['awb_code'] ?? null,
            'courier_id' => $result['courier_id'] ?? null,
            'courier_name' => $result['courier_name'] ?? null,
            'estimated_delivery_date' => $result['estimated_delivery_date'] ?? null,
            'pickup_pincode' => config('services.shiprocket.pickup_postcode'),
        ], fn ($value) => filled($value)));
    }

    /**
     * Attach a courier and AWB to the booked shipment.
     *
     * The AWB is what the status webhook matches on and what tracking reads, so
     * an order without one is invisible for the rest of its life.
     */
    private function assignAwb(ShiprocketService $shiprocket): void
    {
        if (filled($this->order->awb_code) || blank($this->order->shiprocket_shipment_id)) {
            return;
        }

        $result = $shiprocket->assignAwb(
            $this->order->shiprocket_shipment_id,
            $shiprocket->preferredCourierId($this->order),
        );

        $this->order->update(array_filter([
            'awb_code' => $result['awb_code'] ?? null,
            'courier_id' => $result['courier_id'] ?? null,
            'courier_name' => $result['courier_name'] ?? null,
        ], fn ($value) => filled($value)));
    }
}
