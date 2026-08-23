<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent on an RTO — the parcel is on its way back to us.
 *
 * Kept separate from {@see OrderCancelled} because it means something different
 * to the customer: nobody cancelled anything, the delivery failed and their
 * money is coming back.
 */
class OrderReturned extends Mailable
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
            subject: 'Your order is being returned - '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-returned',
        );
    }
}
