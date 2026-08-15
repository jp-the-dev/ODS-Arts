<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow checkout without an account.
     *
     * `orders.user_id` was NOT NULL, which made every purchase require
     * registration. Guest orders still need a contact point, so email and phone
     * are stored on the order itself rather than only inside the address JSON —
     * they are needed for order lookup and confirmation mail.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('email')->nullable()->after('user_id');
            $table->string('phone', 20)->nullable()->after('email');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex(['email']);
            $table->dropColumn(['email', 'phone']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
