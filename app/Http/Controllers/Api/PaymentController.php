<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\CreateShiprocketOrderJob;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Razorpay payments.
 *
 * Talked to over plain HTTP rather than the vendor SDK, so the app gains no
 * dependency. Amounts are always taken from the order in the database — never
 * from the request — so a client cannot pay less than it owes.
 */
class PaymentController extends Controller
{
    /**
     * POST /api/v1/orders/{orderNumber}/pay
     *
     * Creates (or returns) the Razorpay order the checkout widget needs. Safe to
     * call twice: an existing razorpay_order_id is reused rather than duplicated.
     */
    public function pay(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->findPayableOrder($request, $orderNumber);

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'This order has already been paid.'], 409);
        }

        if (blank(config('services.razorpay.key')) || blank(config('services.razorpay.secret'))) {
            return response()->json([
                'message' => 'Payments are not configured. Set RAZORPAY_KEY and RAZORPAY_SECRET.',
            ], 503);
        }

        if (filled($order->razorpay_order_id)) {
            return response()->json(['data' => $this->checkoutPayload($order)]);
        }

        $response = Http::withBasicAuth(
            (string) config('services.razorpay.key'),
            (string) config('services.razorpay.secret'),
        )->acceptJson()->post(config('services.razorpay.base_url').'/orders', [
            // Razorpay works in the smallest currency unit — paise — which is
            // exactly how totals are stored, so no conversion is applied.
            'amount' => (int) $order->total,
            'currency' => $order->currency ?: 'INR',
            'receipt' => $order->order_number,
            'notes' => ['order_number' => $order->order_number],
        ]);

        if ($response->failed()) {
            Log::error('Razorpay order creation failed', [
                'order' => $order->order_number,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json(['message' => 'Could not start payment. Please try again.'], 502);
        }

        $order->update([
            'razorpay_order_id' => $response->json('id'),
            'payment_method' => 'razorpay',
        ]);

        return response()->json(['data' => $this->checkoutPayload($order)]);
    }

    /**
     * POST /api/v1/orders/{orderNumber}/verify
     *
     * Confirms the signature Razorpay returns to the browser. The signature is
     * HMAC-SHA256 of "<razorpay_order_id>|<razorpay_payment_id>" keyed with the
     * API secret, so it cannot be forged by the client.
     */
    public function verify(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_payment_id' => ['required', 'string', 'max:255'],
            'razorpay_signature' => ['required', 'string', 'max:255'],
            'razorpay_order_id' => ['sometimes', 'string', 'max:255'],
        ]);

        $order = $this->findPayableOrder($request, $orderNumber);

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (blank($order->razorpay_order_id)) {
            return response()->json(['message' => 'Payment was never started for this order.'], 422);
        }

        // Already settled — usually a retry, or the webhook landing first. Return
        // the current state rather than re-checking: a later bad signature must
        // never be able to downgrade an order that has genuinely been paid.
        if ($order->payment_status === 'paid') {
            return response()->json([
                'data' => [
                    'orderReference' => $order->order_number,
                    'paymentStatus' => $order->payment_status,
                    'status' => $order->status,
                ],
                'message' => 'Payment already confirmed.',
            ]);
        }

        $expected = hash_hmac(
            'sha256',
            $order->razorpay_order_id.'|'.$validated['razorpay_payment_id'],
            (string) config('services.razorpay.secret'),
        );

        if (! hash_equals($expected, $validated['razorpay_signature'])) {
            Log::warning('Razorpay signature mismatch', ['order' => $order->order_number]);

            $order->update(['payment_status' => 'failed']);

            return response()->json(['message' => 'Payment verification failed.'], 422);
        }

        $order->update([
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'razorpay_signature' => $validated['razorpay_signature'],
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Book the shipment asynchronously — fulfilment must never delay or fail
        // the customer's payment confirmation.
        CreateShiprocketOrderJob::dispatch($order);

        return response()->json([
            'data' => [
                'orderReference' => $order->order_number,
                'paymentStatus' => $order->payment_status,
                'status' => $order->status,
            ],
            'message' => 'Payment confirmed.',
        ]);
    }

    /**
     * POST /api/v1/webhooks/razorpay
     *
     * Server-to-server confirmation. This is the authoritative signal — the
     * browser may close before /verify runs — so it marks orders paid on its own.
     * Verified against the raw request body with the webhook secret.
     */
    /**
     * Record a payment the customer's browser saw fail.
     *
     * Razorpay reports a declined card or a failed UPI collect to the browser
     * only. Without this the order sat at payment_status "pending" — identical
     * to one the customer simply abandoned — so nothing downstream, in the admin
     * or on the tracking page, could tell that a payment had actually been tried
     * and refused.
     *
     * The razorpay_order_id is what authorises the change: it is issued by
     * Razorpay when payment starts and is not guessable from the order
     * reference, so a stranger holding only the reference cannot mark someone
     * else's order failed.
     */
    public function failed(Request $request, string $orderNumber): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string', 'max:255'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $order = $this->findPayableOrder($request, $orderNumber);

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (blank($order->razorpay_order_id)
            || ! hash_equals($order->razorpay_order_id, $validated['razorpay_order_id'])) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // A captured payment is the authority. The browser can report a failure
        // after the webhook has already confirmed the money arrived — on a retry
        // within the same widget, for instance — and that must not undo it.
        if ($order->payment_status === 'paid') {
            return response()->json([
                'data' => [
                    'orderReference' => $order->order_number,
                    'paymentStatus' => $order->payment_status,
                    'status' => $order->status,
                ],
                'message' => 'Payment already confirmed.',
            ]);
        }

        Log::info('Payment reported failed by the client', [
            'order' => $order->order_number,
            'reason' => $validated['reason'] ?? null,
        ]);

        $order->update(['payment_status' => 'failed']);

        return response()->json([
            'data' => [
                'orderReference' => $order->order_number,
                'paymentStatus' => $order->payment_status,
                'status' => $order->status,
            ],
            'message' => 'Payment failure recorded.',
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $secret = (string) config('services.razorpay.webhook_secret');

        if (blank($secret)) {
            return response()->json(['message' => 'Webhook secret not configured.'], 503);
        }

        $signature = (string) $request->header('X-Razorpay-Signature', '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($expected, $signature)) {
            Log::warning('Razorpay webhook signature mismatch');

            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $event = (string) $request->input('event', '');
        $entity = $request->input('payload.payment.entity', []);
        $razorpayOrderId = $entity['order_id'] ?? null;

        if (blank($razorpayOrderId)) {
            return response()->json(['message' => 'Ignored.']);
        }

        $order = Order::where('razorpay_order_id', $razorpayOrderId)->first();

        if (! $order) {
            return response()->json(['message' => 'Ignored.']);
        }

        match ($event) {
            'payment.captured' => $this->markCaptured($order, $entity),
            'payment.failed' => $order->update(['payment_status' => 'failed']),
            default => null,
        };

        return response()->json(['message' => 'Handled.']);
    }

    /**
     * Mark a webhook-confirmed payment as paid, booking fulfilment only on the
     * transition — the webhook may be delivered more than once.
     *
     * @param  array<string, mixed>  $entity
     */
    private function markCaptured(Order $order, array $entity): void
    {
        $wasUnpaid = $order->payment_status !== 'paid';

        $order->update([
            'razorpay_payment_id' => $entity['id'] ?? $order->razorpay_payment_id,
            'payment_status' => 'paid',
            'status' => $order->status === 'pending' ? 'confirmed' : $order->status,
        ]);

        if ($wasUnpaid) {
            CreateShiprocketOrderJob::dispatch($order);
        }
    }

    /**
     * An order is payable by its owner, or by anyone holding the reference when
     * it was placed as a guest. Guest orders have no account to authenticate
     * against, so the order number is the capability.
     */
    private function findPayableOrder(Request $request, string $orderNumber): ?Order
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            return null;
        }

        if ($order->user_id !== null && $order->user_id !== $request->user()?->id) {
            return null;
        }

        return $order;
    }

    /** @return array<string, mixed> */
    private function checkoutPayload(Order $order): array
    {
        return [
            'razorpayOrderId' => $order->razorpay_order_id,
            'razorpayKey' => config('services.razorpay.key'),
            'amountPaise' => (int) $order->total,
            'currency' => $order->currency ?: 'INR',
            'orderReference' => $order->order_number,
        ];
    }
}
