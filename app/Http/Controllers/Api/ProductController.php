<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products — list active products with optional filtering.
     *
     * Query params:
     *   c          — comma-separated collection slugs: walnut,gallery,heritage
     *   s          — pipe-separated size labels: 8" × 10"|11" × 14"
     *   sort       — recommended|price_asc|price_desc|newest|delivery_asc
     *   min_price  — integer in paise
     *   max_price  — integer in paise
     *   in_stock   — 1 to filter to in-stock only
     *   q          — full-text search across name, tagline, description, material
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::active()
            ->with(['images', 'collection.finishOptions', 'variants']);

        // ── Collection filter (c=walnut,gallery) ──────────────────────────────
        if ($c = $request->query('c')) {
            $slugs = array_filter(explode(',', $c));
            $query->whereHas('collection', fn ($q) => $q->whereIn('slug', $slugs));
        }

        // ── Full-text search (q=walnut) ───────────────────────────────────────
        if ($q = trim($request->query('q', ''))) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('tagline', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('material', 'like', "%{$q}%");
            });
        }

        // ── Size filter (s=8" × 10"|11" × 14") ──────────────────────────────
        if ($s = $request->query('s')) {
            $sizes = array_filter(explode('|', $s));
            $query->whereHas('variants', fn ($q) => $q->whereIn('size_label', $sizes));
        }

        // ── Price range (in paise) ────────────────────────────────────────────
        if ($minPrice = $request->query('min_price')) {
            $query->whereHas('variants', fn ($q) => $q->where('base_price_paise', '>=', (int) $minPrice));
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->whereHas('variants', fn ($q) => $q->where('base_price_paise', '<=', (int) $maxPrice));
        }

        // ── In-stock filter ───────────────────────────────────────────────────
        if ($request->query('in_stock') === '1') {
            $query->whereHas('variants', fn ($q) => $q->where('stock_qty', '>', 0));
        }

        // ── Sorting ───────────────────────────────────────────────────────────
        switch ($request->query('sort', 'recommended')) {
            case 'price_asc':
                $query->orderByRaw('(
                    SELECT MIN(base_price_paise) FROM product_variants
                    WHERE product_variants.product_id = products.id
                ) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('(
                    SELECT MIN(base_price_paise) FROM product_variants
                    WHERE product_variants.product_id = products.id
                ) DESC');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'delivery_asc':
                $query->orderBy('delivery_days', 'asc');
                break;
            default: // recommended
                $query->orderBy('sort_order');
                break;
        }

        return ProductResource::collection($query->get());
    }

    /** GET /api/v1/products/featured — list featured products */
    public function featured(): AnonymousResourceCollection
    {
        $products = Product::active()
            ->featured()
            ->with(['images', 'collection.finishOptions', 'variants'])
            ->orderBy('sort_order')
            ->get();

        return ProductResource::collection($products);
    }

    /** GET /api/v1/products/{slug} — show a single product */
    public function show(string $slug): ProductResource|JsonResponse
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['images', 'collection.finishOptions', 'variants'])
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return new ProductResource($product);
    }
}
