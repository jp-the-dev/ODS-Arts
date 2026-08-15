<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Order')
                    ->columns(3)
                    ->schema([
                        TextEntry::make('order_number')->label('Reference')->copyable(),
                        TextEntry::make('status')->badge(),
                        TextEntry::make('payment_status')->badge(),
                        TextEntry::make('total')->money('INR', divideBy: 100),
                        TextEntry::make('ordered_at')->dateTime('d M Y, H:i'),
                        TextEntry::make('payment_method')->placeholder('—'),
                    ]),

                Section::make('Customer')
                    ->columns(3)
                    ->schema([
                        TextEntry::make('email')->copyable(),
                        TextEntry::make('phone')->placeholder('—'),
                        TextEntry::make('user.name')->label('Account')->placeholder('Guest checkout'),
                    ]),

                Section::make('Delivery')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('shipping_address')
                            ->label('Address')
                            ->formatStateUsing(fn (?array $state): string => $state ? implode(', ', array_filter([
                                $state['full_name'] ?? null,
                                $state['line1'] ?? null,
                                $state['line2'] ?? null,
                                $state['city'] ?? null,
                                $state['state'] ?? null,
                                $state['pincode'] ?? null,
                            ])) : '—')
                            ->columnSpanFull(),
                        TextEntry::make('courier_name')->placeholder('Not assigned'),
                        TextEntry::make('awb_code')->label('AWB')->placeholder('Not shipped'),
                        TextEntry::make('shiprocket_status')->placeholder('—'),
                        TextEntry::make('estimated_delivery_date')->date()->placeholder('—'),
                    ]),

                Section::make('Payment references')
                    ->columns(2)
                    ->collapsed()
                    ->schema([
                        TextEntry::make('razorpay_order_id')->placeholder('—'),
                        TextEntry::make('razorpay_payment_id')->placeholder('—'),
                    ]),
            ]);
    }
}
