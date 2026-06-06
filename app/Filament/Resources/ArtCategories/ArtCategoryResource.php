<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArtCategories;

use App\Filament\Resources\ArtCategories\Pages\CreateArtCategory;
use App\Filament\Resources\ArtCategories\Pages\EditArtCategory;
use App\Filament\Resources\ArtCategories\Pages\ListArtCategories;
use App\Filament\Resources\ArtCategories\Pages\ViewArtCategory;
use App\Filament\Resources\ArtCategories\Schemas\ArtCategoryForm;
use App\Filament\Resources\ArtCategories\Schemas\ArtCategoryInfolist;
use App\Filament\Resources\ArtCategories\Tables\ArtCategoriesTable;
use App\Models\ArtCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ArtCategoryResource extends Resource
{
    protected static ?string $model = ArtCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'title';

    protected static \UnitEnum|string|null $navigationGroup = 'Art';

    public static function form(Schema $schema): Schema
    {
        return ArtCategoryForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ArtCategoryInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ArtCategoriesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListArtCategories::route('/'),
            'create' => CreateArtCategory::route('/create'),
            'view' => ViewArtCategory::route('/{record}'),
            'edit' => EditArtCategory::route('/{record}/edit'),
        ];
    }
}
