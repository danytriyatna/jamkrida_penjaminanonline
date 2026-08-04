<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Kolom baru untuk login asli: token API sederhana + link ke pejabat_komites
        Schema::table('app_users', function (Blueprint $table) {
            $table->string('api_token', 80)->nullable()->unique()->after('password');
            $table->unsignedBigInteger('pejabat_komite_id')->nullable()->after('mitra_id');
        });

        // 2. Selaraskan kode role dengan yang dipakai frontend (klaim, super_admin, dst)
        DB::table('roles')->where('id', 1)->update(['kode' => 'super_admin']);
        DB::table('roles')->where('id', 3)->update(['kode' => 'klaim']);

        // 3. Tambah role baru "komite" (Pejabat Komite Klaim) - sebelumnya tidak ada
        //    padahal SidangKomite.vue butuh role.kode === 'komite'.
        $komiteRoleId = DB::table('roles')->insertGetId([
            'kode' => 'komite',
            'nama' => 'Pejabat Komite Klaim',
            'is_super_admin' => 0,
            'active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Perbaiki hak akses Kabag Klaim (role id 4): sebelumnya nyasar ke modul
        //    Sidang Komite (id 7), padahal tugas Kabag Klaim adalah approve/TTE Memo
        //    Pembayaran (modul id 8). Modul 7 sekarang jadi milik role "komite" baru.
        DB::table('role_module_permissions')->where('role_id', 4)->where('module_id', 7)->delete();
        DB::table('role_module_permissions')->updateOrInsert(
            ['role_id' => 4, 'module_id' => 8],
            ['can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0, 'updated_at' => now(), 'created_at' => now()]
        );

        // 5. Permission untuk role "komite" baru: Sidang Komite + Profile
        DB::table('role_module_permissions')->insert([
            ['role_id' => $komiteRoleId, 'module_id' => 7, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['role_id' => $komiteRoleId, 'module_id' => 10, 'can_view' => 1, 'can_create' => 1, 'can_edit' => 1, 'can_delete' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Selaraskan email/nama/role_name akun demo yang sudah ada supaya sama
        //    persis dengan tombol quick-login di SignIn.vue.
        DB::table('app_users')->where('id', 1)->update([
            'name' => 'Administrator Utama',
            'email' => 'superadmin@jamkrida.online',
            'role_name' => 'super_admin',
        ]);
        DB::table('app_users')->where('id', 3)->update([
            'email' => 'klaim@jamkrida.online',
            'role_name' => 'klaim',
        ]);
        DB::table('app_users')->where('id', 4)->update([
            'email' => 'kabag@jamkrida.online',
        ]);
        DB::table('app_users')->where('id', 5)->update([
            'email' => 'keuangan@jamkrida.online',
        ]);

        // 7. Tambah 3 akun Pejabat Komite (Ketua + 2 Anggota) yang sebelumnya cuma ada
        //    di MockDb, belum ada di database asli sama sekali - supaya proses TTE
        //    Berita Acara / Surat Keputusan bisa login via backend asli juga.
        $existingKetua = DB::table('app_users')->where('email', 'ketua.komite@jamkrida.online')->exists();
        if (!$existingKetua) {
            $pejabats = DB::table('pejabat_komites')->orderBy('urutan')->get();
            $emails = ['ketua.komite@jamkrida.online', 'anggota1@jamkrida.online', 'anggota2@jamkrida.online'];
            foreach ($pejabats as $i => $pj) {
                if (!isset($emails[$i])) continue;
                DB::table('app_users')->insert([
                    'name' => $pj->nama . ' (' . $pj->jabatan . ')',
                    'email' => $emails[$i],
                    'password' => Hash::make('password123'),
                    'role_id' => $komiteRoleId,
                    'role_name' => 'komite',
                    'mitra_id' => null,
                    'pejabat_komite_id' => $pj->id,
                    'nip' => $pj->nip,
                    'jabatan' => $pj->jabatan,
                    'active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('app_users', function (Blueprint $table) {
            $table->dropColumn(['api_token', 'pejabat_komite_id']);
        });
    }
};
