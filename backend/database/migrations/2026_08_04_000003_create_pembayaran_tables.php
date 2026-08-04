<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memo_pembayarans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->string('nomor_memo')->nullable();
            $table->date('tanggal_memo')->nullable();
            $table->double('nominal_bayar')->nullable();
            $table->string('bank_penerima')->nullable();
            $table->string('no_rekening_penerima')->nullable();
            $table->string('nama_penerima')->nullable();
            $table->string('status')->default('disetujui');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->string('nomor_voucher')->nullable();
            $table->date('tanggal_bayar')->nullable();
            $table->double('nominal_transfer')->nullable();
            $table->string('bank_pengirim')->nullable();
            $table->string('no_rekening_pengirim')->nullable();
            $table->string('bukti_transfer_path')->nullable();
            $table->string('disetujui_oleh')->nullable();
            $table->string('status')->default('selesai');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('bandings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->date('tanggal_pengajuan')->nullable();
            $table->text('alasan')->nullable();
            $table->string('status')->default('diajukan');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bandings');
        Schema::dropIfExists('pembayarans');
        Schema::dropIfExists('memo_pembayarans');
    }
};
