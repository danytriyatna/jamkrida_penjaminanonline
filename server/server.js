const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.use('/documents', express.static(path.join(__dirname, '../public/documents')));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Helper to paginate array / query
function enrichKlaim(k) {
  if (!k) return null;
  const sp = db.prepare('SELECT * FROM sertifikat_penjaminans WHERE id = ?').get(k.sertifikatPenjaminanId);
  const mitra = db.prepare('SELECT * FROM mitras WHERE id = ?').get(k.mitraId);
  const penyebab = db.prepare('SELECT * FROM penyebab_klaims WHERE id = ?').get(k.penyebabKlaimId);
  const status = db.prepare('SELECT * FROM klaim_statuses WHERE id = ?').get(k.statusId);
  
  const rawDocs = db.prepare('SELECT * FROM klaim_documents WHERE klaimId = ?').all(k.id);
  const docs = rawDocs.map(d => {
    const j = db.prepare('SELECT * FROM jenis_dokumens WHERE id = ?').get(d.jenisDokumenId);
    return { ...d, ada: !!d.ada, isReplaced: !!d.isReplaced, jenisDokumen: j };
  });

  const history = db.prepare('SELECT * FROM klaim_status_histories WHERE klaimId = ? ORDER BY id DESC').all(k.id);
  const survey = db.prepare('SELECT * FROM surveys WHERE klaimId = ?').get(k.id);
  const ba = db.prepare('SELECT * FROM berita_acaras WHERE klaimId = ?').get(k.id);
  const sk = db.prepare('SELECT * FROM surat_keputusans WHERE klaimId = ?').get(k.id);
  
  let signatures = [];
  if (ba) {
    const sigs = db.prepare('SELECT * FROM esign_signatures WHERE dokumenType = ? AND dokumenId = ? ORDER BY pejabatKomiteId ASC').all('berita_acara', ba.id);
    signatures = sigs.map(s => {
      const pe = db.prepare('SELECT * FROM pejabat_komites WHERE id = ?').get(s.pejabatKomiteId);
      return {
        id: s.id,
        dokumenType: s.dokumenType,
        dokumenId: s.dokumenId,
        pejabatKomiteId: s.pejabatKomiteId,
        status: s.statusSignature,
        signedAt: s.tanggalSignature,
        pejabatKomite: pe
      };
    });
  }

  const memo = db.prepare('SELECT * FROM memo_pembayarans WHERE klaimId = ?').get(k.id);
  const pembayaran = db.prepare('SELECT * FROM pembayarans WHERE klaimId = ?').get(k.id);
  const banding = db.prepare('SELECT * FROM bandings WHERE klaimId = ?').get(k.id);

  return {
    ...k,
    active: !!k.active,
    draftOnly: !!k.draftOnly,
    isResubmitted: !!k.isResubmitted,
    sertifikatPenjaminan: sp,
    mitra,
    penyebabKlaim: penyebab,
    status,
    documents: docs,
    statusHistory: history,
    survey: survey ? { ...survey, approvedByMitra: !!survey.approvedByMitra } : null,
    beritaAcara: ba,
    suratKeputusan: sk,
    esignSignatures: signatures,
    memoPembayaran: memo,
    pembayaran,
    banding
  };
}

// --- REST API ENDPOINTS ---

// 1. Auth & Current User
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email || 'mitra@bjb.co.id');
  if (!user) {
    return res.status(401).json({ message: 'User tidak ditemukan' });
  }
  res.json({
    user,
    token: `token-jwt-${user.id}-${Date.now()}`
  });
});

app.get('/api/me', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = 2').get(); // Default Mitra
  res.json({ user });
});

// 2. Master Data
app.get('/api/sertifikat-penjaminans', (req, res) => {
  const sps = db.prepare('SELECT * FROM sertifikat_penjaminans WHERE active = 1').all();
  res.json({ data: sps });
});

app.get('/api/penyebab-klaims', (req, res) => {
  const p = db.prepare('SELECT * FROM penyebab_klaims WHERE active = 1').all();
  res.json({ data: p });
});

app.get('/api/jenis-dokumens', (req, res) => {
  const j = db.prepare('SELECT * FROM jenis_dokumens WHERE active = 1 ORDER BY urutan ASC').all();
  res.json({ data: j });
});

app.get('/api/pejabat-komites', (req, res) => {
  const p = db.prepare('SELECT * FROM pejabat_komites WHERE active = 1 ORDER BY urutan ASC').all();
  res.json({ data: p });
});

