<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtProductResource;
use App\Models\ArtProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArtController extends Controller
{
    /** GET /api/v1/art — list all active art products */
    public function index(): AnonymousResourceCollection
    {
        $art = ArtProduct::active()
            ->with(['category', 'materialVariants', 'images'])
            ->orderBy('sort_order')
            ->get();

        return ArtProductResource::collection($art);
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
