<template>
  <div>
    <!-- Tabs Navigation -->
    <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold mb-8">
      <li class="nav-item" v-for="tab in tabs" :key="tab.id">
        <a
          class="nav-link text-active-primary py-5 me-6 cursor-pointer"
          :class="{ active: activeTab === tab.id }"
          @click="changeTab(tab.id)"
        >
          {{ tab.name }}
        </a>
      </li>
    </ul>

    <!-- Main Card -->
    <div class="card mb-5 mb-xl-8">
      <!-- Card Header -->
      <div class="card-header border-0 pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3 mb-1">Master Data {{ activeTabName }}</span>
          <span class="text-muted mt-1 fw-semibold fs-7"
            >Kelola data referensi penjaminan dan parameter sistem</span
          >
        </h3>
        
        <!-- Search and Add Toolbar -->
        <div class="card-toolbar d-flex align-items-center gap-3">
          <div class="d-flex align-items-center position-relative my-1">
            <KTIcon icon-name="magnifier" icon-class="fs-3 position-absolute ms-3" />
            <input
              type="text"
              class="form-control form-control-solid form-control-sm w-200px ps-9"
              placeholder="Cari..."
              v-model="searchQuery"
              @input="onSearch"
            />
          </div>

          <button @click="openCreateModal" class="btn btn-sm btn-light-primary">
            <KTIcon icon-name="plus" icon-class="fs-2" />
            Tambah Baru
          </button>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body py-3">
        <div v-if="loading" class="text-center py-10">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat data referensi...</span>
        </div>

        <div v-else>
          <div v-if="items.length === 0" class="text-center text-gray-500 py-10 fs-6">
            Belum ada data referensi yang terdaftar.
          </div>

          <!-- Table rendering based on active tab -->
          <div v-else class="table-responsive">
            <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
              
              <!-- Head: Produk Penjaminan -->
              <thead v-if="activeTab === 'produk'">
                <tr class="fw-bold text-muted bg-light">
                  <th class="ps-4 min-w-100px rounded-start">Kode</th>
                  <th class="min-w-200px">Nama Produk</th>
                  <th class="min-w-120px text-center">Cover %</th>
                  <th class="min-w-120px text-center">Batas Hari</th>
                  <th class="min-w-100px">Status</th>
                  <th class="min-w-100px text-end rounded-end pe-4">Aksi</th>
                </tr>
              </thead>

              <!-- Head: Mitra -->
              <thead v-else-if="activeTab === 'mitra'">
                <tr class="fw-bold text-muted bg-light">
                  <th class="ps-4 min-w-180px rounded-start">Nama Mitra</th>
                  <th class="min-w-200px">Alamat</th>
                  <th class="min-w-150px">Kontak</th>
                  <th class="min-w-100px">Status</th>
                  <th class="min-w-100px text-end rounded-end pe-4">Aksi</th>
                </tr>
              </thead>

              <!-- Head: Penyebab Klaim -->
              <thead v-else-if="activeTab === 'penyebab'">
                <tr class="fw-bold text-muted bg-light">
                  <th class="ps-4 min-w-250px rounded-start">Nama Penyebab Klaim</th>
                  <th class="min-w-100px">Status</th>
                  <th class="min-w-100px text-end rounded-end pe-4">Aksi</th>
                </tr>
              </thead>

              <!-- Head: Pejabat Komite -->
              <thead v-else-if="activeTab === 'pejabat'">
                <tr class="fw-bold text-muted bg-light">
                  <th class="ps-4 min-w-200px rounded-start">Nama Pejabat</th>
                  <th class="min-w-150px">Jabatan</th>
                  <th class="min-w-100px text-center">Urutan</th>
                  <th class="min-w-100px">Status</th>
                  <th class="min-w-100px text-end rounded-end pe-4">Aksi</th>
                </tr>
              </thead>

              <!-- Body Rendering -->
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  
                  <!-- Body: Produk Penjaminan -->
                  <template v-if="activeTab === 'produk'">
                    <td class="ps-4">
                      <span class="badge badge-light-secondary fs-7 fw-bold">{{ item.kode }}</span>
                    </td>
                    <td>
                      <span class="text-gray-900 fw-bold fs-6">{{ item.nama }}</span>
                    </td>
                    <td class="text-center">
                      <span class="text-gray-900 fw-bold fs-6">{{ (item.coverPercentage * 100).toFixed(0) }}%</span>
                    </td>
                    <td class="text-center">
                      <span class="text-gray-900 fw-bold fs-6">{{ item.batasHari }} Hari</span>
                    </td>
                  </template>

                  <!-- Body: Mitra -->
                  <template v-else-if="activeTab === 'mitra'">
                    <td class="ps-4">
                      <span class="text-gray-900 fw-bold fs-6">{{ item.namaMitra }}</span>
                    </td>
                    <td>
                      <span class="text-gray-700 fs-7 d-block max-w-300px text-truncate" :title="item.alamat">
                        {{ item.alamat }}
                      </span>
                    </td>
                    <td>
                      <span class="text-gray-800 fs-7">{{ item.kontak }}</span>
                    </td>
                  </template>

                  <!-- Body: Penyebab Klaim -->
                  <template v-else-if="activeTab === 'penyebab'">
                    <td class="ps-4">
                      <span class="text-gray-900 fw-bold fs-6">{{ item.namaPenyebab }}</span>
                    </td>
                  </template>

                  <!-- Body: Pejabat Komite -->
                  <template v-else-if="activeTab === 'pejabat'">
                    <td class="ps-4">
                      <span class="text-gray-900 fw-bold fs-6">{{ item.nama }}</span>
                    </td>
                    <td>
                      <span :class="['badge fs-7 fw-bold', item.jabatan === 'Ketua Komite Klaim' ? 'badge-light-danger' : 'badge-light-primary']">
                        {{ item.jabatan === 'Ketua Komite Klaim' ? 'Ketua' : 'Anggota' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="text-gray-700 fw-semibold fs-6">{{ item.urutan }}</span>
                    </td>
                  </template>

                  <!-- Status Column -->
                  <td>
                    <span :class="['badge fs-7 fw-bold', item.active ? 'badge-light-success' : 'badge-light-danger']">
                      {{ item.active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </td>

                  <!-- Action Buttons -->
                  <td class="text-end pe-4">
                    <button
                      @click="openEditModal(item)"
                      class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                      title="Ubah Data"
                    >
                      <KTIcon icon-name="pencil" icon-class="fs-3" />
                    </button>
                    <button
                      @click="onToggleActive(item)"
                      class="btn btn-icon btn-bg-light btn-sm"
                      :class="item.active ? 'btn-active-color-danger' : 'btn-active-color-success'"
                      :title="item.active ? 'Nonaktifkan' : 'Aktifkan'"
                    >
                      <KTIcon :icon-name="item.active ? 'trash' : 'check'" icon-class="fs-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.lastPage > 1" class="d-flex justify-content-between align-items-center flex-wrap pt-5">
            <div class="fs-6 fw-semibold text-gray-700">
              Menampilkan {{ pagination.from || 0 }} sampai {{ pagination.to || 0 }} dari {{ pagination.total }} data
            </div>
            
            <ul class="pagination pagination-outline">
              <li :class="['page-item previous', { disabled: pagination.currentPage === 1 }]">
                <a href="#" class="page-link" @click.prevent="goToPage(pagination.currentPage - 1)">
                  <i class="next"></i>
                </a>
              </li>

              <li
                v-for="page in pagination.lastPage"
                :key="page"
                :class="['page-item', { active: pagination.currentPage === page }]"
              >
                <a href="#" class="page-link" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>

              <li :class="['page-item next', { disabled: pagination.currentPage === pagination.lastPage }]">
                <a href="#" class="page-link" @click.prevent="goToPage(pagination.currentPage + 1)">
                  <i class="next"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Dynamic CRUD Form Modal (Using Reusable UiModal) -->
    <UiModal
      v-model="showModal"
      :title="`${isEditing ? 'Ubah Data' : 'Tambah Baru'} ${activeTabName}`"
      icon="ki-solid ki-plus-circle"
      variant="primary"
      size="lg"
      :showDefaultFooter="false"
    >
      <form @submit.prevent="onSubmitForm">
        <div class="text-start">
          <div v-if="formError" class="alert alert-danger p-4 mb-5">
            {{ formError }}
          </div>

          <!-- Form: Produk Penjaminan -->
          <div v-if="activeTab === 'produk'">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Kode Produk</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.kode"
                placeholder="Contoh: KMU, KMG, KK"
                required
                :disabled="isEditing"
              />
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Nama Produk Penjaminan</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.nama"
                placeholder="Contoh: Kredit Modal Usaha, Kredit Multiguna"
                required
              />
            </div>
          </div>

          <!-- Form: Mitra Penerima -->
          <div v-if="activeTab === 'mitra'">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Nama Instansi Mitra</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.namaMitra"
                placeholder="Contoh: Bank BJB Cabang Utama"
                required
              />
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Kode Mitra (Singkat)</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.kodeMitra"
                placeholder="Contoh: BJB-BDG"
                required
              />
            </div>
            <div class="row">
              <div class="col-md-6 fv-row mb-7">
                <label class="required fs-6 fw-semibold mb-2">Nama Bank Pembayaran</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="form.bankTujuan"
                  placeholder="Contoh: Bank BJB"
                  required
                />
              </div>
              <div class="col-md-6 fv-row mb-7">
                <label class="required fs-6 fw-semibold mb-2">Nomor Rekening</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="form.noRekening"
                  placeholder="Contoh: 001299-11-229"
                  required
                />
              </div>
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Nama Pemilik Rekening</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.namaRekening"
                placeholder="Contoh: PT Bank BJB - Divisi Kredit"
                required
              />
            </div>
          </div>

          <!-- Form: Penyebab Klaim -->
          <div v-if="activeTab === 'penyebab'">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Kode Penyebab</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.kode"
                placeholder="Contoh: WANPRESTASI, MACET, PAILIT"
                required
                :disabled="isEditing"
              />
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Penyebab Klaim (Kategori)</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.namaPenyebab"
                placeholder="Contoh: Debitur Mengalami Wanprestasi / Gagal Bayar"
                required
              />
            </div>
          </div>

          <!-- Form: Jenis Dokumen -->
          <div v-if="activeTab === 'dokumen'">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Kode Dokumen</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.kode"
                placeholder="Contoh: KTP, SPG, SKU, LHA"
                required
                :disabled="isEditing"
              />
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Nama Persyaratan Dokumen</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.nama"
                placeholder="Contoh: Fotokopi KTP Debitur & Pasangan"
                required
              />
            </div>
            <div class="fv-row mb-7">
              <div class="form-check form-check-custom form-check-solid">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="form.wajib"
                  :true-value="1"
                  :false-value="0"
                  id="dokumen_wajib"
                />
                <label class="form-check-label fw-bold text-gray-800" for="dokumen_wajib">
                  Dokumen Bersifat Wajib <span class="text-muted fw-normal">(mitra wajib mengunggah agar berkas bisa dikirim)</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Form: Pejabat Komite -->
          <div v-if="activeTab === 'pejabat'">
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Nama Pejabat</label>
              <input
                type="text"
                class="form-control form-control-solid"
                v-model="form.nama"
                placeholder="Masukkan nama lengkap beserta gelar"
                required
              />
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Jabatan Komite</label>
              <select class="form-select form-select-solid" v-model="form.jabatan" required>
                <option value="Ketua Komite Klaim">Ketua Komite Klaim</option>
                <option value="Anggota Komite Klaim">Anggota Komite Klaim</option>
              </select>
            </div>
            <div class="fv-row mb-7">
              <label class="required fs-6 fw-semibold mb-2">Urutan Penandatanganan (E-Sign)</label>
              <input
                type="number"
                min="1"
                class="form-control form-control-solid"
                v-model="form.urutan"
                placeholder="Contoh: 1, 2, 3"
                required
              />
              <span class="text-muted fs-8">Urutan terkecil akan menandatangani berita acara/dokumen terlebih dahulu.</span>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-6">
          <button type="button" class="btn btn-light" @click="closeModal" :disabled="saving">
            Batal
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="!saving">Simpan</span>
            <span v-else>
              Menyimpan...
              <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          </button>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2/dist/sweetalert2.js";

interface Tab {
  id: string;
  name: string;
  endpoint: string;
}

interface PaginationMeta {
  currentPage: number;
  from: number;
  lastPage: number;
  perPage: number;
  to: number;
  total: number;
}

export default defineComponent({
  name: "referensi-main",
  components: {
    UiModal
  },
  setup() {
    const tabs: Tab[] = [
      { id: "produk", name: "Produk Penjaminan", endpoint: "referensi/produk-penjaminans" },
      { id: "mitra", name: "Mitra Penjaminan", endpoint: "referensi/mitras" },
      { id: "penyebab", name: "Penyebab Klaim", endpoint: "referensi/penyebab-klaims" },
      { id: "pejabat", name: "Pejabat Komite", endpoint: "referensi/pejabat-komites" },
    ];

    const activeTab = ref("produk");
    const items = ref<any[]>([]);
    
    const loading = ref(false);
    const saving = ref(false);
    const showModal = ref(false);
    const isEditing = ref(false);
    const editingItemId = ref<number | null>(null);

    const searchQuery = ref("");
    const formError = ref<string | null>(null);

    // Dynamic Form Model
    const form = ref<any>({
      // produk
      kode: "",
      nama: "",
      coverPercentage: 0.75,
      batasHari: 180,
      // mitra
      namaMitra: "",
      alamat: "",
      kontak: "",
      // penyebab
      namaPenyebab: "",
      // pejabat
      jabatan: "Anggota Komite Klaim",
      urutan: 1,
    });

    const pagination = ref<PaginationMeta>({
      currentPage: 1,
      from: 0,
      lastPage: 1,
      perPage: 15,
      to: 0,
      total: 0,
    });

    const activeTabObj = computed(() => {
      return tabs.find((t) => t.id === activeTab.value) || tabs[0];
    });

    const activeTabName = computed(() => activeTabObj.value.name);

    const changeTab = (tabId: string) => {
      activeTab.value = tabId;
      searchQuery.value = "";
      pagination.value.currentPage = 1;
      fetchData();
    };

    const resetForm = () => {
      form.value = {
        kode: "",
        nama: "",
        coverPercentage: 0.75,
        batasHari: 180,
        namaMitra: "",
        alamat: "",
        kontak: "",
        namaPenyebab: "",
        jabatan: "Anggota Komite Klaim",
        urutan: 1,
      };
      formError.value = null;
    };

    // Load data based on active tab endpoint
    const fetchData = async () => {
      loading.value = true;
      try {
        const params = {
          search: searchQuery.value || null,
          page: pagination.value.currentPage,
          withInactive: true, // load nonaktif juga agar bisa di-toggle
        };

        const res = await ApiService.query(activeTabObj.value.endpoint, { params });
        items.value = res.data.data;
        
        const meta = res.data.meta;
        if (meta) {
          pagination.value = {
            currentPage: meta.currentPage,
            from: meta.from,
            lastPage: meta.lastPage,
            perPage: meta.perPage,
            to: meta.to,
            total: meta.total,
          };
        }
      } catch (err) {
        console.error("Gagal mengambil data referensi:", err);
      } finally {
        loading.value = false;
      }
    };

    let searchTimeout: any = null;
    const onSearch = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        pagination.value.currentPage = 1;
        fetchData();
      }, 400);
    };

    const openCreateModal = () => {
      isEditing.value = false;
      editingItemId.value = null;
      resetForm();
      showModal.value = true;
    };

    const openEditModal = (item: any) => {
      isEditing.value = true;
      editingItemId.value = item.id;
      formError.value = null;

      // Populate form depending on active tab
      if (activeTab.value === "produk") {
        form.value.kode = item.kode;
        form.value.nama = item.nama;
        form.value.coverPercentage = item.coverPercentage;
        form.value.batasHari = item.batasHari;
      } else if (activeTab.value === "mitra") {
        form.value.namaMitra = item.namaMitra;
        form.value.alamat = item.alamat;
        form.value.kontak = item.kontak;
      } else if (activeTab.value === "penyebab") {
        form.value.namaPenyebab = item.namaPenyebab;
      } else if (activeTab.value === "pejabat") {
        form.value.nama = item.nama;
        form.value.jabatan = item.jabatan;
        form.value.urutan = item.urutan;
      }

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const onSubmitForm = async () => {
      saving.value = true;
      formError.value = null;

      // Build payload depending on active tab
      let payload: any = {};
      if (activeTab.value === "produk") {
        payload = {
          kode: form.value.kode,
          nama: form.value.nama,
          coverPercentage: parseFloat(form.value.coverPercentage),
          batasHari: parseInt(form.value.batasHari),
        };
      } else if (activeTab.value === "mitra") {
        payload = {
          namaMitra: form.value.namaMitra,
          alamat: form.value.alamat,
          kontak: form.value.kontak,
        };
      } else if (activeTab.value === "penyebab") {
        payload = {
          namaPenyebab: form.value.namaPenyebab,
        };
      } else if (activeTab.value === "pejabat") {
        payload = {
          nama: form.value.nama,
          jabatan: form.value.jabatan,
          urutan: parseInt(form.value.urutan),
        };
      }

      try {
        const endpoint = activeTabObj.value.endpoint;
        if (isEditing.value && editingItemId.value) {
          await ApiService.put(`${endpoint}/${editingItemId.value}`, payload);
        } else {
          await ApiService.post(endpoint, payload);
        }

        Swal.fire({
          text: `Data ${activeTabName.value} berhasil disimpan!`,
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });

        closeModal();
        fetchData();
      } catch (err: any) {
        formError.value = err.response?.data?.message || "Gagal menyimpan data referensi.";
      } finally {
        saving.value = false;
      }
    };

    const onToggleActive = (item: any) => {
      const verb = item.active ? "menonaktifkan" : "mengaktifkan";
      const statusTitle = item.active ? "Nonaktifkan!" : "Aktifkan!";
      
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: `Anda akan ${verb} data ini di sistem.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Ya, ${statusTitle}`,
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: item.active ? "btn btn-danger" : "btn btn-success",
          cancelButton: "btn btn-active-light",
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const endpoint = activeTabObj.value.endpoint;
            await ApiService.patch(`${endpoint}/${item.id}/toggle-active`, {});
            
            Swal.fire({
              text: `Status data berhasil diubah!`,
              icon: "success",
              confirmButtonText: "Selesai",
              customClass: {
                confirmButton: "btn btn-primary",
              },
            });
            fetchData();
          } catch (err: any) {
            Swal.fire({
              text: err.response?.data?.message || "Gagal mengubah status data.",
              icon: "error",
              confirmButtonText: "Mengerti",
              customClass: {
                confirmButton: "btn btn-danger",
              },
            });
          }
        }
      });
    };

    const goToPage = (page: number) => {
      if (page < 1 || page > pagination.value.lastPage) return;
      pagination.value.currentPage = page;
      fetchData();
    };

    onMounted(() => {
      fetchData();
    });

    return {
      tabs,
      activeTab,
      activeTabName,
      items,
      loading,
      saving,
      showModal,
      isEditing,
      form,
      searchQuery,
      formError,
      pagination,
      changeTab,
      onSearch,
      openCreateModal,
      openEditModal,
      closeModal,
      onSubmitForm,
      onToggleActive,
      goToPage,
    };
  },
});
</script>
