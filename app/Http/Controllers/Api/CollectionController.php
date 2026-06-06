<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    /** GET /api/v1/collections — list all active collections */
    public function index(): AnonymousResourceCollection
    {
        $collections = Collection::active()
            ->with('finishOptions')
            ->orderBy('sort_order')
            ->get();

        return CollectionResource::collection($collections);
    }

    /** GET /api/v1/collections/{slug} — show a single collection with its products */
    public function show(string $slug): CollectionResource|JsonResponse
    {
        $collection = Collection::active()
            ->where('slug', $slug)
            ->with([
                'finishOptions',
                'products' => fn ($q) => $q->active()->with(['images', 'variants', 'collection.finishOptions'])->orderBy('sort_order'),
            ])
            ->first();

        if (! $collection) {
            return response()->json(['message' => 'Collection not found.'], 404);
        }

        return new CollectionResource($collection);
    }
}
