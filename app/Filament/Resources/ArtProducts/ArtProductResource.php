<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArtProducts;

use App\Filament\Resources\ArtProducts\Pages\CreateArtProduct;
use App\Filament\Resources\ArtProducts\Pages\EditArtProduct;
use App\Filament\Resources\ArtProducts\Pages\ListArtProducts;
use App\Filament\Resources\ArtProducts\Pages\ViewArtProduct;
use App\Filament\Resources\ArtProducts\RelationManagers\ArtMaterialVariantRelationManager;
use App\Filament\Resources\ArtProducts\Schemas\ArtProductForm;
use App\Filament\Resources\ArtProducts\Schemas\ArtProductInfolist;
use App\Filament\Resources\ArtProducts\Tables\ArtProductsTable;
use App\Models\ArtProduct;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ArtProductResource extends Resource
{
    protected static ?string $model = ArtProduct::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    protected static \UnitEnum|string|null $navigationGroup = 'Art';

    public static function form(Schema $schema): Schema
    {
        return ArtProductForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ArtProductInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ArtProductsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            ArtMaterialVariantRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListArtProducts::route('/'),
            'create' => CreateArtProduct::route('/create'),
            'view' => ViewArtProduct::route('/{record}'),
            'edit' => EditArtProduct::route('/{record}/edit'),
        ];
    }
}
