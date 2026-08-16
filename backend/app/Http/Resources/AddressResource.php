<?php

namespace App\Http\Resources;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Address $resource
 */
class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'label' => $this->resource->label,
            'type' => $this->resource->type,
            'is_default' => $this->resource->is_default,
            'full_name' => $this->resource->full_name,
            'phone' => $this->resource->phone,
            'address_line1' => $this->resource->address_line1,
            'address_line2' => $this->resource->address_line2,
            'city' => $this->resource->city,
            'state' => $this->resource->state,
            'postal_code' => $this->resource->postal_code,
            'country' => $this->resource->country,
            'created_at' => $this->resource->created_at,
        ];
    }
}
