<?php

namespace App\Filament\Resources\ArtProducts\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class ArtProductInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('category.title')
                    ->label('Category'),
                TextEntry::make('name'),
                TextEntry::make('tagline')
                    ->placeholder('-'),
                TextEntry::make('slug'),
                TextEntry::make('description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('artist')
                    ->placeholder('-'),
                TextEntry::make('medium')
                    ->placeholder('-'),
                TextEntry::make('delivery_days')
                    ->label('Delivery (days)')
                    ->numeric()
                    ->placeholder('-'),
                TextEntry::make('tags')
                    ->badge()
                    ->placeholder('-'),
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
