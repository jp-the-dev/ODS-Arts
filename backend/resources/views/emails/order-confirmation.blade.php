@use(App\Services\Money)
<x-mail::message>
# Thank you for your order

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

We have received your order **{{ $order->order_number }}**@if ($order->ordered_at ?? $order->created_at), placed on {{ ($order->ordered_at ?? $order->created_at)->format('j F Y') }}@endif, and it is now being prepared in our studio.

<x-mail::table>
| Item | Qty | Unit price | Amount |
|:---- |:---:| ----------:| ------:|
@foreach ($order->items as $item)
| {{ $item->name }} | {{ $item->quantity }} | {{ Money::rupees($item->unit_price_paise) }} | {{ Money::rupees($item->subtotal_paise) }} |
@endforeach
</x-mail::table>

<x-mail::table>
| &nbsp; | &nbsp; |
|:------ | ------:|
| Subtotal | {{ Money::rupees($order->subtotal) }} |
@if ($order->discount > 0)
| Discount | {{ Money::negative($order->discount) }} |
@endif
| Shipping | {{ $order->shipping_cost > 0 ? Money::rupees($order->shipping_cost) : 'Free' }} |
@if ($order->tax > 0)
| GST | {{ Money::rupees($order->tax) }} |
@endif
| **Total paid** | **{{ Money::rupees($order->total) }}** |
</x-mail::table>

@if (! empty($order->shipping_address))
**Delivering to**<br>
{{ $order->shipping_address['full_name'] ?? '' }}<br>
{{ $order->shipping_address['line1'] ?? '' }}<br>
@if (! empty($order->shipping_address['line2']))
{{ $order->shipping_address['line2'] }}<br>
@endif
{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['pincode'] ?? '' }}<br>
@if (! empty($order->shipping_address['phone']))
{{ $order->shipping_address['phone'] }}
@endif
@endif

@if ($order->estimated_delivery_date)
Your frames are made to order. Estimated delivery: **{{ $order->estimated_delivery_date->format('j F Y') }}**.
@else
Your frames are made to order, so please allow 7–14 working days for delivery.
@endif
We will email you again as soon as your order ships.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
Track your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
