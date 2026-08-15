<x-mail::message>
# Thank you for your order

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

We have received your order **{{ $order->order_number }}** and it is now being prepared in our studio.

<x-mail::table>
| Item | Qty | Price |
|:---- |:---:| -----:|
@foreach ($order->items as $item)
| {{ $item->name }} | {{ $item->quantity }} | ₹{{ number_format($item->subtotal_paise / 100, 2) }} |
@endforeach
| **Total** | | **₹{{ number_format($order->total / 100, 2) }}** |
</x-mail::table>

@if (! empty($order->shipping_address))
**Delivering to**
{{ $order->shipping_address['line1'] ?? '' }}@if (! empty($order->shipping_address['line2'])), {{ $order->shipping_address['line2'] }}@endif
{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['pincode'] ?? '' }}
@endif

Your frames are made to order, so please allow 7–14 working days for delivery. We will email you again as soon as your order ships.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
Track your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
