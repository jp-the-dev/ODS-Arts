<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    /** GET /api/v1/testimonials — list active testimonials with optional product info */
    public function index(): AnonymousResourceCollection
    {
        $testimonials = Testimonial::active()
            ->with('product')
            ->latest()
            ->get();

        return TestimonialResource::collection($testimonials);
    }
}
