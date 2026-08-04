<template>
  <div class="card mb-5 mb-xl-8">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3 mb-1">Audit Trail & Log Akses</span>
        <span class="text-muted mt-1 fw-semibold fs-7"
          >Rekaman aktivitas pengguna di dalam sistem</span
        >
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-3">
      <!--begin::Filters-->
      <div class="row g-8 mb-8 border rounded p-6 bg-light bg-opacity-50 mx-1">
        <!-- Filter Tanggal Mulai -->
        <div class="col-md-3">
          <label class="form-label fw-semibold fs-6 text-gray-700">Tanggal Mulai</label>
          <input
            type="date"
            class="form-control form-control-solid"
            v-model="filters.startDate"
            @change="onFilterChange"
          />
        </div>

        <!-- Filter Tanggal Selesai -->
        <div class="col-md-3">
          <label class="form-label fw-semibold fs-6 text-gray-700">Tanggal Selesai</label>
          <input
            type="date"
            class="form-control form-control-solid"
            v-model="filters.endDate"
            @change="onFilterChange"
          />
        </div>

        <!-- Filter User -->
        <div class="col-md-3">
          <label class="form-label fw-semibold fs-6 text-gray-700">Pengguna (User)</label>
          <Multiselect
            v-model="filters.userId"
            :options="userOptions"
            :searchable="true"
            placeholder="Pilih Pengguna"
            class="form-control form-control-solid p-0 border-0"
            @change="onFilterChange"
          />
        </div>

        <!-- Filter Modul -->
        <div class="col-md-3">
          <label class="form-label fw-semibold fs-6 text-gray-700">Modul</label>
          <Multiselect
            v-model="filters.module"
            :options="moduleOptions"
            :searchable="true"
            placeholder="Pilih Modul"
            class="form-control form-control-solid p-0 border-0"
            @change="onFilterChange"
          />
        </div>
      </div>
      <!--end::Filters-->

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <span class="spinner-border text-primary" role="status"></span>
        <span class="text-gray-500 d-block mt-2">Memuat data log...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger d-flex align-items-center p-5 mb-10">
        <div class="d-flex flex-column">
          <h4 class="mb-1 text-dark">Gagal Memuat Log</h4>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Table & Data -->
      <div v-else>
        <div v-if="logs.length === 0" class="text-center text-gray-500 py-10 fs-6">
          Tidak ada data log akses yang sesuai dengan filter.
        </div>

        <div v-else class="table-responsive">
          <!--begin::Table-->
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <!--begin::Table head-->
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 min-w-150px rounded-start">Waktu</th>
                <th class="min-w-150px">Pengguna</th>
                <th class="min-w-120px">IP Address</th>
                <th class="min-w-120px">Modul</th>
                <th class="min-w-200px rounded-end">Aksi / Aktivitas</th>
              </tr>
            </thead>
            <!--end::Table head-->

            <!--begin::Table body-->
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td class="ps-4">
                  <span class="text-gray-900 fw-bold d-block fs-7">
                    {{ formatDate(log.createdAt) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-30px me-3">
                      <span class="symbol-label bg-light-info text-info fs-7 fw-bold">
                        {{ log.user ? log.user.name.charAt(0) : 'U' }}
                      </span>
                    </div>
                    <div class="d-flex flex-column">
                      <span class="text-gray-900 fw-bold fs-7">{{ log.user ? log.user.name : 'Unknown User' }}</span>
                      <span class="text-muted fs-9">{{ log.user ? log.user.email : '-' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-light-secondary fs-7 fw-semibold">
                    {{ log.ipAddress }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-light-primary fs-7 fw-bold">
                    {{ log.module }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <span class="badge badge-light-sm badge-outline-secondary me-2 fs-9 text-uppercase">
                      {{ log.method }}
                    </span>
                    <span class="text-gray-800 fw-medium fs-7">
                      {{ log.aksi }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
            <!--end::Table body-->
          </table>
          <!--end::Table-->
        </div>

        <!--begin::Pagination-->
        <div v-if="pagination.lastPage > 1" class="d-flex justify-content-between align-items-center flex-wrap pt-5">
          <div class="fs-6 fw-semibold text-gray-700">
            Menampilkan {{ pagination.from || 0 }} sampai {{ pagination.to || 0 }} dari {{ pagination.total }} log
          </div>
          
          <ul class="pagination pagination-outline">
            <!-- Prev Button -->
            <li :class="['page-item previous', { disabled: pagination.currentPage === 1 }]">
              <a href="#" class="page-link" @click.prevent="goToPage(pagination.currentPage - 1)">
                <i class="next"></i>
              </a>
            </li>

            <!-- Page Numbers -->
            <li
              v-for="page in pagination.lastPage"
              :key="page"
              :class="['page-item', { active: pagination.currentPage === page }]"
            >
              <a href="#" class="page-link" @click.prevent="goToPage(page)">{{ page }}</a>
            </li>

            <!-- Next Button -->
            <li :class="['page-item next', { disabled: pagination.currentPage === pagination.lastPage }]">
              <a href="#" class="page-link" @click.prevent="goToPage(pagination.currentPage + 1)">
                <i class="next"></i>
              </a>
            </li>
          </ul>
        </div>
        <!--end::Pagination-->
      </div>
    </div>
    <!--end::Body-->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import Multiselect from "@vueform/multiselect";
import moment from "moment";

interface UserOption {
  value: number;
  label: string;
}

interface ModuleOption {
  value: string;
  label: string;
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
  name: "utility-logs",
  components: {
    Multiselect,
  },
  setup() {
    const logs = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Initial Date Filter: default last 30 days
    const defaultStartDate = moment().subtract(30, "days").format("YYYY-MM-DD");
    const defaultEndDate = moment().format("YYYY-MM-DD");

    const filters = ref({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      userId: null as number | null,
      module: null as string | null,
      page: 1,
    });

    const userOptions = ref<UserOption[]>([]);
    const moduleOptions = ref<ModuleOption[]>([]);

    const pagination = ref<PaginationMeta>({
      currentPage: 1,
      from: 0,
      lastPage: 1,
      perPage: 20,
      to: 0,
      total: 0,
    });

    const formatDate = (isoString: string) => {
      return moment(isoString).format("DD MMM YYYY, HH:mm:ss");
    };

    // Load filter options
    const fetchFilterOptions = async () => {
      try {
        // Fetch Users from the new endpoint
        const userRes = await ApiService.get("users");
        userOptions.value = userRes.data.data.map((u: any) => ({
          value: u.id,
          label: `${u.name} (${u.email})`,
        }));

        // Fetch active modules for module filter
        const moduleRes = await ApiService.get("utility/modules?perPage=100");
        moduleOptions.value = moduleRes.data.data.map((m: any) => ({
          value: m.kode,
          label: m.nama,
        }));
      } catch (err) {
        console.error("Gagal memuat opsi filter log:", err);
      }
    };

    // Load access logs
    const fetchLogs = async () => {
      loading.value = true;
      error.value = null;
      try {
        const params = {
          startDate: filters.value.startDate,
          endDate: filters.value.endDate,
          userId: filters.value.userId,
          module: filters.value.module,
          page: filters.value.page,
        };

        const response = await ApiService.query("logs", { params });
        logs.value = response.data.data;
        
        // Populate pagination meta
        const meta = response.data.meta;
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
      } catch (err: any) {
        console.error("Gagal mengambil logs:", err);
        error.value = err.response?.data?.message || "Koneksi ke server API gagal.";
      } finally {
        loading.value = false;
      }
    };

    const onFilterChange = () => {
      filters.value.page = 1;
      fetchLogs();
    };

    const goToPage = (page: number) => {
      if (page < 1 || page > pagination.value.lastPage) return;
      filters.value.page = page;
      fetchLogs();
    };

    onMounted(() => {
      fetchFilterOptions();
      fetchLogs();
    });

    return {
      logs,
      loading,
      error,
      filters,
      userOptions,
      moduleOptions,
      pagination,
      formatDate,
      onFilterChange,
      goToPage,
    };
  },
});
</script>
