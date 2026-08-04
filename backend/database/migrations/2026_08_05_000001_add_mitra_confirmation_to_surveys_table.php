<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->boolean('dengan_mitra')->default(true)->after('klaim_id');
            $table->boolean('konfirmasi_mitra')->default(false)->after('dengan_mitra');
        });
    }

    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropColumn(['dengan_mitra', 'konfirmasi_mitra']);
        });
    }
};
