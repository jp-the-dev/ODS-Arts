<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Order $resource
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'order_number' => $this->resource->order_number,
            'status' => $this->resource->status,
            'subtotal' => $this->resource->subtotal,
            'tax' => $this->resource->tax,
            'shipping_cost' => $this->resource->shipping_cost,
            'discount' => $this->resource->discount,
            'total' => $this->resource->total,
            'payment_status' => $this->resource->payment_status,
            'payment_method' => $this->resource->payment_method,
            'billing_address' => $this->resource->billing_address,
            'shipping_address' => $this->resource->shipping_address,
            'currency' => $this->resource->currency,
            'notes' => $this->resource->notes,
            'ordered_at' => $this->resource->ordered_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            // Null until the order is paid — the storefront uses its presence to
            // decide whether to offer the download at all.
            'invoice' => $this->resource->invoice ? [
                'number' => $this->resource->invoice->number,
                'issued_at' => $this->resource->invoice->issued_at,
                'taxable_value' => $this->resource->invoice->taxable_value,
                'cgst' => $this->resource->invoice->cgst,
                'sgst' => $this->resource->invoice->sgst,
                'igst' => $this->resource->invoice->igst,
                'gst_rate' => (float) $this->resource->invoice->gst_rate,
                'is_intra_state' => $this->resource->invoice->is_intra_state,
            ] : null,
            'created_at' => $this->resource->created_at,
        ];
    }
}
