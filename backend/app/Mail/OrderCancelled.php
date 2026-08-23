<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent when a courier cancellation takes the order out of fulfilment.
 *
 * Deliberately not sent for abandoned unpaid checkouts: OrderStock::release()
 * cancels those in a scheduled sweep, and mailing every abandoned cart would
 * turn one stuck worker into a bulk send to people who never paid us.
 */
class OrderCancelled extends Mailable
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
            subject: 'Your order has been cancelled - '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-cancelled',
        );
    }
}
