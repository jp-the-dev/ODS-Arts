<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\CreateShiprocketOrderJob;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Razorpay\Api\Api;

class PaymentController extends Controller
{
    public function pay(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if ($order->status !== 'pending_payment') {
            return response()->json(['message' => 'Order cannot be paid'], 422);
        }

        $razorpay = new Api(
            config('services.razorpay.key'),
            config('services.razorpay.secret'),
        );

        $razorpayOrder = $razorpay->order->create([
            'amount' => $order->total,
            'currency' => $order->currency,
            'receipt' => $order->order_number,
            'notes' => [
                'order_number' => $order->order_number,
                'user_id' => (string) $order->user_id,
            ],
        ]);

        $order->update(['razorpay_order_id' => $razorpayOrder['id']]);

        return response()->json([
            'razorpay_order_id' => $razorpayOrder['id'],
            'razorpay_key_id' => config('services.razorpay.key'),
            'amount' => $order->total,
            'currency' => $order->currency,
        ]);
    }

    public function verify(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $validated = $request->validate([
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        if ($order->razorpay_order_id !== $validated['razorpay_order_id']) {
            return response()->json(['message' => 'Order ID mismatch'], 422);
        }

        $expectedSignature = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'].'|'.$validated['razorpay_payment_id'],
            config('services.razorpay.secret'),
        );

        if (! hash_equals($expectedSignature, $validated['razorpay_signature'])) {
            return response()->json(['message' => 'Invalid payment signature'], 422);
        }

        $order->update([
            'payment_status'      => 'paid',
            'status'              => 'confirmed',
            'payment_method'      => 'razorpay',
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'razorpay_signature'  => $validated['razorpay_signature'],
        ]);

        // Dispatch Shiprocket order creation asynchronously
        // This does not block the payment response — runs in background queue
        dispatch(new CreateShiprocketOrderJob($order));

        return response()->json(['message' => 'Payment verified successfully']);
    }

    public function webhook(Request $request): JsonResponse
    {
        $webhookSecret = config('services.razorpay.webhook_secret');

        if ($webhookSecret) {
            $signature = $request->header('X-Razorpay-Signature');
            $payload = $request->getContent();

            $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

            if (! hash_equals($expectedSignature, $signature)) {
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        $event = $request->input('event');
        $payloadOrderId = $request->input('payload.payment.entity.order_id');

        if ($event === 'payment.captured' && $payloadOrderId) {
            $order = Order::where('razorpay_order_id', $payloadOrderId)->first();

            if ($order && $order->status === 'pending_payment') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                    'payment_method' => 'razorpay',
                ]);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
