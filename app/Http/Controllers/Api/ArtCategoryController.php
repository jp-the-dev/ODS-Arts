<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtCategoryResource;
use App\Models\ArtCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArtCategoryController extends Controller
{
    /** GET /api/v1/art/categories — list all active art categories */
    public function index(): AnonymousResourceCollection
    {
        $categories = ArtCategory::active()
            ->withCount('artProducts')
            ->orderBy('sort_order')
            ->get();

        return ArtCategoryResource::collection($categories);
    }

    /** GET /api/v1/art/categories/{slug} — show a category with its art products */
    public function show(string $slug): ArtCategoryResource|JsonResponse
    {
        $category = ArtCategory::active()
            ->where('slug', $slug)
            ->with(['artProducts' => fn ($q) => $q->active()->with(['materialVariants', 'images'])->orderBy('sort_order')])
            ->first();

        if (! $category) {
            return response()->json(['message' => 'Art category not found.'], 404);
        }

        return new ArtCategoryResource($category);
    }
}