// 3. Klaim Endpoints
app.get('/api/klaims', (req, res) => {
  const { search, statusGroup, perPage = 50, page = 1 } = req.query;

  let query = 'SELECT * FROM klaims WHERE active = 1';
  const params = [];

  if (search) {
    query += ` AND (kodeKlaim LIKE ? OR sertifikatPenjaminanId IN (SELECT id FROM sertifikat_penjaminans WHERE namaDebitur LIKE ? OR nomorSp LIKE ?))`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (statusGroup && statusGroup !== 'semua') {
    const statusMap = {
      baru: [1, 2],
      proses: [3, 4, 5, 6, 7, 13],
      disetujui: [8, 10],
      setuju: [8, 10],
      selesai: [11, 12, 9],
      final: [11, 12, 9],
      diajukan: [2],
      verifikasi: [3],
      perbaikan: [4],
      survei: [6],
      assessment: [5],
      komite: [7, 13]
    };

    const allowedStatusIds = statusMap[statusGroup] || [];
    if (allowedStatusIds.length > 0) {
      query += ` AND statusId IN (${allowedStatusIds.join(',')})`;
    }
  }

  query += ' ORDER BY id DESC';

  const allKlaims = db.prepare(query).all(...params);
  const enriched = allKlaims.map(enrichKlaim);

  const limit = parseInt(perPage);
  const offset = (parseInt(page) - 1) * limit;
  const paginated = enriched.slice(offset, offset + limit);

  res.json({
    data: paginated,
    meta: {
      total: enriched.length,
      page: parseInt(page),
      perPage: limit
    }
  });
});

app.get('/api/klaims/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const klaim = db.prepare('SELECT * FROM klaims WHERE id = ?').get(id);
  if (!klaim) {
    return res.status(404).json({ message: 'Klaim tidak ditemukan' });
  }
  res.json({ data: enrichKlaim(klaim) });
});

