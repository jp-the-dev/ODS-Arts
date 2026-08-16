<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /** Relations every product response needs. */
    private const WITH = ['images', 'collection', 'variants', 'finishOptions'];

    /**
     * SQL for a product's cheapest active variant, falling back to the product's
     * own price when it has no variants yet. Used for both price filtering and
     * price sorting so they agree with the storefront, which filters on the
     * lowest variant price.
     */
    private function lowestPriceSql(): string
    {
        return '(COALESCE((SELECT MIN(pv.base_price_paise) FROM product_variants pv'
            .' WHERE pv.product_id = products.id), products.price_in_paise))';
    }

    /**
     * GET /api/v1/products — list active products.
     *
     * Supports the filter contract emitted by the storefront's
     * `serializeFilters()` (frontend/src/lib/types/filters.ts):
     *
     *   c=walnut,gallery   comma-separated collection slugs
     *   s=8" × 10"|11×14   pipe-separated size labels (matched against variants)
     *   min= / max=        price bounds in paise, inclusive, on the cheapest variant
     *   stock=1            in-stock only
     *   sort=              recommended | price_asc | price_desc | newest | delivery_asc
     *   q=                 substring search over name, tagline, material(s), description
     *   page= / per_page=  pagination
     *
     * Pagination is opt-in: without `page`/`per_page` the full collection is
     * returned, preserving the response shape existing callers rely on.
     *
     * Query-string values arrive as strings; the numeric ones are cast before
     * binding because SQLite compares an integer column against a text binding
     * by type affinity (integers always sort first) rather than numerically.
     *
     * `stock=1` keeps only products with at least one in-stock active variant.
     * Price filtering and price sorting both use the cheapest active variant.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'c' => ['sometimes', 'string', 'max:255'],
            's' => ['sometimes', 'string', 'max:255'],
            'min' => ['sometimes', 'integer', 'min:0'],
            'max' => ['sometimes', 'integer', 'min:0'],
            'stock' => ['sometimes', 'in:0,1'],
            'sort' => ['sometimes', 'in:recommended,price_asc,price_desc,newest,delivery_asc'],
            'q' => ['sometimes', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Product::active()->with(self::WITH);

        if (filled($validated['c'] ?? null)) {
            $slugs = array_filter(explode(',', $validated['c']));

            $query->whereHas('collection', fn (Builder $q) => $q->whereIn('slug', $slugs));
        }

        if (filled($validated['s'] ?? null)) {
            $sizes = array_filter(explode('|', $validated['s']));

            $query->whereHas('variants', fn (Builder $q) => $q->whereIn('size_label', $sizes));
        }

        if (isset($validated['min'])) {
            $query->whereRaw($this->lowestPriceSql().' >= ?', [(int) $validated['min']]);
        }

        if (isset($validated['max'])) {
            $query->whereRaw($this->lowestPriceSql().' <= ?', [(int) $validated['max']]);
        }

        if (($validated['stock'] ?? null) === '1') {
            // A product with no variants has no stock record, so it stays listed.
            $query->where(fn (Builder $q) => $q
                ->whereHas('variants', fn (Builder $v) => $v->inStock())
                ->orWhereDoesntHave('variants'));
        }

        if (filled($validated['q'] ?? null)) {
            $term = '%'.$validated['q'].'%';

            $query->where(function (Builder $q) use ($term): void {
                $q->where('name', 'like', $term)
                    ->orWhere('tagline', 'like', $term)
                    ->orWhere('material', 'like', $term)
                    ->orWhere('materials', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        match ($validated['sort'] ?? 'recommended') {
            'price_asc' => $query->orderByRaw($this->lowestPriceSql().' asc'),
            'price_desc' => $query->orderByRaw($this->lowestPriceSql().' desc'),
            'newest' => $query->orderByDesc('created_at'),
            'delivery_asc' => $query->orderBy('delivery_days'),
            default => $query->orderBy('sort_order'),
        };

        // Deterministic tie-break so paginated pages cannot repeat or skip rows.
        $query->orderBy('id');

        if (isset($validated['page']) || isset($validated['per_page'])) {
            return ProductResource::collection(
                $query->paginate((int) ($validated['per_page'] ?? 15))->withQueryString()
            );
        }

        return ProductResource::collection($query->get());
    }

    /** GET /api/v1/products/featured — list featured products */
    public function featured(): AnonymousResourceCollection
    {
        $products = Product::active()
            ->featured()
            ->with(self::WITH)
            ->orderBy('sort_order')
            ->get();

        return ProductResource::collection($products);
    }

    /** GET /api/v1/products/{slug} — show a single product with all images */
    public function show(string $slug): ProductResource|JsonResponse
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(self::WITH)
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return new ProductResource($product);
    }
}
