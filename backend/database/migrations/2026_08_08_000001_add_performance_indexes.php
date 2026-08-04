<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tidak ada satu pun kolom klaim_id/status_id/dsb yang punya index sejak awal (semua tabel
// dibuat dengan unsignedBigInteger() polos, tanpa ->index() atau foreign key constraint).
// Akibatnya setiap where('klaim_id', ...) / whereIn(...) di KlaimApiController - yang dipanggil
// belasan kali per baris klaim - melakukan full table scan. Migration ini murni menambah index,
// tidak mengubah data maupun struktur kolom sama sekali, jadi aman dijalankan kapan saja.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('klaims', function (Blueprint $table) {
            $table->index('status_id');
            $table->index('mitra_id');
            $table->index('sertifikat_penjaminan_id');
            $table->index('penyebab_klaim_id');
            $table->index(['active', 'status_id']);
        });

        Schema::table('klaim_documents', function (Blueprint $table) {
            $table->index('klaim_id');
            $table->index('jenis_dokumen_id');
        });

        Schema::table('klaim_status_histories', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('surveys', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('berita_acaras', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('surat_keputusans', function (Blueprint $table) {
            $table->index('klaim_id');
            $table->index('berita_acara_id');
        });

        Schema::table('esign_signatures', function (Blueprint $table) {
            $table->index(['dokumen_type', 'dokumen_id']);
            $table->index('pejabat_komite_id');
        });

        Schema::table('memo_pembayarans', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('pembayarans', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('bandings', function (Blueprint $table) {
            $table->index('klaim_id');
        });

        Schema::table('role_module_permissions', function (Blueprint $table) {
            $table->index('role_id');
            $table->index('module_id');
        });

        Schema::table('modules', function (Blueprint $table) {
            $table->index('parent_id');
        });

        Schema::table('app_users', function (Blueprint $table) {
            $table->index('role_id');
            $table->index('mitra_id');
            $table->index('pejabat_komite_id');
        });
    }

    public function down(): void
    {
        Schema::table('klaims', function (Blueprint $table) {
            $table->dropIndex(['status_id']);
            $table->dropIndex(['mitra_id']);
            $table->dropIndex(['sertifikat_penjaminan_id']);
            $table->dropIndex(['penyebab_klaim_id']);
            $table->dropIndex(['active', 'status_id']);
        });
        Schema::table('klaim_documents', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
            $table->dropIndex(['jenis_dokumen_id']);
        });
        Schema::table('klaim_status_histories', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('berita_acaras', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('surat_keputusans', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
            $table->dropIndex(['berita_acara_id']);
        });
        Schema::table('esign_signatures', function (Blueprint $table) {
            $table->dropIndex(['dokumen_type', 'dokumen_id']);
            $table->dropIndex(['pejabat_komite_id']);
        });
        Schema::table('memo_pembayarans', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('pembayarans', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('bandings', function (Blueprint $table) {
            $table->dropIndex(['klaim_id']);
        });
        Schema::table('role_module_permissions', function (Blueprint $table) {
            $table->dropIndex(['role_id']);
            $table->dropIndex(['module_id']);
        });
        Schema::table('modules', function (Blueprint $table) {
            $table->dropIndex(['parent_id']);
        });
        Schema::table('app_users', function (Blueprint $table) {
            $table->dropIndex(['role_id']);
            $table->dropIndex(['mitra_id']);
            $table->dropIndex(['pejabat_komite_id']);
        });
    }
};
