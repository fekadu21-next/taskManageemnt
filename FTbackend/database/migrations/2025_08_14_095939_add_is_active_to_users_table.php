<?php

// database/migrations/2025_08_14_000000_add_is_active_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('profile_photo');
            }
            // if you don't already have last_login:
            if (!Schema::hasColumn('users', 'last_login')) {
                $table->dateTime('last_login')->nullable()->after('is_active');
            }
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_active')) $table->dropColumn('is_active');
            if (Schema::hasColumn('users', 'last_login')) $table->dropColumn('last_login');
        });
    }
};
