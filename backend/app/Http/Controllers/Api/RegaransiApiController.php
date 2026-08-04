<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegaransiApiController extends Controller
{
    // ============ REGARANSI JIWA ============

    public function jiwaIndex(Request $request)
    {
        $query = DB::table('regaransi_jiwas');

        if ($request->filled('tgl_awal')) {
            $query->whereDate('created_at', '>=', $request->query('tgl_awal'));
        }
        if ($request->filled('tgl_akhir')) {
            $query->whereDate('created_at', '<=', $request->query('tgl_akhir'));
        }
        if ($request->filled('status')) {
            $statuses = explode(',', $request->query('status'));
            $query->whereIn('status', $statuses);
        }

        $data = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function jiwaAjukan(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        DB::table('regaransi_jiwas')->whereIn('id', $request->input('ids'))->update([
            'status' => 'PENGAJUAN',
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => count($request->input('ids')) . ' data regaransi jiwa berhasil diajukan.',
        ]);
    }

    public function jiwaSetujui(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'no_persetujuan' => 'required|string',
            'tgl_persetujuan' => 'required|date',
        ]);

        DB::table('regaransi_jiwas')->whereIn('id', $request->input('ids'))->update([
            'status' => 'DISETUJUI',
            'no_persetujuan' => $request->input('no_persetujuan'),
            'tgl_persetujuan' => $request->input('tgl_persetujuan'),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => count($request->input('ids')) . ' data regaransi jiwa berhasil disetujui.',
        ]);
    }

    public function jiwaBayar(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'no_transaksi' => 'required|string',
            'tgl_bayar' => 'required|date',
        ]);

        $filePath = null;
        if ($request->hasFile('file_bukti')) {
            $path = $request->file('file_bukti')->store('uploads/regaransi', 'public');
            $filePath = '/storage/' . $path;
        }

        $ids = $request->input('ids');
        foreach ($ids as $id) {
            $item = DB::table('regaransi_jiwas')->where('id', $id)->first();
            if ($item) {
                DB::table('regaransi_jiwas')->where('id', $id)->update([
                    'status' => 'PAID',
                    'no_transaksi_bayar' => $request->input('no_transaksi'),
                    'tgl_bayar' => $request->input('tgl_bayar'),
                    'metode_bayar' => 'Transfer Bank',
                    'bukti_bayar_file' => $filePath ?: ('Bukti_Bayar_' . $item->id . '.pdf'),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => count($ids) . ' tagihan premi regaransi jiwa berhasil dibayar.',
        ]);
    }

    // ============ REGARANSI KREDIT MACET ============

    public function kreditIndex(Request $request)
    {
        $query = DB::table('regaransi_kredits');

        if ($request->filled('tgl_awal')) {
            $query->whereDate('created_at', '>=', $request->query('tgl_awal'));
        }
        if ($request->filled('tgl_akhir')) {
            $query->whereDate('created_at', '<=', $request->query('tgl_akhir'));
        }
        if ($request->filled('status')) {
            $statuses = explode(',', $request->query('status'));
            $query->whereIn('status', $statuses);
        }

        $data = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function kreditAjukan(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        DB::table('regaransi_kredits')->whereIn('id', $request->input('ids'))->update([
            'status' => 'PENGAJUAN',
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => count($request->input('ids')) . ' data klaim kredit macet berhasil diajukan.',
        ]);
    }

    public function kreditSetujui(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'no_persetujuan' => 'required|string',
            'tgl_persetujuan' => 'required|date',
        ]);

        $ids = $request->input('ids');
        foreach ($ids as $id) {
            $item = DB::table('regaransi_kredits')->where('id', $id)->first();
            if ($item) {
                DB::table('regaransi_kredits')->where('id', $id)->update([
                    'status' => 'DISETUJUI',
                    'no_persetujuan' => $request->input('no_persetujuan'),
                    'tgl_persetujuan' => $request->input('tgl_persetujuan'),
                    'nominal_disetujui' => $item->nominal_klaim_regaransi,
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => count($ids) . ' data klaim kredit macet berhasil disetujui.',
        ]);
    }

    public function kreditCairkan(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'no_transaksi' => 'required|string',
            'tgl_disbursement' => 'required|date',
        ]);

        $filePath = null;
        if ($request->hasFile('file_bukti')) {
            $path = $request->file('file_bukti')->store('uploads/regaransi', 'public');
            $filePath = '/storage/' . $path;
        }

        $ids = $request->input('ids');
        foreach ($ids as $id) {
            $item = DB::table('regaransi_kredits')->where('id', $id)->first();
            if ($item) {
                DB::table('regaransi_kredits')->where('id', $id)->update([
                    'status' => 'PAID',
                    'no_transaksi_disbursement' => $request->input('no_transaksi'),
                    'tgl_disbursement' => $request->input('tgl_disbursement'),
                    'bukti_bayar_file' => $filePath ?: ('Bukti_Disbursement_' . $item->id . '.pdf'),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => count($ids) . ' data klaim kredit macet berhasil dicairkan (Paid).',
        ]);
    }
}
