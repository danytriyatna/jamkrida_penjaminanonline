import type { App } from "vue";
import type { AxiosResponse } from "axios";
import VueAxios from "vue-axios";
import axios from "axios";
import JwtService from "@/core/services/JwtService";
import MockDb, { 
  type User, 
  type Mitra, 
  type ProdukPenjaminan, 
  type PenyebabKlaim, 
  type PejabatKomite, 
  type SertifikatPenjaminan, 
  type Klaim, 
  type AccessLog, 
  type EsignSignature, 
  type BeritaAcara, 
  type SuratKeputusan, 
  type MemoPembayaran, 
  type Pembayaran, 
  type Banding 
} from "@/core/services/MockDb";

/**
 * @description service to call HTTP request via Axios (Mocked for pure frontend visualization)
 */
class ApiService {
  public static vueInstance: App;

  public static init(app: App<Element>) {
    ApiService.vueInstance = app;
    ApiService.vueInstance.use(VueAxios, axios);
    ApiService.setHeader();
    MockDb.init(); // Initialize mock DB
  }

  public static setHeader(): void {
    const token = JwtService.getToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    axios.defaults.headers.common["Accept"] = "application/json";
  }

  // Intercept and resolve with mock data in AxiosResponse format
  private static mockResponse(data: any, status = 200): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (status >= 200 && status < 300) {
          resolve({
            data,
            status,
            statusText: "OK",
            headers: {},
            config: {} as any
          });
        } else {
          reject({
            response: {
              data: data || { message: "Mock API Error" },
              status,
              statusText: "Error"
            }
          });
        }
      }, 300); // 300ms simulated network latency
    });
  }

  /** GET dengan query params */
  public static async query(resource: string, params: any): Promise<AxiosResponse> {
    const queryStr = params && params.params ? new URLSearchParams(params.params).toString() : "";
    const fullUrl = queryStr ? `${resource}?${queryStr}` : resource;
    const cleanUrl = fullUrl.startsWith("/api/") ? fullUrl : `/api/${fullUrl.replace(/^\/+/, "")}`;
    try {
      return await axios.get(cleanUrl);
    } catch (e) {
      return ApiService.handleMockRequest("GET", fullUrl);
    }
  }

  /** GET by slug/id */
  public static async get(resource: string, slug = ""): Promise<AxiosResponse> {
    const url = slug ? `${resource}/${slug}` : `${resource}`;
    const cleanUrl = url.startsWith("/api/") ? url : `/api/${url.replace(/^\/+/, "")}`;
    try {
      return await axios.get(cleanUrl);
    } catch (e) {
      return ApiService.handleMockRequest("GET", url);
    }
  }

  /** POST - create */
  public static async post(resource: string, params: any = {}): Promise<AxiosResponse> {
    const cleanUrl = resource.startsWith("/api/") ? resource : `/api/${resource.replace(/^\/+/, "")}`;
    try {
      return await axios.post(cleanUrl, params);
    } catch (e) {
      return ApiService.handleMockRequest("POST", resource, params);
    }
  }

  /** PUT by slug */
  public static async update(
    resource: string,
    slug: string,
    params: any
  ): Promise<AxiosResponse> {
    const url = `${resource}/${slug}`;
    const cleanUrl = url.startsWith("/api/") ? url : `/api/${url.replace(/^\/+/, "")}`;
    try {
      return await axios.put(cleanUrl, params);
    } catch (e) {
      return ApiService.handleMockRequest("PUT", url, params);
    }
  }

  /** PUT tanpa slug */
  public static async put(resource: string, params: any): Promise<AxiosResponse> {
    const cleanUrl = resource.startsWith("/api/") ? resource : `/api/${resource.replace(/^\/+/, "")}`;
    try {
      return await axios.put(cleanUrl, params);
    } catch (e) {
      return ApiService.handleMockRequest("PUT", resource, params);
    }
  }

  /** DELETE */
  public static async delete(resource: string): Promise<AxiosResponse> {
    const cleanUrl = resource.startsWith("/api/") ? resource : `/api/${resource.replace(/^\/+/, "")}`;
    try {
      return await axios.delete(cleanUrl);
    } catch (e) {
      return ApiService.handleMockRequest("DELETE", resource);
    }
  }

  /** PATCH */
  public static patch(resource: string, params: any = {}): Promise<AxiosResponse> {
    return ApiService.handleMockRequest("PATCH", resource, params);
  }


  // Mock Request Router / Handler
  private static handleMockRequest(method: string, path: string, payload?: any): Promise<AxiosResponse> {
    const cleanPath = path.replace(/^\/|api\//g, ""); // Strip leading slashes and api/ prefix
    const parts = cleanPath.split("?")[0].split("/");
    const queryParams = new URLSearchParams(path.split("?")[1] || "");

    const db = MockDb.getData();
    const activeUser = db.activeUser;

    // Helper for Paginated responses
    const paginate = (items: any[], page = 1, perPage = 15) => {
      const start = (page - 1) * perPage;
      const end = start + perPage;
      return {
        data: items.slice(start, end),
        meta: {
          currentPage: page,
          perPage,
          total: items.length
        }
      };
    };

    // ----------------------------------------------------
    // AUTH MODUL
    // ----------------------------------------------------
    if (method === "POST" && cleanPath === "login") {
      const loginRes = MockDb.login(payload.email);
      if (loginRes) {
        const u = loginRes.user;
        const userRole = db.roles.find((r: any) => r.id === u.roleId);
        const modulePermissions = db.rolePermissions
          .filter((p: any) => p.roleId === u.roleId)
          .map((p: any) => {
            const mod = db.modules.find((m: any) => m.id === p.moduleId);
            return { ...p, module: mod };
          });

        const expandedUser = {
          ...u,
          role: userRole ? { ...userRole, modulePermissions } : null
        };

        return ApiService.mockResponse({
          data: {
            accessToken: loginRes.token,
            tokenType: "Bearer",
            user: expandedUser
          }
        });
      } else {
        return ApiService.mockResponse({ message: "Email atau password salah." }, 401);
      }
    }

    if (method === "POST" && cleanPath === "logout") {
      MockDb.logout();
      return ApiService.mockResponse({ message: "Logout berhasil." });
    }

    if (method === "GET" && cleanPath === "user") {
      if (activeUser) {
        // Expand role and permissions
        const userRole = db.roles.find((r: any) => r.id === activeUser.roleId);
        const modulePermissions = db.rolePermissions
          .filter((p: any) => p.roleId === activeUser.roleId)
          .map((p: any) => {
            const mod = db.modules.find((m: any) => m.id === p.moduleId);
            return { ...p, module: mod };
          });

        const expandedUser = {
          ...activeUser,
          role: userRole ? { ...userRole, modulePermissions } : null
        };
        return ApiService.mockResponse({ data: expandedUser });
      }
      return ApiService.mockResponse({ message: "Unauthenticated" }, 401);
    }

    // ----------------------------------------------------
    // SETTINGS MODUL
    // ----------------------------------------------------
    if (cleanPath === "settings") {
      if (method === "GET") {
        return ApiService.mockResponse({ data: db.settings });
      }
      if (method === "PUT") {
        db.settings = { ...db.settings, ...payload };
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "PUT", "/api/settings", "Memperbarui pengaturan web");
        return ApiService.mockResponse({ data: db.settings });
      }
    }

    if (method === "POST" && cleanPath === "settings/logo") {
      db.settings.logoUrl = "/media/logos/logo-jamkrida.png"; // Mock image URL
      db.settings.logoUrlPublic = "/media/logos/logo-jamkrida.png";
      MockDb.saveData(db);
      if (activeUser) MockDb.logAction(activeUser.id, "POST", "/api/settings/logo", "Mengunggah logo baru");
      return ApiService.mockResponse({ data: db.settings });
    }

    if (method === "POST" && cleanPath === "settings/favicon") {
      db.settings.faviconUrl = "/favicon.ico";
      MockDb.saveData(db);
      if (activeUser) MockDb.logAction(activeUser.id, "POST", "/api/settings/favicon", "Mengunggah favicon baru");
      return ApiService.mockResponse({ data: db.settings });
    }

    // ----------------------------------------------------
    // PROFILE MODUL
    // ----------------------------------------------------
    if (cleanPath === "profile" && method === "GET") {
      return ApiService.mockResponse({ data: activeUser });
    }
    if (cleanPath === "profile" && method === "PUT") {
      if (!activeUser) return ApiService.mockResponse({ message: "Unauthenticated" }, 401);
      const userIndex = db.users.findIndex((u: any) => u.id === activeUser.id);
      db.users[userIndex] = { ...db.users[userIndex], ...payload };
      db.activeUser = db.users[userIndex];
      MockDb.saveData(db);
      MockDb.logAction(activeUser.id, "PUT", "/api/profile", "Memperbarui profil diri");
      return ApiService.mockResponse({ data: db.activeUser });
    }
    if (cleanPath === "profile/password" && method === "PUT") {
      if (activeUser) MockDb.logAction(activeUser.id, "PUT", "/api/profile/password", "Memperbarui password akun");
      return ApiService.mockResponse({ message: "Password berhasil diperbarui." });
    }
    if (cleanPath === "profile/avatar" && method === "POST") {
      if (!activeUser) return ApiService.mockResponse({ message: "Unauthenticated" }, 401);
      const userIndex = db.users.findIndex((u: any) => u.id === activeUser.id);
      db.users[userIndex].avatarPath = "/media/avatars/300-1.jpg"; // Mock avatar
      db.activeUser = db.users[userIndex];
      MockDb.saveData(db);
      MockDb.logAction(activeUser.id, "POST", "/api/profile/avatar", "Mengubah foto profil");
      return ApiService.mockResponse({ data: db.activeUser });
    }

    // ----------------------------------------------------
    // UTILITY: AUDIT LOGS
    // ----------------------------------------------------
    if (cleanPath.startsWith("logs") && method === "GET") {
      const page = parseInt(queryParams.get("page") || "1");
      const perPage = parseInt(queryParams.get("perPage") || "20");
      
      let logs = [...db.accessLogs];
      const search = queryParams.get("search");
      if (search) {
        logs = logs.filter(l => l.aksi.toLowerCase().includes(search.toLowerCase()));
      }

      // Attach user info to logs
      const enrichedLogs = logs.map(log => {
        const u = db.users.find((user: any) => user.id === log.userId);
        return {
          ...log,
          user: u ? { id: u.id, name: u.name, email: u.email } : null
        };
      });

      return ApiService.mockResponse(paginate(enrichedLogs, page, perPage));
    }

    // ----------------------------------------------------
    // UTILITY: MODULES REGISTRY
    // ----------------------------------------------------
    if (cleanPath.startsWith("utility/modules")) {
      if (method === "GET") {
        const parentOnly = queryParams.get("parentOnly") === "1";
        let list = [...db.modules];
        
        if (parentOnly) {
          list = list.filter(m => m.parentId === null);
        }

        // Hydrate children
        const hydrated = list.map(mod => {
          const children = db.modules.filter((m: any) => m.parentId === mod.id);
          return {
            ...mod,
            children
          };
        });

        return ApiService.mockResponse({ data: hydrated });
      }
    }

    // ----------------------------------------------------
    // UTILITY: ROLES & PERMISSIONS MATRIX
    // ----------------------------------------------------
    if (cleanPath.startsWith("utility/roles")) {
      const roleId = parts[2] ? parseInt(parts[2]) : null;

      if (method === "GET") {
        if (roleId) {
          // Show detailed role with permissions
          const role = db.roles.find((r: any) => r.id === roleId);
          if (!role) return ApiService.mockResponse({ message: "Role tidak ditemukan." }, 404);
          
          const permissions = db.rolePermissions
            .filter((p: any) => p.roleId === roleId)
            .map((p: any) => {
              const m = db.modules.find((mod: any) => mod.id === p.moduleId);
              return { ...p, module: m };
            });
          
          return ApiService.mockResponse({ data: { ...role, modulePermissions: permissions } });
        } else {
          // Index list of roles
          return ApiService.mockResponse({ data: db.roles });
        }
      }

      if (method === "POST") {
        const newRole = {
          id: db.roles.length + 1,
          kode: payload.kode,
          nama: payload.nama,
          isSuperAdmin: !!payload.isSuperAdmin,
          active: true
        };
        db.roles.push(newRole);

        // Save permissions
        if (payload.permissions && Array.isArray(payload.permissions)) {
          payload.permissions.forEach((p: any) => {
            db.rolePermissions.push({
              id: db.rolePermissions.length + 1,
              roleId: newRole.id,
              moduleId: p.moduleId,
              canView: !!p.canView,
              canCreate: !!p.canCreate,
              canEdit: !!p.canEdit,
              canDelete: !!p.canDelete
            });
          });
        }
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "POST", "/api/utility/roles", `Menambah role baru: ${newRole.nama}`);
        return ApiService.mockResponse({ data: newRole });
      }

      if (method === "PUT" && roleId) {
        const roleIndex = db.roles.findIndex((r: any) => r.id === roleId);
        if (roleIndex === -1) return ApiService.mockResponse({ message: "Role tidak ditemukan" }, 404);

        db.roles[roleIndex] = { ...db.roles[roleIndex], ...payload };

        // Replace permissions
        if (payload.permissions && Array.isArray(payload.permissions)) {
          // Remove old ones
          db.rolePermissions = db.rolePermissions.filter((p: any) => p.roleId !== roleId);
          // Add new ones
          payload.permissions.forEach((p: any) => {
            db.rolePermissions.push({
              id: db.rolePermissions.length + 1,
              roleId,
              moduleId: p.moduleId,
              canView: !!p.canView,
              canCreate: !!p.canCreate,
              canEdit: !!p.canEdit,
              canDelete: !!p.canDelete
            });
          });
        }
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "PUT", `/api/utility/roles/${roleId}`, `Mengubah konfigurasi role: ${db.roles[roleIndex].nama}`);
        return ApiService.mockResponse({ data: db.roles[roleIndex] });
      }

      if (method === "DELETE" && roleId) {
        const roleIndex = db.roles.findIndex((r: any) => r.id === roleId);
        if (roleIndex === -1) return ApiService.mockResponse({ message: "Role tidak ditemukan" }, 404);

        db.roles[roleIndex].active = false;
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "DELETE", `/api/utility/roles/${roleId}`, `Menonaktifkan role: ${db.roles[roleIndex].nama}`);
        return ApiService.mockResponse({ message: `Role '${db.roles[roleIndex].nama}' berhasil dinonaktifkan.` });
      }
    }

    // ----------------------------------------------------
    // UTILITY: DAFTAR PENGGUNA (USERS MANAGEMENT)
    // ----------------------------------------------------
    if (cleanPath.startsWith("utility/users")) {
      const userId = parts[2] ? parseInt(parts[2]) : null;

      if (method === "GET") {
        if (userId) {
          const u = db.users.find((x: any) => x.id === userId);
          if (!u) return ApiService.mockResponse({ message: "Pengguna tidak ditemukan." }, 404);
          const r = db.roles.find((x: any) => x.id === u.roleId);
          const m = u.mitraId ? db.mitras.find((x: any) => x.id === u.mitraId) : null;
          return ApiService.mockResponse({ data: { ...u, role: r, mitra: m } });
        } else {
          let list = [...db.users];
          const search = queryParams.get("search") || "";
          if (search) {
            list = list.filter(u => 
              u.name.toLowerCase().includes(search.toLowerCase()) || 
              u.email.toLowerCase().includes(search.toLowerCase())
            );
          }
          const enriched = list.map(u => {
            const r = db.roles.find((x: any) => x.id === u.roleId);
            const m = u.mitraId ? db.mitras.find((x: any) => x.id === u.mitraId) : null;
            return { ...u, role: r, mitra: m };
          });
          return ApiService.mockResponse({ data: enriched });
        }
      }

      if (method === "POST") {
        const newUser = {
          id: db.users.length + 1,
          name: payload.name,
          email: payload.email,
          roleId: parseInt(payload.roleId),
          mitraId: payload.mitraId ? parseInt(payload.mitraId) : null,
          pejabatKomiteId: payload.pejabatKomiteId ? parseInt(payload.pejabatKomiteId) : null,
          avatarPath: null,
          active: payload.active !== undefined ? !!payload.active : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.users.push(newUser);
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "POST", "/api/utility/users", `Menambah pengguna baru: ${newUser.name} (${newUser.email})`);
        return ApiService.mockResponse({ data: newUser });
      }

      if (method === "PUT" && userId) {
        const uIndex = db.users.findIndex((x: any) => x.id === userId);
        if (uIndex === -1) return ApiService.mockResponse({ message: "Pengguna tidak ditemukan" }, 404);

        db.users[uIndex] = {
          ...db.users[uIndex],
          name: payload.name !== undefined ? payload.name : db.users[uIndex].name,
          email: payload.email !== undefined ? payload.email : db.users[uIndex].email,
          roleId: payload.roleId !== undefined ? parseInt(payload.roleId) : db.users[uIndex].roleId,
          mitraId: payload.mitraId !== undefined ? (payload.mitraId ? parseInt(payload.mitraId) : null) : db.users[uIndex].mitraId,
          active: payload.active !== undefined ? !!payload.active : db.users[uIndex].active,
          updatedAt: new Date().toISOString()
        };

        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "PUT", `/api/utility/users/${userId}`, `Memperbarui akun pengguna: ${db.users[uIndex].name}`);
        return ApiService.mockResponse({ data: db.users[uIndex] });
      }

      if (method === "DELETE" && userId) {
        const uIndex = db.users.findIndex((x: any) => x.id === userId);
        if (uIndex === -1) return ApiService.mockResponse({ message: "Pengguna tidak ditemukan" }, 404);

        db.users[uIndex].active = !db.users[uIndex].active;
        MockDb.saveData(db);
        if (activeUser) MockDb.logAction(activeUser.id, "DELETE", `/api/utility/users/${userId}`, `Mengubah status pengguna: ${db.users[uIndex].name}`);
        return ApiService.mockResponse({ message: `Status pengguna ${db.users[uIndex].name} berhasil diperbarui.` });
      }
    }

    // ----------------------------------------------------
    // REFERENSI MODUL: MITRAS, PRODUKS, PENYEBABS, PEJABAT
    // ----------------------------------------------------
    const referensiTables = [
      { path: "referensi/mitras", dbKey: "mitras", logLabel: "Mitra" },
      { path: "referensi/produk-penjaminans", dbKey: "produkPenjaminans", logLabel: "Produk Penjaminan" },
      { path: "referensi/penyebab-klaims", dbKey: "penyebabKlaims", logLabel: "Penyebab Klaim" },
      { path: "referensi/pejabat-komites", dbKey: "pejabatKomites", logLabel: "Pejabat Komite" },
      { path: "referensi/sertifikat-penjaminans", dbKey: "sertifikatPenjaminans", logLabel: "Sertifikat Penjaminan" }
    ];

    for (const refTab of referensiTables) {
      if (cleanPath.startsWith(refTab.path)) {
        const itemId = parts[2] && parts[2] !== "toggle-active" ? parseInt(parts[2]) : null;
        const page = parseInt(queryParams.get("page") || "1");
        const perPage = parseInt(queryParams.get("perPage") || "15");
        const search = queryParams.get("search") || "";
        const withInactive = queryParams.get("withInactive") === "1";

        if (method === "GET") {
          if (itemId) {
            const item = db[refTab.dbKey].find((x: any) => x.id === itemId);
            if (!item) return ApiService.mockResponse({ message: "Data tidak ditemukan." }, 404);
            
            // Expand relations for SP
            if (refTab.dbKey === "sertifikatPenjaminans") {
              const m = db.mitras.find((x: any) => x.id === item.mitraId);
              const p = db.produkPenjaminans.find((x: any) => x.id === item.produkId);
              return ApiService.mockResponse({ data: { ...item, mitra: m, produk: p } });
            }
            return ApiService.mockResponse({ data: item });
          } else {
            let list = [...db[refTab.dbKey]];
            
            // Filter inactive if requested
            if (!withInactive) {
              list = list.filter((x: any) => x.active);
            }

            // Perform simple search
            if (search) {
              list = list.filter((x: any) => {
                if (x.nama) return x.nama.toLowerCase().includes(search.toLowerCase());
                if (x.namaMitra) return x.namaMitra.toLowerCase().includes(search.toLowerCase());
                if (x.namaPenyebab) return x.namaPenyebab.toLowerCase().includes(search.toLowerCase());
                if (x.namaDebitur) return x.namaDebitur.toLowerCase().includes(search.toLowerCase()) || x.nomorSp.toLowerCase().includes(search.toLowerCase());
                if (x.kode) return x.kode.toLowerCase().includes(search.toLowerCase());
                return false;
              });
            }

            // Hydrate SP list
            if (refTab.dbKey === "sertifikatPenjaminans") {
              list = list.map(item => {
                const m = db.mitras.find((x: any) => x.id === item.mitraId);
                const p = db.produkPenjaminans.find((x: any) => x.id === item.produkId);
                return { ...item, mitra: m, produk: p };
              });
            }

            return ApiService.mockResponse(paginate(list, page, perPage));
          }
        }

        if (method === "POST") {
          const newItem = {
            id: db[refTab.dbKey].length + 1,
            ...payload,
            active: true
          };

          // Auto-generate SP number
          if (refTab.dbKey === "sertifikatPenjaminans") {
            const seq = String(db[refTab.dbKey].length + 1).padStart(6, "0");
            newItem.nomorSp = `SP-2026-JB-${seq}`;
          }

          db[refTab.dbKey].push(newItem);
          MockDb.saveData(db);
          if (activeUser) MockDb.logAction(activeUser.id, "POST", `/api/${refTab.path}`, `Menambah ${refTab.logLabel}: ${newItem.nama || newItem.namaMitra || newItem.namaDebitur || newItem.namaPenyebab}`);
          return ApiService.mockResponse({ data: newItem }, 201);
        }

        if (method === "PUT" && itemId) {
          const idx = db[refTab.dbKey].findIndex((x: any) => x.id === itemId);
          if (idx === -1) return ApiService.mockResponse({ message: "Data tidak ditemukan." }, 404);
          
          db[refTab.dbKey][idx] = { ...db[refTab.dbKey][idx], ...payload };
          MockDb.saveData(db);
          if (activeUser) MockDb.logAction(activeUser.id, "PUT", `/api/${refTab.path}/${itemId}`, `Mengubah ${refTab.logLabel}: ${db[refTab.dbKey][idx].nama || db[refTab.dbKey][idx].namaMitra || db[refTab.dbKey][idx].namaDebitur || db[refTab.dbKey][idx].namaPenyebab}`);
          return ApiService.mockResponse({ data: db[refTab.dbKey][idx] });
        }

        // Toggle active PATCH
        if (method === "PATCH" && cleanPath.endsWith("/toggle-active")) {
          const match = cleanPath.match(new RegExp(`referensi\\/${refTab.dbKey.toLowerCase()}\\/(\\d+)\\/toggle-active`));
          const tId = itemId || (match ? parseInt(match[1]) : null);
          if (tId) {
            const idx = db[refTab.dbKey].findIndex((x: any) => x.id === tId);
            if (idx !== -1) {
              db[refTab.dbKey][idx].active = !db[refTab.dbKey][idx].active;
              MockDb.saveData(db);
              if (activeUser) MockDb.logAction(activeUser.id, "PATCH", `/api/${refTab.path}/${tId}/toggle-active`, `Mengubah status aktif ${refTab.logLabel}: ${db[refTab.dbKey][idx].nama || db[refTab.dbKey][idx].namaMitra || db[refTab.dbKey][idx].namaDebitur}`);
              return ApiService.mockResponse({ 
                message: `Status berhasil diperbarui.`,
                data: db[refTab.dbKey][idx]
              });
            }
          }
        }
      }
    }

    // ----------------------------------------------------
    // TRANSAKSI KLAIM MODUL (ALUR INTI STATE MACHINE)
    // ----------------------------------------------------
    if (cleanPath.startsWith("klaims")) {
      const klaimId = parts[1] && !isNaN(parseInt(parts[1])) ? parseInt(parts[1]) : null;
      const subAction = parts[2];

      if (method === "GET") {
        if (klaimId) {
          // Show detail claim
          const klaim = db.klaims.find((k: any) => k.id === klaimId);
          if (!klaim) return ApiService.mockResponse({ message: "Klaim tidak ditemukan" }, 404);

          // Enrich details
          const sp = db.sertifikatPenjaminans.find((x: any) => x.id === klaim.sertifikatPenjaminanId);
          const m = db.mitras.find((x: any) => x.id === klaim.mitraId);
          const p = db.penyebabKlaims.find((x: any) => x.id === klaim.penyebabKlaimId);
          const st = db.klaimStatuses.find((x: any) => x.id === klaim.statusId);
          const docs = db.klaimDocuments.filter((d: any) => d.klaimId === klaimId).map((d: any) => {
            const type = db.jenisDokumens.find((j: any) => j.id == d.jenisDokumenId);
            const isPerbaikanDoc = klaim.statusId === 4 && (d.jenisDokumenId === 5 || d.jenisDokumenId === 3);
            return {
              ...d,
              jenisDokumen: type,
              kesesuaian: d.kesesuaian || (isPerbaikanDoc ? "tidak_sesuai" : (d.ada ? "sesuai" : "belum_diperiksa")),
              catatanPemeriksaan: d.catatanPemeriksaan || (
                klaim.statusId === 4 && d.jenisDokumenId === 5 
                  ? "Scan KTP & KK debitur buram dan NIK tidak dapat terverifikasi. Mohon unggah ulang scan KTP asli." 
                  : klaim.statusId === 4 && d.jenisDokumenId === 3 
                    ? "Rekening koran 3 bulan terakhir belum lengkap untuk bulan ke-3. Mohon unggah lembar bulan ke-3." 
                    : ""
              )
            };
          });
          const history = db.klaimStatusHistory.filter((h: any) => h.klaimId === klaimId).sort((a: any, b: any) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
          
          const survey = db.surveys.find((s: any) => s.klaimId === klaimId);
          const ba = db.beritaAcaras.find((b: any) => b.klaimId === klaimId);
          const sk = db.suratKeputusans.find((s: any) => s.klaimId === klaimId);
          const signatures = db.esignSignatures.filter((s: any) => 
            (ba && s.dokumenType === "berita_acara" && s.dokumenId === ba.id) || 
            (sk && s.dokumenType === "surat_keputusan" && s.dokumenId === sk.id)
          ).map((s: any) => {
            const pe = db.pejabatKomites.find((p: any) => p.id === s.pejabatKomiteId);
            return { ...s, pejabatKomite: pe };
          });
          
          const memo = db.memoPembayarans.find((x: any) => x.klaimId === klaimId);
          const bayar = db.pembayarans.find((x: any) => x.klaimId === klaimId);
          const banding = db.bandings.find((x: any) => x.klaimId === klaimId);

          const fullKlaim = {
            ...klaim,
            sertifikatPenjaminan: sp,
            mitra: m,
            penyebabKlaim: p,
            status: st,
            documents: docs,
            statusHistory: history,
            survey,
            beritaAcara: ba,
            suratKeputusan: sk,
            esignSignatures: signatures,
            memoPembayaran: memo,
            pembayaran: bayar,
            banding
          };

          return ApiService.mockResponse({ data: fullKlaim });
        } else {
          // List claims (dashboard view)
          let list = [...db.klaims];

          // Filter by Mitra if logged in user is a Mitra
          if (activeUser && (activeUser.mitraId || activeUser.roleId === 2)) {
            const targetMitraId = activeUser.mitraId || 1;
            list = list.filter((k: any) => k.mitraId == targetMitraId || !k.mitraId);
          }

          // Search filter
          const search = queryParams.get("search");
          if (search) {
            list = list.filter((k: any) => {
              const sp = db.sertifikatPenjaminans.find((x: any) => x.id === k.sertifikatPenjaminanId);
              return k.kodeKlaim.toLowerCase().includes(search.toLowerCase()) || 
                     (sp && sp.namaDebitur.toLowerCase().includes(search.toLowerCase())) || 
                     (sp && sp.nomorSp.toLowerCase().includes(search.toLowerCase()));
            });
          }

          // Status group filters
          const statusGroup = queryParams.get("statusGroup");
          if (statusGroup && statusGroup !== "semua") {
            const statusCodes: Record<string, string[]> = {
              baru: ["draft", "diajukan"],
              proses: ["verifikasi", "perbaikan", "assessment", "survei", "komite", "banding"],
              setuju: ["disetujui", "memo", "dibayar"],
              disetujui: ["disetujui", "memo", "dibayar"],
              final: ["selesai", "ditolak"],
              selesai: ["selesai", "ditolak"]
            };

            const allowedCodes = statusCodes[statusGroup] || [];
            if (allowedCodes.length > 0) {
              list = list.filter((k: any) => {
                const st = db.klaimStatuses.find((x: any) => x.id == k.statusId);
                return st && allowedCodes.includes(st.kode);
              });
            }
          }

          // Enrich summaries
          const enriched = list.map(k => {
            const sp = db.sertifikatPenjaminans.find((x: any) => x.id == k.sertifikatPenjaminanId);
            const m = db.mitras.find((x: any) => x.id == k.mitraId);
            const st = db.klaimStatuses.find((x: any) => x.id == k.statusId);
            return {
              ...k,
              sertifikatPenjaminan: sp,
              mitra: m,
              status: st
            };
          }).sort((a, b) => b.id - a.id);

          const page = parseInt(queryParams.get("page") || "1");
          const perPage = parseInt(queryParams.get("perPage") || "15");

          return ApiService.mockResponse(paginate(enriched, page, perPage));
        }
      }

      if (method === "POST") {
        // Create claim
        if (cleanPath === "klaims") {
          const spId = parseInt(payload.sertifikatPenjaminanId) || 1;
          const sp = db.sertifikatPenjaminans.find((x: any) => x.id == spId) || db.sertifikatPenjaminans[0];

          const prod = db.produkPenjaminans.find((x: any) => x.id == sp?.produkId);
          const cp = prod ? prod.coverPercentage : 0.70;

          const seq = String(db.klaims.length + 1).padStart(4, "0");
          const newKlaim: Klaim = {
            id: db.klaims.length + 1,
            kodeKlaim: `KLM-2026-${seq}`,
            sertifikatPenjaminanId: sp?.id || spId,
            mitraId: activeUser?.mitraId || sp?.mitraId || 1,
            penyebabKlaimId: payload.penyebabKlaimId ? parseInt(payload.penyebabKlaimId) : 1,
            statusId: 1, // Always 1 (Draft) on initial creation
            bakiDebetKlaim: payload.bakiDebetKlaim || sp?.bakiDebet || 50000000,
            coverPercentageSnapshot: cp,
            nilaiKlaim: (payload.bakiDebetKlaim || sp?.bakiDebet || 50000000) * cp,
            tanggalPengajuan: new Date().toISOString().split("T")[0],
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          db.klaims.push(newKlaim);

          // Seed 8 empty documents
          db.jenisDokumens.forEach((jd: any) => {
            db.klaimDocuments.push({
              id: db.klaimDocuments.length + 1,
              klaimId: newKlaim.id,
              jenisDokumenId: jd.id,
              ada: false,
              filePath: null,
              uploadedAt: null
            });
          });

          // History
          const actName = activeUser?.name || "Mitra BJB";
          db.klaimStatusHistory.push({
            id: db.klaimStatusHistory.length + 1,
            klaimId: newKlaim.id,
            waktu: new Date().toISOString(),
            actorUserId: activeUser?.id || 2,
            actorNama: actName,
            actorPeran: activeUser?.mitraId ? "mitra" : "klaim",
            aksi: "Membuat draft klaim baru (Silakan unggah dokumen persyaratan)",
            active: true
          });

          MockDb.saveData(db);
          if (activeUser) MockDb.logAction(activeUser.id, "POST", "/api/klaims", `Membuat draft klaim baru ${newKlaim.kodeKlaim} atas nama debitur ${sp.namaDebitur}`);

          return ApiService.mockResponse({ data: newKlaim }, 201);
        }

        // --- SUB ACTIONS (TRANSITIONS) ---
        if (klaimId && subAction) {
          const klaim = db.klaims.find((k: any) => k.id === klaimId);
          if (!klaim) return ApiService.mockResponse({ message: "Klaim tidak ditemukan" }, 404);

          const actorName = activeUser?.name || "User";
          const actorRole = activeUser?.roleId === 2 ? "mitra" : (activeUser?.roleId === 5 ? "keuangan" : "klaim");

          // 1. Submit claim (Draft -> Diajukan)
          if (subAction === "submit") {
            // Check document completeness
            const docs = db.klaimDocuments.filter((d: any) => d.klaimId === klaimId);
            const missingCount = docs.filter((d: any) => !d.ada).length;
            if (missingCount > 0) {
              return ApiService.mockResponse({ 
                message: `Dokumen persyaratan belum lengkap! Terdapat ${missingCount} dokumen wajib yang belum diunggah.` 
              }, 400);
            }

            klaim.statusId = 2; // diajukan
            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 2,
              actorNama: actorName, actorPeran: "mitra", aksi: "Mengajukan berkas klaim lengkap (Status: Diajukan)", active: true
            });
          }

          // 2. Upload Document
          if (subAction === "upload-document") {
            console.log("=== MOCK UPLOAD DEBUG ===");
            console.log("payload:", payload);
            const isMultipart = payload && typeof payload.get === "function";
            console.log("isMultipart:", isMultipart);
            const rawDocId = isMultipart ? payload.get("jenisDokumenId") : (payload?.jenisDokumenId || payload);
            console.log("rawDocId:", rawDocId);
            const docId = rawDocId ? parseInt(String(rawDocId)) : null;
            console.log("parsed docId:", docId);
            console.log("klaimId:", klaimId);

            const fileName = isMultipart ? payload.get("fileName") : payload?.fileName;
            const fileType = isMultipart ? payload.get("fileType") : payload?.fileType;
            const fileUrl = isMultipart ? payload.get("fileUrl") : payload?.fileUrl;

            let doc = db.klaimDocuments.find((d: any) => d.klaimId == klaimId && d.jenisDokumenId == docId);
            console.log("found doc:", doc);
            console.log("all docs for this claim in db:", db.klaimDocuments.filter((d: any) => d.klaimId == klaimId));

            const targetUrl = fileUrl || "/documents/uploaded_sample.pdf";
            const targetName = fileName || "uploaded_document.pdf";

            if (!doc) {
              // Auto-create doc entry if not present
              doc = {
                id: db.klaimDocuments.length + 1,
                klaimId: parseInt(String(klaimId)),
                jenisDokumenId: parseInt(String(docId)),
                ada: true,
                filePath: targetUrl,
                fileName: targetName,
                fileType: fileType || "application/pdf",
                isReplaced: true,
                is_replaced: 1,
                replacedAt: new Date().toISOString(),
                uploadedAt: new Date().toISOString()
              };
              db.klaimDocuments.push(doc);
            } else {
              doc.ada = true;
              doc.filePath = targetUrl;
              doc.fileName = targetName;
              doc.fileType = fileType || doc.fileType || "application/pdf";
              doc.isReplaced = true;
              doc.is_replaced = 1;
              doc.replacedAt = new Date().toISOString();
              doc.uploadedAt = new Date().toISOString();
            }

            MockDb.saveData(db);
            return ApiService.mockResponse({ data: doc, message: "Dokumen berhasil diunggah." });
          }

          // 2b. Verify Individual Document (Sesuai / Tidak Sesuai)
          if (subAction === "verify-document") {
            const docId = payload.documentId || payload.jenisDokumenId;
            const status = payload.status; // 'sesuai' | 'tidak_sesuai' | 'belum_diperiksa'
            const catatan = payload.catatan || "";

            let doc = db.klaimDocuments.find((d: any) => d.klaimId == klaimId && (d.jenisDokumenId == docId || d.id == docId));
            if (!doc) {
              doc = {
                id: db.klaimDocuments.length + 1,
                klaimId: parseInt(String(klaimId)),
                jenisDokumenId: parseInt(String(docId)),
                ada: true,
                filePath: "/documents/uploaded_sample.pdf",
                fileName: "document.pdf",
                fileType: "application/pdf",
                kesesuaian: status,
                catatanPemeriksaan: status === 'sesuai' ? '' : catatan,
                uploadedAt: new Date().toISOString()
              };
              db.klaimDocuments.push(doc);
            } else {
              doc.kesesuaian = status;
              doc.catatanPemeriksaan = status === 'sesuai' ? '' : catatan;
            }

            MockDb.saveData(db);
            return ApiService.mockResponse({ data: doc, message: `Status pemeriksaan dokumen diperbarui (${status}).` });
          }

          // 3. Take for Verification (Diajukan -> Verifikasi)
          if (subAction === "ambil-verifikasi") {
            klaim.statusId = 3; // verifikasi
            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: "Mengambil klaim untuk diverifikasi", active: true
            });
          }

          // 4. Verification result
          if (subAction === "verifikasi-dokumen") {
            const actionType = payload.action; // assessment, perbaikan, survei
            if (actionType === "assessment") {
              klaim.statusId = 5; // assessment
              db.klaimStatusHistory.push({
                id: db.klaimStatusHistory.length + 1,
                klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
                actorNama: actorName, actorPeran: "klaim", aksi: "Verifikasi dokumen selesai - dokumen lengkap & valid", active: true
              });
            } else if (actionType === "perbaikan") {
              klaim.statusId = 4; // perbaikan
              klaim.catatanPerbaikan = payload.catatan || "Mohon perbaiki dokumen klaim sesuai catatan per berkas.";
              db.klaimStatusHistory.push({
                id: db.klaimStatusHistory.length + 1,
                klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
                actorNama: actorName, actorPeran: "klaim", aksi: `Berkas tidak lengkap. Catatan verifikasi: ${payload.catatan}`, active: true
              });
            } else if (actionType === "survei") {
              klaim.statusId = 6; // survei
              db.klaimStatusHistory.push({
                id: db.klaimStatusHistory.length + 1,
                klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
                actorNama: actorName, actorPeran: "klaim", aksi: `Klaim butuh survei lapangan. Catatan: ${payload.catatan}`, active: true
              });

              // Create survey request
              const seq = String(db.surveys.length + 1).padStart(4, "0");
              db.surveys.push({
                id: db.surveys.length + 1,
                klaimId,
                nomorPermohonan: `SRV-2026-${seq}`,
                tanggalSurvey: payload.tanggalSurvey || new Date().toISOString().split("T")[0],
                catatan: payload.catatan || "",
                dokumenLaporanPath: null,
                approvedByMitra: false,
                active: true,
                createdAt: new Date().toISOString()
              });
            }
          }

          // 5. Submit Perbaikan (Perbaikan -> Verifikasi)
          if (subAction === "submit-perbaikan") {
            klaim.statusId = 3; // verifikasi
            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 2,
              actorNama: actorName, actorPeran: "mitra", aksi: "Mengajukan berkas perbaikan dokumen", active: true
            });
          }

          // 6. Laporan Survey Upload
          if (subAction === "survei-laporan") {
            const survey = db.surveys.find((s: any) => s.klaimId === klaimId);
            if (survey) {
              survey.dokumenLaporanPath = "/documents/laporan_survey_final.pdf";
              survey.approvedByMitra = !!payload.approvedByMitra;
            }
          }

          // 7. Selesai Survey (Survei -> Assessment)
          if (subAction === "survei-selesai") {
            klaim.statusId = 5; // assessment
            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: "Laporan survey diunggah - memproses assessment", active: true
            });
          }

          // 8. Ajukan Komite (Assessment -> Komite)
          if (subAction === "ajukan-komite") {
            klaim.statusId = 7; // komite
            
            // Create BA
            const baSeq = String(db.beritaAcaras.length + 1).padStart(4, "0");
            const newBa = {
              id: db.beritaAcaras.length + 1,
              klaimId,
              nomorBa: `BA-${baSeq}/KLM/JJ/2026`,
              statusDokumen: "menunggu_esign" as const,
              active: true,
              createdAt: new Date().toISOString()
            };
            db.beritaAcaras.push(newBa);

            // Create signatures for BA
            db.pejabatKomites.forEach((pj: any) => {
              db.esignSignatures.push({
                id: db.esignSignatures.length + 1,
                dokumenType: "berita_acara",
                dokumenId: newBa.id,
                pejabatKomiteId: pj.id,
                status: "pending",
                signedAt: null,
                active: true
              });
            });

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: `Klaim diajukan ke Sidang Komite. Menerbitkan BA ${newBa.nomorBa}`, active: true
            });
          }

          // 9. Esign BA / SK
          if (subAction === "esign") {
            const sigId = payload.esignSignatureId;
            const action = payload.action; // sign, reject
            const sig = db.esignSignatures.find((s: any) => s.id === sigId);
            if (sig) {
              sig.status = action === "sign" ? "signed" : "rejected";
              sig.signedAt = new Date().toISOString();

              const pj = db.pejabatKomites.find((p: any) => p.id === sig.pejabatKomiteId);
              const pjName = pj ? pj.nama : "Anggota Komite";

              db.klaimStatusHistory.push({
                id: db.klaimStatusHistory.length + 1,
                klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 4,
                actorNama: actorName, actorPeran: "komite", 
                aksi: `${action === "sign" ? "Menandatangani" : "Menolak"} dokumen ${sig.dokumenType === "berita_acara" ? "Berita Acara (BA)" : "Surat Keputusan (SK)"} (${pjName})`, 
                active: true
              });

              // Check logic transitions
              if (action === "reject") {
                // Rejected, claim goes to ditolak directly
                klaim.statusId = 9; // ditolak
                // Cancel pending signatures on this document
                db.esignSignatures.filter((s: any) => 
                  s.dokumenType === sig.dokumenType && 
                  s.dokumenId === sig.dokumenId && 
                  s.status === "pending"
                ).forEach((s: any) => s.status = "rejected");

                db.klaimStatusHistory.push({
                  id: db.klaimStatusHistory.length + 1,
                  klaimId, waktu: new Date().toISOString(), actorUserId: null,
                  actorNama: "Sistem", actorPeran: "sistem", aksi: "Klaim ditolak secara sistem karena salah satu Komite memilih Tolak", active: true
                });
              } else {
                // Check if all signed
                const docType = sig.dokumenType;
                const docId = sig.dokumenId;
                const relatedSigs = db.esignSignatures.filter((s: any) => s.dokumenType === docType && s.dokumenId === docId);
                const allSigned = relatedSigs.every((s: any) => s.status === "signed");

                if (allSigned) {
                  if (docType === "berita_acara") {
                    // Update BA state
                    const ba = db.beritaAcaras.find((b: any) => b.id === docId);
                    if (ba) ba.statusDokumen = "selesai";

                    // BA completed, generate SK automatically
                    const skSeq = String(db.suratKeputusans.length + 1).padStart(4, "0");
                    const newSk = {
                      id: db.suratKeputusans.length + 1,
                      klaimId,
                      nomorSk: `SK-${skSeq}/KLM/JJ/2026`,
                      statusDokumen: "menunggu_esign" as const,
                      keputusan: null,
                      active: true,
                      createdAt: new Date().toISOString()
                    };
                    db.suratKeputusans.push(newSk);

                    // Add SK signatures
                    db.pejabatKomites.forEach((p: any) => {
                      db.esignSignatures.push({
                        id: db.esignSignatures.length + 1,
                        dokumenType: "surat_keputusan",
                        dokumenId: newSk.id,
                        pejabatKomiteId: p.id,
                        status: "pending",
                        signedAt: null,
                        active: true
                      });
                    });

                    db.klaimStatusHistory.push({
                      id: db.klaimStatusHistory.length + 1,
                      klaimId, waktu: new Date().toISOString(), actorUserId: null,
                      actorNama: "Sistem", actorPeran: "sistem", aksi: `Seluruh pejabat komite menandatangani BA. Menggenerate Surat Keputusan (SK) nomor ${newSk.nomorSk}`, active: true
                    });
                  } else if (docType === "surat_keputusan") {
                    // SK completed -> disetujui!
                    const sk = db.suratKeputusans.find((s: any) => s.id === docId);
                    if (sk) {
                      sk.statusDokumen = "selesai";
                      sk.keputusan = "disetujui";
                    }
                    klaim.statusId = 8; // disetujui

                    db.klaimStatusHistory.push({
                      id: db.klaimStatusHistory.length + 1,
                      klaimId, waktu: new Date().toISOString(), actorUserId: null,
                      actorNama: "Sistem", actorPeran: "sistem", aksi: "Seluruh pejabat komite menandatangani SK. Klaim disetujui untuk pembayaran", active: true
                    });
                  }
                }
              }
            }
          }

          // 10. Memo bayar (Disetujui -> Memo)
          if (subAction === "terbit-memo") {
            klaim.statusId = 11; // memo
            
            const memoSeq = String(db.memoPembayarans.length + 1).padStart(4, "0");
            const newMemo = {
              id: db.memoPembayarans.length + 1,
              klaimId,
              nomorMemo: `MEMO-${memoSeq}/KLAIM/2026`,
              esignStatus: "selesai" as const, // Automatically signed in mockup
              active: true,
              createdAt: new Date().toISOString()
            };
            db.memoPembayarans.push(newMemo);

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: `Menerbitkan Memo Pembayaran nomor ${newMemo.nomorMemo}`, active: true
            });
          }

          // 11. Bayar (Memo -> Dibayar)
          if (subAction === "bayar") {
            klaim.statusId = 12; // dibayar

            db.pembayarans.push({
              id: db.pembayarans.length + 1,
              klaimId,
              tanggalBayar: payload.tanggalBayar || new Date().toISOString().split("T")[0],
              buktiBayarPath: "/documents/bukti_bayar_transfer.pdf",
              dikonfirmasiKeMitra: false,
              active: true,
              createdAt: new Date().toISOString()
            });

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 7,
              actorNama: actorName, actorPeran: "keuangan", aksi: "Mencatat pembayaran klaim & upload bukti transfer", active: true
            });
          }

          // 12. Konfirmasi bukti bayar (Dibayar -> Selesai)
          if (subAction === "konfirmasi-bukti") {
            klaim.statusId = 13; // selesai
            const pay = db.pembayarans.find((p: any) => p.klaimId === klaimId);
            if (pay) pay.dikonfirmasiKeMitra = true;

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: "Mengirimkan konfirmasi bukti transfer ke mitra. Siklus klaim Selesai.", active: true
            });
          }

          // 13. Banding (Ditolak -> Banding)
          if (subAction === "banding") {
            klaim.statusId = 10; // banding
            db.bandings.push({
              id: db.bandings.length + 1,
              klaimId,
              tanggalPengajuan: new Date().toISOString().split("T")[0],
              alasan: payload.alasan || "",
              status: "diajukan",
              active: true,
              createdAt: new Date().toISOString()
            });

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 2,
              actorNama: actorName, actorPeran: "mitra", aksi: `Mengajukan banding. Alasan: ${payload.alasan}`, active: true
            });
          }

          // 14. Selesai Banding (Banding -> Komite)
          if (subAction === "selesai-banding") {
            klaim.statusId = 7; // komite
            
            // Create BA baru
            const baSeq = String(db.beritaAcaras.length + 1).padStart(4, "0");
            const newBa = {
              id: db.beritaAcaras.length + 1,
              klaimId,
              nomorBa: `BA-${baSeq}/KLM/JJ/2026-BANDING`,
              statusDokumen: "menunggu_esign" as const,
              active: true,
              createdAt: new Date().toISOString()
            };
            db.beritaAcaras.push(newBa);

            // Create signatures for BA baru
            db.pejabatKomites.forEach((pj: any) => {
              db.esignSignatures.push({
                id: db.esignSignatures.length + 1,
                dokumenType: "berita_acara",
                dokumenId: newBa.id,
                pejabatKomiteId: pj.id,
                status: "pending",
                signedAt: null,
                active: true
              });
            });

            // Update status banding record
            const band = db.bandings.find((b: any) => b.klaimId === klaimId);
            if (band) band.status = "diproses";

            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 3,
              actorNama: actorName, actorPeran: "klaim", aksi: `Assessment banding selesai. Mengembalikan berkas ke Sidang Komite. Menerbitkan BA Banding ${newBa.nomorBa}`, active: true
            });
          }

          // 15. Terima Penolakan (Ditolak -> Selesai)
          if (subAction === "terima-penolakan") {
            klaim.statusId = 13; // selesai
            db.klaimStatusHistory.push({
              id: db.klaimStatusHistory.length + 1,
              klaimId, waktu: new Date().toISOString(), actorUserId: activeUser?.id || 2,
              actorNama: actorName, actorPeran: "mitra", aksi: "Mitra menerima keputusan penolakan. Berkas ditutup.", active: true
            });
          }

          MockDb.saveData(db);
          return ApiService.mockResponse({ data: klaim });
        }
      }

      // PUT klaims/:id (Update draft claim details)
      if (method === "PUT" && cleanPath.startsWith("klaims/") && klaimId) {
        const idx = db.klaims.findIndex((k: any) => k.id == klaimId);
        if (idx === -1) return ApiService.mockResponse({ message: "Klaim tidak ditemukan" }, 404);

        const k = db.klaims[idx];
        if (k.statusId !== 1 && k.statusId !== 4) {
          return ApiService.mockResponse({ message: "Klaim yang sudah diproses tidak dapat diubah lagi." }, 400);
        }

        const spId = payload.sertifikatPenjaminanId ? parseInt(payload.sertifikatPenjaminanId) : k.sertifikatPenjaminanId;
        const sp = db.sertifikatPenjaminans.find((x: any) => x.id == spId);
        const prod = db.produkPenjaminans.find((x: any) => x.id == sp?.produkId);
        const cp = prod ? prod.coverPercentage : k.coverPercentageSnapshot;
        const bakiDebet = payload.bakiDebetKlaim !== undefined ? payload.bakiDebetKlaim : k.bakiDebetKlaim;

        db.klaims[idx] = {
          ...k,
          sertifikatPenjaminanId: spId,
          penyebabKlaimId: payload.penyebabKlaimId ? parseInt(payload.penyebabKlaimId) : k.penyebabKlaimId,
          bakiDebetKlaim: bakiDebet,
          nilaiKlaim: bakiDebet * cp,
          updatedAt: new Date().toISOString()
        };

        db.klaimStatusHistory.push({
          id: db.klaimStatusHistory.length + 1,
          klaimId,
          waktu: new Date().toISOString(),
          actorUserId: activeUser?.id || 2,
          actorNama: activeUser?.name || "Mitra BJB",
          actorPeran: "mitra",
          aksi: "Memperbarui rincian data pengajuan klaim",
          active: true
        });

        MockDb.saveData(db);
        return ApiService.mockResponse({ data: db.klaims[idx] });
      }

      // DELETE klaims/:id (Delete draft claim)
      if (method === "DELETE" && cleanPath.startsWith("klaims/") && klaimId) {
        const idx = db.klaims.findIndex((k: any) => k.id == klaimId);
        if (idx === -1) return ApiService.mockResponse({ message: "Klaim tidak ditemukan" }, 404);

        const k = db.klaims[idx];
        if (k.statusId !== 1) {
          return ApiService.mockResponse({ message: "Hanya draft klaim yang belum diajukan yang dapat dihapus." }, 400);
        }

        db.klaims.splice(idx, 1);
        db.klaimDocuments = db.klaimDocuments.filter((d: any) => d.klaimId != klaimId);
        db.klaimStatusHistory = db.klaimStatusHistory.filter((h: any) => h.klaimId != klaimId);

        MockDb.saveData(db);
        return ApiService.mockResponse({ message: "Draft klaim berhasil dihapus." });
      }
    }

    // Fallback: If route is not mock-intercepted, return a 404 error
    console.warn(`Unintercepted mock API route: ${method} ${path}`);
    return ApiService.mockResponse({ message: `Mock route ${cleanPath} not found` }, 404);
  }
}

export default ApiService;
