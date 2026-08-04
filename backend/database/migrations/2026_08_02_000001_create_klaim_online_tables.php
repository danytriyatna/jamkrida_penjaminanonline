<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users
        Schema::create('app_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->integer('role_id');
            $table->string('role_name');
            $table->integer('mitra_id')->nullable();
            $table->string('nip')->nullable();
            $table->string('jabatan')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 2. Mitras
        Schema::create('mitras', function (Blueprint $table) {
            $table->id();
            $table->string('kode_mitra')->unique();
            $table->string('nama_mitra');
            $table->string('jenis_mitra')->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 3. Produk Penjaminan
        Schema::create('produk_penjaminans', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->double('cover_percentage');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 4. Penyebab Klaim
        Schema::create('penyebab_klaims', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama_penyebab');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 5. Klaim Statuses
        Schema::create('klaim_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->integer('urutan');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 6. Jenis Dokumens
        Schema::create('jenis_dokumens', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->boolean('wajib')->default(true);
            $table->integer('urutan');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 7. Pejabat Komites
        Schema::create('pejabat_komites', function (Blueprint $table) {
            $table->id();
            $table->string('nip');
            $table->string('nama');
            $table->string('jabatan');
            $table->integer('urutan');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 8. Sertifikat Penjaminan
        Schema::create('sertifikat_penjaminans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sp')->unique();
            $table->string('nama_debitur');
            $table->date('tanggal_akad')->nullable();
            $table->double('plafon_kredit');
            $table->double('baki_debet');
            $table->unsignedBigInteger('produk_id')->nullable();
            $table->unsignedBigInteger('mitra_id')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 9. Klaims
        Schema::create('klaims', function (Blueprint $table) {
            $table->id();
            $table->string('kode_klaim')->unique();
            $table->unsignedBigInteger('sertifikat_penjaminan_id');
            $table->unsignedBigInteger('mitra_id');
            $table->unsignedBigInteger('penyebab_klaim_id');
            $table->unsignedBigInteger('status_id');
            $table->double('baki_debet_klaim');
            $table->double('cover_percentage_snapshot')->default(0.70);
            $table->double('nilai_klaim');
            $table->date('tanggal_pengajuan')->nullable();
            $table->date('tanggal_macet')->nullable();
            $table->text('catatan_perbaikan')->nullable();
            $table->boolean('is_resubmitted')->default(false);
            $table->boolean('draft_only')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 10. Klaim Documents
        Schema::create('klaim_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->unsignedBigInteger('jenis_dokumen_id');
            $table->boolean('ada')->default(false);
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->string('kesesuaian')->default('belum_diperiksa');
            $table->text('catatan_pemeriksaan')->nullable();
            $table->boolean('is_replaced')->default(false);
            $table->timestamp('replaced_at')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();
        });

        // 11. Klaim Status History
        Schema::create('klaim_status_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->timestamp('waktu');
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->string('actor_nama')->nullable();
            $table->string('actor_peran')->nullable();
            $table->text('aksi');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // 12. Surveys
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->string('nomor_permohonan')->nullable();
            $table->date('tanggal_survey')->nullable();
            $table->text('catatan')->nullable();
            $table->string('dokumen_laporan_path')->nullable();
            $table->boolean('approved_by_mitra')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surveys');
        Schema::dropIfExists('klaim_status_histories');
        Schema::dropIfExists('klaim_documents');
        Schema::dropIfExists('klaims');
        Schema::dropIfExists('sertifikat_penjaminans');
        Schema::dropIfExists('pejabat_komites');
        Schema::dropIfExists('jenis_dokumens');
        Schema::dropIfExists('klaim_statuses');
        Schema::dropIfExists('penyebab_klaims');
        Schema::dropIfExists('produk_penjaminans');
        Schema::dropIfExists('mitras');
        Schema::dropIfExists('app_users');
    }
};
