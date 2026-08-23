@use(App\Services\Money)
<x-mail::message>
# Payment received

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

We have received your payment for order **{{ $order->order_number }}**. Your frames are now confirmed and in production in our studio.

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

@if ($order->invoice)
Your GST tax invoice **{{ $order->invoice->number }}** is attached to this email as a PDF.
@endif

@if ($order->estimated_delivery_date)
Estimated delivery: **{{ $order->estimated_delivery_date->format('j F Y') }}**.
@else
Your frames are made to order, so please allow 7–14 working days for delivery.
@endif
We will email you again the moment your order ships.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
Track your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
