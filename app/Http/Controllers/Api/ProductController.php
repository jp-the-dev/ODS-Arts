<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /** GET /api/v1/products — list active products */
    public function index(): AnonymousResourceCollection
    {
        $products = Product::active()
            ->with(['images', 'collection.finishOptions', 'variants'])
            ->orderBy('sort_order')
            ->get();

        return ProductResource::collection($products);
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
