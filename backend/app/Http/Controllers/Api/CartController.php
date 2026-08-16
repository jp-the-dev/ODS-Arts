<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $request->user()->cart;

        return response()->json([
            'items' => $cart && $cart->items ? $cart->items : [],
        ]);
    }

    /**
     * Sync the user's cart items.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['present', 'array'],
        ]);

        $cart = $request->user()->cart()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['items' => $request->items]
        );

        return response()->json([
            'items' => $cart->items ?? [],
            'message' => 'Cart synced successfully.',
        ]);
    }
}
