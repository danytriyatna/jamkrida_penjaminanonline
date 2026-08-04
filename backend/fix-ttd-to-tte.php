<?php
// One-off script: perbaiki istilah "TTD" -> "TTE" pada data yang sudah tersimpan di DB
// (data referensi/seed lama, sebelum penyeragaman istilah ke "TTE").

$host = '127.0.0.1';
$port = '3306';
$db   = 'db_klaim_online';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

echo "Memperbaiki istilah TTD -> TTE pada data klaim_statuses...\n";

$stmt = $pdo->prepare("UPDATE klaim_statuses SET nama = REPLACE(nama, 'TTD', 'TTE') WHERE nama LIKE '%TTD%'");
$stmt->execute();
echo "  -> {$stmt->rowCount()} baris klaim_statuses diperbaiki.\n";

echo "\nSelesai.\n";
