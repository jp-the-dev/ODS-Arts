<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('markAsConfirmed')
                ->label('Mark as Confirmed')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn () => $this->record->status === 'pending_payment')
                ->action(function () {
                    $this->record->update(['status' => 'confirmed']);
                    Notification::make()
                        ->title('Order confirmed')
                        ->success()
                        ->send();
                }),
            Action::make('markAsShipped')
                ->label('Mark as Shipped')
                ->icon('heroicon-o-truck')
                ->color('primary')
                ->visible(fn () => $this->record->status === 'confirmed' || $this->record->status === 'processing')
                ->action(function () {
                    $this->record->update(['status' => 'shipped']);
                    Notification::make()
                        ->title('Order marked as shipped')
                        ->success()
                        ->send();
                }),
            Action::make('markAsDelivered')
                ->label('Mark as Delivered')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->visible(fn () => $this->record->status === 'shipped')
                ->action(function () {
                    $this->record->update(['status' => 'delivered', 'payment_status' => 'paid']);
                    Notification::make()
                        ->title('Order delivered')
                        ->success()
                        ->send();
                }),
            Action::make('cancelOrder')
                ->label('Cancel Order')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => ! in_array($this->record->status, ['delivered', 'cancelled', 'refunded']))
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->update(['status' => 'cancelled']);
                    Notification::make()
                        ->title('Order cancelled')
                        ->warning()
                        ->send();
                }),
        ];
    }
}
