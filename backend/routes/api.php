<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\KlaimApiController;
use App\Http\Controllers\Api\UtilityApiController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\RegaransiApiController;

Route::post('/login', [AuthApiController::class, 'login']);
Route::post('/logout', [AuthApiController::class, 'logout']);
Route::get('/user', [AuthApiController::class, 'me']);

Route::get('/klaims', [KlaimApiController::class, 'index']);
Route::get('/klaims/{id}', [KlaimApiController::class, 'show']);
Route::post('/klaims', [KlaimApiController::class, 'store']);
Route::post('/klaims/{id}/documents', [KlaimApiController::class, 'uploadDocument']);
Route::post('/klaims/{id}/verify-document', [KlaimApiController::class, 'verifyDocument']);
Route::post('/klaims/{id}/verifikasi-dokumen', [KlaimApiController::class, 'verifikasiAction']);
Route::post('/klaims/{id}/submit', [KlaimApiController::class, 'submit']);
Route::post('/klaims/{id}/ambil-verifikasi', [KlaimApiController::class, 'ambilVerifikasi']);
Route::post('/klaims/{id}/survei-laporan', [KlaimApiController::class, 'surveiLaporan']);
Route::post('/klaims/{id}/survei-selesai', [KlaimApiController::class, 'surveiSelesai']);
Route::post('/klaims/{id}/survei-konfirmasi', [KlaimApiController::class, 'surveiKonfirmasi']);
Route::post('/klaims/{id}/ajukan-komite', [KlaimApiController::class, 'ajukanKomite']);
Route::post('/klaims/{id}/setuju-keputusan', [KlaimApiController::class, 'setujuKeputusan']);
Route::post('/klaims/{id}/ajukan-banding', [KlaimApiController::class, 'ajukanBanding']);
Route::post('/klaims/{id}/selesai-banding', [KlaimApiController::class, 'selesaiBanding']);
Route::post('/klaims/{id}/esign', [KlaimApiController::class, 'esign']);
Route::post('/klaims/{id}/terbit-memo', [KlaimApiController::class, 'terbitMemo']);
Route::post('/klaims/{id}/esign-memo', [KlaimApiController::class, 'esignMemo']);
Route::post('/klaims/{id}/bayar', [KlaimApiController::class, 'bayar']);
Route::post('/klaims/{id}/konfirmasi-bukti', [KlaimApiController::class, 'konfirmasiBukti']);

Route::get('/sertifikat-penjaminans', function () {
    return response()->json(['data' => \Illuminate\Support\Facades\DB::table('sertifikat_penjaminans')->where('active', 1)->get()]);
});

Route::get('/jenis-dokumens', function () {
    return response()->json(['data' => \Illuminate\Support\Facades\DB::table('jenis_dokumens')->where('active', 1)->orderBy('urutan')->get()]);
});

Route::get('/pejabat-komites', function () {
    return response()->json(['data' => \Illuminate\Support\Facades\DB::table('pejabat_komites')->where('active', 1)->orderBy('urutan')->get()]);
});

// Utility: Modules, Roles, Users
Route::get('/utility/modules', [UtilityApiController::class, 'modules']);
Route::get('/utility/roles', [UtilityApiController::class, 'rolesIndex']);
Route::get('/utility/roles/{id}', [UtilityApiController::class, 'rolesShow']);
Route::post('/utility/roles', [UtilityApiController::class, 'rolesStore']);
Route::put('/utility/roles/{id}', [UtilityApiController::class, 'rolesUpdate']);
Route::delete('/utility/roles/{id}', [UtilityApiController::class, 'rolesDeactivate']);
Route::get('/utility/users', [UtilityApiController::class, 'usersIndex']);
Route::post('/utility/users', [UtilityApiController::class, 'usersStore']);
Route::put('/utility/users/{id}', [UtilityApiController::class, 'usersUpdate']);
Route::delete('/utility/users/{id}', [UtilityApiController::class, 'usersToggleActive']);

// Referensi: Mitras
Route::get('/referensi/mitras', [UtilityApiController::class, 'mitras']);

// Regaransi: Asuransi Jiwa
Route::get('/regaransi-jiwa', [RegaransiApiController::class, 'jiwaIndex']);
Route::post('/regaransi-jiwa/ajukan', [RegaransiApiController::class, 'jiwaAjukan']);
Route::post('/regaransi-jiwa/setujui', [RegaransiApiController::class, 'jiwaSetujui']);
Route::post('/regaransi-jiwa/bayar', [RegaransiApiController::class, 'jiwaBayar']);

// Regaransi: Kredit Macet
Route::get('/regaransi-kredit', [RegaransiApiController::class, 'kreditIndex']);
Route::post('/regaransi-kredit/ajukan', [RegaransiApiController::class, 'kreditAjukan']);
Route::post('/regaransi-kredit/setujui', [RegaransiApiController::class, 'kreditSetujui']);
Route::post('/regaransi-kredit/cairkan', [RegaransiApiController::class, 'kreditCairkan']);
