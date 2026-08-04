// Mock Database service for Klaim Online UI Mockup
// Saves state to localStorage for persistence across reloads

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  avatarPath: string | null;
  active: boolean;
  mitraId?: number | null;
  pejabatKomiteId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  kode: string;
  nama: string;
  isSuperAdmin: boolean;
  active: boolean;
  modulePermissions?: any[];
}

export interface Module {
  id: number;
  kode: string;
  nama: string;
  routeSlug: string;
  icon: string;
  parentId: number | null;
  active: boolean;
  children?: Module[];
}

export interface Mitra {
  id: number;
  namaMitra: string;
  alamat: string;
  kontak: string;
  active: boolean;
}

export interface ProdukPenjaminan {
  id: number;
  kode: string;
  nama: string;
  coverPercentage: number;
  batasHari: number;
  active: boolean;
}

export interface PenyebabKlaim {
  id: number;
  namaPenyebab: string;
  active: boolean;
}

export interface PejabatKomite {
  id: number;
  nama: string;
  jabatan: 'Ketua Komite Klaim' | 'Anggota Komite Klaim';
  urutan: number;
  active: boolean;
}

export interface SertifikatPenjaminan {
  id: number;
  nomorSp: string;
  mitraId: number;
  produkId: number;
  namaDebitur: string;
  bidangUsaha: string;
  plafonKredit: number;
  bakiDebet: number;
  kolektibilitas: number;
  tanggalMacet: string | null;
  tanggalExpire: string;
  active: boolean;
}

export interface Klaim {
  id: number;
  kodeKlaim: string;
  sertifikatPenjaminanId: number;
  mitraId: number;
  penyebabKlaimId: number | null;
  statusId: number;
  bakiDebetKlaim: number;
  coverPercentageSnapshot: number;
  nilaiKlaim: number;
  tanggalPengajuan: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KlaimStatus {
  id: number;
  kode: string;
  nama: string;
  urutan: number;
  isFinal: boolean;
  slaHari: number | null;
  active: boolean;
}

export interface KlaimStatusTransition {
  id: number;
  fromStatusId: number | null;
  toStatusId: number;
  triggerLabel: string;
  roleId: number | null;
  otomatis: boolean;
  active: boolean;
}

export interface AccessLog {
  id: number;
  userId: number | null;
  ipAddress: string;
  userAgent: string;
  method: string;
  url: string;
  aksi: string;
  module: string;
  active: boolean;
  createdAt: string;
}

export interface EsignSignature {
  id: number;
  dokumenType: 'berita_acara' | 'surat_keputusan';
  dokumenId: number;
  pejabatKomiteId: number;
  status: 'pending' | 'signed' | 'rejected';
  signedAt: string | null;
  active: boolean;
}

export interface BeritaAcara {
  id: number;
  klaimId: number;
  nomorBa: string;
  statusDokumen: 'menunggu_esign' | 'selesai';
  active: boolean;
  createdAt: string;
}

export interface SuratKeputusan {
  id: number;
  klaimId: number;
  nomorSk: string;
  statusDokumen: 'menunggu_esign' | 'selesai';
  keputusan: 'disetujui' | 'ditolak' | null;
  active: boolean;
  createdAt: string;
}

export interface MemoPembayaran {
  id: number;
  klaimId: number;
  nomorMemo: string;
  esignStatus: 'menunggu' | 'selesai';
  active: boolean;
  createdAt: string;
}

export interface Pembayaran {
  id: number;
  klaimId: number;
  tanggalBayar: string;
  buktiBayarPath: string;
  dikonfirmasiKeMitra: boolean;
  active: boolean;
  createdAt: string;
}

export interface Banding {
  id: number;
  klaimId: number;
  tanggalPengajuan: string;
  alasan: string;
  status: 'diajukan' | 'diproses';
  active: boolean;
  createdAt: string;
}

class MockDb {
  private static STORAGE_KEY = "jamkrida_mock_db";

