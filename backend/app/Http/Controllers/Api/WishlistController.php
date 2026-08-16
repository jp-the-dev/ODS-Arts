<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistItemResource;
use App\Models\ArtProduct;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class WishlistController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $items = $request->user()->wishlistItems()
            ->with(['product.images', 'product.collection', 'artProduct.images', 'artProduct.category'])
            ->latest()
            ->get();

        return WishlistItemResource::collection($items);
    }

    /**
     * POST /api/v1/auth/wishlist
     *
     * Frames and art have separate tables and independent slugs, so the caller
     * states which catalogue the slug belongs to. Without that, a slug present in
     * both would silently save the wrong item.
     */
    public function store(Request $request): WishlistItemResource
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:frame,art'],
        ]);

        $type = $validated['type'] ?? 'frame';

        if ($type === 'art') {
            $art = ArtProduct::where('slug', $validated['slug'])->firstOrFail();

            $item = $request->user()->wishlistItems()
                ->firstOrCreate(['art_product_id' => $art->id], ['product_id' => null]);

            $item->load(['artProduct.images', 'artProduct.category']);

            return new WishlistItemResource($item);
        }

        $product = Product::where('slug', $validated['slug'])->firstOrFail();

        $item = $request->user()->wishlistItems()
            ->firstOrCreate(['product_id' => $product->id], ['art_product_id' => null]);

        $item->load(['product.images', 'product.collection']);

        return new WishlistItemResource($item);
    }

    public function destroy(Request $request, WishlistItem $wishlistItem): JsonResponse
    {
        // 404 rather than 403 — someone else's row should not be discoverable.
        if ($wishlistItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Item not found.'], 404);
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Item removed from wishlist.']);
    }
}
