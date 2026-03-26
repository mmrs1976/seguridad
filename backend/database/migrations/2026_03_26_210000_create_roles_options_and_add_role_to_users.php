<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('route')->unique();
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('option_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('option_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['role_id', 'option_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('active')->constrained('roles')->nullOnDelete();
        });

        $now = now();

        DB::table('roles')->insert([
            [
                'id' => 1,
                'name' => 'Administrador',
                'code' => 'admin',
                'description' => 'Perfil con acceso completo al sistema.',
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'name' => 'Postulante',
                'code' => 'applicant',
                'description' => 'Perfil que completa la encuesta de postulación.',
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('options')->insert([
            ['id' => 1, 'name' => 'Dashboard', 'route' => '/home/dashboard', 'icon' => 'dashboard', 'sort_order' => 1, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'name' => 'Alertas', 'route' => '/home/alertas', 'icon' => 'notifications', 'sort_order' => 2, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'name' => 'Usuarios', 'route' => '/home/usuarios', 'icon' => 'group', 'sort_order' => 3, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'name' => 'Perfiles', 'route' => '/home/roles', 'icon' => 'admin_panel_settings', 'sort_order' => 4, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 5, 'name' => 'Opciones', 'route' => '/home/opciones', 'icon' => 'menu_open', 'sort_order' => 5, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 6, 'name' => 'Encuesta', 'route' => '/home/encuesta', 'icon' => 'assignment', 'sort_order' => 1, 'active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('option_role')->insert([
            ['role_id' => 1, 'option_id' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'option_id' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'option_id' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'option_id' => 4, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 1, 'option_id' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['role_id' => 2, 'option_id' => 6, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('users')->update(['role_id' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
        });

        Schema::dropIfExists('option_role');
        Schema::dropIfExists('options');
        Schema::dropIfExists('roles');
    }
};