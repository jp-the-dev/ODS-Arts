<?php

declare(strict_types=1);

namespace App\Filament\Resources\Collections\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CollectionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Collection Details')
                    ->description('Define the collection name, URL, and marketing copy.')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('URL-safe identifier — auto-filled from name.'),

                        TextInput::make('tagline')
                            ->maxLength(255)
                            ->placeholder('e.g. Timeless craftsmanship in solid walnut.'),

                        Textarea::make('description')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Cover Image')
                    ->schema([
                        FileUpload::make('cover_image')
                            ->image()
                            ->directory('collections')
                            ->disk('public')
                            ->imageEditor()
                            ->maxSize(5120)
                            ->helperText('Recommended: 1600×900px. Max 5MB.'),
                    ]),

                Section::make('Visibility & Ordering')
                    ->schema([
                        Grid::make(2)->schema([
                            Toggle::make('is_active')
                                ->label('Active (visible on website)')
                                ->default(true),

                            TextInput::make('sort_order')
                                ->label('Display order')
                                ->numeric()
                                ->default(0)
                                ->helperText('Lower number = shown first.'),
                        ]),
                    ]),
            ]);
    }
}
