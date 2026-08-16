<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\Money;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InvoiceController extends Controller
{
    /**
     * GET /api/v1/orders/{orderNumber}/invoice
     *
     * Streams the tax invoice as a PDF.
     *
     * Access mirrors tracking: the order's owner, or any holder of the
     * reference when it was placed as a guest. Unlike tracking this does carry
     * the billing address, but the reference is the guest's only handle on
     * their own order and it is unguessable.
     */
    public function show(Request $request, string $orderNumber): Response|JsonResponse
    {
        $order = Order::with(['items', 'invoice'])->where('order_number', $orderNumber)->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // Ask the sanctum guard by name — this route carries no auth middleware,
        // so the default guard never inspects a bearer token and every owned
        // order would 404 for its own customer.
        if ($order->user_id !== null && $order->user_id !== $request->user('sanctum')?->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (! $order->invoice) {
            return response()->json([
                'message' => 'No invoice yet — one is raised once the order is paid.',
            ], 404);
        }

        return $this->render($order->invoice, $order)
            ->download('invoice-'.str_replace('/', '-', $order->invoice->number).'.pdf');
    }

    /** Shared by the API download and the Filament panel action. */
    public function render(Invoice $invoice, Order $order): \Barryvdh\DomPDF\PDF
    {
        return Pdf::loadView('invoices.tax-invoice', [
            'invoice' => $invoice,
            'order' => $order,
            'billing' => $order->billing_address ?: $order->shipping_address ?: [],
            'money' => fn (int $paise): string => Money::rupees($paise),
            'lines' => $this->lines($invoice, $order),
        ])->setPaper('a4');
    }

    /**
     * Per-line figures for the table.
     *
     * Line taxable values are derived by apportioning the invoice's taxable
     * total across the lines by their gross amounts, with the last line taking
     * the remainder. Splitting each line independently would round each one and
     * the column would not add up to the invoice total — which is the first
     * thing an accountant checks.
     *
     * @return list<array{name: string, quantity: int, gross: string, taxable: string}>
     */
    private function lines(Invoice $invoice, Order $order): array
    {
        $grossTotal = (int) $order->items->sum('subtotal_paise');
        $remaining = $invoice->taxable_value;
        $lines = [];
        $lastIndex = $order->items->count() - 1;

        foreach ($order->items->values() as $index => $item) {
            $gross = (int) $item->subtotal_paise;

            $taxable = $index === $lastIndex || $grossTotal === 0
                ? $remaining
                : (int) round($invoice->taxable_value * $gross / $grossTotal);

            $remaining -= $taxable;

            $lines[] = [
                'name' => (string) $item->name,
                'quantity' => (int) $item->quantity,
                'gross' => Money::rupees($gross),
                'taxable' => Money::rupees($taxable),
            ];
        }

        return $lines;
    }
}
