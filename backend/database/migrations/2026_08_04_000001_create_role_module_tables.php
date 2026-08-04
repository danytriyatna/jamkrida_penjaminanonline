<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Roles (hak akses)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->boolean('is_super_admin')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // Modules (registry menu/sidebar)
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('route_slug');
            $table->string('icon')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // Role <-> Module permission matrix
        Schema::create('role_module_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('module_id');
            $table->boolean('can_view')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();
        });

        // --- SEED DATA ---

        // Roles selaras dengan role_id yang sudah dipakai app_users
        DB::table('roles')->insert([
            ['id' => 1, 'kode' => 'admin', 'nama' => 'Super Admin', 'is_super_admin' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'mitra', 'nama' => 'Mitra Bank/BPR', 'is_super_admin' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'kode' => 'verifikator', 'nama' => 'Staf Bagian Klaim', 'is_super_admin' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'kode' => 'kabag_klaim', 'nama' => 'Kepala Bagian Klaim', 'is_super_admin' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'kode' => 'keuangan', 'nama' => 'Staf Keuangan', 'is_super_admin' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Modules selaras dengan struktur sidebar saat ini
        DB::table('modules')->insert([
            ['id' => 1, 'kode' => 'referensi', 'nama' => 'Data Referensi', 'route_slug' => 'referensi', 'icon' => 'briefcase', 'parent_id' => null, 'urutan' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'utility', 'nama' => 'Utility & System', 'route_slug' => 'utility', 'icon' => 'gear', 'parent_id' => null, 'urutan' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'kode' => 'utility-setting-web', 'nama' => 'Setting Web', 'route_slug' => 'utility/setting-web', 'icon' => null, 'parent_id' => 2, 'urutan' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 22, 'kode' => 'utility-role-module', 'nama' => 'Role & Izin', 'route_slug' => 'utility/role-module', 'icon' => null, 'parent_id' => 2, 'urutan' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'kode' => 'utility-log-access', 'nama' => 'Audit Log', 'route_slug' => 'utility/log-access', 'icon' => null, 'parent_id' => 2, 'urutan' => 3, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'kode' => 'pengajuan', 'nama' => 'Pengajuan Klaim', 'route_slug' => 'pengajuan', 'icon' => 'file-sheet', 'parent_id' => null, 'urutan' => 3, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'kode' => 'verifikasi', 'nama' => 'Analisa & Verifikasi', 'route_slug' => 'verifikasi', 'icon' => 'check-square', 'parent_id' => null, 'urutan' => 4, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'kode' => 'komite', 'nama' => 'Sidang Komite', 'route_slug' => 'komite', 'icon' => 'fingerprint', 'parent_id' => null, 'urutan' => 5, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'kode' => 'pembayaran', 'nama' => 'Pembayaran Klaim', 'route_slug' => 'pembayaran', 'icon' => 'wallet', 'parent_id' => null, 'urutan' => 6, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'kode' => 'profile', 'nama' => 'Profil Saya', 'route_slug' => 'profile', 'icon' => 'user', 'parent_id' => null, 'urutan' => 7, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Permission matrix per role
        $permissions = [
            // Mitra (role_id 2): Pengajuan & Profile
            ['role_id' => 2, 'module_id' => 3, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['role_id' => 2, 'module_id' => 10, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            // Staf Klaim / Verifikator (role_id 3): Referensi (view), Pengajuan (view), Verifikasi, Pembayaran, Profile
            ['role_id' => 3, 'module_id' => 1, 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['role_id' => 3, 'module_id' => 3, 'can_view' => 1, 'can_create' => 0, 'can_edit' => 0, 'can_delete' => 0],
            ['role_id' => 3, 'module_id' => 4, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['role_id' => 3, 'module_id' => 8, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['role_id' => 3, 'module_id' => 10, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            // Kabag Klaim (role_id 4): Sidang Komite + Profile
            ['role_id' => 4, 'module_id' => 7, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['role_id' => 4, 'module_id' => 10, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            // Keuangan (role_id 5): Pembayaran + Profile
            ['role_id' => 5, 'module_id' => 8, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
            ['role_id' => 5, 'module_id' => 10, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0],
        ];

        foreach ($permissions as $p) {
            DB::table('role_module_permissions')->insert(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_module_permissions');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('roles');
    }
};
