<?php
// One-off script: backfill Surat Keputusan (SK) untuk klaim yang BA-nya sudah full-signed
// sebelum fitur auto-generate SK ditambahkan.

$host = '127.0.0.1';
$port = '3306';
$db   = 'db_klaim_online';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

echo "Mencari klaim yang sudah disetujui komite tapi belum punya SK...\n";

// Ambil semua klaim dengan status disetujui/memo/dibayar/selesai (id 8,10,11,12) yang punya BA
$stmt = $pdo->query("
    SELECT k.id AS klaim_id, k.nilai_klaim, ba.id AS ba_id, ba.nomor_ba
    FROM klaims k
    INNER JOIN berita_acaras ba ON ba.klaim_id = k.id
    WHERE k.status_id IN (8, 10, 11, 12)
");
$candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);

$countSk = (int) $pdo->query("SELECT COUNT(*) FROM surat_keputusans")->fetchColumn();
$created = 0;

foreach ($candidates as $c) {
    // Skip jika sudah ada SK untuk klaim ini
    $existsStmt = $pdo->prepare("SELECT COUNT(*) FROM surat_keputusans WHERE klaim_id = ?");
    $existsStmt->execute([$c['klaim_id']]);
    if ((int) $existsStmt->fetchColumn() > 0) {
        continue;
    }

    // Pastikan semua tanda tangan BA sudah signed (bukan masih pending)
    $pendingStmt = $pdo->prepare("SELECT COUNT(*) FROM esign_signatures WHERE dokumen_type = 'berita_acara' AND dokumen_id = ? AND status = 'pending'");
    $pendingStmt->execute([$c['ba_id']]);
    if ((int) $pendingStmt->fetchColumn() > 0) {
        continue; // belum full-signed, lewati
    }

    $countSk++;
    $nomorSk = 'SK-' . date('Y') . '-' . str_pad($countSk, 4, '0', STR_PAD_LEFT);

    $insert = $pdo->prepare("
        INSERT INTO surat_keputusans (klaim_id, berita_acara_id, nomor_sk, tanggal_sk, nilai_disetujui, status, active, created_at, updated_at)
        VALUES (?, ?, ?, CURDATE(), ?, 'disetujui', 1, NOW(), NOW())
    ");
    $insert->execute([$c['klaim_id'], $c['ba_id'], $nomorSk, $c['nilai_klaim']]);

    $histInsert = $pdo->prepare("
        INSERT INTO klaim_status_histories (klaim_id, waktu, actor_user_id, actor_nama, actor_peran, aksi, created_at, updated_at)
        VALUES (?, NOW(), 3, 'Sistem', 'komite', ?, NOW(), NOW())
    ");
    $histInsert->execute([$c['klaim_id'], "Surat Keputusan (SK) Klaim {$nomorSk} diterbitkan (backfill) berdasarkan Berita Acara {$c['nomor_ba']} yang sudah full-signed."]);

    echo "  -> Klaim #{$c['klaim_id']}: SK {$nomorSk} dibuat.\n";
    $created++;
}

echo "\nSelesai. Total SK baru dibuat: {$created}\n";
