@use(App\Services\Money)
<x-mail::message>
# Your order has been cancelled

Hi {{ $order->shipping_address['full_name'] ?? 'there' }},

Order **{{ $order->order_number }}** has been cancelled and will not be delivered.

@if ($order->payment_status === 'paid')
You paid {{ Money::rupees($order->total) }} for this order. The refund has been started and typically reaches your account within 5–7 working days, depending on your bank.
@endif

If you did not expect this, reply to this email and we will look into it for you.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/').'/orders/'.$order->order_number">
View your order
</x-mail::button>

With care,<br>
The ODSArts Studio
</x-mail::message>
