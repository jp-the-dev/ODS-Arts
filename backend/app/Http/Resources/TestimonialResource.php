<?php

namespace App\Http\Resources;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Testimonial $resource
 */
class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'quote' => $this->resource->quote,
            'author' => $this->resource->author,
            'city' => $this->resource->city,
            'product_name' => $this->resource->product?->name,
            'product_slug' => $this->resource->product?->slug,
        ];
    }
}
