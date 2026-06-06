<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistItemResource;
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
            ->with('product')
            ->latest()
            ->get();

        return WishlistItemResource::collection($items);
    }

    public function store(Request $request): WishlistItemResource
    {
        $request->validate([
            'slug' => ['required', 'string', 'exists:products,slug'],
        ]);

        $product = Product::where('slug', $request->slug)->firstOrFail();

        $item = $request->user()->wishlistItems()
            ->firstOrCreate(['product_id' => $product->id]);

        $item->load('product');

        return new WishlistItemResource($item);
    }

    public function destroy(Request $request, WishlistItem $wishlistItem): JsonResponse
    {
        if ($wishlistItem->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Item removed from wishlist.']);
    }
}
