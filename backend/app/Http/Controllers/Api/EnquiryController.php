<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

            // The structured half of a custom-framing or gifting enquiry: the
            // chosen size, mat, frame and estimated price. The column, the model
            // cast and the fillable entry all existed, but nothing validated
            // this — and `...$validated` can only carry what was validated, so
            // every submission silently arrived with metadata NULL.
            //
            // Shape is deliberately not pinned: the forms evolve, and an enquiry
            // is read by a human, not queried. Size is bounded instead, because
            // this endpoint is public and unauthenticated.
            'metadata' => ['sometimes', 'nullable', 'array', 'max:40'],
        ], [
            'metadata.max' => 'That enquiry carries too much detail to accept.',
        ]);

        if (isset($validated['metadata']) && ! $this->isReasonablySized($validated['metadata'])) {
            throw ValidationException::withMessages([
                'metadata' => ['That enquiry carries too much detail to accept.'],
            ]);
        }

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

    /**
     * Guard against a payload that is broad rather than deep.
     *
     * `array:max` counts top-level keys only, so it would happily accept forty
     * keys each holding a megabyte of nested junk. Encoding is the honest
     * measure of what actually lands in the JSON column.
     */
    private function isReasonablySized(array $metadata): bool
    {
        $encoded = json_encode($metadata);

        return $encoded !== false && strlen($encoded) <= 8192;
    }
}
