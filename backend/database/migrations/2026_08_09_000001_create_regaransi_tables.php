<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regaransi_jiwas', function (Blueprint $table) {
            $table->id();
            $table->string('no_regaransi')->unique();
            $table->string('nama_peserta');
            $table->string('nik')->nullable();
            $table->date('tgl_lahir')->nullable();
            $table->string('mitra_reasuradur')->nullable();
            $table->double('uang_pertanggungan')->default(0);
            $table->double('premi_regaransi')->default(0);
            $table->double('share_percentage')->default(50);
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_akhir')->nullable();
            $table->string('periode')->nullable();
            $table->string('status_data')->default('Include');
            $table->string('status')->default('AVAILABLE');
            $table->string('no_persetujuan')->nullable();
            $table->date('tgl_persetujuan')->nullable();
            $table->text('catatan_underwriting')->nullable();
            $table->string('no_transaksi_bayar')->nullable();
            $table->date('tgl_bayar')->nullable();
            $table->string('metode_bayar')->nullable();
            $table->string('bukti_bayar_file')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
            $table->index('periode');
        });

        Schema::create('regaransi_kredits', function (Blueprint $table) {
            $table->id();
            $table->string('no_regaransi')->unique();
            $table->string('no_sertifikat_penjaminan')->nullable();
            $table->string('nama_debitur');
            $table->string('bank_cedant')->nullable();
            $table->double('plafond_kredit')->default(0);
            $table->double('outstanding_tunggakan')->default(0);
            $table->double('nominal_klaim_regaransi')->default(0);
            $table->string('kolektibilitas')->nullable();
            $table->text('alasan_klaim')->nullable();
            $table->string('periode')->nullable();
            $table->string('status_data')->default('Include');
            $table->string('status')->default('AVAILABLE');
            $table->string('no_persetujuan')->nullable();
            $table->date('tgl_persetujuan')->nullable();
            $table->double('nominal_disetujui')->nullable();
            $table->string('bank_tujuan')->nullable();
            $table->string('no_rekening')->nullable();
            $table->text('catatan_komite')->nullable();
            $table->string('no_transaksi_disbursement')->nullable();
            $table->date('tgl_disbursement')->nullable();
            $table->string('bukti_bayar_file')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
            $table->index('periode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regaransi_kredits');
        Schema::dropIfExists('regaransi_jiwas');
    }
};
