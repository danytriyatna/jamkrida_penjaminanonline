# Klaim Online v2.00 - Interactive Mockup & UI Prototype

Ini adalah folder mockup/prototype interaktif mandiri (*self-contained*) untuk frontend **Aplikasi Klaim Online PT Jamkrida Jabar v2.00**.

Mockup ini **tidak terhubung ke database atau backend API nyata**, melainkan menggunakan database dummy lokal (`MockDb.ts`) yang disematkan langsung di dalam aplikasi dan disimpan pada `localStorage` browser Anda. Seluruh alur data, peran pengguna (*roles*), dan transisi berkas (*state machine*) disimulasikan secara dinamis.

---

## 🚀 Cara Menjalankan

1. Masuk ke folder mockup ini:
   ```bash
   cd klaim-online-mockup
   ```

2. Jalankan server development Vite:
   ```bash
   npm run dev
   ```

3. Buka alamat yang tertera di terminal Anda (biasanya `http://localhost:5173`).

---

## 👥 Akun Demo & Skenario Peran

Pada halaman login, Anda dapat mengklik tombol **"Akun Mockup"** untuk mengisi form login secara otomatis. Berikut adalah peran yang tersedia untuk menguji alur kerja:

| Email Akun | Password | Peran (Role) | Deskripsi Simulasi |
| :--- | :--- | :--- | :--- |
| **`superadmin@jamkrida.online`** | `password123` | **Super Admin** | Akses bypass penuh ke seluruh menu termasuk modul Utility (Pengaturan Web, CRUD Role & Registry Modul, Log Akses). |
| **`mitra@bjb.co.id`** | `password` | **Mitra (Bank BJB)** | Mengajukan klaim dengan mencari debitur macet di portofolionya, upload berkas, dan memantau status. |
| **`klaim@jamkrida.online`** | `password` | **Bagian Klaim** | Tim internal yang memverifikasi dokumen mitra, membuat disposisi survei, melakukan assessment, mengajukan ke komite, dan menerbitkan memo bayar. |
| **`ketua.komite@jamkrida.online`** | `password` | **Ketua Komite** | Meninjau berkas Berita Acara (BA) dan Surat Keputusan (SK) untuk ditandatangani elektronik (E-sign). |
| **`anggota1@jamkrida.online`** | `password` | **Anggota Komite 1** | Anggota sidang komite yang berhak menandatangani dokumen komite. |
| **`anggota2@jamkrida.online`** | `password` | **Anggota Komite 2** | Anggota sidang komite yang berhak menandatangani dokumen komite. |
| **`keuangan@jamkrida.online`** | `password` | **Staf Keuangan** | Mencatat realisasi transfer dana klaim ke rekening mitra dan mengupload bukti transfer. |

---

## 🔄 Cara Menguji Alur Kerja Penjaminan Klaim (State Machine)

Anda dapat melakukan simulasi alur berkas dari hulu ke hilir dengan bertukar akun (Log out -> Log in sebagai akun lain) sebagai berikut:

1. **Pengajuan (Mitra BJB):**
   - Login sebagai `mitra@bjb.co.id`.
   - Buka menu **Pengajuan Klaim** -> Klik **Ajukan Klaim Baru**.
   - Pilih Debitur (misal: *Sugeng Priyanto*). Nominal klaim akan otomatis terhitung.
   - Pilih penyebab macet, upload file-file dokumen wajib (dummy file saja), lalu klik **Kirim Pengajuan Klaim**.
   - Berkas akan masuk ke status `Diajukan`.

2. **Verifikasi & Analisa (Bagian Klaim):**
   - Login sebagai `klaim@jamkrida.online`.
   - Buka menu **Analisa & Verifikasi** -> Tab **Pengajuan Baru** -> Klik **Ambil Berkas** pada berkas yang baru saja diajukan.
   - Buka berkas tersebut di tab **Verifikasi & Analisa Berjalan**.
   - Anda dapat memilih:
     - *Minta Perbaikan:* Berkas kembali ke status `Perlu Perbaikan` di halaman Mitra.
     - *Jadwalkan Survei:* Status bergeser ke `Survei Lapangan`. Anda harus mengupload laporan survei sebelum bisa mengembalikan berkas ke meja Analisa.
     - *Assessment:* Lanjutkan berkas ke tahap kajian kelayakan keuangan, lalu klik **Kirim ke Sidang Komite**.
   - Berkas akan masuk ke status `Keputusan Komite`.

3. **Sidang Komite (E-sign Berjenjang):**
   - Berkas yang masuk ke Komite membutuhkan persetujuan **Ketua + 2 Anggota Komite**.
   - Login berturut-turut sebagai:
     - `ketua.komite@jamkrida.online`
     - `anggota1@jamkrida.online`
     - `anggota2@jamkrida.online`
   - Pada menu **Sidang Komite**, setiap pejabat meninjau draf **Berita Acara (BA)**. Klik **Setujui & TTD**.
   - Jika salah satu komite memilih *Tolak*, berkas klaim langsung berstatus `Ditolak`.
   - Jika ketiga pejabat selesai menandatangani BA, sistem akan otomatis menerbitkan draf **Surat Keputusan (SK)**.
   - Lakukan e-sign kembali untuk dokumen SK. Setelah ketiga komite menandatangani SK, status klaim otomatis berubah menjadi `Disetujui`.

4. **Pembayaran Klaim:**
   - Login kembali sebagai `klaim@jamkrida.online`.
   - Buka menu **Pembayaran Klaim** -> Klik **Terbit Memo Bayar**. Berkas masuk status `Memo Bayar`.
   - Login sebagai `keuangan@jamkrida.online`.
   - Buka menu **Pembayaran Klaim** -> Klik **Catat Transfer Bayar**, masukkan tanggal transfer dan upload file kwitansi transfer dummy. Berkas masuk status `Dibayar`.
   - Login kembali sebagai `klaim@jamkrida.online`.
   - Buka menu **Pembayaran Klaim** -> Klik **Kirim Bukti ke Mitra**. Status klaim berakhir pada status **Selesai (Final)**.

---

## 🛠️ Modul Tambahan yang Terintegrasi

* **Data Referensi:** Pengelolaan data Mitra Jamkrida, Produk Kredit Penjaminan (beserta limit hari dan persen cover jaminan), Penyebab Klaim, Pejabat Komite, dan Sertifikat Debitur Portofolio.
* **Role & Izin:** Matriks hak akses untuk setiap menu.
* **Audit Log:** Mencatat log aktivitas setiap akun secara otomatis saat melakukan aksi di mockup.
* **Setting Web:** Memungkinkan Anda mengubah nama aplikasi, warna primer/sekunder sistem, tipe font, hingga deskripsi SEO. Perubahan akan diaplikasikan langsung pada CSS variabel mockup secara real-time.
