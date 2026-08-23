<?php

namespace App\Mail;

use App\Http\Controllers\Api\InvoiceController;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent once the money has actually arrived.
 *
 * Distinct from {@see OrderConfirmation}, which goes out at checkout while the
 * payment is still pending — a customer who abandons the Razorpay widget gets
 * that one and nothing more, so "we received your order" cannot double as the
 * receipt.
 */
class PaymentConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment received - '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-confirmed',
        );
    }

    /**
     * The GST tax invoice, rendered by the same code path as the customer's own
     * download so the attached document can never drift from the one on file.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $invoice = $this->order->invoice;

        // InvoiceIssuer::issue() runs immediately before this mail is queued, so
        // an invoice is normally present. It is still optional here: GST_ENABLED
        // can be off, and a worker must not fail a receipt over a missing PDF.
        if (! $invoice) {
            return [];
        }

        return [
            Attachment::fromData(
                fn (): string => app(InvoiceController::class)->render($invoice, $this->order)->output(),
                'invoice-'.str_replace('/', '-', $invoice->number).'.pdf',
            )->withMime('application/pdf'),
        ];
    }
}
