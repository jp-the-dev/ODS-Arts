<x-mail::message>
# Your order is on its way

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

Order **{{ $order->order_number }}** has left our studio and is now with the courier.

<x-mail::table>
| &nbsp; | &nbsp; |
|:------ | ------:|
@if ($order->courier_name)
| Courier | {{ $order->courier_name }} |
@endif
@if ($order->awb_code)
| Tracking number | **{{ $order->awb_code }}** |
@endif
@if ($order->estimated_delivery_date)
| Estimated delivery | {{ $order->estimated_delivery_date->format('j F Y') }} |
@endif
</x-mail::table>

@if (! empty($order->shipping_address))
**Delivering to**<br>
{{ $order->shipping_address['full_name'] ?? '' }}<br>
{{ $order->shipping_address['line1'] ?? '' }}<br>
@if (! empty($order->shipping_address['line2']))
{{ $order->shipping_address['line2'] }}<br>
@endif
{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['pincode'] ?? '' }}
@endif

Tracking can take a few hours to show its first scan after the parcel is collected.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
Track your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
