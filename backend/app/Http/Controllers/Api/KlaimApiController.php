<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class KlaimApiController extends Controller
{
    private function enrichKlaim($k)
    {
        if (!$k) return null;

        $sp = DB::table('sertifikat_penjaminans')->where('id', $k->sertifikat_penjaminan_id)->first();
        $mitra = DB::table('mitras')->where('id', $k->mitra_id)->first();
        $penyebab = DB::table('penyebab_klaims')->where('id', $k->penyebab_klaim_id)->first();
        $status = DB::table('klaim_statuses')->where('id', $k->status_id)->first();

        $rawDocs = DB::table('klaim_documents')->where('klaim_id', $k->id)->get();
        $docs = $rawDocs->map(function ($d) {
            $j = DB::table('jenis_dokumens')->where('id', $d->jenis_dokumen_id)->first();
            return [
                'id' => $d->id,
                'klaimId' => $d->klaim_id,
                'jenisDokumenId' => $d->jenis_dokumen_id,
                'ada' => (bool)$d->ada,
                'filePath' => $d->file_path,
                'fileName' => $d->file_name,
                'fileType' => $d->file_type,
                'kesesuaian' => $d->kesesuaian,
                'catatanPemeriksaan' => $d->catatan_pemeriksaan,
                'isReplaced' => (bool)$d->is_replaced,
                'replacedAt' => $d->replaced_at,
                'uploadedAt' => $d->uploaded_at,
                'jenisDokumen' => $j ? [
                    'id' => $j->id,
                    'kode' => $j->kode,
                    'nama' => $j->nama,
                    'wajib' => (bool)$j->wajib,
                    'urutan' => $j->urutan
                ] : null
            ];
        });

        $history = DB::table('klaim_status_histories')
            ->where('klaim_id', $k->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($h) {
                return [
                    'id' => $h->id,
                    'klaimId' => $h->klaim_id,
                    'waktu' => $h->waktu,
                    'actorUserId' => $h->actor_user_id,
                    'actorNama' => $h->actor_nama,
                    'actorPeran' => $h->actor_peran,
                    'aksi' => $h->aksi,
                    'active' => (bool)$h->active
                ];
            });

        $survey = DB::table('surveys')->where('klaim_id', $k->id)->first();
        $hasReplacedDocs = $docs->contains('isReplaced', true);

        $ba = DB::table('berita_acaras')->where('klaim_id', $k->id)->orderByDesc('id')->first();
        $sk = DB::table('surat_keputusans')->where('klaim_id', $k->id)->orderByDesc('id')->first();

        // Dokumen aktif untuk sesi E-sign & tampilan dokumen adalah yang paling baru diterbitkan.
        // Normalnya SK menyusul BA (SK lebih baru -> aktif). Tapi kalau klaim pernah di-Banding,
        // Berita Acara BARU akan diterbitkan lagi setelah SK lama ada - dalam kondisi ini BA yang
        // lebih baru itu yang harus jadi aktif kembali (SK lama dianggap sudah tidak berlaku).
        $skIsActive = $sk && (!$ba || $sk->created_at >= $ba->created_at);
        $esignDocType = $skIsActive ? 'surat_keputusan' : 'berita_acara';
        $esignDocId = $skIsActive ? $sk->id : ($ba->id ?? null);

        $esignSignatures = [];
        if ($esignDocId) {
            $esignSignatures = DB::table('esign_signatures')
                ->where('dokumen_type', $esignDocType)
                ->where('dokumen_id', $esignDocId)
                ->orderBy('pejabat_komite_id')
                ->get()
                ->map(function ($s) {
                    $pj = DB::table('pejabat_komites')->where('id', $s->pejabat_komite_id)->first();
                    return [
                        'id' => $s->id,
                        'dokumenType' => $s->dokumen_type,
                        'dokumenId' => $s->dokumen_id,
                        'pejabatKomiteId' => $s->pejabat_komite_id,
                        'status' => $s->status,
                        'signedAt' => $s->signed_at,
                        'pejabatKomite' => $pj ? [
                            'id' => $pj->id,
                            'nip' => $pj->nip,
                            'nama' => $pj->nama,
                            'jabatan' => $pj->jabatan,
                            'urutan' => $pj->urutan,
                        ] : null,
                    ];
                })->values();
        }

        return [
            'id' => $k->id,
            'kodeKlaim' => $k->kode_klaim,
            'sertifikatPenjaminanId' => $k->sertifikat_penjaminan_id,
            'mitraId' => $k->mitra_id,
            'penyebabKlaimId' => $k->penyebab_klaim_id,
            'statusId' => $k->status_id,
            'bakiDebetKlaim' => $k->baki_debet_klaim,
            'coverPercentageSnapshot' => $k->cover_percentage_snapshot,
            'nilaiKlaim' => $k->nilai_klaim,
            'tanggalPengajuan' => $k->tanggal_pengajuan,
            'tanggalMacet' => $k->tanggal_macet,
            'catatanPerbaikan' => $k->catatan_perbaikan,
            'isResubmitted' => (bool) ($k->is_resubmitted ?? false),
            'disetujuiConfirmedByMitra' => (bool) ($k->disetujui_confirmed_by_mitra ?? false),
            'hasReplacedDocs' => $hasReplacedDocs,
            'draftOnly' => (bool)$k->draft_only,
            'active' => (bool)$k->active,
            'createdAt' => $k->created_at,
            'updatedAt' => $k->updated_at,
            'sertifikatPenjaminan' => $sp ? [
                'id' => $sp->id,
                'nomorSp' => $sp->nomor_sp,
                'namaDebitur' => $sp->nama_debitur,
                'tanggalAkad' => $sp->tanggal_akad,
                'plafonKredit' => $sp->plafon_kredit,
                'bakiDebet' => $sp->baki_debet,
                'produkId' => $sp->produk_id,
                'mitraId' => $sp->mitra_id,
            ] : null,
            'mitra' => $mitra ? [
                'id' => $mitra->id,
                'kodeMitra' => $mitra->kode_mitra,
                'namaMitra' => $mitra->nama_mitra,
                'jenisMitra' => $mitra->jenis_mitra,
                'bankPenerima' => $mitra->bank_penerima ?? null,
                'noRekeningPenerima' => $mitra->no_rekening_penerima ?? null,
            ] : null,
            'penyebabKlaim' => $penyebab ? [
                'id' => $penyebab->id,
                'kode' => $penyebab->kode,
                'namaPenyebab' => $penyebab->nama_penyebab,
            ] : null,
            'status' => $status ? [
                'id' => $status->id,
                'kode' => $status->kode,
                'nama' => $status->nama,
                'urutan' => $status->urutan,
            ] : null,
            'documents' => $docs,
            'statusHistory' => $history,
            'survey' => $survey ? [
                'id' => $survey->id,
                'nomorPermohonan' => $survey->nomor_permohonan,
                'tanggalSurvey' => $survey->tanggal_survey,
                'catatan' => $survey->catatan,
                'dokumenLaporanPath' => $survey->dokumen_laporan_path,
                'approvedByMitra' => (bool)$survey->approved_by_mitra,
                'denganMitra' => (bool)($survey->dengan_mitra ?? true),
                'konfirmasiMitra' => (bool)($survey->konfirmasi_mitra ?? false)
            ] : null,
            'beritaAcara' => $ba ? [
                'id' => $ba->id,
                'klaimId' => $ba->klaim_id,
                'nomorBa' => $ba->nomor_ba,
                'tanggalBa' => $ba->tanggal_ba,
                'kesimpulan' => $ba->kesimpulan,
                'usulanNilaiKlaim' => $ba->usulan_nilai_klaim,
                'status' => $ba->status,
            ] : null,
            'suratKeputusan' => ($sk && $skIsActive) ? [
                'id' => $sk->id,
                'klaimId' => $sk->klaim_id,
                'nomorSk' => $sk->nomor_sk,
                'tanggalSk' => $sk->tanggal_sk,
                'nilaiDisetujui' => $sk->nilai_disetujui,
                'status' => $sk->status,
            ] : null,
            'esignSignatures' => $esignSignatures,
            'memoPembayaran' => (function () use ($k) {
                $memo = DB::table('memo_pembayarans')->where('klaim_id', $k->id)->orderByDesc('id')->first();
                if (!$memo) return null;
                return [
                    'id' => $memo->id,
                    'klaimId' => $memo->klaim_id,
                    'nomorMemo' => $memo->nomor_memo,
                    'tanggalMemo' => $memo->tanggal_memo,
                    'nominalBayar' => $memo->nominal_bayar,
                    'bankPenerima' => $memo->bank_penerima,
                    'noRekeningPenerima' => $memo->no_rekening_penerima,
                    'namaPenerima' => $memo->nama_penerima,
                    'status' => $memo->status,
                    'disetujuiOleh' => $memo->disetujui_oleh ?? null,
                    'tanggalTtd' => $memo->tanggal_ttd ?? null,
                    'createdAt' => $memo->created_at,
                ];
            })(),
            'pembayaran' => (function () use ($k) {
                $bayar = DB::table('pembayarans')->where('klaim_id', $k->id)->orderByDesc('id')->first();
                if (!$bayar) return null;
                return [
                    'id' => $bayar->id,
                    'klaimId' => $bayar->klaim_id,
                    'nomorVoucher' => $bayar->nomor_voucher,
                    'nomorReferensiTransfer' => $bayar->nomor_referensi_transfer,
                    'tanggalBayar' => $bayar->tanggal_bayar,
                    'nominalTransfer' => $bayar->nominal_transfer,
                    'bankPengirim' => $bayar->bank_pengirim,
                    'noRekeningPengirim' => $bayar->no_rekening_pengirim,
                    'buktiBayarPath' => $bayar->bukti_transfer_path,
                    'disetujuiOleh' => $bayar->disetujui_oleh,
                    'status' => $bayar->status,
                    'createdAt' => $bayar->created_at,
                ];
            })(),
            'banding' => (function () use ($k) {
                $b = DB::table('bandings')->where('klaim_id', $k->id)->orderByDesc('id')->first();
                if (!$b) return null;
                return [
                    'id' => $b->id,
                    'klaimId' => $b->klaim_id,
                    'tanggalPengajuan' => $b->tanggal_pengajuan,
                    'alasan' => $b->alasan,
                    'status' => $b->status,
                ];
            })(),
        ];
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $statusGroup = $request->query('statusGroup');
        $perPage = (int) $request->query('perPage', 50);
        $page = (int) $request->query('page', 1);

        $query = DB::table('klaims')->where('active', 1);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_klaim', 'like', "%{$search}%")
                  ->orWhereIn('sertifikat_penjaminan_id', function ($sub) use ($search) {
                      $sub->select('id')->from('sertifikat_penjaminans')
                          ->where('nama_debitur', 'like', "%{$search}%")
                          ->orWhere('nomor_sp', 'like', "%{$search}%");
                  });
            });
        }

        if ($statusGroup && $statusGroup !== 'semua') {
            $statusMap = [
                'baru' => [1, 2],
                'proses' => [3, 4, 5, 6, 7, 13],
                'disetujui' => [8, 10],
                'setuju' => [8, 10],
                'selesai' => [11, 12, 9],
                'final' => [11, 12, 9],
                'diajukan' => [2],
                'verifikasi' => [3],
                'perbaikan' => [4],
                'survei' => [6],
                'assessment' => [5],
                'komite' => [7, 13]
            ];
            $ids = $statusMap[$statusGroup] ?? [];
            if (!empty($ids)) {
                $query->whereIn('status_id', $ids);
            }
        }

        $all = $query->orderBy('id', 'desc')->get();
        $enriched = $all->map(fn($k) => $this->enrichKlaim($k));

        $total = $enriched->count();
        $offset = ($page - 1) * $perPage;
        $paginated = $enriched->slice($offset, $perPage)->values();

        return response()->json([
            'data' => $paginated,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage
            ]
        ]);
    }

    public function show($id)
    {
        $k = DB::table('klaims')->where('id', $id)->first();
        if (!$k) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }
        return response()->json(['data' => $this->enrichKlaim($k)]);
    }

    public function store(Request $request)
    {
        $spId = (int) $request->input('sertifikatPenjaminanId', 1);
        $sp = DB::table('sertifikat_penjaminans')->where('id', $spId)->first();
        $prod = DB::table('produk_penjaminans')->where('id', $sp->produk_id ?? 1)->first();
        $cp = $prod ? $prod->cover_percentage : 0.70;

        $count = DB::table('klaims')->count() + 1;
        $kodeKlaim = 'KLM-2026-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $baki = (float) $request->input('bakiDebetKlaim', $sp->baki_debet ?? 50000000);
        $nilaiKlaim = $baki * $cp;

        $klaimId = DB::table('klaims')->insertGetId([
            'kode_klaim' => $kodeKlaim,
            'sertifikat_penjaminan_id' => $spId,
            'mitra_id' => $sp->mitra_id ?? 1,
            'penyebab_klaim_id' => (int) $request->input('penyebabKlaimId', 1),
            'status_id' => 1,
            'baki_debet_klaim' => $baki,
            'cover_percentage_snapshot' => $cp,
            'nilai_klaim' => $nilaiKlaim,
            'tanggal_pengajuan' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $jenisDocs = DB::table('jenis_dokumens')->where('active', 1)->get();
        foreach ($jenisDocs as $j) {
            DB::table('klaim_documents')->insert([
                'klaim_id' => $klaimId,
                'jenis_dokumen_id' => $j->id,
                'ada' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $klaimId,
            'waktu' => now(),
            'actor_user_id' => 2,
            'actor_nama' => 'Budi Santoso (Bank BJB)',
            'actor_peran' => 'mitra',
            'aksi' => 'Membuat draft klaim baru',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $created = DB::table('klaims')->where('id', $klaimId)->first();
        return response()->json(['data' => $this->enrichKlaim($created)], 201);
    }

    public function uploadDocument(Request $request, $id)
    {
        $jenisDokumenId = (int) $request->input('jenisDokumenId', $request->input('documentId', 1));
        $file = $request->file('file');

        $filePath = '/documents/uploaded_sample.pdf';
        $fileName = 'uploaded_document.pdf';
        $fileType = 'application/pdf';

        if ($file) {
            $path = $file->store('uploads', 'public');
            $filePath = '/storage/' . $path;
            $fileName = $file->getClientOriginalName();
            $fileType = $file->getClientMimeType();
        }

        $doc = DB::table('klaim_documents')->where('klaim_id', $id)->where('jenis_dokumen_id', $jenisDokumenId)->first();

        // Only count this as a "replace" if the document already had a file uploaded before now
        $wasAlreadyUploaded = $doc && $doc->ada;

        if ($doc) {
            DB::table('klaim_documents')->where('id', $doc->id)->update([
                'ada' => 1,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_type' => $fileType,
                'is_replaced' => $wasAlreadyUploaded ? 1 : 0,
                'replaced_at' => $wasAlreadyUploaded ? now() : null,
                'uploaded_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            DB::table('klaim_documents')->insert([
                'klaim_id' => $id,
                'jenis_dokumen_id' => $jenisDokumenId,
                'ada' => 1,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_type' => $fileType,
                'is_replaced' => 0,
                'replaced_at' => null,
                'uploaded_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $updatedDoc = DB::table('klaim_documents')->where('klaim_id', $id)->where('jenis_dokumen_id', $jenisDokumenId)->first();
        return response()->json(['data' => $updatedDoc, 'message' => 'Berkas berhasil diunggah']);
    }

    public function verifyDocument(Request $request, $id)
    {
        $docId = (int) $request->input('documentId', $request->input('jenisDokumenId'));
        $status = $request->input('status');
        $catatan = $request->input('catatan');

        $doc = DB::table('klaim_documents')
            ->where('klaim_id', $id)
            ->where(function ($q) use ($docId) {
                $q->where('jenis_dokumen_id', $docId)->orWhere('id', $docId);
            })->first();

        if ($doc) {
            DB::table('klaim_documents')->where('id', $doc->id)->update([
                'kesesuaian' => $status,
                'catatan_pemeriksaan' => $status === 'sesuai' ? '' : ($catatan ?? ''),
                'updated_at' => now()
            ]);
        }

        return response()->json(['message' => "Status pemeriksaan dokumen diperbarui ({$status})."]);
    }

    public function verifikasiAction(Request $request, $id)
    {
        $action = $request->input('action');
        $catatan = $request->input('catatan');

        if ($action === 'perbaikan') {
            DB::table('klaims')->where('id', $id)->update([
                'status_id' => 4,
                'is_resubmitted' => 0,
                'catatan_perbaikan' => $catatan ?? 'Mohon perbaiki dokumen klaim sesuai catatan per berkas.',
                'updated_at' => now()
            ]);
            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => 3,
                'actor_nama' => 'Andi Wijaya (Staf Klaim)',
                'actor_peran' => 'klaim',
                'aksi' => "Berkas tidak lengkap. Catatan verifikasi: " . ($catatan ?? ''),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else if ($action === 'assessment') {
            DB::table('klaims')->where('id', $id)->update([
                'status_id' => 5,
                'updated_at' => now()
            ]);
            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => 3,
                'actor_nama' => 'Andi Wijaya (Staf Klaim)',
                'actor_peran' => 'klaim',
                'aksi' => 'Verifikasi dokumen selesai - dokumen lengkap & valid',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else if ($action === 'survei') {
            DB::table('klaims')->where('id', $id)->update([
                'status_id' => 6,
                'updated_at' => now()
            ]);

            $tanggalSurvey = $request->input('tanggalSurvey');
            $denganMitra = $request->has('denganMitra') ? (bool) $request->input('denganMitra') : true;
            // Kalau survei tidak melibatkan Mitra (survei internal), tidak perlu menunggu
            // konfirmasi jadwal dari Mitra - langsung dianggap terkonfirmasi.
            $konfirmasiMitra = $denganMitra ? false : true;

            $existingSurvey = DB::table('surveys')->where('klaim_id', $id)->first();

            if ($existingSurvey) {
                DB::table('surveys')->where('id', $existingSurvey->id)->update([
                    'tanggal_survey' => $tanggalSurvey,
                    'catatan' => $catatan,
                    'dengan_mitra' => $denganMitra,
                    'konfirmasi_mitra' => $konfirmasiMitra,
                    'updated_at' => now()
                ]);
            } else {
                DB::table('surveys')->insert([
                    'klaim_id' => $id,
                    'nomor_permohonan' => 'SVY-2026-' . str_pad($id, 4, '0', STR_PAD_LEFT),
                    'tanggal_survey' => $tanggalSurvey,
                    'catatan' => $catatan,
                    'dengan_mitra' => $denganMitra,
                    'konfirmasi_mitra' => $konfirmasiMitra,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => 3,
                'actor_nama' => 'Andi Wijaya (Staf Klaim)',
                'actor_peran' => 'klaim',
                'aksi' => $denganMitra
                    ? ('Mengajukan permohonan survei lapangan ke Mitra' . ($tanggalSurvey ? ", usulan tanggal {$tanggalSurvey}. Menunggu konfirmasi jadwal dari Mitra." : '. Menunggu konfirmasi jadwal dari Mitra.'))
                    : ('Menjadwalkan survei lapangan internal (tanpa perlu konfirmasi Mitra)' . ($tanggalSurvey ? " pada {$tanggalSurvey}" : '')),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Hasil verifikasi berhasil diproses']);
    }

    public function surveiKonfirmasi(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $survey = DB::table('surveys')->where('klaim_id', $id)->first();
        if (!$survey) {
            return response()->json(['message' => 'Jadwal survei belum tersedia'], 404);
        }

        DB::table('surveys')->where('id', $survey->id)->update([
            'konfirmasi_mitra' => true,
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 2,
            'actor_nama' => 'Mitra',
            'actor_peran' => 'mitra',
            'aksi' => 'Mengonfirmasi jadwal survei lapangan pada ' . ($survey->tanggal_survey ?? '-'),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Jadwal survei berhasil dikonfirmasi']);
    }

    public function surveiLaporan(Request $request, $id)
    {
        $survey = DB::table('surveys')->where('klaim_id', $id)->first();
        $hasApproved = $request->has('approvedByMitra');
        $approvedByMitra = $hasApproved ? (bool) $request->input('approvedByMitra') : null;

        $data = [
            'dokumen_laporan_path' => '/documents/uploaded_sample.pdf',
            'updated_at' => now()
        ];
        if ($hasApproved) {
            $data['approved_by_mitra'] = $approvedByMitra;
        }

        if ($survey) {
            DB::table('surveys')->where('id', $survey->id)->update($data);
        } else {
            DB::table('surveys')->insert(array_merge($data, [
                'klaim_id' => $id,
                'nomor_permohonan' => 'SVY-2026-' . str_pad($id, 4, '0', STR_PAD_LEFT),
                'created_at' => now()
            ]));
        }

        return response()->json(['message' => 'Laporan survei berhasil diunggah']);
    }

    public function surveiSelesai(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 5,
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => 'Survei lapangan selesai, berkas dilanjutkan ke tahap Assessment',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Survei selesai, berkas kembali ke Assessment']);
    }

    public function submit(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        // Both a fresh draft submission and a perbaikan resubmission land back in the
        // "Diajukan" queue - Bagian Klaim still has to "Ambil Berkas" like any new claim,
        // it does not skip straight to Verifikasi Dokumen.
        $wasPerbaikan = ($klaim->status_id == 4);
        $newStatusId = 2;
        DB::table('klaims')->where('id', $id)->update([
            'status_id' => $newStatusId,
            'is_resubmitted' => $wasPerbaikan ? 1 : 0,
            'updated_at' => now()
        ]);

        $aksiMsg = $wasPerbaikan
            ? 'Mengajukan ulang berkas perbaikan dokumen klaim (Status: Diajukan Ulang)'
            : 'Mengajukan berkas klaim lengkap (Status: Diajukan)';

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 2,
            'actor_nama' => 'Budi Santoso (Bank BJB)',
            'actor_peran' => 'mitra',
            'aksi' => $aksiMsg,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Pengajuan klaim berhasil dikirim']);
    }

    public function ambilVerifikasi(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 3,
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => 'Mengambil klaim untuk diverifikasi',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Berkas berhasil diambil untuk verifikasi']);
    }

    // Terbitkan Berita Acara baru + buka sesi E-sign untuk seluruh Pejabat Komite aktif.
    // Dipakai baik untuk pengajuan awal ke Komite maupun untuk pengajuan ulang pasca-Banding.
    private function generateBeritaAcara($id, $kesimpulan)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();

        $count = DB::table('berita_acaras')->count() + 1;
        $nomorBa = 'BA-' . now()->format('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $baId = DB::table('berita_acaras')->insertGetId([
            'klaim_id' => $id,
            'nomor_ba' => $nomorBa,
            'tanggal_ba' => now()->toDateString(),
            'kesimpulan' => $kesimpulan ?: 'Usul disetujui pembayaran klaim.',
            'usulan_nilai_klaim' => $klaim->nilai_klaim,
            'status' => 'proses',
            'active' => 1,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $pejabatList = DB::table('pejabat_komites')->where('active', 1)->orderBy('urutan')->get();
        foreach ($pejabatList as $pj) {
            DB::table('esign_signatures')->insert([
                'dokumen_type' => 'berita_acara',
                'dokumen_id' => $baId,
                'pejabat_komite_id' => $pj->id,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return $nomorBa;
    }

    public function ajukanKomite(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $catatan = $request->input('catatan');

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 7, // komite
            'updated_at' => now()
        ]);

        $nomorBa = $this->generateBeritaAcara($id, $catatan);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => "Mengajukan klaim ke Sidang Komite. Berita Acara {$nomorBa} diterbitkan." . ($catatan ? " Catatan: {$catatan}" : ''),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Klaim berhasil diajukan ke Sidang Komite, Berita Acara telah diterbitkan']);
    }

    public function setujuKeputusan(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        if ($klaim->status_id != 8) {
            return response()->json(['message' => 'Klaim tidak dalam status Disetujui'], 422);
        }

        DB::table('klaims')->where('id', $id)->update([
            'disetujui_confirmed_by_mitra' => true,
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 2,
            'actor_nama' => 'Mitra',
            'actor_peran' => 'mitra',
            'aksi' => 'Menyetujui keputusan klaim. Proses penerbitan Memo Pembayaran akan dilanjutkan oleh Jamkrida.',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Keputusan klaim berhasil disetujui']);
    }

    public function ajukanBanding(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $alasan = $request->input('alasan');
        if (!$alasan) {
            return response()->json(['message' => 'Alasan banding wajib diisi'], 422);
        }

        DB::table('bandings')->insert([
            'klaim_id' => $id,
            'tanggal_pengajuan' => now()->toDateString(),
            'alasan' => $alasan,
            'status' => 'diajukan',
            'active' => 1,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 13, // banding
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 2,
            'actor_nama' => 'Mitra',
            'actor_peran' => 'mitra',
            'aksi' => "Mengajukan Banding atas keputusan klaim. Alasan: {$alasan}",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Banding berhasil diajukan, berkas dikembalikan untuk assessment ulang']);
    }

    public function selesaiBanding(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $catatan = $request->input('catatan');

        $banding = DB::table('bandings')->where('klaim_id', $id)->orderByDesc('id')->first();
        if ($banding) {
            DB::table('bandings')->where('id', $banding->id)->update([
                'status' => 'selesai',
                'updated_at' => now()
            ]);
        }

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 7, // kembali ke komite
            'updated_at' => now()
        ]);

        $kesimpulan = $catatan
            ? "Hasil assessment banding: {$catatan}"
            : 'Usul keputusan hasil assessment ulang atas banding klaim.';
        $nomorBa = $this->generateBeritaAcara($id, $kesimpulan);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => "Assessment Banding selesai. Berkas dikirim ulang ke Sidang Komite, Berita Acara {$nomorBa} diterbitkan." . ($catatan ? " Catatan: {$catatan}" : ''),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Assessment banding selesai, klaim dikirim ulang ke Sidang Komite']);
    }

    public function esign(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $sigId = $request->input('esignSignatureId');
        $action = $request->input('action'); // 'sign' | 'reject'

        $sig = DB::table('esign_signatures')->where('id', $sigId)->first();
        if (!$sig) {
            return response()->json(['message' => 'Slot tanda tangan tidak ditemukan'], 404);
        }

        $pejabat = DB::table('pejabat_komites')->where('id', $sig->pejabat_komite_id)->first();
        $isSk = $sig->dokumen_type === 'surat_keputusan';
        $docTable = $isSk ? 'surat_keputusans' : 'berita_acaras';
        $docLabel = $isSk ? 'Surat Keputusan' : 'Berita Acara';

        if ($action === 'reject') {
            DB::table('esign_signatures')->where('id', $sigId)->update([
                'status' => 'rejected',
                'signed_at' => now(),
                'updated_at' => now()
            ]);

            DB::table($docTable)->where('id', $sig->dokumen_id)->update([
                'status' => 'ditolak',
                'updated_at' => now()
            ]);

            DB::table('klaims')->where('id', $id)->update([
                'status_id' => 9, // ditolak
                'updated_at' => now()
            ]);

            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => $pejabat->id ?? null,
                'actor_nama' => ($pejabat->nama ?? 'Pejabat Komite') . ' (' . ($pejabat->jabatan ?? 'Komite') . ')',
                'actor_peran' => 'komite',
                'aksi' => "Menolak {$docLabel} pada Sidang Komite. Klaim ditolak.",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            DB::table('esign_signatures')->where('id', $sigId)->update([
                'status' => 'signed',
                'signed_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => $pejabat->id ?? null,
                'actor_nama' => ($pejabat->nama ?? 'Pejabat Komite') . ' (' . ($pejabat->jabatan ?? 'Komite') . ')',
                'actor_peran' => 'komite',
                'aksi' => "Menandatangani {$docLabel} Sidang Komite (E-sign)",
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Jika seluruh pejabat sudah menandatangani dokumen ini
            $remaining = DB::table('esign_signatures')
                ->where('dokumen_type', $sig->dokumen_type)
                ->where('dokumen_id', $sig->dokumen_id)
                ->where('status', 'pending')
                ->count();

            if ($remaining === 0) {
                DB::table($docTable)->where('id', $sig->dokumen_id)->update([
                    'status' => 'disetujui',
                    'updated_at' => now()
                ]);

                if (!$isSk) {
                    // Tahap 1 selesai: BA disetujui. Susun draf Surat Keputusan (SK) dan buka
                    // sesi E-sign kedua untuk Komite - SK BUKAN salinan otomatis dari BA,
                    // dan baru sah setelah ditandatangani terpisah (sesuai alur resmi).
                    DB::table('klaim_status_histories')->insert([
                        'klaim_id' => $id,
                        'waktu' => now(),
                        'actor_user_id' => 3,
                        'actor_nama' => 'Sistem',
                        'actor_peran' => 'komite',
                        'aksi' => 'Seluruh anggota Komite telah menandatangani Berita Acara.',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    $countSk = DB::table('surat_keputusans')->count() + 1;
                    $nomorSk = 'SK-' . now()->format('Y') . '-' . str_pad($countSk, 4, '0', STR_PAD_LEFT);

                    $skId = DB::table('surat_keputusans')->insertGetId([
                        'klaim_id' => $id,
                        'berita_acara_id' => $sig->dokumen_id,
                        'nomor_sk' => $nomorSk,
                        'tanggal_sk' => now()->toDateString(),
                        'nilai_disetujui' => $klaim->nilai_klaim,
                        'status' => 'proses',
                        'active' => 1,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    // Siapkan slot tanda tangan baru untuk Surat Keputusan
                    $pejabatList = DB::table('pejabat_komites')->where('active', 1)->orderBy('urutan')->get();
                    foreach ($pejabatList as $pj) {
                        DB::table('esign_signatures')->insert([
                            'dokumen_type' => 'surat_keputusan',
                            'dokumen_id' => $skId,
                            'pejabat_komite_id' => $pj->id,
                            'status' => 'pending',
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }

                    DB::table('klaim_status_histories')->insert([
                        'klaim_id' => $id,
                        'waktu' => now(),
                        'actor_user_id' => 3,
                        'actor_nama' => 'Sistem',
                        'actor_peran' => 'komite',
                        'aksi' => "Draf Surat Keputusan (SK) {$nomorSk} disusun. Menunggu tanda tangan Komite untuk SK.",
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                } else {
                    // Tahap 2 selesai: SK disetujui. Klaim resmi Disetujui.
                    // Reset flag persetujuan Mitra - keputusan baru ini butuh konfirmasi baru dari Mitra
                    // (relevan kalau ini hasil siklus ulang pasca-Banding).
                    DB::table('klaims')->where('id', $id)->update([
                        'status_id' => 8, // disetujui
                        'disetujui_confirmed_by_mitra' => false,
                        'updated_at' => now()
                    ]);

                    DB::table('klaim_status_histories')->insert([
                        'klaim_id' => $id,
                        'waktu' => now(),
                        'actor_user_id' => 3,
                        'actor_nama' => 'Sistem',
                        'actor_peran' => 'komite',
                        'aksi' => 'Seluruh anggota Komite telah menandatangani Surat Keputusan. Klaim resmi Disetujui.',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => $action === 'reject' ? 'Dokumen ditolak, klaim dihentikan' : 'Tanda tangan berhasil disematkan']);
    }

    public function terbitMemo(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        if (!$klaim->disetujui_confirmed_by_mitra) {
            return response()->json(['message' => 'Mitra belum menyetujui keputusan klaim ini'], 422);
        }

        $mitra = DB::table('mitras')->where('id', $klaim->mitra_id)->first();

        $bankPenerima = $request->input('bankPenerima') ?: ($mitra->bank_penerima ?? 'Bank BJB');
        $noRekeningPenerima = $request->input('noRekeningPenerima') ?: ($mitra->no_rekening_penerima ?? '-');
        $namaPenerima = $request->input('namaPenerima') ?: ($mitra->nama_mitra ?? '-');

        $count = DB::table('memo_pembayarans')->count() + 1;
        $nomorMemo = 'MEMO-' . now()->format('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        DB::table('memo_pembayarans')->insert([
            'klaim_id' => $id,
            'nomor_memo' => $nomorMemo,
            'tanggal_memo' => now()->toDateString(),
            'nominal_bayar' => $klaim->nilai_klaim,
            'bank_penerima' => $bankPenerima,
            'no_rekening_penerima' => $noRekeningPenerima,
            'nama_penerima' => $namaPenerima,
            'status' => 'menunggu_ttd',
            'active' => 1,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 10, // memo
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => "Menerbitkan Memo Pembayaran {$nomorMemo}. Menunggu persetujuan & TTE Kepala Bagian Klaim.",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => "Memo Pembayaran {$nomorMemo} berhasil diterbitkan, menunggu TTE Kabag Klaim"]);
    }

    public function esignMemo(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $memo = DB::table('memo_pembayarans')->where('klaim_id', $id)->orderByDesc('id')->first();
        if (!$memo) {
            return response()->json(['message' => 'Memo Pembayaran belum diterbitkan'], 404);
        }

        $action = $request->input('action'); // 'sign' | 'reject'
        $namaKabag = 'Drs. Hendra Setiawan (Kabag Klaim)';

        if ($action === 'reject') {
            DB::table('memo_pembayarans')->where('id', $memo->id)->update([
                'status' => 'ditolak',
                'disetujui_oleh' => $namaKabag,
                'tanggal_ttd' => now(),
                'updated_at' => now()
            ]);

            // Kembalikan ke tahap Disetujui supaya Staf Klaim bisa menerbitkan memo baru
            DB::table('klaims')->where('id', $id)->update([
                'status_id' => 8, // disetujui
                'updated_at' => now()
            ]);

            DB::table('klaim_status_histories')->insert([
                'klaim_id' => $id,
                'waktu' => now(),
                'actor_user_id' => 8,
                'actor_nama' => $namaKabag,
                'actor_peran' => 'kabag_klaim',
                'aksi' => "Menolak Memo Pembayaran {$memo->nomor_memo}. Catatan: " . ($request->input('catatan') ?: '-'),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $updated = DB::table('klaims')->where('id', $id)->first();
            return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Memo Pembayaran ditolak']);
        }

        DB::table('memo_pembayarans')->where('id', $memo->id)->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $namaKabag,
            'tanggal_ttd' => now(),
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 8,
            'actor_nama' => $namaKabag,
            'actor_peran' => 'kabag_klaim',
            'aksi' => "Menyetujui & menandatangani (E-sign) Memo Pembayaran {$memo->nomor_memo}.",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Memo Pembayaran disetujui & ditandatangani']);
    }

    public function bayar(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        $memo = DB::table('memo_pembayarans')->where('klaim_id', $id)->orderByDesc('id')->first();
        if (!$memo || $memo->status !== 'disetujui') {
            return response()->json(['message' => 'Memo Pembayaran belum disetujui/ditandatangani oleh Kepala Bagian Klaim'], 422);
        }

        $tanggalBayar = $request->input('tanggalBayar') ?: now()->toDateString();
        $nomorReferensi = $request->input('nomorReferensiTransfer');
        if (!$nomorReferensi) {
            return response()->json(['message' => 'Nomor referensi transfer wajib diisi'], 422);
        }

        $count = DB::table('pembayarans')->count() + 1;
        $nomorVoucher = 'VCR-' . now()->format('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        DB::table('pembayarans')->insert([
            'klaim_id' => $id,
            'nomor_voucher' => $nomorVoucher,
            'nomor_referensi_transfer' => $nomorReferensi,
            'tanggal_bayar' => $tanggalBayar,
            'nominal_transfer' => $klaim->nilai_klaim,
            'bank_pengirim' => 'Bank Jabar Banten',
            'no_rekening_pengirim' => '-',
            'bukti_transfer_path' => '/media/bukti-transfer-' . $id . '.pdf',
            'disetujui_oleh' => 'Staf Keuangan',
            'status' => 'selesai',
            'active' => 1,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 11, // dibayar
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 4,
            'actor_nama' => 'Staf Keuangan',
            'actor_peran' => 'keuangan',
            'aksi' => "Mencatat realisasi transfer pembayaran klaim (Voucher {$nomorVoucher}, No. Referensi {$nomorReferensi}), tanggal {$tanggalBayar}.",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Realisasi pembayaran berhasil dicatat']);
    }

    public function konfirmasiBukti(Request $request, $id)
    {
        $klaim = DB::table('klaims')->where('id', $id)->first();
        if (!$klaim) {
            return response()->json(['message' => 'Klaim tidak ditemukan'], 404);
        }

        DB::table('klaims')->where('id', $id)->update([
            'status_id' => 12, // selesai
            'updated_at' => now()
        ]);

        DB::table('klaim_status_histories')->insert([
            'klaim_id' => $id,
            'waktu' => now(),
            'actor_user_id' => 3,
            'actor_nama' => 'Andi Wijaya (Staf Klaim)',
            'actor_peran' => 'klaim',
            'aksi' => 'Mengirimkan bukti transfer pembayaran ke Mitra. Berkas klaim dinyatakan Selesai.',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $updated = DB::table('klaims')->where('id', $id)->first();
        return response()->json(['data' => $this->enrichKlaim($updated), 'message' => 'Berkas klaim dinyatakan Selesai']);
    }
}
