<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gate the Filament panel on an explicit flag.
     *
     * Until now `users` held staff only, and Filament fell back to "any
     * authenticated user, but only outside production" — which both locked staff
     * out of production and, now that the storefront has public registration,
     * would have let any customer into /admin locally.
     *
     * Existing rows predate customer sign-up, so they are promoted to admin;
     * everyone created from here on is a customer by default.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_admin')->default(false)->after('password');
        });

        DB::table('users')->update(['is_admin' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('is_admin');
        });
    }
};
