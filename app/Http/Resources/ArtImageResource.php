<?php

namespace App\Http\Resources;

use App\Models\ArtImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ArtImage $resource
 */
class ArtImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'url' => $this->resource->url,
            'alt' => $this->resource->alt,
            'role' => $this->resource->role,
            'sort_order' => $this->resource->sort_order,
        ];
    }
}
