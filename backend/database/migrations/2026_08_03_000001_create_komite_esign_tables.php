<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Berita Acara Sidang Komite
        Schema::create('berita_acaras', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('klaim_id');
            $table->string('nomor_ba')->nullable();
            $table->date('tanggal_ba')->nullable();
            $table->text('kesimpulan')->nullable();
            $table->double('usulan_nilai_klaim')->nullable();
            $table->string('status')->default('proses'); // proses, disetujui, ditolak
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // E-sign Signatures (dipakai untuk Berita Acara & Surat Keputusan)
        Schema::create('esign_signatures', function (Blueprint $table) {
            $table->id();
            $table->string('dokumen_type'); // 'berita_acara' | 'surat_keputusan'
            $table->unsignedBigInteger('dokumen_id');
            $table->unsignedBigInteger('pejabat_komite_id');
            $table->string('status')->default('pending'); // pending, signed, rejected
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esign_signatures');
        Schema::dropIfExists('berita_acaras');
    }
};
