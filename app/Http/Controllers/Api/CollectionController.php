<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Http\Resources\ProductResource;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    /**
     * GET /api/v1/collections — list all active collections.
     *
     * Pagination is opt-in, matching ProductController: without `page` or
     * `per_page` the full collection is returned unwrapped, so existing callers
     * keep the response shape they depend on.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Collection::active()->orderBy('sort_order')->orderBy('id');

        if (isset($validated['page']) || isset($validated['per_page'])) {
            return CollectionResource::collection(
                $query->paginate((int) ($validated['per_page'] ?? 15))->withQueryString()
            );
        }

        return CollectionResource::collection($query->get());
    }

    /** GET /api/v1/collections/{slug}/products — products belonging to one collection */
    public function products(string $slug): AnonymousResourceCollection|JsonResponse
    {
        $collection = Collection::active()->where('slug', $slug)->first();

        if (! $collection) {
            return response()->json(['message' => 'Collection not found.'], 404);
        }

        $products = $collection->products()
            ->active()
            ->with(['images', 'variants', 'finishOptions'])
            ->orderBy('sort_order')
            ->get();

        return ProductResource::collection($products);
    }

    /** GET /api/v1/collections/{slug} — show a single collection with its products */
    public function show(string $slug): CollectionResource|JsonResponse
    {
        $collection = Collection::active()
            ->where('slug', $slug)
            ->with(['products' => fn ($q) => $q->active()
                ->with(['images', 'variants', 'finishOptions'])
                ->orderBy('sort_order')])
            ->first();

        if (! $collection) {
            return response()->json(['message' => 'Collection not found.'], 404);
        }

        return new CollectionResource($collection);
    }
}
