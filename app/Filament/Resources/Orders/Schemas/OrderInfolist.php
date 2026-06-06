<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Models\Order;
use Filament\Infolists\Components\Group;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Order Information')
                    ->schema([
                        TextEntry::make('order_number')
                            ->weight(FontWeight::Bold)
                            ->size('lg'),
                        TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'pending_payment' => 'warning',
                                'confirmed' => 'info',
                                'processing' => 'info',
                                'shipped' => 'primary',
                                'delivered' => 'success',
                                'cancelled' => 'danger',
                                'refunded' => 'gray',
                                default => 'gray',
                            }),
                        TextEntry::make('payment_status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'pending' => 'warning',
                                'paid' => 'success',
                                'failed' => 'danger',
                                'refunded' => 'gray',
                                default => 'gray',
                            }),
                        TextEntry::make('payment_method')
                            ->placeholder('—'),
                        TextEntry::make('currency'),
                        TextEntry::make('ordered_at')
                            ->dateTime(),
                        TextEntry::make('created_at')
                            ->label('Created')
                            ->dateTime(),
                    ])
                    ->columns(2)
                    ->columnSpan(2),

                Section::make('Pricing')
                    ->schema([
                        TextEntry::make('subtotal')
                            ->money('INR'),
                        TextEntry::make('tax')
                            ->money('INR'),
                        TextEntry::make('shipping_cost')
                            ->money('INR'),
                        TextEntry::make('discount')
                            ->money('INR'),
                        TextEntry::make('total')
                            ->money('INR')
                            ->weight(FontWeight::Bold)
                            ->size('lg'),
                    ])
                    ->columns(2)
                    ->columnSpan(1),

                Group::make()
                    ->columns(2)
                    ->columnSpanFull()
                    ->schema([
                        Section::make('Shipping Address')
                            ->schema([
                                TextEntry::make('shipping_address.full_name')
                                    ->label('Full Name'),
                                TextEntry::make('shipping_address.email')
                                    ->label('Email'),
                                TextEntry::make('shipping_address.phone')
                                    ->label('Phone'),
                                TextEntry::make('shipping_address.line1')
                                    ->label('Address Line 1'),
                                TextEntry::make('shipping_address.line2')
                                    ->label('Address Line 2')
                                    ->placeholder('—'),
                                TextEntry::make('shipping_address.city')
                                    ->label('City'),
                                TextEntry::make('shipping_address.state')
                                    ->label('State'),
                                TextEntry::make('shipping_address.pincode')
                                    ->label('Pincode'),
                                TextEntry::make('shipping_address.country')
                                    ->label('Country'),
                            ])
                            ->columns(2),

                        Section::make('Customer')
                            ->schema([
                                TextEntry::make('user.name')
                                    ->label('Name'),
                                TextEntry::make('user.email')
                                    ->label('Email'),
                                TextEntry::make('user.phone')
                                    ->label('Phone'),
                            ]),
                    ]),

                Section::make('Notes')
                    ->schema([
                        TextEntry::make('notes')
                            ->placeholder('No notes')
                            ->columnSpanFull(),
                    ])
                    ->visible(fn (Order $record): bool => filled($record->notes)),

                Section::make('Order Items')
                    ->schema([
                        RepeatableEntry::make('items')
                            ->schema([
                                TextEntry::make('name')
                                    ->label('Product')
                                    ->weight(FontWeight::SemiBold),
                                TextEntry::make('sku')
                                    ->label('SKU')
                                    ->placeholder('—'),
                                TextEntry::make('unit_price_paise')
                                    ->label('Unit Price')
                                    ->money('INR'),
                                TextEntry::make('quantity')
                                    ->label('Qty'),
                                TextEntry::make('subtotal_paise')
                                    ->label('Subtotal')
                                    ->money('INR'),
                            ])
                            ->columns(5),
                    ]),
            ]);
    }
}
