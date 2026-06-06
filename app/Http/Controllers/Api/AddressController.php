<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAddressRequest;
use App\Http\Requests\Api\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AddressController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $addresses = $request->user()->addresses()->latest()->get();

        return AddressResource::collection($addresses);
    }

    public function store(StoreAddressRequest $request): AddressResource
    {
        $address = $request->user()->addresses()->create($request->validated());

        if ($address->is_default) {
            $request->user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        return new AddressResource($address);
    }

    public function update(UpdateAddressRequest $request, Address $address): AddressResource
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $address->update($request->validated());

        if ($request->boolean('is_default')) {
            $request->user()->addresses()
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        return new AddressResource($address);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }
}
