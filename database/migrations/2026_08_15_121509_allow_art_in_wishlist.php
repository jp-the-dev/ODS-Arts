<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Let customers wishlist art, not just frames.
     *
     * `product_id` was a required frames column, so the storefront could only
     * ever sync frame slugs — art hearts stayed trapped in localStorage. Each row
     * now points at exactly one of the two catalogues.
     *
     * The (user_id, product_id) unique index doubles as the index backing the
     * user_id foreign key, and MySQL refuses to drop an index a constraint still
     * needs — so a standalone user_id index is added first to take over that role.
     */
    public function up(): void
    {
        Schema::table('wishlist_items', function (Blueprint $table): void {
            $table->index('user_id', 'wishlist_items_user_id_index');
        });

        Schema::table('wishlist_items', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'product_id']);
        });

        Schema::table('wishlist_items', function (Blueprint $table): void {
            $table->foreignId('product_id')->nullable()->change();
            $table->foreignId('art_product_id')->nullable()->after('product_id')
                ->constrained('art_products')->cascadeOnDelete();
        });

        Schema::table('wishlist_items', function (Blueprint $table): void {
            // One row per customer per item, independently for each catalogue.
            $table->unique(['user_id', 'product_id']);
            $table->unique(['user_id', 'art_product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('wishlist_items', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'art_product_id']);
            $table->dropConstrainedForeignId('art_product_id');
            $table->dropIndex('wishlist_items_user_id_index');
        });
    }
};
