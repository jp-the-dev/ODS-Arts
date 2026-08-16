<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FrameOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FramingController extends Controller
{
    /**
     * POST /api/v1/framing/calculate-price
     *
     * Calculate total framing price given a base product price
     * plus selected frame option modifiers.
     *
     * Request body:
     * {
     *   "base_price_in_paise": 149900,
     *   "wood_slug": "walnut-standard",
     *   "mat_slug": "ivory-single",
     *   "glass_slug": "museum-uv"
     * }
     */
    public function calculatePrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'base_price_in_paise' => ['required', 'integer', 'min:0'],
            'wood_slug' => ['nullable', 'string', 'exists:frame_options,slug'],
            'mat_slug' => ['nullable', 'string', 'exists:frame_options,slug'],
            'glass_slug' => ['nullable', 'string', 'exists:frame_options,slug'],
        ]);

        $totalModifier = 0;
        $breakdown = [];

        foreach (['wood_slug', 'mat_slug', 'glass_slug'] as $slugField) {
            if (! empty($validated[$slugField])) {
                $option = FrameOption::active()->where('slug', $validated[$slugField])->first();

                if ($option) {
                    $totalModifier += $option->price_modifier_in_paise;
                    $breakdown[$option->type] = [
                        'name' => $option->name,
                        'modifier_in_paise' => $option->price_modifier_in_paise,
                        'modifier' => $option->price_modifier_in_paise / 100,
                    ];
                }
            }
        }

        $totalInPaise = $validated['base_price_in_paise'] + $totalModifier;

        return response()->json([
            'data' => [
                // Paise is authoritative; the rupee floats are kept for display
                // and for any consumer already reading them.
                'base_price_in_paise' => $validated['base_price_in_paise'],
                'total_price_in_paise' => max(0, $totalInPaise),
                'base_price' => $validated['base_price_in_paise'] / 100,
                'total_price' => max(0, $totalInPaise) / 100,
                'breakdown' => $breakdown,
            ],
        ]);
    }
}
