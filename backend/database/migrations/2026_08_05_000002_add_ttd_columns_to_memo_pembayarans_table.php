<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('memo_pembayarans', function (Blueprint $table) {
            $table->string('disetujui_oleh')->nullable()->after('status');
            $table->timestamp('tanggal_ttd')->nullable()->after('disetujui_oleh');
        });
    }

    public function down(): void
    {
        Schema::table('memo_pembayarans', function (Blueprint $table) {
            $table->dropColumn(['disetujui_oleh', 'tanggal_ttd']);
        });
    }
};
