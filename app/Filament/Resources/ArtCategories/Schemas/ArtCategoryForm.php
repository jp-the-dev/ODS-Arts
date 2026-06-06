<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArtCategories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ArtCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Category Details')
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-filled from title.'),

                        TextInput::make('display_number')
                            ->label('Display number')
                            ->placeholder('e.g. 01')
                            ->maxLength(10),

                        TextInput::make('eyebrow')
                            ->maxLength(255)
                            ->placeholder('e.g. Traditional Art'),

                        TextInput::make('tagline')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Textarea::make('description')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Cover Image')
                    ->schema([
                        FileUpload::make('cover_image')
                            ->image()
                            ->directory('art-categories')
                            ->disk('public')
                            ->imageEditor()
                            ->maxSize(5120),

                        TextInput::make('cover_image_alt')
                            ->label('Cover image alt text')
                            ->maxLength(255),

                        TextInput::make('accent_color')
                            ->label('Accent color')
                            ->placeholder('#C9A96E')
                            ->maxLength(7),
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
                                ->default(0),
                        ]),
                    ]),
            ]);
    }
}
