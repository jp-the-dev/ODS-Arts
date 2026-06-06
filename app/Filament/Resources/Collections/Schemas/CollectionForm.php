<?php

declare(strict_types=1);

namespace App\Filament\Resources\Collections\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
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

                        TextInput::make('display_number')
                            ->label('Display number')
                            ->placeholder('e.g. 01')
                            ->maxLength(10),

                        TextInput::make('tagline')
                            ->maxLength(255)
                            ->placeholder('e.g. Timeless craftsmanship in solid walnut.'),

                        TextInput::make('eyebrow')
                            ->maxLength(255)
                            ->placeholder('e.g. Signature Wood'),

                        Textarea::make('description')
                            ->rows(4)
                            ->columnSpanFull(),

                        Textarea::make('long_description')
                            ->label('Long description')
                            ->rows(6)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Materials & Features')
                    ->description('List the materials used and signature features of this collection.')
                    ->schema([
                        TagsInput::make('materials')
                            ->label('Materials')
                            ->placeholder('Add a material'),
                        TagsInput::make('features')
                            ->label('Signature Features')
                            ->placeholder('Add a feature'),
                    ])
                    ->columns(2),

                Section::make('Hero Image')
                    ->description('Image displayed on the collection detail page.')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('image_path')
                                ->label('Image path')
                                ->placeholder('/images/collections/walnut.png')
                                ->helperText('Absolute path to a frontend public asset.'),
                            TextInput::make('image_alt')
                                ->label('Alt text')
                                ->maxLength(255),
                        ]),
                        Select::make('image_position')
                            ->label('Image position')
                            ->options([
                                'left' => 'Left',
                                'right' => 'Right',
                            ])
                            ->default('left'),
                    ]),

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
