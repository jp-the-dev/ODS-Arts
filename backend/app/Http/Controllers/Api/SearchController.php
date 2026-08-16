<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtProductResource;
use App\Http\Resources\ProductResource;
use App\Models\ArtProduct;
use App\Models\Product;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class SearchController extends Controller
{
    /**
     * GET /api/v1/search?q=walnut&limit=6&type=art
     *
     * Searches frames and art in one call, which is what the storefront's search
     * drawer renders. `total` counts every match, while the returned lists are
     * capped at `limit` — so the UI can say "showing 6 of 24".
     *
     * Frames fill the limit first, then art takes what is left, mirroring the
     * ordering the drawer already used against fixtures.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:255'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:24'],
            'type' => ['sometimes', 'string', 'in:frames,art'],
        ]);

        $term = trim($validated['q']);
        $limit = (int) ($validated['limit'] ?? 6);
        $type = $validated['type'] ?? null;

        $products = $type === 'art' ? collect() : $this->searchProducts($term);
        $art = $type === 'frames' ? collect() : $this->searchArt($term);

        $total = $products->count() + $art->count();

        // Frames take priority for the shared limit; art fills the remainder.
        $pagedProducts = $products->take($limit);
        $pagedArt = $art->take(max(0, $limit - $pagedProducts->count()));

        return response()->json([
            'data' => [
                'products' => ProductResource::collection($pagedProducts)->resolve(),
                'art' => ArtProductResource::collection($pagedArt)->resolve(),
                'total' => $total,
            ],
        ]);
    }

    /**
     * @return Collection<int, Product>
     */
    private function searchProducts(string $term): Collection
    {
        $like = '%'.$term.'%';

        return Product::active()
            ->with(['images', 'collection', 'variants', 'finishOptions'])
            ->where(function (Builder $q) use ($like): void {
                $q->where('name', 'like', $like)
                    ->orWhere('tagline', 'like', $like)
                    ->orWhere('material', 'like', $like)
                    ->orWhere('materials', 'like', $like)
                    ->orWhere('description', 'like', $like);
            })
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * @return Collection<int, ArtProduct>
     */
    private function searchArt(string $term): Collection
    {
        $like = '%'.$term.'%';

        return ArtProduct::active()
            ->with(['category', 'materialVariants', 'images'])
            ->where(function (Builder $q) use ($like): void {
                $q->where('name', 'like', $like)
                    ->orWhere('tagline', 'like', $like)
                    ->orWhere('medium', 'like', $like)
                    // `tags` is a JSON column; LIKE over its text form is enough
                    // at this catalogue size and works on both MySQL and SQLite.
                    ->orWhere('tags', 'like', $like)
                    ->orWhere('description', 'like', $like);
            })
            ->orderBy('sort_order')
            ->get();
    }
}
