{{--
    GST tax invoice.

    Rendered by dompdf, which supports only a conservative slice of CSS — no
    flexbox or grid, so layout is done with tables. Every value comes from the
    invoice snapshot rather than from config, so a reprint shows the document as
    it was issued.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Tax Invoice {{ $invoice->number }}</title>
    <style>
        @page { margin: 28px 32px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; }
        .head-title { font-size: 17px; letter-spacing: 2px; text-transform: uppercase; }
        .muted { color: #666; }
        .box { border: 1px solid #bbb; }
        .box td { padding: 8px 10px; vertical-align: top; }
        .items th { background: #f2f2f2; border: 1px solid #bbb; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .5px; }
        .items td { border: 1px solid #bbb; padding: 7px 8px; }
        .r { text-align: right; }
        .totals td { padding: 4px 8px; }
        .totals .label { text-align: right; color: #555; }
        .totals .grand td { border-top: 1px solid #999; font-size: 12px; font-weight: bold; padding-top: 7px; }
        .foot { margin-top: 22px; font-size: 9px; color: #666; }
        .sign { margin-top: 34px; text-align: right; font-size: 10px; }
    </style>
</head>
<body>

<table>
    <tr>
        <td>
            <div class="head-title">Tax Invoice</div>
            <div class="muted" style="margin-top:3px;">{{ $invoice->seller_name }}</div>
        </td>
        <td class="r">
            <div><strong>{{ $invoice->number }}</strong></div>
            <div class="muted">{{ $invoice->issued_at->format('d M Y') }}</div>
        </td>
    </tr>
</table>

<table class="box" style="margin-top:14px;">
    <tr>
        <td style="width:50%; border-right:1px solid #bbb;">
            <strong>Sold by</strong><br>
            {{ $invoice->seller_name }}<br>
            {!! nl2br(e($invoice->seller_address)) !!}<br>
            @if ($invoice->seller_gstin)
                GSTIN: {{ $invoice->seller_gstin }}<br>
            @endif
            State: {{ $invoice->seller_state }} ({{ $invoice->seller_state_code }})
        </td>
        <td style="width:50%;">
            <strong>Billed to</strong><br>
            {{ $billing['full_name'] ?? $order->email }}<br>
            @foreach (array_filter([$billing['line1'] ?? null, $billing['line2'] ?? null]) as $line)
                {{ $line }}<br>
            @endforeach
            {{ trim(implode(' ', array_filter([$billing['city'] ?? null, $billing['pincode'] ?? null]))) }}<br>
            @if (filled($order->phone))
                Phone: {{ $order->phone }}<br>
            @endif
            Place of supply: {{ $invoice->place_of_supply }}@if ($invoice->place_of_supply_code) ({{ $invoice->place_of_supply_code }})@endif
        </td>
    </tr>
</table>

<table class="box" style="margin-top:10px;">
    <tr>
        <td style="width:34%; border-right:1px solid #bbb;">
            <span class="muted">Order reference</span><br>{{ $order->order_number }}
        </td>
        <td style="width:33%; border-right:1px solid #bbb;">
            <span class="muted">Order date</span><br>{{ optional($order->ordered_at)->format('d M Y') ?? '—' }}
        </td>
        <td style="width:33%;">
            <span class="muted">Payment</span><br>{{ ucfirst($order->payment_status) }}
        </td>
    </tr>
</table>

<table class="items" style="margin-top:14px;">
    <thead>
        <tr>
            <th style="width:4%;">#</th>
            <th>Description</th>
            <th style="width:10%;">HSN</th>
            <th style="width:7%;" class="r">Qty</th>
            <th style="width:15%;" class="r">Taxable value</th>
            <th style="width:16%;" class="r">Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($lines as $index => $line)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $line['name'] }}</td>
                <td>{{ $invoice->hsn_code ?: '—' }}</td>
                <td class="r">{{ $line['quantity'] }}</td>
                <td class="r">{{ $line['taxable'] }}</td>
                <td class="r">{{ $line['gross'] }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<table style="margin-top:12px;">
    <tr>
        <td style="width:55%; vertical-align:top;">
            @if ($invoice->gst_rate > 0)
                <div class="muted" style="font-size:9px;">
                    Prices are inclusive of GST. The taxable value shown is the price
                    net of tax at {{ rtrim(rtrim(number_format((float) $invoice->gst_rate, 2), '0'), '.') }}%.
                </div>
            @endif
        </td>
        <td style="width:45%;">
            <table class="totals">
                <tr>
                    <td class="label">Taxable value</td>
                    <td class="r">{{ $money($invoice->taxable_value) }}</td>
                </tr>
                @if ($invoice->is_intra_state)
                    <tr>
                        <td class="label">CGST @ {{ rtrim(rtrim(number_format((float) $invoice->gst_rate / 2, 2), '0'), '.') }}%</td>
                        <td class="r">{{ $money($invoice->cgst) }}</td>
                    </tr>
                    <tr>
                        <td class="label">SGST @ {{ rtrim(rtrim(number_format((float) $invoice->gst_rate / 2, 2), '0'), '.') }}%</td>
                        <td class="r">{{ $money($invoice->sgst) }}</td>
                    </tr>
                @else
                    <tr>
                        <td class="label">IGST @ {{ rtrim(rtrim(number_format((float) $invoice->gst_rate, 2), '0'), '.') }}%</td>
                        <td class="r">{{ $money($invoice->igst) }}</td>
                    </tr>
                @endif
                @if ($order->shipping_cost > 0)
                    <tr>
                        <td class="label">Shipping</td>
                        <td class="r">{{ $money((int) $order->shipping_cost) }}</td>
                    </tr>
                @endif
                <tr class="grand">
                    <td class="label">Total</td>
                    <td class="r">{{ $money($invoice->total) }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<div class="sign">
    For <strong>{{ $invoice->seller_name }}</strong>
    <div style="margin-top:26px;" class="muted">Authorised signatory</div>
</div>

<div class="foot">
    @unless ($invoice->seller_gstin)
        This is not a GST tax invoice — no GSTIN is configured for the seller.<br>
    @endunless
    This is a computer-generated invoice and is valid without a physical signature.
</div>

</body>
</html>
