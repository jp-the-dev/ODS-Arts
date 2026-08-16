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
        $isArt = $this->resource->art_product_id !== null;

        return [
            'id' => $this->resource->id,
            // The storefront keys its wishlist by slug + type, mirroring the cart.
            'type' => $isArt ? 'art' : 'frame',
            'product_id' => $this->resource->product_id,
            'art_product_id' => $this->resource->art_product_id,
            'product' => $isArt ? $this->artPayload() : $this->productPayload(),
            'created_at' => $this->resource->created_at,
        ];
    }

    /** @return array<string, mixed>|null */
    private function productPayload(): ?array
    {
        $product = $this->resource->product;

        if (! $product) {
            return null;
        }

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'tagline' => $product->tagline,
            'price' => $product->price, // rupees (float via accessor)
            'thumbnail' => $product->relationLoaded('images')
                ? ($product->images->first()->url ?? null)
                : null,
            'collection_slug' => $product->relationLoaded('collection')
                ? ($product->collection?->slug)
                : null,
        ];
    }

    /** @return array<string, mixed>|null */
    private function artPayload(): ?array
    {
        $art = $this->resource->artProduct;

        if (! $art) {
            return null;
        }

        return [
            'id' => $art->id,
            'slug' => $art->slug,
            'name' => $art->name,
            'tagline' => $art->tagline,
            'price' => null, // art is priced per material + size variant
            'thumbnail' => $art->relationLoaded('images')
                ? ($art->images->first()->url ?? null)
                : null,
            'category_slug' => $art->relationLoaded('category')
                ? ($art->category?->slug)
                : null,
        ];
    }
}
