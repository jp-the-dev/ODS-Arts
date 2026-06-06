<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArtProducts\Schemas;

use App\Models\ArtCategory;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
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

class ArtProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Product Details')
                    ->schema([
                        Select::make('art_category_id')
                            ->label('Category')
                            ->options(ArtCategory::active()->orderBy('sort_order')->pluck('title', 'id'))
                            ->searchable()
                            ->required(),

                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-filled from name.'),

                        TextInput::make('tagline')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        Textarea::make('description')
                            ->rows(4)
                            ->columnSpanFull(),

                        TextInput::make('artist')
                            ->maxLength(255)
                            ->default('ODSArts Studio'),

                        TextInput::make('medium')
                            ->placeholder('e.g. Acrylic on Canvas')
                            ->maxLength(255),

                        TextInput::make('delivery_days')
                            ->label('Delivery (working days)')
                            ->numeric()
                            ->default(10)
                            ->suffix('days'),

                        TagsInput::make('tags')
                            ->placeholder('Add a tag'),
                    ])
                    ->columns(2),

                Section::make('Images')
                    ->schema([
                        Repeater::make('images')
                            ->relationship()
                            ->schema([
                                FileUpload::make('path')
                                    ->label('Image')
                                    ->image()
                                    ->directory('art-products')
                                    ->disk('public')
                                    ->imageEditor()
                                    ->maxSize(5120)
                                    ->required(),

                                TextInput::make('alt')
                                    ->label('Alt text')
                                    ->placeholder('Describe the image for accessibility')
                                    ->maxLength(255),

                                Select::make('role')
                                    ->label('Role')
                                    ->options([
                                        'hero' => 'Hero',
                                        'gallery' => 'Gallery',
                                        'detail' => 'Detail',
                                    ])
                                    ->default('hero'),

                                TextInput::make('sort_order')
                                    ->label('Order')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(4)
                            ->itemLabel(fn (array $state): ?string => $state['alt'] ?? 'Image')
                            ->orderColumn(fn () => 'sort_order')
                            ->collapsible(),
                    ]),

                Section::make('Visibility & Ordering')
                    ->schema([
                        Grid::make(3)->schema([
                            Toggle::make('is_featured')
                                ->label('Featured'),

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
