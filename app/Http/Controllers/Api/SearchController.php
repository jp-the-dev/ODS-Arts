<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtProductResource;
use App\Http\Resources\ProductResource;
use App\Models\ArtProduct;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * GET /api/v1/search?q={query}&limit={limit}
     *
     * Full-text search across both frame products and art products.
     * Returns a combined response matching the frontend SearchResult shape:
     * { products: Product[], art: ArtProduct[], total: number }
     */
    public function index(Request $request): JsonResponse
    {
        $q     = trim($request->query('q', ''));
        $limit = min((int) $request->query('limit', 6), 24);

        if ($q === '') {
            return response()->json([
                'products' => [],
                'art'      => [],
                'total'    => 0,
            ]);
        }

        // ── Frame Products ───────────────────────────────────────────────────
        $products = Product::active()
            ->with(['images', 'collection.finishOptions', 'variants'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('tagline', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('material', 'like', "%{$q}%");
            })
            ->limit($limit)
            ->get();

        // ── Art Products ─────────────────────────────────────────────────────
        $art = ArtProduct::active()
            ->with(['category', 'materialVariants', 'images'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('tagline', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('medium', 'like', "%{$q}%")
                      ->orWhereJsonContains('tags', $q);
            })
            ->limit($limit)
            ->get();

        $total = $products->count() + $art->count();

        return response()->json([
            'products' => ProductResource::collection($products),
            'art'      => ArtProductResource::collection($art),
            'total'    => $total,
        ]);
    }
}
