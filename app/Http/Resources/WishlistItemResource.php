<?php

namespace App\Http\Resources;

use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read WishlistItem $resource
 */
class WishlistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->resource->product;

        // Get the first product image URL as thumbnail
        $thumbnail = null;
        if ($product && $product->relationLoaded('images') && $product->images->isNotEmpty()) {
            $thumbnail = $product->images->first()->url ?? null;
        }

        // Get the collection slug for building the product URL on the frontend
        $collectionSlug = null;
        if ($product && $product->relationLoaded('collection') && $product->collection) {
            $collectionSlug = $product->collection->slug;
        }

        return [
            'id'         => $this->resource->id,
            'product_id' => $this->resource->product_id,
            'product'    => $product ? [
                'id'              => $product->id,
                'slug'            => $product->slug,
                'name'            => $product->name,
                'tagline'         => $product->tagline,
                'price'           => $product->price, // rupees (float via accessor)
                'thumbnail'       => $thumbnail,
                'collection_slug' => $collectionSlug,
            ] : null,
            'created_at' => $this->resource->created_at,
        ];
    }
}
