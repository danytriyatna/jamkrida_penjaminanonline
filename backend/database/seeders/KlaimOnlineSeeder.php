<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class KlaimOnlineSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('klaim_documents')->delete();
        DB::table('klaim_status_histories')->delete();
        DB::table('klaims')->delete();
        DB::table('sertifikat_penjaminans')->delete();
        DB::table('pejabat_komites')->delete();
        DB::table('jenis_dokumens')->delete();
        DB::table('klaim_statuses')->delete();
        DB::table('penyebab_klaims')->delete();
        DB::table('produk_penjaminans')->delete();
        DB::table('mitras')->delete();
        DB::table('app_users')->delete();

        // 1. App Users
        DB::table('app_users')->insert([
            ['id' => 1, 'name' => 'Administrator System', 'email' => 'admin@jamkridajabar.co.id', 'password' => Hash::make('password123'), 'role_id' => 1, 'role_name' => 'admin', 'mitra_id' => null, 'nip' => 'ADM-001', 'jabatan' => 'System Administrator', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Budi Santoso (Bank BJB)', 'email' => 'mitra@bjb.co.id', 'password' => Hash::make('password123'), 'role_id' => 2, 'role_name' => 'mitra', 'mitra_id' => 1, 'nip' => 'BJB-8821', 'jabatan' => 'Staf Administrasi Kredit', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Andi Wijaya (Staf Klaim)', 'email' => 'verifikator@jamkridajabar.co.id', 'password' => Hash::make('password123'), 'role_id' => 3, 'role_name' => 'verifikator', 'mitra_id' => null, 'nip' => 'JKD-1042', 'jabatan' => 'Staf Bagian Klaim', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Drs. Hendra Setiawan (Kabag)', 'email' => 'kabag@jamkridajabar.co.id', 'password' => Hash::make('password123'), 'role_id' => 4, 'role_name' => 'kabag_klaim', 'mitra_id' => null, 'nip' => 'JKD-1002', 'jabatan' => 'Kepala Bagian Klaim', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Rina Permata (Keuangan)', 'email' => 'kasir@jamkridajabar.co.id', 'password' => Hash::make('password123'), 'role_id' => 5, 'role_name' => 'keuangan', 'mitra_id' => null, 'nip' => 'JKD-1088', 'jabatan' => 'Staf Divisi Keuangan', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Mitras
        DB::table('mitras')->insert([
            ['id' => 1, 'kode_mitra' => 'BJB', 'nama_mitra' => 'PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (Bank BJB)', 'jenis_mitra' => 'Bank Umum', 'alamat' => 'Jl. Naripan No. 12-14, Bandung', 'telepon' => '022-4237171', 'bank_penerima' => 'Bank BJB', 'no_rekening_penerima' => '0012345678', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode_mitra' => 'BPR_KGB', 'nama_mitra' => 'PT BPR Karya Guna Bandung', 'jenis_mitra' => 'BPR', 'alamat' => 'Jl. Sunda No. 45, Bandung', 'telepon' => '022-4201122', 'bank_penerima' => 'Bank BJB', 'no_rekening_penerima' => '0087654321', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Produk Penjaminans
        DB::table('produk_penjaminans')->insert([
            ['id' => 1, 'kode' => 'KKB', 'nama' => 'Penjaminan Kredit Konsumtif / Multiguna', 'cover_percentage' => 0.70, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'KUR', 'nama' => 'Penjaminan Kredit Usaha Rakyat (KUR)', 'cover_percentage' => 0.80, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Penyebab Klaims
        DB::table('penyebab_klaims')->insert([
            ['id' => 1, 'kode' => 'MACET', 'nama_penyebab' => 'Debitur Wanprestasi / Macet Kredit', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'MENINGGAL', 'nama_penyebab' => 'Debitur Meninggal Dunia', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Klaim Statuses
        DB::table('klaim_statuses')->insert([
            ['id' => 1, 'kode' => 'draft', 'nama' => 'Draft (Pengisian Data)', 'urutan' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'diajukan', 'nama' => 'Diajukan Mitra', 'urutan' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'kode' => 'verifikasi', 'nama' => 'Verifikasi Dokumen', 'urutan' => 3, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'kode' => 'perbaikan', 'nama' => 'Perlu Perbaikan Data', 'urutan' => 4, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'kode' => 'assessment', 'nama' => 'Analisa & Assessment', 'urutan' => 5, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'kode' => 'survei', 'nama' => 'Survei Lapangan', 'urutan' => 6, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'kode' => 'komite', 'nama' => 'Sidang Komite Klaim', 'urutan' => 7, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'kode' => 'disetujui', 'nama' => 'Disetujui Komite (TTE SK)', 'urutan' => 8, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'kode' => 'ditolak', 'nama' => 'Klaim Ditolak', 'urutan' => 9, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'kode' => 'memo', 'nama' => 'Penerbitan Memo Bayar', 'urutan' => 10, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'kode' => 'dibayar', 'nama' => 'Pembayaran Selesai', 'urutan' => 11, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'kode' => 'selesai', 'nama' => 'Klaim Selesai', 'urutan' => 12, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'kode' => 'banding', 'nama' => 'Proses Banding', 'urutan' => 13, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Jenis Dokumens
        DB::table('jenis_dokumens')->insert([
            ['id' => 1, 'kode' => 'doc_sertifikat', 'nama' => 'Sertifikat Penjaminan (Asli/Copy)', 'wajib' => 1, 'urutan' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode' => 'doc_perjanjian', 'nama' => 'Perjanjian Kredit', 'wajib' => 1, 'urutan' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'kode' => 'doc_rekening', 'nama' => 'Rekening Koran Debitur (3 bulan terakhir)', 'wajib' => 1, 'urutan' => 3, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'kode' => 'doc_surat_tagihan', 'nama' => 'Surat Peringatan / Tagihan 1-3', 'wajib' => 1, 'urutan' => 4, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'kode' => 'doc_ktp', 'nama' => 'KTP & KK Debitur', 'wajib' => 1, 'urutan' => 5, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'kode' => 'doc_analisa', 'nama' => 'Analisa Kredit Awal', 'wajib' => 1, 'urutan' => 6, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'kode' => 'doc_kunjungan', 'nama' => 'Laporan Kunjungan / Penagihan', 'wajib' => 0, 'urutan' => 7, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'kode' => 'doc_kematian', 'nama' => 'Surat Keterangan Kematian (khusus meninggal)', 'wajib' => 0, 'urutan' => 8, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 7. Pejabat Komite
        DB::table('pejabat_komites')->insert([
            ['id' => 1, 'nip' => '19750812-JKD-01', 'nama' => 'Drs. Hendra Setiawan, MM', 'jabatan' => 'Kepala Bagian Klaim & Subrogasi', 'urutan' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nip' => '19780315-JKD-04', 'nama' => 'Ahmad Hidayat, SE, Ak', 'jabatan' => 'Kepala Divisi Operasional', 'urutan' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nip' => '19691120-JKD-00', 'nama' => 'Ir. Bambang Suherman, MBA', 'jabatan' => 'Direktur Operasional & Teknik', 'urutan' => 3, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 8. Sertifikat Penjaminan
        DB::table('sertifikat_penjaminans')->insert([
            ['id' => 1, 'nomor_sp' => 'SP-2026-JB-000001', 'nama_debitur' => 'Ahmad Faisal', 'tanggal_akad' => '2024-01-15', 'plafon_kredit' => 100000000, 'baki_debet' => 85000000, 'produk_id' => 1, 'mitra_id' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nomor_sp' => 'SP-2026-JB-000004', 'nama_debitur' => 'Sugeng Priyanto', 'tanggal_akad' => '2024-03-20', 'plafon_kredit' => 75000000, 'baki_debet' => 65000000, 'produk_id' => 1, 'mitra_id' => 1, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nomor_sp' => 'SP-2026-JB-000007', 'nama_debitur' => 'Dewi Rahmawati', 'tanggal_akad' => '2024-05-10', 'plafon_kredit' => 150000000, 'baki_debet' => 120000000, 'produk_id' => 2, 'mitra_id' => 2, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 9. Klaims
        DB::table('klaims')->insert([
            ['id' => 1, 'kode_klaim' => 'KLM-2026-0001', 'sertifikat_penjaminan_id' => 1, 'mitra_id' => 1, 'penyebab_klaim_id' => 1, 'status_id' => 4, 'baki_debet_klaim' => 85000000, 'cover_percentage_snapshot' => 0.70, 'nilai_klaim' => 59500000, 'tanggal_pengajuan' => '2026-08-02', 'tanggal_macet' => '2026-06-01', 'catatan_perbaikan' => 'Mohon perbaiki dokumen Scan KTP & Rekening Koran sesuai catatan per berkas.', 'draft_only' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'kode_klaim' => 'KLM-2026-0002', 'sertifikat_penjaminan_id' => 2, 'mitra_id' => 1, 'penyebab_klaim_id' => 1, 'status_id' => 3, 'baki_debet_klaim' => 65000000, 'cover_percentage_snapshot' => 0.70, 'nilai_klaim' => 45500000, 'tanggal_pengajuan' => '2026-08-02', 'tanggal_macet' => '2026-05-15', 'catatan_perbaikan' => null, 'draft_only' => 0, 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 10. Documents (KLM-2026-0001 doc 3 & 5 marked is_replaced = 1)
        DB::table('klaim_documents')->insert([
            ['id' => 1, 'klaim_id' => 1, 'jenis_dokumen_id' => 1, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Sertifikat_Ahmad_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'klaim_id' => 1, 'jenis_dokumen_id' => 2, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'PK_Ahmad_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'klaim_id' => 1, 'jenis_dokumen_id' => 3, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Rekening_Koran_Faisal_Revisi.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'tidak_sesuai', 'catatan_pemeriksaan' => 'Rekening koran 3 bulan terakhir kurang bulan ke-3. Mohon unggah lembar bulan ke-3.', 'is_replaced' => 1, 'replaced_at' => now(), 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'klaim_id' => 1, 'jenis_dokumen_id' => 4, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Surat_Tagihan_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'klaim_id' => 1, 'jenis_dokumen_id' => 5, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'KTP_KK_Faisal_Revisi.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'tidak_sesuai', 'catatan_pemeriksaan' => 'Scan KTP & KK debitur buram dan NIK tidak dapat terverifikasi. Mohon unggah ulang scan KTP asli.', 'is_replaced' => 1, 'replaced_at' => now(), 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'klaim_id' => 1, 'jenis_dokumen_id' => 6, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Analisa_Kredit_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'klaim_id' => 1, 'jenis_dokumen_id' => 7, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Laporan_Penagihan_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'klaim_id' => 1, 'jenis_dokumen_id' => 8, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => 'Surat_Kematian_Faisal.pdf', 'file_type' => 'application/pdf', 'kesesuaian' => 'sesuai', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        for ($i = 1; $i <= 8; $i++) {
            DB::table('klaim_documents')->insert([
                'id' => 8 + $i, 'klaim_id' => 2, 'jenis_dokumen_id' => $i, 'ada' => 1, 'file_path' => '/documents/uploaded_sample.pdf', 'file_name' => "Document_{$i}_Sugeng.pdf", 'file_type' => 'application/pdf', 'kesesuaian' => 'belum_diperiksa', 'catatan_pemeriksaan' => '', 'is_replaced' => 0, 'replaced_at' => null, 'uploaded_at' => now(), 'created_at' => now(), 'updated_at' => now()
            ]);
        }

        // 11. Status History
        DB::table('klaim_status_histories')->insert([
            ['klaim_id' => 1, 'waktu' => now(), 'actor_user_id' => 2, 'actor_nama' => 'Budi Santoso (Bank BJB)', 'actor_peran' => 'mitra', 'aksi' => 'Membuat draft klaim baru', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['klaim_id' => 1, 'waktu' => now(), 'actor_user_id' => 2, 'actor_nama' => 'Budi Santoso (Bank BJB)', 'actor_peran' => 'mitra', 'aksi' => 'Mengajukan berkas klaim lengkap (Status: Diajukan)', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['klaim_id' => 1, 'waktu' => now(), 'actor_user_id' => 3, 'actor_nama' => 'Andi Wijaya (Staf Klaim)', 'actor_peran' => 'klaim', 'aksi' => 'Mengambil klaim untuk diverifikasi', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['klaim_id' => 1, 'waktu' => now(), 'actor_user_id' => 3, 'actor_nama' => 'Andi Wijaya (Staf Klaim)', 'actor_peran' => 'klaim', 'aksi' => 'Berkas tidak lengkap. Catatan verifikasi: Mohon perbaiki dokumen Scan KTP & Rekening Koran', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['klaim_id' => 1, 'waktu' => now(), 'actor_user_id' => 2, 'actor_nama' => 'Budi Santoso (Bank BJB)', 'actor_peran' => 'mitra', 'aksi' => 'Mengunggah berkas perbaikan baru (Rekening Koran & KTP/KK) dan mengajukan ulang klaim', 'active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
