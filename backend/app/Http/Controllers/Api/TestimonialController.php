<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    /**
     * GET /api/v1/testimonials — active testimonials, newest first.
     *
     * Pagination is opt-in, as elsewhere: omitting `page`/`per_page` returns the
     * full list unwrapped.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Testimonial::active()->with('product')->latest()->orderBy('id');

        if (isset($validated['page']) || isset($validated['per_page'])) {
            return TestimonialResource::collection(
                $query->paginate((int) ($validated['per_page'] ?? 15))->withQueryString()
            );
        }

        return TestimonialResource::collection($query->get());
    }
}
