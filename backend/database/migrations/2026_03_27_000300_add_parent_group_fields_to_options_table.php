<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('options', function (Blueprint $table) {
            if (!Schema::hasColumn('options', 'is_group')) {
                $table->boolean('is_group')->default(false)->after('icon');
            }

            if (!Schema::hasColumn('options', 'parent_id')) {
                $table->foreignId('parent_id')->nullable()->after('is_group')->constrained('options')->nullOnDelete();
            }
        });

        Schema::table('options', function (Blueprint $table) {
            $table->string('route')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('options', function (Blueprint $table) {
            if (Schema::hasColumn('options', 'parent_id')) {
                $table->dropConstrainedForeignId('parent_id');
            }

            if (Schema::hasColumn('options', 'is_group')) {
                $table->dropColumn('is_group');
            }
        });

        Schema::table('options', function (Blueprint $table) {
            $table->string('route')->nullable(false)->change();
        });
    }
};
