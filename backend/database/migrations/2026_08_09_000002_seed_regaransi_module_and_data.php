<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Modul induk "Modul Regaransi" (kode: regaransi) dibuat di migrasi
        //    2026_08_07_000003_group_klaim_modules_under_parent.php. Ambil id-nya
        //    sebagai parent untuk 6 modul anak Regaransi Jiwa & Kredit Macet.
        $regaransiId = DB::table('modules')->where('kode', 'regaransi')->value('id');
        if (!$regaransiId) {
            $regaransiId = DB::table('modules')->insertGetId([
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

        $childModules = [
            ['kode' => 'regaransi-jiwa-pengajuan', 'nama' => 'Pengajuan Regaransi Jiwa', 'route_slug' => 'regaransi-jiwa/pengajuan', 'urutan' => 1],
            ['kode' => 'regaransi-jiwa-persetujuan', 'nama' => 'Persetujuan Regaransi Jiwa', 'route_slug' => 'regaransi-jiwa/persetujuan', 'urutan' => 2],
            ['kode' => 'regaransi-jiwa-pembayaran', 'nama' => 'Pembayaran Regaransi Jiwa', 'route_slug' => 'regaransi-jiwa/pembayaran', 'urutan' => 3],
            ['kode' => 'kredit-macet-pengajuan', 'nama' => 'Pengajuan Kredit Macet', 'route_slug' => 'kredit-macet/pengajuan', 'urutan' => 4],
            ['kode' => 'kredit-macet-persetujuan', 'nama' => 'Persetujuan Kredit Macet', 'route_slug' => 'kredit-macet/persetujuan', 'urutan' => 5],
            ['kode' => 'kredit-macet-pembayaran', 'nama' => 'Pembayaran Kredit Macet', 'route_slug' => 'kredit-macet/pembayaran', 'urutan' => 6],
        ];

        $childIds = [];
        foreach ($childModules as $cm) {
            $existingId = DB::table('modules')->where('kode', $cm['kode'])->value('id');
            if ($existingId) {
                $childIds[] = $existingId;
                continue;
            }
            $childIds[] = DB::table('modules')->insertGetId([
                'kode' => $cm['kode'],
                'nama' => $cm['nama'],
                'route_slug' => $cm['route_slug'],
                'icon' => '',
                'parent_id' => $regaransiId,
                'urutan' => $cm['urutan'],
                'active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Beri akses penuh ke role 'klaim' (Staf Bagian Klaim) untuk keenam modul baru -
        //    mengikuti pola: role yang sama sudah mengelola alur pengajuan/verifikasi/pembayaran klaim.
        $klaimRoleId = DB::table('roles')->where('kode', 'klaim')->value('id');
        if ($klaimRoleId) {
            foreach ($childIds as $moduleId) {
                $exists = DB::table('role_module_permissions')
                    ->where('role_id', $klaimRoleId)
                    ->where('module_id', $moduleId)
                    ->exists();
                if (!$exists) {
                    DB::table('role_module_permissions')->insert([
                        'role_id' => $klaimRoleId,
                        'module_id' => $moduleId,
                        'can_view' => true,
                        'can_create' => true,
                        'can_edit' => true,
                        'can_delete' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 3. Seed data mockup (mengikuti DatabaseSeeder pada repo referensi Regaransi).
        if (DB::table('regaransi_jiwas')->count() === 0) {
            DB::table('regaransi_jiwas')->insert([
                [
                    'no_regaransi' => 'REG-JW/2026/08/001',
                    'nama_peserta' => 'Budi Santoso',
                    'nik' => '3273011205850001',
                    'tgl_lahir' => '1985-05-12',
                    'mitra_reasuradur' => 'PT Reasuransi Indonesia Utama (Indonesia Re)',
                    'uang_pertanggungan' => 500000000,
                    'premi_regaransi' => 7500000,
                    'share_percentage' => 50,
                    'tgl_mulai' => '2026-08-01',
                    'tgl_akhir' => '2031-08-01',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'AVAILABLE',
                    'created_at' => '2026-08-01 09:30:00',
                    'updated_at' => '2026-08-01 09:30:00',
                ],
                [
                    'no_regaransi' => 'REG-JW/2026/08/002',
                    'nama_peserta' => 'Siti Aminah',
                    'nik' => '3273024409900003',
                    'tgl_lahir' => '1990-09-04',
                    'mitra_reasuradur' => 'PT Tugu Reasuransi Indonesia (Tugure)',
                    'uang_pertanggungan' => 750000000,
                    'premi_regaransi' => 11250000,
                    'share_percentage' => 60,
                    'tgl_mulai' => '2026-08-01',
                    'tgl_akhir' => '2036-08-01',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'AVAILABLE',
                    'created_at' => '2026-08-01 10:15:00',
                    'updated_at' => '2026-08-01 10:15:00',
                ],
                [
                    'no_regaransi' => 'REG-JW/2026/08/010',
                    'nama_peserta' => 'Agus Pratama',
                    'nik' => '3273099901800004',
                    'tgl_lahir' => '1980-01-15',
                    'mitra_reasuradur' => 'PT Reasuransi Indonesia Utama (Indonesia Re)',
                    'uang_pertanggungan' => 850000000,
                    'premi_regaransi' => 12750000,
                    'share_percentage' => 50,
                    'tgl_mulai' => '2026-08-02',
                    'tgl_akhir' => '2031-08-02',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'PENGAJUAN',
                    'created_at' => '2026-08-02 11:00:00',
                    'updated_at' => '2026-08-02 11:00:00',
                ],
                [
                    'no_regaransi' => 'REG-JW/2026/08/020',
                    'nama_peserta' => 'Deni Kurniawan',
                    'nik' => '3273066604820001',
                    'tgl_lahir' => '1982-04-12',
                    'mitra_reasuradur' => 'PT Reasuransi Nasional Indonesia (NasRe)',
                    'uang_pertanggungan' => 900000000,
                    'premi_regaransi' => 13500000,
                    'share_percentage' => 50,
                    'tgl_mulai' => '2026-08-01',
                    'tgl_akhir' => '2031-08-01',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'DISETUJUI',
                    'no_persetujuan' => 'SK-REG-JW/2026/08/020',
                    'tgl_persetujuan' => '2026-08-02',
                    'catatan_underwriting' => 'Underwriting disetujui.',
                    'created_at' => '2026-08-01 16:00:00',
                    'updated_at' => '2026-08-01 16:00:00',
                ],
                [
                    'no_regaransi' => 'REG-JW/2026/08/030',
                    'nama_peserta' => 'Ahmad Subagja',
                    'nik' => '3204121010780005',
                    'tgl_lahir' => '1978-10-10',
                    'mitra_reasuradur' => 'PT Reasuransi Nasional Indonesia (NasRe)',
                    'uang_pertanggungan' => 300000000,
                    'premi_regaransi' => 4500000,
                    'share_percentage' => 40,
                    'tgl_mulai' => '2026-08-01',
                    'tgl_akhir' => '2029-08-01',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'PAID',
                    'no_persetujuan' => 'SK-REG-JW/2026/08/030',
                    'tgl_persetujuan' => '2026-08-02',
                    'no_transaksi_bayar' => 'TRX-PAY-JW/2026/08/030',
                    'tgl_bayar' => '2026-08-03',
                    'metode_bayar' => 'Transfer Bank Mandiri',
                    'bukti_bayar_file' => 'Bukti_Transfer_Premi_JW030.pdf',
                    'created_at' => '2026-08-01 08:00:00',
                    'updated_at' => '2026-08-01 08:00:00',
                ],
            ]);
        }

        if (DB::table('regaransi_kredits')->count() === 0) {
            DB::table('regaransi_kredits')->insert([
                [
                    'no_regaransi' => 'REG-KM/2026/08/001',
                    'no_sertifikat_penjaminan' => 'SERT-JKD-2024/0991',
                    'nama_debitur' => 'CV Maju Bersama',
                    'bank_cedant' => 'Bank bjb Cabang Utama Bandung',
                    'plafond_kredit' => 1500000000,
                    'outstanding_tunggakan' => 850000000,
                    'nominal_klaim_regaransi' => 425000000,
                    'kolektibilitas' => 'Macet (Kol 5)',
                    'alasan_klaim' => 'Gagal bayar akibat penurunan omzet usaha.',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'AVAILABLE',
                    'created_at' => '2026-08-01 11:20:00',
                    'updated_at' => '2026-08-01 11:20:00',
                ],
                [
                    'no_regaransi' => 'REG-KM/2026/08/010',
                    'no_sertifikat_penjaminan' => 'SERT-JKD-2024/1102',
                    'nama_debitur' => 'PT Citra Mandiri Teknika',
                    'bank_cedant' => 'Bank bjb Cabang Utama Bandung',
                    'plafond_kredit' => 1200000000,
                    'outstanding_tunggakan' => 700000000,
                    'nominal_klaim_regaransi' => 350000000,
                    'kolektibilitas' => 'Macet (Kol 5)',
                    'alasan_klaim' => 'Penghentian operasional pabrik debitur.',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'PENGAJUAN',
                    'created_at' => '2026-08-02 09:30:00',
                    'updated_at' => '2026-08-02 09:30:00',
                ],
                [
                    'no_regaransi' => 'REG-KM/2026/08/020',
                    'no_sertifikat_penjaminan' => 'SERT-JKD-2024/0551',
                    'nama_debitur' => 'PT Bina Usaha Bersama',
                    'bank_cedant' => 'Bank bjb Cabang Utama Bandung',
                    'plafond_kredit' => 1000000000,
                    'outstanding_tunggakan' => 600000000,
                    'nominal_klaim_regaransi' => 300000000,
                    'kolektibilitas' => 'Macet (Kol 5)',
                    'alasan_klaim' => 'Usaha debitur tidak beroperasi.',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'DISETUJUI',
                    'no_persetujuan' => 'SK-KOMITE-KM/2026/08/020',
                    'tgl_persetujuan' => '2026-08-02',
                    'nominal_disetujui' => 300000000,
                    'bank_tujuan' => 'Bank bjb',
                    'no_rekening' => '001-99201-11',
                    'catatan_komite' => 'Klaim disetujui Komite 50%.',
                    'created_at' => '2026-08-01 15:30:00',
                    'updated_at' => '2026-08-01 15:30:00',
                ],
                [
                    'no_regaransi' => 'REG-KM/2026/08/030',
                    'no_sertifikat_penjaminan' => 'SERT-JKD-2023/1105',
                    'nama_debitur' => 'UD Berkah Mulia',
                    'bank_cedant' => 'BPR PK Ciamis',
                    'plafond_kredit' => 400000000,
                    'outstanding_tunggakan' => 280000000,
                    'nominal_klaim_regaransi' => 140000000,
                    'kolektibilitas' => 'Macet (Kol 5)',
                    'alasan_klaim' => 'Bencana alam kebakaran.',
                    'periode' => '2026-08',
                    'status_data' => 'Include',
                    'status' => 'PAID',
                    'no_persetujuan' => 'SK-KOMITE-KM/2026/08/030',
                    'tgl_persetujuan' => '2026-08-01',
                    'catatan_komite' => 'Klaim disetujui.',
                    'nominal_disetujui' => 140000000,
                    'no_transaksi_disbursement' => 'DISB-KM/2026/08/030',
                    'tgl_disbursement' => '2026-08-03',
                    'bank_tujuan' => 'Bank BCA',
                    'no_rekening' => '148-0912-334',
                    'bukti_bayar_file' => 'Bukti_Disbursement_Klaim_KM030.pdf',
                    'created_at' => '2026-08-01 10:10:00',
                    'updated_at' => '2026-08-01 10:10:00',
                ],
            ]);
        }
    }

    public function down(): void
    {
        DB::table('modules')->whereIn('kode', [
            'regaransi-jiwa-pengajuan',
            'regaransi-jiwa-persetujuan',
            'regaransi-jiwa-pembayaran',
            'kredit-macet-pengajuan',
            'kredit-macet-persetujuan',
            'kredit-macet-pembayaran',
        ])->delete();
    }
};
