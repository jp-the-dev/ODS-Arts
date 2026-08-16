<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtProductResource;
use App\Models\ArtProduct;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArtController extends Controller
{
    /** Relations every art response needs. */
    private const WITH = ['category', 'materialVariants', 'images'];

    /**
     * GET /api/v1/art — list active art.
     *
     * Mirrors the frame filter contract in ProductController, using the art
     * vocabulary the storefront's `getFilteredArt()` sends:
     *
     *   style=cultural,modern   comma-separated category slugs
     *   material=canvas,metallic  comma-separated print materials
     *   size=8" × 10"|11×14     pipe-separated size labels
     *   min_price / max_price   paise bounds on the cheapest material variant
     *   in_stock=1              only pieces with a variant in stock
     *   sort=                   recommended | price_asc | price_desc | newest
     *   q=                      name, tagline, medium, tags, description
     *
     * Numeric params are cast before binding: SQLite compares an integer column
     * against a text binding by type affinity rather than numerically.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'style' => ['sometimes', 'string', 'max:255'],
            'material' => ['sometimes', 'string', 'max:255'],
            'size' => ['sometimes', 'string', 'max:255'],
            'min_price' => ['sometimes', 'integer', 'min:0'],
            'max_price' => ['sometimes', 'integer', 'min:0'],
            'in_stock' => ['sometimes', 'in:0,1'],
            'sort' => ['sometimes', 'in:recommended,price_asc,price_desc,newest'],
            'q' => ['sometimes', 'string', 'max:255'],
        ]);

        $query = ArtProduct::active()->with(self::WITH);

        if (filled($validated['style'] ?? null)) {
            $slugs = array_filter(explode(',', $validated['style']));

            $query->whereHas('category', fn (Builder $q) => $q->whereIn('slug', $slugs));
        }

        if (filled($validated['material'] ?? null)) {
            $materials = array_filter(explode(',', $validated['material']));

            $query->whereHas('materialVariants', fn (Builder $q) => $q->whereIn('material', $materials));
        }

        if (filled($validated['size'] ?? null)) {
            $sizes = array_filter(explode('|', $validated['size']));

            $query->whereHas('materialVariants', fn (Builder $q) => $q->whereIn('size_label', $sizes));
        }

        if (isset($validated['min_price'])) {
            $query->whereRaw($this->lowestPriceSql().' >= ?', [(int) $validated['min_price']]);
        }

        if (isset($validated['max_price'])) {
            $query->whereRaw($this->lowestPriceSql().' <= ?', [(int) $validated['max_price']]);
        }

        if (($validated['in_stock'] ?? null) === '1') {
            $query->whereHas('materialVariants', fn (Builder $q) => $q->where('stock_qty', '>', 0));
        }

        if (filled($validated['q'] ?? null)) {
            $term = '%'.$validated['q'].'%';

            $query->where(function (Builder $q) use ($term): void {
                $q->where('name', 'like', $term)
                    ->orWhere('tagline', 'like', $term)
                    ->orWhere('medium', 'like', $term)
                    ->orWhere('tags', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        match ($validated['sort'] ?? 'recommended') {
            'price_asc' => $query->orderByRaw($this->lowestPriceSql().' asc'),
            'price_desc' => $query->orderByRaw($this->lowestPriceSql().' desc'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->orderBy('sort_order'),
        };

        // Deterministic tie-break so ordering is stable.
        $query->orderBy('id');

        return ArtProductResource::collection($query->get());
    }

    /** Cheapest material variant for an art piece, for filtering and sorting. */
    private function lowestPriceSql(): string
    {
        return '(COALESCE((SELECT MIN(amv.price_paise) FROM art_material_variants amv'
            .' WHERE amv.art_product_id = art_products.id), 0))';
    }

    /** GET /api/v1/art/featured — list featured art products */
    public function featured(): AnonymousResourceCollection
    {
        $art = ArtProduct::active()
            ->featured()
            ->with(['category', 'materialVariants', 'images'])
            ->orderBy('sort_order')
            ->get();

        return ArtProductResource::collection($art);
    }

    /** GET /api/v1/art/{slug} — show a single art product */
    public function show(string $slug): ArtProductResource|JsonResponse
    {
        $art = ArtProduct::active()
            ->where('slug', $slug)
            ->with(['category', 'materialVariants', 'images'])
            ->first();

        if (! $art) {
            return response()->json(['message' => 'Art product not found.'], 404);
        }

        return new ArtProductResource($art);
    }
}
