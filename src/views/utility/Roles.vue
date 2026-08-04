<template>
  <div>
    <!-- Tabs Navigation -->
    <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold mb-8">
      <li class="nav-item">
        <a
          class="nav-link text-active-primary py-5 me-6 cursor-pointer"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          <KTIcon icon-name="profile-user" icon-class="fs-2 me-2" />
          Daftar Pengguna (Users)
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link text-active-primary py-5 me-6 cursor-pointer"
          :class="{ active: activeTab === 'roles' }"
          @click="activeTab = 'roles'"
        >
          <KTIcon icon-name="shield-tick" icon-class="fs-2 me-2" />
          Kelola Role & Hak Akses
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link text-active-primary py-5 cursor-pointer"
          :class="{ active: activeTab === 'modules' }"
          @click="activeTab = 'modules'"
        >
          <KTIcon icon-name="element-11" icon-class="fs-2 me-2" />
          Registry Modul Sistem
        </a>
      </li>
    </ul>

    <!-- TAB 1: USERS MANAGEMENT -->
    <div v-if="activeTab === 'users'" class="card mb-5 mb-xl-8">
      <!-- Card Header -->
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3 mb-1">Daftar Pengguna Sistem</span>
          <span class="text-muted mt-1 fw-semibold fs-7"
            >Kelola akun pengguna, penetapan peran (role), dan mitra terhubung</span
          >
        </h3>
        <div class="card-toolbar gap-3">
          <div class="d-flex align-items-center position-relative my-1">
            <KTIcon icon-name="magnifier" icon-class="fs-3 position-absolute ms-3" />
            <input
              type="text"
              v-model="searchUserQuery"
              @input="fetchUsers"
              class="form-control form-control-solid w-250px ps-10"
              placeholder="Cari nama / email..."
            />
          </div>
          <button @click="openUserCreateModal" class="btn btn-sm btn-primary">
            <KTIcon icon-name="plus" icon-class="fs-2 me-1" />
            Tambah Pengguna Baru
          </button>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body py-3">
        <div v-if="loadingUsers" class="text-center py-10">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat daftar pengguna...</span>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 min-w-200px rounded-start">Nama Pengguna</th>
                <th class="min-w-200px">Email / ID</th>
                <th class="min-w-150px">Role (Hak Akses)</th>
                <th class="min-w-200px">Mitra / Instansi</th>
                <th class="min-w-100px">Status</th>
                <th class="min-w-120px text-end rounded-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-35px me-3">
                      <img :src="getAssetPath('media/avatars/300-1.jpg')" alt="Avatar" />
                    </div>
                    <div class="d-flex flex-column">
                      <span class="text-gray-900 fw-bold fs-6">{{ user.name }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-gray-800 fw-semibold fs-7">{{ user.email }}</span>
                </td>
                <td>
                  <span :class="['badge py-2 px-3 fs-7 fw-bold', getRoleBadgeClass(user.role?.kode)]">
                    {{ user.role?.nama || 'Tanpa Role' }}
                  </span>
                </td>
                <td>
                  <span v-if="user.mitra" class="text-gray-800 fw-semibold fs-7">
                    {{ user.mitra.namaMitra }}
                  </span>
                  <span v-else class="text-muted fs-7 italic">PT Jamkrida Jabar (Internal)</span>
                </td>
                <td>
                  <span :class="['badge fs-8 fw-bold', user.active ? 'badge-light-success' : 'badge-light-danger']">
                    {{ user.active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button
                    @click="openUserEditModal(user)"
                    class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                    title="Edit Pengguna"
                  >
                    <KTIcon icon-name="pencil" icon-class="fs-3" />
                  </button>
                  <button
                    @click="toggleUserActive(user)"
                    :class="['btn btn-icon btn-sm', user.active ? 'btn-bg-light btn-active-color-danger' : 'btn-light-success']"
                    :title="user.active ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'"
                  >
                    <KTIcon :icon-name="user.active ? 'lock' : 'check'" icon-class="fs-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: ROLES MANAGEMENT -->
    <div v-if="activeTab === 'roles'" class="card mb-5 mb-xl-8">
      <!-- Card Header -->
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3 mb-1">Daftar Role Pengguna</span>
          <span class="text-muted mt-1 fw-semibold fs-7"
            >Konfigurasi hak akses (permission matrix) per level jabatan</span
          >
        </h3>
        <div class="card-toolbar">
          <button @click="openCreateModal" class="btn btn-sm btn-light-primary">
            <KTIcon icon-name="plus" icon-class="fs-2" />
            Tambah Role Baru
          </button>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body py-3">
        <div v-if="loadingRoles" class="text-center py-10">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat data role...</span>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 min-w-150px rounded-start">Nama Role</th>
                <th class="min-w-150px">Kode</th>
                <th class="min-w-150px">Tipe Role</th>
                <th class="min-w-100px">Status</th>
                <th class="min-w-100px text-end rounded-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td class="ps-4">
                  <span class="text-gray-900 fw-bold fs-6">{{ role.nama }}</span>
                </td>
                <td>
                  <span class="badge badge-light-secondary fs-7 fw-semibold">{{ role.kode }}</span>
                </td>
                <td>
                  <span v-if="role.isSuperAdmin" class="badge badge-light-danger fs-7 fw-bold">
                    Super Admin
                  </span>
                  <span v-else class="badge badge-light-primary fs-7 fw-medium">
                    Regular Role
                  </span>
                </td>
                <td>
                  <span :class="['badge fs-7 fw-bold', role.active ? 'badge-light-success' : 'badge-light-danger']">
                    {{ role.active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button
                    @click="openEditModal(role)"
                    class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                    title="Ubah Role & Permission"
                  >
                    <KTIcon icon-name="pencil" icon-class="fs-3" />
                  </button>
                  <button
                    @click="onDeactivateRole(role)"
                    class="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                    :disabled="!role.active"
                    title="Nonaktifkan Role"
                  >
                    <KTIcon icon-name="trash" icon-class="fs-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: MODULES REGISTRY -->
    <div v-if="activeTab === 'modules'" class="card mb-5 mb-xl-8">
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3 mb-1">Daftar Modul Terdaftar</span>
          <span class="text-muted mt-1 fw-semibold fs-7"
            >Registry menu dan modul sistem (terbaca dari database)</span
          >
        </h3>
      </div>
      <div class="card-body py-3">
        <div v-if="loadingModules" class="text-center py-10">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat modul...</span>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 min-w-150px rounded-start">Nama Modul</th>
                <th class="min-w-150px">Kode</th>
                <th class="min-w-150px">Route Slug</th>
                <th class="min-w-100px">Ikon</th>
                <th class="min-w-100px rounded-end">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mod in modules" :key="mod.id">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <span v-if="mod.parentId" class="text-muted me-2 fs-7">—</span>
                    <span class="text-gray-900 fw-bold fs-6">{{ mod.nama }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-light-secondary fs-7 fw-semibold">{{ mod.kode }}</span>
                </td>
                <td>
                  <span class="text-gray-700 fs-7">/{{ mod.routeSlug }}</span>
                </td>
                <td>
                  <span class="text-gray-600 fs-7">
                    <KTIcon v-if="mod.icon" :icon-name="mod.icon" icon-class="fs-4 text-primary me-2" />
                    {{ mod.icon || '-' }}
                  </span>
                </td>
                <td>
                  <span :class="['badge fs-7 fw-bold', mod.active ? 'badge-light-success' : 'badge-light-danger']">
                    {{ mod.active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- USER FORM MODAL -->
    <div
      v-if="showUserModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">
              {{ isEditingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeUserModal"></button>
          </div>

          <form @submit.prevent="onSaveUser">
            <div class="modal-body py-6 px-8">
              <div v-if="userFormError" class="alert alert-danger p-4 mb-5">
                {{ userFormError }}
              </div>

              <!-- Nama Lengkap -->
              <div class="fv-row mb-5">
                <label class="required fs-6 fw-semibold mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="userForm.name"
                  placeholder="Masukkan nama pengguna"
                  required
                />
              </div>

              <!-- Email -->
              <div class="fv-row mb-5">
                <label class="required fs-6 fw-semibold mb-2">Alamat Email</label>
                <input
                  type="email"
                  class="form-control form-control-solid"
                  v-model="userForm.email"
                  placeholder="contoh@bjb.co.id"
                  required
                />
              </div>

              <!-- Pilih Role -->
              <div class="fv-row mb-5">
                <label class="required fs-6 fw-semibold mb-2">Role (Peran)</label>
                <select class="form-select form-select-solid" v-model="userForm.roleId" required>
                  <option value="" disabled>-- Pilih Role --</option>
                  <option v-for="r in roles" :key="r.id" :value="r.id">
                    {{ r.nama }} ({{ r.kode }})
                  </option>
                </select>
              </div>

              <!-- Pilih Mitra (jika role = mitra / roleId = 2) -->
              <div v-if="userForm.roleId == 2" class="fv-row mb-5">
                <label class="required fs-6 fw-semibold mb-2">Instansi / Mitra Bank</label>
                <select class="form-select form-select-solid" v-model="userForm.mitraId" required>
                  <option value="" disabled>-- Pilih Bank / BPR --</option>
                  <option v-for="m in mitras" :key="m.id" :value="m.id">
                    {{ m.namaMitra }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div class="fv-row mb-5">
                <label class="fs-6 fw-semibold mb-2">Status Akun</label>
                <div class="form-check form-switch form-check-custom form-check-solid">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="userForm.active"
                    id="userActiveSwitch"
                  />
                  <label class="form-check-label fw-bold text-gray-700 ms-3" for="userActiveSwitch">
                    {{ userForm.active ? 'Akun Aktif' : 'Akun Nonaktif' }}
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" @click="closeUserModal">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm" :disabled="savingUser">
                <span v-if="savingUser" class="spinner-border spinner-border-sm me-2"></span>
                Simpan Pengguna
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ROLE FORM MODAL -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5); overflow-y: auto;"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Role & Permission Matrix' : 'Buat Role Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="onSubmitForm">
            <div class="modal-body py-10 px-lg-17">
              <div v-if="formError" class="alert alert-danger p-5 mb-5">
                {{ formError }}
              </div>

              <div class="fv-row mb-7">
                <label class="required fs-6 fw-semibold mb-2">Nama Role</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="form.nama"
                  placeholder="Contoh: Staf Verifikasi"
                  required
                />
              </div>

              <div class="fv-row mb-7">
                <label class="required fs-6 fw-semibold mb-2">Kode Unique</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="form.kode"
                  placeholder="Contoh: staf_verifikasi"
                  :disabled="isEditing"
                  required
                />
              </div>

              <div class="fv-row mb-7">
                <div class="form-check form-switch form-check-custom form-check-solid">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="form.isSuperAdmin"
                    id="superAdminSwitch"
                  />
                  <label class="form-check-label fw-bold text-gray-700 ms-3" for="superAdminSwitch">
                    Super Admin (Bypass semua batasan permission)
                  </label>
                </div>
              </div>

              <div v-if="!form.isSuperAdmin" class="fv-row mb-7">
                <label class="fs-6 fw-bold mb-4 d-block">Matriks Hak Akses Modul (Permissions)</label>

                <div class="table-responsive">
                  <table class="table table-bordered align-middle">
                    <thead>
                      <tr class="bg-light fw-bold">
                        <th>Modul</th>
                        <th class="text-center w-100px">Lihat</th>
                        <th class="text-center w-100px">Tambah</th>
                        <th class="text-center w-100px">Edit</th>
                        <th class="text-center w-100px">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="mod in flatModules" :key="mod.id">
                        <td>
                          <span :class="{ 'ms-4 text-muted': mod.parentId, 'fw-bold': !mod.parentId }">
                            {{ mod.nama }}
                          </span>
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="formPermissions[mod.id].canView"
                          />
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="formPermissions[mod.id].canCreate"
                          />
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="formPermissions[mod.id].canEdit"
                          />
                        </td>
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="formPermissions[mod.id].canDelete"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Simpan Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { getAssetPath } from "@/core/helpers/assets";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2";

export default defineComponent({
  name: "utility-roles",
  setup() {
    const activeTab = ref<"users" | "roles" | "modules">("users");

    // USERS STATE
    const users = ref<any[]>([]);
    const mitras = ref<any[]>([]);
    const loadingUsers = ref(false);
    const searchUserQuery = ref("");
    const showUserModal = ref(false);
    const isEditingUser = ref(false);
    const savingUser = ref(false);
    const userFormError = ref("");
    const currentUserId = ref<number | null>(null);

    const userForm = ref({
      name: "",
      email: "",
      roleId: "",
      mitraId: "",
      active: true
    });

    // ROLES STATE
    const roles = ref<any[]>([]);
    const loadingRoles = ref(false);
    const showModal = ref(false);
    const isEditing = ref(false);
    const currentRoleId = ref<number | null>(null);
    const submitting = ref(false);
    const formError = ref("");

    const form = ref({
      nama: "",
      kode: "",
      isSuperAdmin: false
    });

    // MODULES STATE
    const modules = ref<any[]>([]);
    const loadingModules = ref(false);

    const formPermissions = ref<Record<number, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>>({});

    const flatModules = computed(() => {
      const result: any[] = [];
      modules.value.forEach((m: any) => {
        result.push(m);
        if (m.children && m.children.length > 0) {
          m.children.forEach((c: any) => result.push(c));
        }
      });
      return result;
    });

    // FETCH USERS
    const fetchUsers = async () => {
      loadingUsers.value = true;
      try {
        const query = searchUserQuery.value ? `?search=${encodeURIComponent(searchUserQuery.value)}` : "";
        const res = await ApiService.get(`utility/users${query}`);
        users.value = res.data.data || [];
      } catch (err) {
        console.error("Gagal memuat pengguna:", err);
      } finally {
        loadingUsers.value = false;
      }
    };

    // FETCH MITRAS FOR USER FORM
    const fetchMitras = async () => {
      try {
        const res = await ApiService.get("referensi/mitras");
        mitras.value = res.data.data || [];
      } catch (err) {
        console.error("Gagal memuat mitras:", err);
      }
    };

    // USER MODAL ACTIONS
    const openUserCreateModal = () => {
      isEditingUser.value = false;
      currentUserId.value = null;
      userFormError.value = "";
      userForm.value = {
        name: "",
        email: "",
        roleId: "",
        mitraId: "",
        active: true
      };
      showUserModal.value = true;
    };

    const openUserEditModal = (u: any) => {
      isEditingUser.value = true;
      currentUserId.value = u.id;
      userFormError.value = "";
      userForm.value = {
        name: u.name,
        email: u.email,
        roleId: u.roleId ? String(u.roleId) : "",
        mitraId: u.mitraId ? String(u.mitraId) : "",
        active: u.active
      };
      showUserModal.value = true;
    };

    const closeUserModal = () => {
      showUserModal.value = false;
    };

    const onSaveUser = async () => {
      savingUser.value = true;
      userFormError.value = "";
      try {
        if (isEditingUser.value && currentUserId.value) {
          await ApiService.update("utility/users", String(currentUserId.value), userForm.value);
          Swal.fire("Berhasil", "Data pengguna berhasil diperbarui.", "success");
        } else {
          await ApiService.post("utility/users", userForm.value);
          Swal.fire("Berhasil", "Pengguna baru berhasil ditambahkan.", "success");
        }
        closeUserModal();
        fetchUsers();
      } catch (err: any) {
        userFormError.value = err.response?.data?.message || "Gagal menyimpan pengguna.";
      } finally {
        savingUser.value = false;
      }
    };

    const toggleUserActive = async (u: any) => {
      try {
        await ApiService.delete(`utility/users/${u.id}`);
        fetchUsers();
        Swal.fire("Status Diperbarui", `Status akun ${u.name} berhasil diubah.`, "success");
      } catch (err) {
        console.error("Gagal mengubah status user:", err);
      }
    };

    const getRoleBadgeClass = (code: string) => {
      const map: Record<string, string> = {
        admin: "badge-light-danger",
        super_admin: "badge-light-danger",
        mitra: "badge-light-primary",
        verifikator: "badge-light-info",
        klaim: "badge-light-info",
        kabag_klaim: "badge-light-warning",
        komite: "badge-light-warning",
        keuangan: "badge-light-success"
      };
      return map[code] || "badge-light-secondary";
    };

    // FETCH ROLES
    const fetchRoles = async () => {
      loadingRoles.value = true;
      try {
        const res = await ApiService.get("utility/roles");
        roles.value = res.data.data || [];
      } catch (err) {
        console.error("Gagal memuat roles:", err);
      } finally {
        loadingRoles.value = false;
      }
    };

    // FETCH MODULES
    const fetchModules = async () => {
      loadingModules.value = true;
      try {
        const res = await ApiService.get("utility/modules?parentOnly=1");
        modules.value = res.data.data || [];
        
        flatModules.value.forEach((m: any) => {
          formPermissions.value[m.id] = {
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false
          };
        });
      } catch (err) {
        console.error("Gagal memuat modules:", err);
      } finally {
        loadingModules.value = false;
      }
    };

    const openCreateModal = () => {
      isEditing.value = false;
      currentRoleId.value = null;
      formError.value = "";
      form.value = {
        nama: "",
        kode: "",
        isSuperAdmin: false
      };
      flatModules.value.forEach((m: any) => {
        formPermissions.value[m.id] = {
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        };
      });
      showModal.value = true;
    };

    const openEditModal = async (role: any) => {
      isEditing.value = true;
      currentRoleId.value = role.id;
      formError.value = "";
      form.value = {
        nama: role.nama,
        kode: role.kode,
        isSuperAdmin: role.isSuperAdmin
      };

      try {
        const res = await ApiService.get("utility/roles", String(role.id));
        const detailedRole = res.data.data;
        
        flatModules.value.forEach((m: any) => {
          formPermissions.value[m.id] = {
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false
          };
        });

        if (detailedRole.modulePermissions) {
          detailedRole.modulePermissions.forEach((p: any) => {
            if (formPermissions.value[p.moduleId]) {
              formPermissions.value[p.moduleId] = {
                canView: !!p.canView,
                canCreate: !!p.canCreate,
                canEdit: !!p.canEdit,
                canDelete: !!p.canDelete
              };
            }
          });
        }
      } catch (err) {
        console.error("Gagal memuat detail role:", err);
      }

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const onSubmitForm = async () => {
      submitting.value = true;
      formError.value = "";

      const permissionsArray = Object.keys(formPermissions.value).map(moduleIdStr => {
        const modId = parseInt(moduleIdStr);
        const perm = formPermissions.value[modId];
        return {
          moduleId: modId,
          ...perm
        };
      });

      const payload = {
        ...form.value,
        permissions: permissionsArray
      };

      try {
        if (isEditing.value && currentRoleId.value) {
          await ApiService.update("utility/roles", String(currentRoleId.value), payload);
          Swal.fire("Berhasil", "Role & permissions berhasil diperbarui.", "success");
        } else {
          await ApiService.post("utility/roles", payload);
          Swal.fire("Berhasil", "Role baru berhasil dibuat.", "success");
        }
        closeModal();
        fetchRoles();
      } catch (err: any) {
        formError.value = err.response?.data?.message || "Gagal menyimpan role.";
      } finally {
        submitting.value = false;
      }
    };

    const onDeactivateRole = async (role: any) => {
      const confirm = await Swal.fire({
        title: "Konfirmasi",
        text: `Apakah Anda yakin ingin menonaktifkan role '${role.nama}'?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Nonaktifkan",
        cancelButtonText: "Batal"
      });

      if (confirm.isConfirmed) {
        try {
          await ApiService.delete(`utility/roles/${role.id}`);
          Swal.fire("Berhasil", "Role berhasil dinonaktifkan.", "success");
          fetchRoles();
        } catch (err) {
          console.error("Gagal menonaktifkan role:", err);
        }
      }
    };

    onMounted(() => {
      fetchUsers();
      fetchRoles();
      fetchModules();
      fetchMitras();
    });

    return {
      activeTab,
      users,
      mitras,
      loadingUsers,
      searchUserQuery,
      showUserModal,
      isEditingUser,
      savingUser,
      userFormError,
      userForm,
      roles,
      loadingRoles,
      showModal,
      isEditing,
      submitting,
      formError,
      form,
      modules,
      loadingModules,
      formPermissions,
      flatModules,
      fetchUsers,
      openUserCreateModal,
      openUserEditModal,
      closeUserModal,
      onSaveUser,
      toggleUserActive,
      getRoleBadgeClass,
      openCreateModal,
      openEditModal,
      closeModal,
      onSubmitForm,
      onDeactivateRole,
      getAssetPath
    };
  }
});
</script>
