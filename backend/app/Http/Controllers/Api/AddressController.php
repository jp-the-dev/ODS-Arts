<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAddressRequest;
use App\Http\Requests\Api\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Saved delivery addresses for signed-in customers.
 *
 * Every action is scoped through `$request->user()->addresses()`, so one
 * customer can never read or mutate another's address by guessing an id.
 */
class AddressController extends Controller
{
    /** GET /api/v1/auth/addresses — default first, then newest. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $addresses = $request->user()->addresses()
            ->orderByDesc('is_default')
            ->latest('id')
            ->get();

        return AddressResource::collection($addresses);
    }

    /** POST /api/v1/auth/addresses */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // The very first address is the default whether or not it was asked for —
        // otherwise a customer can end up with saved addresses and no default.
        $isFirst = ! $user->addresses()->exists();
        $data['is_default'] = $isFirst || ($data['is_default'] ?? false);
        $data['country'] = $data['country'] ?? 'IN';

        $address = DB::transaction(function () use ($user, $data): Address {
            if ($data['is_default']) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create($data);
        });

        return response()->json([
            'data' => new AddressResource($address),
            'message' => 'Address saved.',
        ], 201);
    }

    /** PUT /api/v1/auth/addresses/{address} */
    public function update(UpdateAddressRequest $request, Address $address): AddressResource|JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $data = $request->validated();

        DB::transaction(function () use ($request, $address, $data): void {
            if ($data['is_default'] ?? false) {
                $request->user()->addresses()
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($data);
        });

        return new AddressResource($address->fresh());
    }

    /** DELETE /api/v1/auth/addresses/{address} */
    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $wasDefault = $address->is_default;

        DB::transaction(function () use ($request, $address, $wasDefault): void {
            $address->delete();

            // Never leave the customer without a default while addresses remain.
            if ($wasDefault) {
                $next = $request->user()->addresses()->latest('id')->first();
                $next?->update(['is_default' => true]);
            }
        });

        return response()->json(['message' => 'Address removed.']);
    }
}
