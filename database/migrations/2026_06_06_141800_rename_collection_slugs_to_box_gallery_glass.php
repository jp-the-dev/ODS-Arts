<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('collections')
            ->where('slug', 'walnut')
            ->update(['slug' => 'box-frame']);

        DB::table('collections')
            ->where('slug', 'gallery')
            ->update(['slug' => 'gallery-frame']);

        DB::table('collections')
            ->where('slug', 'heritage')
            ->update(['slug' => 'glass-frame']);
    }

    public function down(): void
    {
        DB::table('collections')
            ->where('slug', 'box-frame')
            ->update(['slug' => 'walnut']);

        DB::table('collections')
            ->where('slug', 'gallery-frame')
            ->update(['slug' => 'gallery']);

        DB::table('collections')
            ->where('slug', 'glass-frame')
            ->update(['slug' => 'heritage']);
    }
};
