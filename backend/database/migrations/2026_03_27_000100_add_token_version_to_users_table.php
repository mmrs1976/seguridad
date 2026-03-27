<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'token_version')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedInteger('token_version')->default(0)->after('remember_token');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'token_version')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('token_version');
            });
        }
    }
};
