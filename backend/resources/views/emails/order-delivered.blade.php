<x-mail::message>
# Your order has arrived

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

{{-- Interpolated rather than wrapped in @if: a directive immediately after a
     word character is not parsed as one, and the stray @endif breaks the view. --}}
Order **{{ $order->order_number }}** was delivered{{ $order->courier_name ? ' by '.$order->courier_name : '' }}. We hope it looks every bit as good on your wall as it did leaving our studio.

If anything arrived damaged or is not what you expected, reply to this email and we will put it right.

@if ($order->invoice)
Your GST tax invoice **{{ $order->invoice->number }}** remains available from your order page at any time.
@endif

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
View your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
