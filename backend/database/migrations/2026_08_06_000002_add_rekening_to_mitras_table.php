<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->string('bank_penerima')->nullable()->after('telepon');
            $table->string('no_rekening_penerima')->nullable()->after('bank_penerima');
        });

        // Backfill rekening tujuan pencairan dana klaim untuk mitra yang sudah ada,
        // supaya form Memo Bayar punya data default yang masuk akal (bukan placeholder kosong).
        DB::table('mitras')->where('id', 1)->update([
            'bank_penerima' => 'Bank BJB',
            'no_rekening_penerima' => '0012345678',
        ]);
        DB::table('mitras')->where('id', 2)->update([
            'bank_penerima' => 'Bank BJB',
            'no_rekening_penerima' => '0087654321',
        ]);
    }

    public function down(): void
    {
        Schema::table('mitras', function (Blueprint $table) {
            $table->dropColumn(['bank_penerima', 'no_rekening_penerima']);
        });
    }
};
