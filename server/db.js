const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Inisialisasi Skema Tabel SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    roleId INTEGER NOT NULL,
    roleName TEXT NOT NULL,
    mitraId INTEGER,
    nip TEXT,
    jabatan TEXT,
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS mitras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kodeMitra TEXT UNIQUE NOT NULL,
    namaMitra TEXT NOT NULL,
    jenisMitra TEXT,
    alamat TEXT,
    telepon TEXT,
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS produk_penjaminans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    coverPercentage REAL NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS penyebab_klaims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT UNIQUE NOT NULL,
    namaPenyebab TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS klaim_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    urutan INTEGER NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS jenis_dokumens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    wajib INTEGER DEFAULT 1,
    urutan INTEGER NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS pejabat_komites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT NOT NULL,
    nama TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    urutan INTEGER NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sertifikat_penjaminans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomorSp TEXT UNIQUE NOT NULL,
    namaDebitur TEXT NOT NULL,
    tanggalAkad TEXT,
    plafonKredit REAL NOT NULL,
    bakiDebet REAL NOT NULL,
    produkId INTEGER,
    mitraId INTEGER,
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS klaims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kodeKlaim TEXT UNIQUE NOT NULL,
    sertifikatPenjaminanId INTEGER NOT NULL,
    mitraId INTEGER NOT NULL,
    penyebabKlaimId INTEGER NOT NULL,
    statusId INTEGER NOT NULL,
    bakiDebetKlaim REAL NOT NULL,
    coverPercentageSnapshot REAL DEFAULT 0.70,
    nilaiKlaim REAL NOT NULL,
    tanggalPengajuan TEXT,
    tanggalMacet TEXT,
    catatanPerbaikan TEXT,
    isResubmitted INTEGER DEFAULT 0,
    draftOnly INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS klaim_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    jenisDokumenId INTEGER NOT NULL,
    ada INTEGER DEFAULT 0,
    filePath TEXT,
    fileName TEXT,
    fileType TEXT,
    kesesuaian TEXT DEFAULT 'belum_diperiksa',
    catatanPemeriksaan TEXT,
    isReplaced INTEGER DEFAULT 0,
    replacedAt TEXT,
    uploadedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS klaim_status_histories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    waktu TEXT NOT NULL,
    actorUserId INTEGER,
    actorNama TEXT,
    actorPeran TEXT,
    aksi TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    nomorPermohonan TEXT,
    tanggalSurvey TEXT,
    catatan TEXT,
    dokumenLaporanPath TEXT,
    approvedByMitra INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS berita_acaras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    nomorBa TEXT,
    tanggalBa TEXT,
    kesimpulan TEXT,
    usulanNilaiKlaim REAL,
    status TEXT DEFAULT 'draft',
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS surat_keputusans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    nomorSk TEXT,
    tanggalSk TEXT,
    nilaiDisetujui REAL,
    status TEXT DEFAULT 'draft',
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS esign_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dokumenType TEXT NOT NULL,
    dokumenId INTEGER NOT NULL,
    pejabatKomiteId INTEGER NOT NULL,
    statusSignature TEXT DEFAULT 'pending',
    tanggalSignature TEXT,
    ipAddress TEXT,
    qrCodeData TEXT
  );

  CREATE TABLE IF NOT EXISTS memo_pembayarans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    nomorMemo TEXT,
    tanggalMemo TEXT,
    nominalBayar REAL,
    bankPenerima TEXT,
    noRekeningPenerima TEXT,
    namaPenerima TEXT,
    status TEXT DEFAULT 'disetujui',
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS pembayarans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    nomorVoucher TEXT,
    tanggalBayar TEXT,
    nominalTransfer REAL,
    bankPengirim TEXT,
    noRekeningPengirim TEXT,
    buktiTransferPath TEXT,
    disetujuiOleh TEXT,
    status TEXT DEFAULT 'selesai',
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS bandings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    klaimId INTEGER NOT NULL,
    tanggalPengajuan TEXT,
    alasan TEXT,
    status TEXT DEFAULT 'diajukan',
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );
`);

// Reset seed for clean update
db.prepare('DELETE FROM klaim_documents').run();
db.prepare('DELETE FROM klaim_status_histories').run();
db.prepare('DELETE FROM klaims').run();

console.log("Seeding ulang data klaim (KLM-2026-0001: isResubmitted = 0, menunggu tombol Ajukan Kembali)...");

// 9. Klaim Seed (isResubmitted = 0 until Mitra clicks Ajukan Kembali)
const insertKlaim = db.prepare(`
  INSERT INTO klaims (id, kodeKlaim, sertifikatPenjaminanId, mitraId, penyebabKlaimId, statusId, bakiDebetKlaim, coverPercentageSnapshot, nilaiKlaim, tanggalPengajuan, tanggalMacet, catatanPerbaikan, isResubmitted, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertKlaim.run(
  1, 'KLM-2026-0001', 1, 1, 1, 4, 85000000, 0.70, 59500000, '2026-08-02', '2026-06-01',
  'Mohon perbaiki dokumen Scan KTP & Rekening Koran sesuai catatan per berkas.', 0,
  new Date().toISOString(), new Date().toISOString()
);
insertKlaim.run(
  2, 'KLM-2026-0002', 2, 1, 1, 4, 65000000, 0.70, 45500000, '2026-08-02', '2026-05-15',
  'Sertifikat Penjaminan (Asli/Copy): dokumen tidak sesuai (tidak terlihat)', 0,
  new Date().toISOString(), new Date().toISOString()
);

// 10. Documents Seed
const insertDoc = db.prepare(`
  INSERT INTO klaim_documents (id, klaimId, jenisDokumenId, ada, filePath, fileName, fileType, kesesuaian, catatanPemeriksaan, isReplaced, replacedAt, uploadedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
// KLM-2026-0001
insertDoc.run(1, 1, 1, 1, '/documents/uploaded_sample.pdf', 'Sertifikat_Ahmad_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
insertDoc.run(2, 1, 2, 1, '/documents/uploaded_sample.pdf', 'PK_Ahmad_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
insertDoc.run(3, 1, 3, 1, '/documents/uploaded_sample.pdf', 'Rekening_Koran_Faisal_Revisi.pdf', 'application/pdf', 'tidak_sesuai', 'Rekening koran 3 bulan terakhir kurang bulan ke-3. Mohon unggah lembar bulan ke-3.', 1, new Date().toISOString(), new Date().toISOString());
insertDoc.run(4, 1, 4, 1, '/documents/uploaded_sample.pdf', 'Surat_Tagihan_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
insertDoc.run(5, 1, 5, 1, '/documents/uploaded_sample.pdf', 'KTP_KK_Faisal_Revisi.pdf', 'application/pdf', 'tidak_sesuai', 'Scan KTP & KK debitur buram dan NIK tidak dapat terverifikasi. Mohon unggah ulang scan KTP asli.', 1, new Date().toISOString(), new Date().toISOString());
insertDoc.run(6, 1, 6, 1, '/documents/uploaded_sample.pdf', 'Analisa_Kredit_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
insertDoc.run(7, 1, 7, 1, '/documents/uploaded_sample.pdf', 'Laporan_Penagihan_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
insertDoc.run(8, 1, 8, 1, '/documents/uploaded_sample.pdf', 'Surat_Kematian_Faisal.pdf', 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());

// KLM-2026-0002 (Doc 1 marked tidak_sesuai for revision testing)
insertDoc.run(9, 2, 1, 1, '/documents/uploaded_sample.pdf', 'Sertifikat_Sugeng.pdf', 'application/pdf', 'tidak_sesuai', 'Sertifikat Penjaminan (Asli/Copy): dokumen tidak sesuai (tidak terlihat)', 0, null, new Date().toISOString());
for (let i = 2; i <= 8; i++) {
  insertDoc.run(8 + i, 2, i, 1, '/documents/uploaded_sample.pdf', `Document_${i}_Sugeng.pdf`, 'application/pdf', 'sesuai', '', 0, null, new Date().toISOString());
}

// 11. Status History Seed
const insertHistory = db.prepare(`INSERT INTO klaim_status_histories (klaimId, waktu, actorUserId, actorNama, actorPeran, aksi) VALUES (?, ?, ?, ?, ?, ?)`);
insertHistory.run(1, new Date().toISOString(), 2, 'Budi Santoso (Bank BJB)', 'mitra', 'Membuat draft klaim baru');
insertHistory.run(1, new Date().toISOString(), 2, 'Budi Santoso (Bank BJB)', 'mitra', 'Mengajukan berkas klaim lengkap (Status: Diajukan)');
insertHistory.run(1, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', 'Mengambil klaim untuk diverifikasi');
insertHistory.run(1, new Date().toISOString(), 3, 'Andi Wijaya (Staf Klaim)', 'klaim', 'Berkas tidak lengkap. Catatan verifikasi: Mohon perbaiki dokumen Scan KTP & Rekening Koran');

console.log("Seeding data SQLite dengan isResubmitted = 0 SELESAI!");

module.exports = db;
