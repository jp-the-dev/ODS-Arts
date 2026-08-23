@use(App\Services\Money)
<x-mail::message>
# Your order is coming back to us

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

The courier was unable to complete delivery of order **{{ $order->order_number }}**, so the parcel is on its way back to our studio.

This usually happens when nobody was available at the address, or the address could not be reached.

@if ($order->payment_status === 'paid')
You paid {{ Money::rupees($order->total) }} for this order. Once the parcel is back with us we will refund you in full, which typically reaches your account within 5–7 working days.
@endif

If you would still like these frames, reply to this email and we will arrange a fresh delivery to an address that suits you better.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
View your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
