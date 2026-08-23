<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent when the courier first reports the parcel moving.
 *
 * Shiprocket pushes 'shipped', 'in transit' and 'out for delivery', all of which
 * map onto our single 'shipped' status — so this must be sent on the transition
 * into that status, never on every webhook, or a customer gets three of them.
 */
class OrderShipped extends Mailable
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
            subject: 'Your order has shipped - '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-shipped',
        );
    }
}
