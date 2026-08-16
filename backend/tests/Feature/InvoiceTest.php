<?php

declare(strict_types=1);

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use App\Services\Gst;
use App\Services\InvoiceIssuer;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;

beforeEach(function (): void {
    config()->set('invoice.gst.enabled', true);
    config()->set('invoice.gst.rate', 12);
    config()->set('invoice.gst.hsn_code', '4414');
    config()->set('invoice.seller.state', 'Gujarat');
    config()->set('invoice.seller.state_code', '24');
    config()->set('invoice.seller.gstin', '24AAAAA0000A1Z5');
    config()->set('invoice.series.prefix', 'ODS');
    config()->set('invoice.series.padding', 4);
});

describe('GST arithmetic', function (): void {
    /**
     * Prices include GST, so the two halves must add back to exactly the gross.
     * Computing the tax independently rather than by subtraction would leave a
     * paisa adrift on some totals — the invoice would not match what was charged.
     */
    it('splits an inclusive amount so the halves add back exactly', function (int $gross): void {
        $split = Gst::split($gross);

        expect($split['taxable'] + $split['tax'])->toBe($gross);
    })->with([249900, 100, 1, 3, 999999, 123457]);

    it('returns the whole amount as taxable when GST is off', function (): void {
        config()->set('invoice.gst.enabled', false);

        expect(Gst::split(249900))->toBe(['taxable' => 249900, 'tax' => 0]);
    });

    it('charges CGST and SGST within the seller state', function (): void {
        expect(Gst::isIntraState('Gujarat'))->toBeTrue()
            ->and(Gst::isIntraState('  gujarat '))->toBeTrue()
            ->and(Gst::isIntraState('Maharashtra'))->toBeFalse();
    });

    /** Halving an odd number of paise twice would lose one. */
    it('splits tax into heads without losing a paisa', function (int $tax): void {
        $heads = Gst::heads($tax, intraState: true);

        expect($heads['cgst'] + $heads['sgst'])->toBe($tax)
            ->and($heads['igst'])->toBe(0);
    })->with([26775, 1, 3, 100]);

    it('puts the whole tax on IGST for an inter-state supply', function (): void {
        expect(Gst::heads(26775, intraState: false))
            ->toBe(['cgst' => 0, 'sgst' => 0, 'igst' => 26775]);
    });

    it('maps state names to GST codes and tolerates unknown ones', function (): void {
        expect(Gst::stateCode('Gujarat'))->toBe('24')
            ->and(Gst::stateCode('maharashtra'))->toBe('27')
            ->and(Gst::stateCode('Nowhere'))->toBeNull();
    });
});

describe('issuing', function (): void {
    it('numbers invoices consecutively within a financial year', function (): void {
        $numbers = collect(range(1, 3))
            ->map(fn (): string => InvoiceIssuer::issue(Order::factory()->create(['total' => 249900]))->number);

        expect($numbers->all())->toBe(['ODS/2026-27/0001', 'ODS/2026-27/0002', 'ODS/2026-27/0003']);
    });

    /** Payment is confirmed from both /verify and the webhook, either order. */
    it('is idempotent for the same order', function (): void {
        $order = Order::factory()->create(['total' => 249900]);

        $first = InvoiceIssuer::issue($order);
        $second = InvoiceIssuer::issue($order);

        expect($second->id)->toBe($first->id)
            ->and(Invoice::count())->toBe(1);
    });

    it('records a total that always equals taxable plus tax', function (): void {
        $invoice = InvoiceIssuer::issue(Order::factory()->create(['total' => 249900]));

        expect($invoice->taxable_value + $invoice->taxTotal())->toBe($invoice->total)
            ->and($invoice->total)->toBe(249900);
    });

    it('uses CGST and SGST for a buyer in the seller state', function (): void {
        $invoice = InvoiceIssuer::issue(Order::factory()->create([
            'total' => 249900,
            'billing_address' => ['state' => 'Gujarat', 'city' => 'Rajkot'],
        ]));

        expect($invoice->is_intra_state)->toBeTrue()
            ->and($invoice->igst)->toBe(0)
            ->and($invoice->cgst + $invoice->sgst)->toBe(26775)
            ->and($invoice->place_of_supply_code)->toBe('24');
    });

    it('uses IGST for a buyer outside the seller state', function (): void {
        $invoice = InvoiceIssuer::issue(Order::factory()->create([
            'total' => 249900,
            'billing_address' => ['state' => 'Maharashtra'],
        ]));

        expect($invoice->is_intra_state)->toBeFalse()
            ->and($invoice->cgst)->toBe(0)
            ->and($invoice->sgst)->toBe(0)
            ->and($invoice->igst)->toBe(26775);
    });

    /**
     * The document is a legal record. Changing the rate or the address later
     * must not alter an invoice a customer already holds.
     */
    it('snapshots the seller and rate so later config changes cannot alter it', function (): void {
        $invoice = InvoiceIssuer::issue(Order::factory()->create(['total' => 249900]));

        config()->set('invoice.gst.rate', 18);
        config()->set('invoice.seller.gstin', '27BBBBB1111B1Z9');

        $invoice->refresh();

        expect((float) $invoice->gst_rate)->toBe(12.0)
            ->and($invoice->seller_gstin)->toBe('24AAAAA0000A1Z5');
    });

    it('derives the Indian financial year from the issue date', function (string $date, string $expected): void {
        expect(InvoiceIssuer::financialYear(Carbon::parse($date)))->toBe($expected);
    })->with([
        'start of year' => ['2026-04-01', '2026-27'],
        'mid year' => ['2026-08-16', '2026-27'],
        'end of year' => ['2027-03-31', '2026-27'],
        'january belongs to the previous April' => ['2027-01-15', '2026-27'],
    ]);
});

describe('GET /orders/{orderNumber}/invoice', function (): void {
    it('streams a PDF to the owner', function (): void {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->create(['total' => 249900]);
        InvoiceIssuer::issue($order);

        Sanctum::actingAs($user);

        $response = $this->get('/api/v1/orders/'.$order->order_number.'/invoice');

        $response->assertOk()->assertHeader('content-type', 'application/pdf');
        expect(substr((string) $response->getContent(), 0, 4))->toBe('%PDF');
    });

    it('lets a guest download by reference', function (): void {
        $order = Order::factory()->create(['user_id' => null, 'total' => 249900]);
        InvoiceIssuer::issue($order);

        $this->get('/api/v1/orders/'.$order->order_number.'/invoice')->assertOk();
    });

    it('does not expose another customer invoice', function (): void {
        $order = Order::factory()->for(User::factory())->create(['total' => 249900]);
        InvoiceIssuer::issue($order);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/orders/'.$order->order_number.'/invoice')->assertNotFound();
    });

    it('404s while the order is unpaid and has no invoice', function (): void {
        $order = Order::factory()->create(['user_id' => null, 'payment_status' => 'pending']);

        $this->getJson('/api/v1/orders/'.$order->order_number.'/invoice')->assertNotFound();
    });

    it('404s for an unknown reference', function (): void {
        $this->getJson('/api/v1/orders/ODS-NOPE/invoice')->assertNotFound();
    });
});
