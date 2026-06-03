<?php

declare(strict_types=1);

namespace App\Filament\Resources\Enquiries\Tables;

use App\Models\Enquiry;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class EnquiriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('email')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'contact' => 'gray',
                        'custom_framing' => 'warning',
                        'gifting' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'custom_framing' => 'Custom Framing',
                        'gifting' => 'Gifting',
                        default => ucfirst($state),
                    }),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'new' => 'danger',
                        'read' => 'warning',
                        'replied' => 'success',
                        default => 'gray',
                    }),

                TextColumn::make('message')
                    ->limit(60)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState() ?? '') > 60 ? $column->getState() : null)
                    ->wrap(),

                TextColumn::make('created_at')
                    ->label('Received')
                    ->dateTime('M j, Y g:ia')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('type')
                    ->options([
                        'contact' => 'Contact',
                        'custom_framing' => 'Custom Framing',
                        'gifting' => 'Gifting',
                    ]),

                SelectFilter::make('status')
                    ->options([
                        'new' => 'New',
                        'read' => 'Read',
                        'replied' => 'Replied',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),

                Action::make('updateStatus')
                    ->label('Update status')
                    ->icon('heroicon-m-arrow-path')
                    ->form([
                        Select::make('status')
                            ->options(['new' => 'New', 'read' => 'Read', 'replied' => 'Replied'])
                            ->required(),
                    ])
                    ->action(function (Enquiry $record, array $data): void {
                        $record->update(['status' => $data['status']]);
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
