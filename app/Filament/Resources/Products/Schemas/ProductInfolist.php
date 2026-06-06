<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class ProductInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('collection.name')
                    ->label('Collection'),
                TextEntry::make('name'),
                TextEntry::make('tagline')
                    ->placeholder('-'),
                TextEntry::make('slug'),
                TextEntry::make('description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('material')
                    ->placeholder('-'),
                TextEntry::make('materials')
                    ->badge()
                    ->placeholder('-'),
                TextEntry::make('dimensions')
                    ->placeholder('-'),
                TextEntry::make('delivery_days')
                    ->label('Delivery (days)')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('care_instructions')
                    ->badge()
                    ->placeholder('-'),
                TextEntry::make('price_in_paise')
                    ->numeric(),
                IconEntry::make('is_featured')
                    ->boolean(),
                IconEntry::make('is_active')
                    ->boolean(),
                TextEntry::make('sort_order')
                    ->numeric(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
