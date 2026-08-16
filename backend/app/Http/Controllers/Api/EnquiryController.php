<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnquiryController extends Controller
{
    /**
     * POST /api/v1/enquiries — store a new customer enquiry.
     *
     * Used by the contact form, custom framing form, and gifting page.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:2000'],
            'type' => ['sometimes', 'string', 'in:contact,custom_framing,gifting'],
        ]);

        $enquiry = Enquiry::create([
            ...$validated,
            'type' => $validated['type'] ?? 'contact',
            'status' => 'new',
        ]);

        return response()->json([
            'data' => ['id' => $enquiry->id],
            'message' => 'Thank you for your enquiry. We will be in touch within 24 hours.',
        ], 201);
    }
}
