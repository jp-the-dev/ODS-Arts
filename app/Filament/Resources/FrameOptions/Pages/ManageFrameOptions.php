<?php

namespace App\Filament\Resources\FrameOptions\Pages;

use App\Filament\Resources\FrameOptions\FrameOptionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageFrameOptions extends ManageRecords
{
    protected static string $resource = FrameOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
