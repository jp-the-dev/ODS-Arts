<?php

namespace App\Filament\Resources\Collections\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class CollectionInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name'),
                TextEntry::make('slug'),
                TextEntry::make('display_number')
                    ->label('Number')
                    ->placeholder('-'),
                TextEntry::make('tagline')
                    ->placeholder('-'),
                TextEntry::make('eyebrow')
                    ->placeholder('-'),
                TextEntry::make('description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('long_description')
                    ->label('Long description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('materials')
                    ->badge()
                    ->placeholder('-'),
                TextEntry::make('features')
                    ->badge()
                    ->placeholder('-'),
                TextEntry::make('image_path')
                    ->label('Hero image path')
                    ->placeholder('-'),
                TextEntry::make('image_alt')
                    ->label('Hero image alt')
                    ->placeholder('-'),
                TextEntry::make('image_position')
                    ->label('Image position')
                    ->placeholder('-'),
                ImageEntry::make('cover_image')
                    ->placeholder('-'),
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
