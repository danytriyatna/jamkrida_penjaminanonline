<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Modul induk baru: "Modul Klaim Online" membungkus 4 modul alur klaim
        //    yang sudah ada (Pengajuan, Verifikasi, Komite, Pembayaran).
        $klaimOnlineId = DB::table('modules')->where('kode', 'klaim-online')->value('id');
        if (!$klaimOnlineId) {
            $klaimOnlineId = DB::table('modules')->insertGetId([
                'kode' => 'klaim-online',
                'nama' => 'Modul Klaim Online',
                'route_slug' => 'klaim-online',
                'icon' => 'briefcase',
                'parent_id' => null,
                'urutan' => 3,
                'active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Modul induk baru "Modul Regaransi" - kosong dulu, disiapkan untuk fitur mendatang.
        $regaransiId = DB::table('modules')->where('kode', 'regaransi')->value('id');
        if (!$regaransiId) {
            DB::table('modules')->insert([
                'kode' => 'regaransi',
                'nama' => 'Modul Regaransi',
                'route_slug' => 'regaransi',
                'icon' => 'shield',
                'parent_id' => null,
                'urutan' => 4,
                'active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Pindahkan 4 modul alur klaim yang sudah ada ke bawah "Modul Klaim Online".
        DB::table('modules')->whereIn('kode', ['pengajuan', 'verifikasi', 'komite', 'pembayaran'])
            ->update(['parent_id' => $klaimOnlineId, 'updated_at' => now()]);
    }

    public function down(): void
    {
        $klaimOnlineId = DB::table('modules')->where('kode', 'klaim-online')->value('id');
        if ($klaimOnlineId) {
            DB::table('modules')->whereIn('kode', ['pengajuan', 'verifikasi', 'komite', 'pembayaran'])
                ->update(['parent_id' => null]);
            DB::table('modules')->where('id', $klaimOnlineId)->delete();
        }
        DB::table('modules')->where('kode', 'regaransi')->delete();
    }
};
