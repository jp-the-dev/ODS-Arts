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
     * Used by:
     *   - Contact form          (type: contact)
     *   - Custom framing form   (type: custom_framing, includes metadata JSON)
     *   - Gifting page form     (type: gifting)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'message'  => ['required', 'string', 'max:2000'],
            'type'     => ['sometimes', 'string', 'in:contact,custom_framing,gifting'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ]);

        $enquiry = Enquiry::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'] ?? null,
            'message'  => $validated['message'],
            'type'     => $validated['type'] ?? 'contact',
            'metadata' => $validated['metadata'] ?? null,
            'status'   => 'new',
        ]);

        return response()->json([
            'data'    => ['id' => $enquiry->id, 'reference' => 'CFR-' . str_pad($enquiry->id, 6, '0', STR_PAD_LEFT)],
            'message' => 'Thank you for your enquiry. We will be in touch within 48 hours.',
        ], 201);
    }
}
