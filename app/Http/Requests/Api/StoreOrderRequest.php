<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'customer.fullName' => ['required', 'string', 'max:255'],
            'customer.email' => ['required', 'email', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:20'],

            'address.line1' => ['required', 'string', 'max:255'],
            'address.line2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address.city' => ['required', 'string', 'max:255'],
            'address.state' => ['required', 'string', 'max:255'],
            'address.pincode' => ['required', 'string', 'max:10'],
            'address.country' => ['sometimes', 'string', 'size:2'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string'],
            'items.*.productSlug' => ['required', 'string', 'max:255'],
            'items.*.variantId' => ['required', 'string'],
            'items.*.finishId' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unitPricePaise' => ['required', 'integer', 'min:0'],

            'subtotalPaise' => ['required', 'integer', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