// 4. Create Draft Claim
app.post('/api/klaims', (req, res) => {
  const { sertifikatPenjaminanId, bakiDebetKlaim, penyebabKlaimId } = req.body;
  const spId = parseInt(sertifikatPenjaminanId) || 1;
  const sp = db.prepare('SELECT * FROM sertifikat_penjaminans WHERE id = ?').get(spId);

  const prod = db.prepare('SELECT * FROM produk_penjaminans WHERE id = ?').get(sp?.produkId || 1);
  const cp = prod ? prod.coverPercentage : 0.70;

  const count = db.prepare('SELECT COUNT(*) as cnt FROM klaims').get().cnt + 1;
  const kodeKlaim = `KLM-2026-${String(count).padStart(4, '0')}`;

  const baki = parseFloat(bakiDebetKlaim) || sp?.bakiDebet || 50000000;
  const nilaiKlaim = baki * cp;

  const stmt = db.prepare(`
    INSERT INTO klaims (kodeKlaim, sertifikatPenjaminanId, mitraId, penyebabKlaimId, statusId, bakiDebetKlaim, coverPercentageSnapshot, nilaiKlaim, tanggalPengajuan, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    kodeKlaim, spId, sp?.mitraId || 1, parseInt(penyebabKlaimId) || 1, 1, baki, cp, nilaiKlaim,
    new Date().toISOString().split('T')[0], new Date().toISOString(), new Date().toISOString()
  );

  const klaimId = info.lastInsertRowid;

  // Seed 8 empty documents for this claim
  const jenisDocs = db.prepare('SELECT * FROM jenis_dokumens WHERE active = 1').all();
  const insertDoc = db.prepare('INSERT INTO klaim_documents (klaimId, jenisDokumenId, ada) VALUES (?, ?, 0)');
  jenisDocs.forEach(j => insertDoc.run(klaimId, j.id));

  // History
  db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(klaimId, new Date().toISOString(), 2, 'Budi Santoso (Bank BJB)', 'mitra', 'Membuat draft klaim baru');

  const created = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.status(201).json({ data: enrichKlaim(created) });
});

// 5. Real File Upload for Document
app.post('/api/klaims/:id/documents', upload.single('file'), (req, res) => {
  const klaimId = parseInt(req.params.id);
  const jenisDokumenId = parseInt(req.body.jenisDokumenId || req.body.documentId);
  const file = req.file;

  const targetUrl = file ? `/uploads/${file.filename}` : '/documents/uploaded_sample.pdf';
  const targetName = file ? file.originalname : 'uploaded_document.pdf';

  let doc = db.prepare('SELECT * FROM klaim_documents WHERE klaimId = ? AND jenisDokumenId = ?').get(klaimId, jenisDokumenId);

  // Only count this as a "replace" if the document already had a file uploaded before now
  const wasAlreadyUploaded = !!(doc && doc.ada);

  if (!doc) {
    db.prepare(`
      INSERT INTO klaim_documents (klaimId, jenisDokumenId, ada, filePath, fileName, fileType, isReplaced, replacedAt, uploadedAt)
      VALUES (?, ?, 1, ?, ?, ?, 0, NULL, ?)
    `).run(klaimId, jenisDokumenId, targetUrl, targetName, file ? file.mimetype : 'application/pdf', new Date().toISOString());
  } else {
    db.prepare(`
      UPDATE klaim_documents
      SET ada = 1, filePath = ?, fileName = ?, fileType = ?, isReplaced = ?, replacedAt = ?, uploadedAt = ?
      WHERE id = ?
    `).run(targetUrl, targetName, file ? file.mimetype : doc.fileType || 'application/pdf', wasAlreadyUploaded ? 1 : 0, wasAlreadyUploaded ? new Date().toISOString() : null, new Date().toISOString(), doc.id);
  }

  const updatedDoc = db.prepare('SELECT * FROM klaim_documents WHERE klaimId = ? AND jenisDokumenId = ?').get(klaimId, jenisDokumenId);
  res.json({ data: updatedDoc, message: 'Berkas berhasil diunggah' });
});

// 6. Submit Claim (Draft -> Diajukan, or Perbaikan -> Diajukan lagi/Diajukan Ulang)
// Both cases land back in the "Diajukan" queue so Bagian Klaim picks it up via "Ambil Berkas",
// same as a brand new submission - it does NOT jump straight to Verifikasi.
app.post('/api/klaims/:id/submit', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const klaim = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  const wasPerbaikan = !!(klaim && klaim.statusId === 4);
  const newStatusId = 2;

  db.prepare('UPDATE klaims SET statusId = ?, isResubmitted = ?, updatedAt = ? WHERE id = ?')
    .run(newStatusId, wasPerbaikan ? 1 : 0, new Date().toISOString(), klaimId);

  const msgText = wasPerbaikan
    ? 'Mengajukan ulang berkas perbaikan dokumen klaim (Status: Diajukan Ulang)'
    : 'Mengajukan berkas klaim lengkap (Status: Diajukan)';

  db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(klaimId, new Date().toISOString(), 2, 'Budi Santoso (Bank BJB)', 'mitra', msgText);

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: 'Pengajuan klaim berhasil dikirim' });
});

// 7. Ambil Verifikasi (Diajukan -> Verifikasi)
app.post('/api/klaims/:id/ambil-verifikasi', (req, res) => {
  const klaimId = parseInt(req.params.id);
  db.prepare('UPDATE klaims SET statusId = 3, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);
  db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', 'Mengambil klaim untuk diverifikasi');

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: 'Berkas berhasil diambil untuk verifikasi' });
});

// 8. Verify Document (Sesuai / Tidak Sesuai per file)
app.post('/api/klaims/:id/verify-document', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const docId = parseInt(req.body.documentId || req.body.jenisDokumenId);
  const { status, catatan } = req.body;

  let doc = db.prepare('SELECT * FROM klaim_documents WHERE klaimId = ? AND (jenisDokumenId = ? OR id = ?)').get(klaimId, docId, docId);
  if (!doc) {
    db.prepare(`
      INSERT INTO klaim_documents (klaimId, jenisDokumenId, ada, filePath, kesesuaian, catatanPemeriksaan, uploadedAt)
      VALUES (?, ?, 1, '/documents/uploaded_sample.pdf', ?, ?, ?)
    `).run(klaimId, docId, status, status === 'sesuai' ? '' : (catatan || ''), new Date().toISOString());
  } else {
    db.prepare(`
      UPDATE klaim_documents SET kesesuaian = ?, catatanPemeriksaan = ? WHERE id = ?
    `).run(status, status === 'sesuai' ? '' : (catatan || ''), doc.id);
  }

  const updatedDoc = db.prepare('SELECT * FROM klaim_documents WHERE klaimId = ? AND (jenisDokumenId = ? OR id = ?)').get(klaimId, docId, docId);
  res.json({ data: updatedDoc, message: `Status pemeriksaan dokumen diperbarui (${status}).` });
});

// 9. Verifikasi Action (Minta Perbaikan / Teruskan ke Assessment)
app.post('/api/klaims/:id/verifikasi-dokumen', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const { action, catatan } = req.body;

  if (action === 'perbaikan') {
    db.prepare('UPDATE klaims SET statusId = 4, isResubmitted = 0, catatanPerbaikan = ?, updatedAt = ? WHERE id = ?')
      .run(catatan || 'Mohon perbaiki dokumen klaim sesuai catatan per berkas.', new Date().toISOString(), klaimId);
    db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
      .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', `Berkas tidak lengkap. Catatan verifikasi: ${catatan || ''}`);
  } else if (action === 'assessment') {
    db.prepare('UPDATE klaims SET statusId = 5, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);
    db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
      .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', 'Verifikasi dokumen selesai - dokumen lengkap & valid');
  } else if (action === 'survei') {
    const { tanggalSurvey } = req.body;
    db.prepare('UPDATE klaims SET statusId = 6, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);

    const existingSurvey = db.prepare('SELECT * FROM surveys WHERE klaimId = ?').get(klaimId);
    if (existingSurvey) {
      db.prepare('UPDATE surveys SET tanggalSurvey = ?, catatan = ? WHERE id = ?')
        .run(tanggalSurvey || null, catatan || '', existingSurvey.id);
    } else {
      db.prepare('INSERT INTO surveys (klaimId, nomorPermohonan, tanggalSurvey, catatan, createdAt) VALUES (?, ?, ?, ?, ?)')
        .run(klaimId, `SVY-2026-${String(klaimId).padStart(4, '0')}`, tanggalSurvey || null, catatan || '', new Date().toISOString());
    }

    db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
      .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', `Menjadwalkan survei lapangan${tanggalSurvey ? ' pada ' + tanggalSurvey : ''}`);
  }

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: 'Hasil verifikasi berhasil diproses' });
});

// 9b. Survei - Upload Laporan
app.post('/api/klaims/:id/survei-laporan', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const hasApproved = Object.prototype.hasOwnProperty.call(req.body || {}, 'approvedByMitra');
  const approvedByMitra = hasApproved ? (req.body.approvedByMitra ? 1 : 0) : undefined;

  const existingSurvey = db.prepare('SELECT * FROM surveys WHERE klaimId = ?').get(klaimId);
  if (existingSurvey) {
    if (hasApproved) {
      db.prepare('UPDATE surveys SET dokumenLaporanPath = ?, approvedByMitra = ? WHERE id = ?')
        .run('/documents/uploaded_sample.pdf', approvedByMitra, existingSurvey.id);
    } else {
      db.prepare('UPDATE surveys SET dokumenLaporanPath = ? WHERE id = ?')
        .run('/documents/uploaded_sample.pdf', existingSurvey.id);
    }
  } else {
    db.prepare('INSERT INTO surveys (klaimId, nomorPermohonan, dokumenLaporanPath, approvedByMitra, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(klaimId, `SVY-2026-${String(klaimId).padStart(4, '0')}`, '/documents/uploaded_sample.pdf', approvedByMitra || 0, new Date().toISOString());
  }

  res.json({ message: 'Laporan survei berhasil diunggah' });
});

// 9c. Survei - Selesai (kembali ke Assessment)
app.post('/api/klaims/:id/survei-selesai', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const klaim = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  if (!klaim) {
    return res.status(404).json({ message: 'Klaim tidak ditemukan' });
  }

  db.prepare('UPDATE klaims SET statusId = 5, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);
  db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', 'Survei lapangan selesai, berkas dilanjutkan ke tahap Assessment');

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: 'Survei selesai, berkas kembali ke Assessment' });
});

// 10. Ajukan ke Komite
app.post('/api/klaims/:id/ajukan-komite', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const klaim = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  if (!klaim) {
    return res.status(404).json({ message: 'Klaim tidak ditemukan' });
  }
  const { catatan } = req.body;

  db.prepare('UPDATE klaims SET statusId = 7, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);

  // Generate BA
  const count = db.prepare('SELECT COUNT(*) as cnt FROM berita_acaras').get().cnt + 1;
  const nomorBa = `BA-2026-${String(count).padStart(4, '0')}`;
  const baResult = db.prepare('INSERT INTO berita_acaras (klaimId, nomorBa, tanggalBa, kesimpulan, usulanNilaiKlaim, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(klaimId, nomorBa, new Date().toISOString().split('T')[0], catatan || 'Usul disetujui pembayaran klaim.', klaim.nilaiKlaim, 'proses', new Date().toISOString());
  const baId = baResult.lastInsertRowid;

  // Siapkan slot tanda tangan untuk seluruh Pejabat Komite aktif
  const pejabatList = db.prepare('SELECT * FROM pejabat_komites WHERE active = 1 ORDER BY urutan ASC').all();
  const insertSig = db.prepare('INSERT INTO esign_signatures (dokumenType, dokumenId, pejabatKomiteId, statusSignature) VALUES (?, ?, ?, ?)');
  pejabatList.forEach(pj => insertSig.run('berita_acara', baId, pj.id, 'pending'));

  db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
    .run(klaimId, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', `Mengajukan klaim ke Sidang Komite. Berita Acara ${nomorBa} diterbitkan.` + (catatan ? ` Catatan: ${catatan}` : ''));

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: 'Klaim berhasil diajukan ke Sidang Komite, Berita Acara telah diterbitkan' });
});

// 11. E-sign Berita Acara (Sidang Komite)
app.post('/api/klaims/:id/esign', (req, res) => {
  const klaimId = parseInt(req.params.id);
  const klaim = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  if (!klaim) {
    return res.status(404).json({ message: 'Klaim tidak ditemukan' });
  }

  const { esignSignatureId, action } = req.body;
  const sig = db.prepare('SELECT * FROM esign_signatures WHERE id = ?').get(esignSignatureId);
  if (!sig) {
    return res.status(404).json({ message: 'Slot tanda tangan tidak ditemukan' });
  }
  const pejabat = db.prepare('SELECT * FROM pejabat_komites WHERE id = ?').get(sig.pejabatKomiteId);
  const actorNama = `${pejabat?.nama || 'Pejabat Komite'} (${pejabat?.jabatan || 'Komite'})`;

  if (action === 'reject') {
    db.prepare('UPDATE esign_signatures SET statusSignature = ?, tanggalSignature = ? WHERE id = ?')
      .run('rejected', new Date().toISOString(), sig.id);
    db.prepare('UPDATE berita_acaras SET status = ? WHERE id = ?').run('ditolak', sig.dokumenId);
    db.prepare('UPDATE klaims SET statusId = 9, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);
    db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
      .run(klaimId, new Date().toISOString(), pejabat?.id || null, actorNama, 'komite', 'Menolak Berita Acara pada Sidang Komite. Klaim ditolak.');
  } else {
    db.prepare('UPDATE esign_signatures SET statusSignature = ?, tanggalSignature = ? WHERE id = ?')
      .run('signed', new Date().toISOString(), sig.id);
    db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
      .run(klaimId, new Date().toISOString(), pejabat?.id || null, actorNama, 'komite', 'Menandatangani Berita Acara Sidang Komite (E-sign)');

    const remaining = db.prepare("SELECT COUNT(*) as cnt FROM esign_signatures WHERE dokumenType = 'berita_acara' AND dokumenId = ? AND statusSignature = 'pending'").get(sig.dokumenId).cnt;
    if (remaining === 0) {
      db.prepare('UPDATE berita_acaras SET status = ? WHERE id = ?').run('disetujui', sig.dokumenId);
      db.prepare('UPDATE klaims SET statusId = 8, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), klaimId);
      db.prepare('INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)')
        .run(klaimId, new Date().toISOString(), 3, 'Sistem', 'komite', 'Seluruh anggota Komite telah menandatangani Berita Acara. Klaim Disetujui.');
    }
  }

  const updated = db.prepare('SELECT * FROM klaims WHERE id = ?').get(klaimId);
  res.json({ data: enrichKlaim(updated), message: action === 'reject' ? 'Dokumen ditolak, klaim dihentikan' : 'Tanda tangan berhasil disematkan' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🚀 REAL BACKEND REST API RUNNING ON PORT ${PORT}`);
  console.log(`  📁 Database: SQLite (server/database.sqlite)`);
  console.log(`  📂 File Uploads: server/uploads/`);
  console.log(`=======================================================`);
});