  // Seeds database with default data
  public static init() {
    const existing = localStorage.getItem(MockDb.STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        // Ensure core structure is present
        if (
          !parsed.klaims ||
          !Array.isArray(parsed.klaims) ||
          !parsed.sertifikatPenjaminans ||
          !parsed.klaimStatuses
        ) {
          localStorage.removeItem(MockDb.STORAGE_KEY);
        } else {
          // Self-heal: suntikkan role/user quick-login baru (mis. Kabag Klaim) DAN rekonsiliasi
          // rolePermissions terhadap daftar kanonik di bawah, ke data yang sudah tersimpan di
          // browser - supaya perubahan hak akses (mis. penambahan modul pembayaran untuk role
          // tertentu) tetap ter-apply tanpa perlu clear localStorage manual.
          let patched = false;
          if (Array.isArray(parsed.roles) && !parsed.roles.some((r: any) => r.kode === "kabag_klaim")) {
            parsed.roles.push({ id: 6, kode: "kabag_klaim", nama: "Kepala Bagian Klaim", isSuperAdmin: false, active: true });
            patched = true;
          }
          if (Array.isArray(parsed.users) && !parsed.users.some((u: any) => u.email === "kabag@jamkrida.online")) {
            parsed.users.push({ id: 8, name: "Drs. Hendra Setiawan (Kabag Klaim)", email: "kabag@jamkrida.online", roleId: 6, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            patched = true;
          }
          if (Array.isArray(parsed.modules) && !parsed.modules.some((m: any) => m.id === 8)) {
            // Modul "Pembayaran Klaim" ditambahkan belakangan - kalau data lama di browser
            // belum punya modul ini, rolePermissions yang menunjuk moduleId 8 jadi tidak
            // ketemu modul-nya (module: undefined) sehingga menu tidak muncul di sidebar.
            parsed.modules.push({ id: 8, kode: "pembayaran", nama: "Pembayaran Klaim", routeSlug: "pembayaran", icon: "wallet", parentId: null, active: true });
            patched = true;
          }
          if (Array.isArray(parsed.rolePermissions)) {
            // Daftar kanonik roleId+moduleId yang WAJIB ada (mengikuti default rolePermissions
            // di bawah). Kalau ada kombinasi yang belum ada di data lama, tambahkan.
            const CANONICAL_PERMISSIONS: Array<{ roleId: number; moduleId: number }> = [
              { roleId: 2, moduleId: 3 }, { roleId: 2, moduleId: 10 },
              { roleId: 3, moduleId: 1 }, { roleId: 3, moduleId: 3 }, { roleId: 3, moduleId: 4 }, { roleId: 3, moduleId: 8 }, { roleId: 3, moduleId: 10 },
              { roleId: 4, moduleId: 7 }, { roleId: 4, moduleId: 10 },
              { roleId: 5, moduleId: 8 }, { roleId: 5, moduleId: 10 },
              { roleId: 6, moduleId: 8 }, { roleId: 6, moduleId: 10 },
            ];
            let nextId = parsed.rolePermissions.length > 0 ? Math.max(...parsed.rolePermissions.map((p: any) => p.id)) + 1 : 1;
            CANONICAL_PERMISSIONS.forEach(({ roleId, moduleId }) => {
              const exists = parsed.rolePermissions.some((p: any) => p.roleId === roleId && p.moduleId === moduleId);
              if (!exists) {
                parsed.rolePermissions.push({ id: nextId++, roleId, moduleId, canView: true, canCreate: true, canEdit: true, canDelete: false });
                patched = true;
              }
            });
          }
          if (patched) {
            localStorage.setItem(MockDb.STORAGE_KEY, JSON.stringify(parsed));
          }
          return;
        }
      } catch (e) {
        localStorage.removeItem(MockDb.STORAGE_KEY);
      }
    }

    const data = {
      settings: {
        appName: "Aplikasi Klaim Online PT Jamkrida Jabar",
        logoUrl: null,
        logoUrlPublic: null,
        faviconUrl: null,
        primaryColor: "#2c3691",
        secondaryColor: "#0da24b",
        fontFamily: "Inter",
        footerText: "© 2026 PT Jamkrida Jabar (Perseroda). All rights reserved.",
        contactEmail: "info@jamkridajabar.co.id",
        contactPhone: "022-123456",
        metaDescription: "Aplikasi Klaim Online PT Jamkrida Jabar",
        metaKeywords: "jamkrida, klaim, online, jabar"
      },
      roles: [
        { id: 1, kode: "super_admin", nama: "Super Admin", isSuperAdmin: true, active: true },
        { id: 2, kode: "mitra", nama: "Mitra Bank/BPR", isSuperAdmin: false, active: true },
        { id: 3, kode: "klaim", nama: "Staf Bagian Klaim", isSuperAdmin: false, active: true },
        { id: 4, kode: "komite", nama: "Pejabat Komite Klaim", isSuperAdmin: false, active: true },
        { id: 5, kode: "keuangan", nama: "Staf Keuangan", isSuperAdmin: false, active: true },
        { id: 6, kode: "kabag_klaim", nama: "Kepala Bagian Klaim", isSuperAdmin: false, active: true }
      ],
      rolePermissions: [
        // Mitra permissions (id: 2) - Only Pengajuan & Profile
        { id: 1, roleId: 2, moduleId: 3, canView: true, canCreate: true, canEdit: true, canDelete: false }, // pengajuan
        { id: 2, roleId: 2, moduleId: 10, canView: true, canCreate: true, canEdit: true, canDelete: false }, // profile
        // Staf Klaim permissions (id: 3)
        { id: 3, roleId: 3, moduleId: 1, canView: true, canCreate: false, canEdit: false, canDelete: false }, // referensi
        { id: 4, roleId: 3, moduleId: 3, canView: true, canCreate: false, canEdit: false, canDelete: false }, // pengajuan
        { id: 5, roleId: 3, moduleId: 4, canView: true, canCreate: true, canEdit: true, canDelete: false }, // verifikasi
        { id: 6, roleId: 3, moduleId: 8, canView: true, canCreate: true, canEdit: true, canDelete: false }, // pembayaran
        { id: 7, roleId: 3, moduleId: 10, canView: true, canCreate: true, canEdit: true, canDelete: false }, // profile
        // Komite permissions (id: 4)
        { id: 8, roleId: 4, moduleId: 7, canView: true, canCreate: true, canEdit: true, canDelete: false }, // komite
        { id: 9, roleId: 4, moduleId: 10, canView: true, canCreate: true, canEdit: true, canDelete: false }, // profile
        // Keuangan permissions (id: 5)
        { id: 10, roleId: 5, moduleId: 8, canView: true, canCreate: true, canEdit: true, canDelete: false }, // pembayaran
        { id: 11, roleId: 5, moduleId: 10, canView: true, canCreate: true, canEdit: true, canDelete: false }, // profile
        // Kabag Klaim permissions (id: 6)
        { id: 12, roleId: 6, moduleId: 8, canView: true, canCreate: true, canEdit: true, canDelete: false }, // pembayaran
        { id: 13, roleId: 6, moduleId: 10, canView: true, canCreate: true, canEdit: true, canDelete: false } // profile
      ],
      modules: [
        { id: 1, kode: "referensi", nama: "Data Referensi", routeSlug: "referensi", icon: "briefcase", parentId: null, active: true },
        { id: 2, kode: "utility", nama: "Utility & System", routeSlug: "utility", icon: "gear", parentId: null, active: true },
        { id: 21, parentId: 2, kode: "utility-setting-web", nama: "Setting Web", routeSlug: "utility/setting-web", icon: "", active: true },
        { id: 22, parentId: 2, kode: "utility-role-module", nama: "Role & Izin", routeSlug: "utility/role-module", icon: "", active: true },
        { id: 23, parentId: 2, kode: "utility-log-access", nama: "Audit Log", routeSlug: "utility/log-access", icon: "", active: true },
        { id: 3, kode: "pengajuan", nama: "Pengajuan Klaim", routeSlug: "pengajuan", icon: "file-sheet", parentId: null, active: true },
        { id: 4, kode: "verifikasi", nama: "Analisa & Verifikasi", routeSlug: "verifikasi", icon: "check-square", parentId: null, active: true },
        { id: 7, kode: "komite", nama: "Sidang Komite", routeSlug: "komite", icon: "fingerprint", parentId: null, active: true },
        { id: 8, kode: "pembayaran", nama: "Pembayaran Klaim", routeSlug: "pembayaran", icon: "wallet", parentId: null, active: true },
        { id: 10, kode: "profile", nama: "Profil Saya", routeSlug: "profile", icon: "user", parentId: null, active: true }
      ],
      users: [
        { id: 1, name: "Administrator Utama", email: "superadmin@jamkrida.online", roleId: 1, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, name: "Budi Santoso (Bank BJB)", email: "mitra@bjb.co.id", roleId: 2, avatarPath: null, active: true, mitraId: 1, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, name: "Andi Wijaya (Staf Klaim)", email: "klaim@jamkrida.online", roleId: 3, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 4, name: "Dr. H. Heri Soekarno (Ketua)", email: "ketua.komite@jamkrida.online", roleId: 4, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 5, name: "Ir. Bambang Yudho (Anggota 1)", email: "anggota1@jamkrida.online", roleId: 4, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 6, name: "Siti Rahmawati, SE (Anggota 2)", email: "anggota2@jamkrida.online", roleId: 4, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 7, name: "Hendra Yusuf (Keuangan)", email: "keuangan@jamkrida.online", roleId: 5, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 8, name: "Drs. Hendra Setiawan (Kabag Klaim)", email: "kabag@jamkrida.online", roleId: 6, avatarPath: null, active: true, mitraId: null, pejabatKomiteId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      mitras: [
        { id: 1, namaMitra: "PT Bank Pembangunan Daerah Jawa Barat dan Banten, Tbk (BJB)", alamat: "Jl. Naripan No. 12-14, Bandung", kontak: "Bp. Ronald (0812-3456-7890)", active: true },
        { id: 2, namaMitra: "BPR Karya Utama Jabar", alamat: "Jl. Raya Jatinangor No. 202, Sumedang", kontak: "Ibu Dian (0811-2233-4455)", active: true },
        { id: 3, namaMitra: "Bank DKI Syariah - Cab. Bandung", alamat: "Jl. Asia Afrika No. 100, Bandung", kontak: "Bp. Farid (0813-9988-7766)", active: true }
      ],
      produkPenjaminans: [
        { id: 1, kode: "KMU", nama: "Kredit Mikro Utama", coverPercentage: 0.70, batasHari: 180, active: true },
        { id: 2, kode: "KM", nama: "Kredit Multiguna", coverPercentage: 0.75, batasHari: 120, active: true },
        { id: 3, kode: "KU", nama: "Kredit Usaha Rakyat (KUR)", coverPercentage: 0.80, batasHari: 90, active: true },
        { id: 4, kode: "SYR", nama: "Kafalah Pembiayaan Syariah", coverPercentage: 0.70, batasHari: 180, active: true }
      ],
      penyebabKlaims: [
        { id: 1, namaPenyebab: "Debitur Wanprestasi / Macet Kredit", active: true },
        { id: 2, namaPenyebab: "Usaha Debitur Mengalami Penurunan Drastis", active: true },
        { id: 3, namaPenyebab: "Debitur Meninggal Dunia", active: true },
        { id: 4, namaPenyebab: "Kejadian Force Majeure (Bencana Alam)", active: true }
      ],
      pejabatKomites: [
        { id: 1, nama: "Dr. H. Heri Soekarno", jabatan: "Ketua Komite Klaim", urutan: 3, active: true },
        { id: 2, nama: "Ir. Bambang Yudho", jabatan: "Anggota Komite Klaim", urutan: 1, active: true },
        { id: 3, nama: "Siti Rahmawati, SE", jabatan: "Anggota Komite Klaim", urutan: 2, active: true }
      ],
      sertifikatPenjaminans: [
        { id: 1, nomorSp: "SP-2026-JB-000001", mitraId: 1, produkId: 1, namaDebitur: "Ahmad Faisal", bidangUsaha: "Kuliner / Warkop Modern", plafonKredit: 100000000, bakiDebet: 85000000, kolektibilitas: 5, tanggalMacet: "2026-05-10", tanggalExpire: "2027-06-01", active: true },
        { id: 2, nomorSp: "SP-2026-JB-000002", mitraId: 1, produkId: 2, namaDebitur: "Indah Purnamasari", bidangUsaha: "Jasa Fotokopi & ATK", plafonKredit: 50000000, bakiDebet: 38000000, kolektibilitas: 5, tanggalMacet: "2026-06-15", tanggalExpire: "2027-12-01", active: true },
        { id: 3, nomorSp: "SP-2026-JB-000003", mitraId: 1, produkId: 3, namaDebitur: "CV Maju Jaya Abadi", bidangUsaha: "Perdagangan Bahan Bangunan", plafonKredit: 500000000, bakiDebet: 450000000, kolektibilitas: 4, tanggalMacet: null, tanggalExpire: "2028-12-31", active: true },
        { id: 4, nomorSp: "SP-2026-JB-000004", mitraId: 2, produkId: 1, namaDebitur: "Sugeng Priyanto", bidangUsaha: "Pertanian Tanaman Padi", plafonKredit: 75000000, bakiDebet: 65000000, kolektibilitas: 5, tanggalMacet: "2026-03-01", tanggalExpire: "2026-12-31", active: true },
        { id: 5, nomorSp: "SP-2026-JB-000005", mitraId: 1, produkId: 1, namaDebitur: "Rani Kartika", bidangUsaha: "Salon Kecantikan", plafonKredit: 30000000, bakiDebet: 28000000, kolektibilitas: 5, tanggalMacet: "2026-02-01", tanggalExpire: "2026-10-31", active: true }
      ],
      klaimStatuses: [
        { id: 1, kode: "draft", nama: "Draft", urutan: 1, isFinal: false, slaHari: null, active: true },
        { id: 2, kode: "diajukan", nama: "Diajukan", urutan: 2, isFinal: false, slaHari: 2, active: true },
        { id: 3, kode: "verifikasi", nama: "Verifikasi Dokumen", urutan: 3, isFinal: false, slaHari: 3, active: true },
        { id: 4, kode: "perbaikan", nama: "Perlu Perbaikan", urutan: 4, isFinal: false, slaHari: 5, active: true },
        { id: 5, kode: "assessment", nama: "Assessment", urutan: 5, isFinal: false, slaHari: 5, active: true },
        { id: 6, kode: "survei", nama: "Survei Lapangan", urutan: 6, isFinal: false, slaHari: 7, active: true },
        { id: 7, kode: "komite", nama: "Keputusan Komite", urutan: 7, isFinal: false, slaHari: 5, active: true },
        { id: 8, kode: "disetujui", nama: "Disetujui", urutan: 8, isFinal: false, slaHari: 3, active: true },
        { id: 9, kode: "ditolak", nama: "Ditolak", urutan: 9, isFinal: false, slaHari: 14, active: true },
        { id: 10, kode: "banding", nama: "Banding", urutan: 10, isFinal: false, slaHari: 7, active: true },
        { id: 11, kode: "memo", nama: "Memo Bayar", urutan: 11, isFinal: false, slaHari: 2, active: true },
        { id: 12, kode: "dibayar", nama: "Dibayar", urutan: 12, isFinal: false, slaHari: 1, active: true },
        { id: 13, kode: "selesai", nama: "Selesai", urutan: 13, isFinal: true, slaHari: null, active: true }
      ],
      klaims: [],
      klaimStatusHistory: [],
      klaimDocuments: [],
      jenisDokumens: [
        { id: 1, kode: "doc_sertifikat", nama: "Sertifikat Penjaminan (Asli/Copy)", wajib: true, urutan: 1, active: true },
        { id: 2, kode: "doc_perjanjian", nama: "Perjanjian Kredit", wajib: true, urutan: 2, active: true },
        { id: 3, kode: "doc_rekening", nama: "Rekening Koran Debitur (3 bulan terakhir)", wajib: true, urutan: 3, active: true },
        { id: 4, kode: "doc_surat_tagihan", nama: "Surat Peringatan / Tagihan 1-3", wajib: true, urutan: 4, active: true },
        { id: 5, kode: "doc_ktp", nama: "KTP & KK Debitur", wajib: true, urutan: 5, active: true },
        { id: 6, kode: "doc_analisa", nama: "Analisa Kredit Awal", wajib: true, urutan: 6, active: true },
        { id: 7, kode: "doc_kunjungan", nama: "Laporan Kunjungan / Penagihan", wajib: false, urutan: 7, active: true },
        { id: 8, kode: "doc_kematian", nama: "Surat Keterangan Kematian (khusus meninggal)", wajib: false, urutan: 8, active: true }
      ],
      surveys: [],
      beritaAcaras: [],
      suratKeputusans: [],
      esignSignatures: [],
      memoPembayarans: [],
      pembayarans: [],
      bandings: [],
      accessLogs: [],
      activeUser: null as User | null
    };

    localStorage.setItem(MockDb.STORAGE_KEY, JSON.stringify(data));
  }

  public static getData(): any {
    MockDb.init();
    return JSON.parse(localStorage.getItem(MockDb.STORAGE_KEY)!);
  }

  public static saveData(data: any) {
    localStorage.setItem(MockDb.STORAGE_KEY, JSON.stringify(data));
  }

  // Auth Operations
  public static login(email: string): { user: User; token: string } | null {
    const db = MockDb.getData();
    const user = db.users.find((u: User) => u.email === email && u.active);
    if (!user) return null;

    db.activeUser = user;
    MockDb.saveData(db);

    // Add log
    MockDb.logAction(user.id, "POST", "/api/login", `Login berhasil sebagai ${user.name}`);

    return {
      user,
      token: "mock-jwt-token-" + user.id + "-" + Date.now()
    };
  }

  public static logout() {
    const db = MockDb.getData();
    if (db.activeUser) {
      MockDb.logAction(db.activeUser.id, "POST", "/api/logout", "Logout berhasil");
      db.activeUser = null;
      MockDb.saveData(db);
    }
  }

  public static getActiveUser(): User | null {
    const db = MockDb.getData();
    return db.activeUser;
  }

  public static logAction(userId: number | null, method: string, url: string, action: string) {
    const db = MockDb.getData();
    const newLog: AccessLog = {
      id: db.accessLogs.length + 1,
      userId,
      ipAddress: "127.0.0.1",
      userAgent: window.navigator.userAgent,
      method,
      url,
      aksi: action,
      module: url.includes("referensi") ? "Referensi" : url.includes("utility") ? "Utility" : "Umum",
      active: true,
      createdAt: new Date().toISOString()
    };
    db.accessLogs.unshift(newLog);
    MockDb.saveData(db);
  }
}

export default MockDb;
