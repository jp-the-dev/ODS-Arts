<x-mail::message>
# Order Confirmed

Thank you for your order! Here are the details:

**Order Number:** {{ $order->order_number }}  
**Order Date:** {{ $order->ordered_at->format('F j, Y') }}  
**Status:** {{ ucfirst(str_replace('_', ' ', $order->status)) }}

## Items

@foreach ($order->items as $item)
- **{{ $item->name }}** × {{ $item->quantity }} — ₹{{ number_format($item->subtotal_paise) }}
@endforeach

---

| | |
|---|---|
| **Subtotal** | ₹{{ number_format($order->subtotal) }} |
| **Tax** | ₹{{ number_format($order->tax) }} |
| **Total** | **₹{{ number_format($order->total) }}** |

## Shipping To

{{ $order->shipping_address['full_name'] }}  
{{ $order->shipping_address['line1'] }}  
@if($order->shipping_address['line2'] ?? null){{ $order->shipping_address['line2'] }}@endif  
{{ $order->shipping_address['city'] }}, {{ $order->shipping_address['state'] }} {{ $order->shipping_address['pincode'] }}

<x-mail::button :url="config('app.frontend_url') . '/account'">
View My Orders
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
