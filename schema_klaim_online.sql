-- ==============================================================================
-- DATABASE SCHEMA: db_klaim_online
-- Aplikasi Klaim Online PT Jamkrida Jabar v2.0
-- Target DBMS: MySQL 8.0+ / MariaDB 10.4+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `db_klaim_online` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_klaim_online`;

-- Disable Foreign Key checks during schema initialization
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: roles
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `is_super_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: mitras
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `mitras`;
CREATE TABLE `mitras` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nama_mitra` VARCHAR(255) NOT NULL,
  `alamat` TEXT NULL,
  `kontak` VARCHAR(255) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: pejabat_komites
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `pejabat_komites`;
CREATE TABLE `pejabat_komites` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `jabatan` ENUM('Ketua Komite Klaim', 'Anggota Komite Klaim') NOT NULL DEFAULT 'Anggota Komite Klaim',
  `urutan` INT NOT NULL DEFAULT 1,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: users
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `mitra_id` INT UNSIGNED NULL,
  `pejabat_komite_id` INT UNSIGNED NULL,
  `avatar_path` VARCHAR(255) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_users_mitra` FOREIGN KEY (`mitra_id`) REFERENCES `mitras` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_pejabat` FOREIGN KEY (`pejabat_komite_id`) REFERENCES `pejabat_komites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: produk_penjaminans
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `produk_penjaminans`;
CREATE TABLE `produk_penjaminans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(255) NOT NULL,
  `cover_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.70,
  `batas_hari` INT NOT NULL DEFAULT 180,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: penyebab_klaims
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `penyebab_klaims`;
CREATE TABLE `penyebab_klaims` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nama_penyebab` VARCHAR(255) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: sertifikat_penjaminans
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sertifikat_penjaminans`;
CREATE TABLE `sertifikat_penjaminans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nomor_sp` VARCHAR(100) NOT NULL UNIQUE,
  `mitra_id` INT UNSIGNED NOT NULL,
  `produk_id` INT UNSIGNED NOT NULL,
  `nama_debitur` VARCHAR(255) NOT NULL,
  `bidang_usaha` VARCHAR(255) NULL,
  `plafon_kredit` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `baki_debet` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `kolektibilitas` INT NOT NULL DEFAULT 1,
  `tanggal_macet` DATE NULL,
  `tanggal_expire` DATE NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sp_mitra` FOREIGN KEY (`mitra_id`) REFERENCES `mitras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_produk` FOREIGN KEY (`produk_id`) REFERENCES `produk_penjaminans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: klaim_statuses
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `klaim_statuses`;
CREATE TABLE `klaim_statuses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `urutan` INT NOT NULL DEFAULT 1,
  `is_final` TINYINT(1) NOT NULL DEFAULT 0,
  `sla_hari` INT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table: modules
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT UNSIGNED NULL,
  `kode` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `route_slug` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_modules_parent` FOREIGN KEY (`parent_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Table: role_permissions
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `module_id` INT UNSIGNED NOT NULL,
  `can_view` TINYINT(1) NOT NULL DEFAULT 1,
  `can_create` TINYINT(1) NOT NULL DEFAULT 0,
  `can_edit` TINYINT(1) NOT NULL DEFAULT 0,
  `can_delete` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_perm_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_perm_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Table: klaims
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `klaims`;
CREATE TABLE `klaims` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `kode_klaim` VARCHAR(50) NOT NULL UNIQUE,
  `sertifikat_penjaminan_id` INT UNSIGNED NOT NULL,
  `mitra_id` INT UNSIGNED NOT NULL,
  `penyebab_klaim_id` INT UNSIGNED NULL,
  `status_id` INT UNSIGNED NOT NULL,
  `baki_debet_klaim` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `cover_percentage_snapshot` DECIMAL(5,2) NOT NULL DEFAULT 0.70,
  `nilai_klaim` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `tanggal_pengajuan` DATE NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_klaim_sp` FOREIGN KEY (`sertifikat_penjaminan_id`) REFERENCES `sertifikat_penjaminans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_klaim_mitra` FOREIGN KEY (`mitra_id`) REFERENCES `mitras` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_klaim_penyebab` FOREIGN KEY (`penyebab_klaim_id`) REFERENCES `penyebab_klaims` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_klaim_status` FOREIGN KEY (`status_id`) REFERENCES `klaim_statuses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Table: berita_acaras
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `berita_acaras`;
CREATE TABLE `berita_acaras` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `nomor_ba` VARCHAR(100) NOT NULL UNIQUE,
  `status_dokumen` ENUM('menunggu_esign', 'selesai') NOT NULL DEFAULT 'menunggu_esign',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ba_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Table: surat_keputusans
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `surat_keputusans`;
CREATE TABLE `surat_keputusans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `nomor_sk` VARCHAR(100) NOT NULL UNIQUE,
  `status_dokumen` ENUM('menunggu_esign', 'selesai') NOT NULL DEFAULT 'menunggu_esign',
  `keputusan` ENUM('disetujui', 'ditolak') NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sk_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. Table: esign_signatures
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `esign_signatures`;
CREATE TABLE `esign_signatures` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `dokumen_type` ENUM('berita_acara', 'surat_keputusan') NOT NULL,
  `dokumen_id` INT UNSIGNED NOT NULL,
  `pejabat_komite_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'signed', 'rejected') NOT NULL DEFAULT 'pending',
  `signed_at` TIMESTAMP NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_esign_pejabat` FOREIGN KEY (`pejabat_komite_id`) REFERENCES `pejabat_komites` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. Table: memo_pembayarans
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `memo_pembayarans`;
CREATE TABLE `memo_pembayarans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `nomor_memo` VARCHAR(100) NOT NULL UNIQUE,
  `esign_status` ENUM('menunggu', 'selesai') NOT NULL DEFAULT 'menunggu',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_memo_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. Table: pembayarans
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `pembayarans`;
CREATE TABLE `pembayarans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `tanggal_bayar` DATE NOT NULL,
  `bukti_bayar_path` VARCHAR(255) NOT NULL,
  `dikonfirmasi_ke_mitra` TINYINT(1) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bayar_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 17. Table: bandings
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `bandings`;
CREATE TABLE `bandings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `tanggal_pengajuan` DATE NOT NULL,
  `alasan` TEXT NOT NULL,
  `status` ENUM('diajukan', 'diproses') NOT NULL DEFAULT 'diajukan',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_banding_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. Table: klaim_status_histories
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `klaim_status_histories`;
CREATE TABLE `klaim_status_histories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `klaim_id` INT UNSIGNED NOT NULL,
  `waktu` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor_user_id` INT UNSIGNED NULL,
  `actor_nama` VARCHAR(255) NOT NULL,
  `actor_peran` VARCHAR(100) NOT NULL,
  `aksi` TEXT NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hist_klaim` FOREIGN KEY (`klaim_id`) REFERENCES `klaims` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hist_user` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 19. Table: access_logs
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `access_logs`;
CREATE TABLE `access_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NOT NULL,
  `method` VARCHAR(10) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `aksi` TEXT NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 20. Table: settings
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `app_name` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(255) NULL,
  `favicon_url` VARCHAR(255) NULL,
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#2c3691',
  `secondary_color` VARCHAR(20) NOT NULL DEFAULT '#0da24b',
  `font_family` VARCHAR(50) NOT NULL DEFAULT 'Inter',
  `footer_text` TEXT NOT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(100) NOT NULL,
  `meta_description` TEXT NULL,
  `meta_keywords` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 1;


-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Roles
INSERT INTO `roles` (`id`, `kode`, `nama`, `is_super_admin`, `active`) VALUES
(1, 'super_admin', 'Super Admin', 1, 1),
(2, 'mitra', 'Mitra Bank/BPR', 0, 1),
(3, 'klaim', 'Staf Bagian Klaim', 0, 1),
(4, 'komite', 'Pejabat Komite Klaim', 0, 1),
(5, 'keuangan', 'Staf Keuangan', 0, 1);

-- 2. Mitras
INSERT INTO `mitras` (`id`, `nama_mitra`, `alamat`, `kontak`, `active`) VALUES
(1, 'PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (BJB)', 'Jl. Naripan No. 12-14, Bandung', 'Bp. Ronald (0812-3456-7890)', 1),
(2, 'BPR Karya Utama Jabar', 'Jl. Raya Jatinangor No. 202, Sumedang', 'Ibu Dian (0811-2233-4455)', 1),
(3, 'Bank DKI Syariah - Cab. Bandung', 'Jl. Asia Afrika No. 100, Bandung', 'Bp. Farid (0813-9988-7766)', 1);

-- 3. Pejabat Komites
INSERT INTO `pejabat_komites` (`id`, `nama`, `jabatan`, `urutan`, `active`) VALUES
(1, 'Dr. H. Heri Soekarno, SE, MM', 'Ketua Komite Klaim', 1, 1),
(2, 'Ir. Bambang Yudho, M.Si', 'Anggota Komite Klaim', 2, 1),
(3, 'Siti Rahmawati, SE, Ak', 'Anggota Komite Klaim', 3, 1);

-- 4. Users (Passwords hashed using bcrypt for "password123" and "password")
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `mitra_id`, `pejabat_komite_id`, `avatar_path`, `active`) VALUES
(1, 'Administrator Utama', 'superadmin@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NULL, NULL, NULL, 1),
(2, 'Budi Santoso (Bank BJB)', 'mitra@bjb.co.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, NULL, NULL, 1),
(3, 'Andi Wijaya (Staf Klaim)', 'klaim@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, NULL, NULL, NULL, 1),
(4, 'Dr. H. Heri Soekarno (Ketua)', 'ketua.komite@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, NULL, 1, NULL, 1),
(5, 'Ir. Bambang Yudho (Anggota 1)', 'anggota1@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, NULL, 2, NULL, 1),
(6, 'Siti Rahmawati, SE (Anggota 2)', 'anggota2@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, NULL, 3, NULL, 1),
(7, 'Hendra Yusuf (Keuangan)', 'keuangan@jamkrida.online', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, NULL, NULL, NULL, 1);

-- 5. Produk Penjaminan
INSERT INTO `produk_penjaminans` (`id`, `kode`, `nama`, `cover_percentage`, `batas_hari`, `active`) VALUES
(1, 'KMU', 'Kredit Mikro Utama', 0.70, 180, 1),
(2, 'KM', 'Kredit Multiguna', 0.75, 120, 1),
(3, 'KU', 'Kredit Usaha Rakyat (KUR)', 0.80, 90, 1),
(4, 'SYR', 'Kafalah Pembiayaan Syariah', 0.70, 180, 1);

-- 6. Penyebab Klaim
INSERT INTO `penyebab_klaims` (`id`, `nama_penyebab`, `active`) VALUES
(1, 'Debitur Wanprestasi / Macet Kredit', 1),
(2, 'Debitur Meninggal Dunia (Proteksi Jiwa)', 1),
(3, 'Bencana Alam / Force Majeure Usaha', 1),
(4, 'Usaha Bangkrut / Kebakaran Tempat Usaha', 1);

-- 7. Sertifikat Penjaminan
INSERT INTO `sertifikat_penjaminans` (`id`, `nomor_sp`, `mitra_id`, `produk_id`, `nama_debitur`, `bidang_usaha`, `plafon_kredit`, `baki_debet`, `kolektibilitas`, `tanggal_macet`, `tanggal_expire`, `active`) VALUES
(1, 'SP-2026-JB-000001', 1, 1, 'Ahmad Faisal', 'Perdagangan Sembako', 85000000.00, 85000000.00, 5, '2026-05-10', '2027-12-31', 1),
(2, 'SP-2026-JB-000002', 1, 2, 'Indah Purnamasari', 'Jasa Konveksi & Pakaian', 38000000.00, 38000000.00, 5, '2026-06-01', '2027-06-30', 1),
(3, 'SP-2026-JB-000003', 1, 3, 'Sugeng Priyanto', 'Bengkel Motor & Sparepart', 150000000.00, 142000000.00, 4, '2026-06-15', '2028-01-15', 1),
(4, 'SP-2026-JB-000004', 2, 1, 'Dedi Suhendar', 'Katering & Kuliner', 45000000.00, 45000000.00, 5, '2026-04-20', '2027-04-20', 1),
(5, 'SP-2026-JB-000005', 1, 1, 'Rani Kartika', 'Toko Kelontong & ATK', 30000000.00, 28000000.00, 5, '2026-07-01', '2027-07-01', 1);

-- 8. Klaim Statuses
INSERT INTO `klaim_statuses` (`id`, `kode`, `nama`, `urutan`, `is_final`, `sla_hari`, `active`) VALUES
(1, 'draft', 'Draft Pengajuan', 1, 0, 3, 1),
(2, 'diajukan', 'Diajukan Mitra', 2, 0, 3, 1),
(3, 'verifikasi', 'Verifikasi Dokumen', 3, 0, 5, 1),
(4, 'perbaikan', 'Perlu Perbaikan Dokumen', 4, 0, 7, 1),
(5, 'survei', 'Survei Lapangan', 5, 0, 7, 1),
(6, 'assessment', 'Kajian & Assessment Klaim', 6, 0, 5, 1),
(7, 'komite', 'Keputusan Sidang Komite', 7, 0, 5, 1),
(8, 'disetujui', 'Disetujui Komite', 8, 0, 3, 1),
(9, 'ditolak', 'Ditolak Komite', 9, 1, NULL, 1),
(10, 'banding', 'Proses Banding Mitra', 10, 0, 14, 1),
(11, 'memo', 'Terbit Memo Bayar', 11, 0, 3, 1),
(12, 'dibayar', 'Dana Klaim Dibayar', 12, 0, 3, 1),
(13, 'selesai', 'Selesai (Final)', 13, 1, NULL, 1);

-- 9. Modules
INSERT INTO `modules` (`id`, `parent_id`, `kode`, `nama`, `route_slug`, `icon`, `active`) VALUES
(1, NULL, 'referensi', 'Data Referensi', 'referensi', 'briefcase', 1),
(2, NULL, 'utility', 'Utility & System', 'utility', 'gear', 1),
(21, 2, 'utility-setting-web', 'Setting Web', 'utility/setting-web', '', 1),
(22, 2, 'utility-role-module', 'Role & Izin', 'utility/role-module', '', 1),
(23, 2, 'utility-log-access', 'Audit Log', 'utility/log-access', '', 1),
(3, NULL, 'pengajuan', 'Pengajuan Klaim', 'pengajuan', 'file-sheet', 1),
(4, NULL, 'verifikasi', 'Analisa & Verifikasi', 'verifikasi', 'check-square', 1),
(7, NULL, 'komite', 'Sidang Komite', 'komite', 'fingerprint', 1),
(8, NULL, 'pembayaran', 'Pembayaran Klaim', 'pembayaran', 'wallet', 1),
(10, NULL, 'profile', 'Profil Saya', 'profile', 'user', 1);

-- 10. Role Permissions
INSERT INTO `role_permissions` (`id`, `role_id`, `module_id`, `can_view`, `can_create`, `can_edit`, `can_delete`) VALUES
(1, 2, 3, 1, 1, 1, 0), -- Mitra: Pengajuan
(2, 2, 10, 1, 1, 1, 0), -- Mitra: Profile
(3, 3, 1, 1, 0, 0, 0), -- Staf Klaim: Referensi
(4, 3, 3, 1, 0, 0, 0), -- Staf Klaim: Pengajuan
(5, 3, 4, 1, 1, 1, 0), -- Staf Klaim: Verifikasi
(6, 3, 8, 1, 1, 1, 0), -- Staf Klaim: Pembayaran
(7, 3, 10, 1, 1, 1, 0), -- Staf Klaim: Profile
(8, 4, 7, 1, 1, 1, 0), -- Komite: Sidang Komite
(9, 4, 10, 1, 1, 1, 0), -- Komite: Profile
(10, 5, 8, 1, 1, 1, 0), -- Keuangan: Pembayaran
(11, 5, 10, 1, 1, 1, 0); -- Keuangan: Profile

-- 11. Initial Klaims
INSERT INTO `klaims` (`id`, `kode_klaim`, `sertifikat_penjaminan_id`, `mitra_id`, `penyebab_klaim_id`, `status_id`, `baki_debet_klaim`, `cover_percentage_snapshot`, `nilai_klaim`, `tanggal_pengajuan`, `active`) VALUES
(1, 'KLM-2026-0001', 1, 1, 1, 3, 85000000.00, 0.70, 59500000.00, '2026-07-28', 1),
(2, 'KLM-2026-0002', 2, 1, 1, 7, 38000000.00, 0.75, 28500000.00, '2026-07-29', 1),
(3, 'KLM-2026-0003', 5, 1, 1, 2, 28000000.00, 0.70, 19600000.00, '2026-08-02', 1);

-- 12. Berita Acara & Signatures Seed
INSERT INTO `berita_acaras` (`id`, `klaim_id`, `nomor_ba`, `status_dokumen`, `active`) VALUES
(1, 2, 'BA-0001/KLM/JJ/2026', 'menunggu_esign', 1);

INSERT INTO `esign_signatures` (`id`, `dokumen_type`, `dokumen_id`, `pejabat_komite_id`, `status`, `signed_at`, `active`) VALUES
(1, 'berita_acara', 1, 1, 'pending', NULL, 1),
(2, 'berita_acara', 1, 2, 'pending', NULL, 1),
(3, 'berita_acara', 1, 3, 'pending', NULL, 1);

-- 13. Klaim Status Histories
INSERT INTO `klaim_status_histories` (`id`, `klaim_id`, `waktu`, `actor_user_id`, `actor_nama`, `actor_peran`, `aksi`, `active`) VALUES
(1, 1, '2026-07-28 10:00:00', 2, 'Budi Santoso', 'mitra', 'Mengajukan pengajuan klaim baru untuk debitur Ahmad Faisal', 1),
(2, 1, '2026-07-28 14:30:00', 3, 'Andi Wijaya', 'klaim', 'Mengambil berkas dan memulai proses verifikasi dokumen', 1),
(3, 2, '2026-07-29 09:15:00', 2, 'Budi Santoso', 'mitra', 'Mengajukan pengajuan klaim baru untuk debitur Indah Purnamasari', 1),
(4, 2, '2026-07-29 11:20:00', 3, 'Andi Wijaya', 'klaim', 'Selesai assessment & mengirimkan berkas ke Sidang Komite (Terbit BA-0001/KLM/JJ/2026)', 1),
(5, 3, '2026-08-02 08:30:00', 2, 'Budi Santoso', 'mitra', 'Mengajukan pengajuan klaim baru untuk debitur Rani Kartika', 1);

-- 14. Settings
INSERT INTO `settings` (`id`, `app_name`, `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `font_family`, `footer_text`, `contact_email`, `contact_phone`, `meta_description`, `meta_keywords`) VALUES
(1, 'Aplikasi Klaim Online PT Jamkrida Jabar', NULL, NULL, '#2c3691', '#0da24b', 'Inter', '© 2026 PT Jamkrida Jabar (Perseroda). All rights reserved.', 'info@jamkrida-jabar.co.id', '+62 (022) 7504-777', 'Aplikasi Klaim Online PT Jamkrida Jabar', 'jamkrida, klaim, online, jabar');
