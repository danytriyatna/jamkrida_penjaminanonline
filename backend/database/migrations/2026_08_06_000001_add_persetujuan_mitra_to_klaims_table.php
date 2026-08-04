<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('klaims', function (Blueprint $table) {
            $table->boolean('disetujui_confirmed_by_mitra')->default(false)->after('status_id');
        });
    }

    public function down(): void
    {
        Schema::table('klaims', function (Blueprint $table) {
            $table->dropColumn('disetujui_confirmed_by_mitra');
        });
    }
};
