<template>
  <div class="d-flex flex-column flex-column-fluid">
    <!-- Filter Periode From - To Date Card -->
    <div class="card card-flush mb-5">
      <div class="card-header align-items-center py-5">
        <div class="card-title d-flex flex-column">
          <h3 class="fw-bold m-0">Pengajuan Regaransi Kredit Macet</h3>
          <span class="text-muted fs-7 mt-1">Pilih rentang periode tanggal (From - To), tampilkan data klaim kredit macet berkategori Include dari API, centang klaim terpilih, dan ajukan ke Komite Persetujuan.</span>
        </div>
      </div>
      <div class="card-body pt-0">
        <form @submit.prevent="handleFetchApi" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-bold">Tanggal Awal (From Date)</label>
            <input type="date" v-model="tglAwal" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold">Tanggal Akhir (To Date)</label>
            <input type="date" v-model="tglAkhir" class="form-control" required />
          </div>
          <div class="col-md-4">
            <button type="submit" class="btn btn-danger w-100" :disabled="isFetchingApi">
              <span v-if="isFetchingApi" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-cloud-download me-2"></i>
              Tampilkan Data API Klaim
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data Candidate Table Card (Single Page with Horizontal Scroll & Sub-header Search) -->
    <div class="card card-flush">
      <div class="card-header align-items-center py-5 gap-2 gap-md-5">
        <div class="card-title">
          <span class="fs-4 fw-bold text-gray-900">
            Daftar Klaim Kredit Macet Siap Diajukan [Status: Include] (Periode: {{ tglAwal }} s/d {{ tglAkhir }})
          </span>
        </div>
        <div class="card-toolbar d-flex align-items-center gap-3">
          <div v-if="selectedIds.length > 0" class="text-danger fw-bold fs-6">
            {{ selectedIds.length }} Klaim Dipilih | Total: Rp {{ formatNumber(totalSelectedKlaim) }}
          </div>
          <button
            class="btn btn-danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchSubmit"
          >
            <i class="bi bi-send-check me-2"></i> Ajukan Terpilih ke Komite ({{ selectedIds.length }})
          </button>
        </div>
      </div>

      <div class="card-body pt-0">
        <div class="table-responsive">
          <table class="table align-middle table-row-dashed text-nowrap fs-6 gy-4">
            <thead>
              <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                <th class="w-40px">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>No. Regaransi / Sertifikat</th>
                <th>Nama Debitur</th>
                <th>Bank Cedant</th>
                <th>Outstanding Tunggakan</th>
                <th>Klaim Regaransi</th>
                <th>Tanggal Transaksi</th>
                <th>Status Data</th>
              </tr>
              <!-- Column Search Filter Row -->
              <tr class="bg-light gs-0">
                <th></th>
                <th><input type="text" v-model="colFilters.noRegaransi" class="form-control form-control-sm" placeholder="Cari No. Reg..." /></th>
                <th><input type="text" v-model="colFilters.namaDebitur" class="form-control form-control-sm" placeholder="Cari Debitur..." /></th>
                <th><input type="text" v-model="colFilters.bankCedant" class="form-control form-control-sm" placeholder="Cari Bank..." /></th>
                <th><input type="text" v-model="colFilters.outstandingTunggakan" class="form-control form-control-sm" placeholder="Cari Tunggakan..." /></th>
                <th><input type="text" v-model="colFilters.nominalKlaimRegaransi" class="form-control form-control-sm" placeholder="Cari Klaim..." /></th>
                <th><input type="text" v-model="colFilters.createdAt" class="form-control form-control-sm" placeholder="Cari Tanggal..." /></th>
                <th><input type="text" v-model="colFilters.statusData" class="form-control form-control-sm" placeholder="Cari Status..." /></th>
              </tr>
            </thead>
            <tbody class="fw-semibold text-gray-600">
              <tr v-for="item in filteredItems" :key="item.id">
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="item.id"
                    v-model="selectedIds"
                  />
                </td>
                <td>
                  <span class="text-gray-800 fw-bold">{{ item.noRegaransi }}</span>
                  <div class="fs-8 text-muted">{{ item.noSertifikatPenjaminan }}</div>
                </td>
                <td>
                  <div class="text-gray-800 fw-bold">{{ item.namaDebitur }}</div>
                  <span class="badge badge-light-danger fs-9">{{ item.kolektibilitas }}</span>
                </td>
                <td>{{ item.bankCedant }}</td>
                <td class="fw-bold text-dark">Rp {{ formatNumber(item.outstandingTunggakan) }}</td>
                <td class="text-danger fw-bold fs-5">Rp {{ formatNumber(item.nominalKlaimRegaransi) }}</td>
                <td><span class="text-gray-800 fw-bold">{{ item.createdAt }}</span></td>
                <td>
                  <span class="badge badge-light-success text-success px-3 py-2">
                    <i class="bi bi-check-circle-fill me-1"></i> Include
                  </span>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-2x text-warning d-block mb-2"></i>
                  Tidak ada data klaim kredit macet yang sesuai kriteria pencarian atau tanggal {{ tglAwal }} s/d {{ tglAkhir }}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRegaransiStore } from "@/stores/regaransiStore";

export default defineComponent({
  name: "pengajuan-kredit",
  setup() {
    const regaransiStore = useRegaransiStore();
    const tglAwal = ref("2026-08-01");
    const tglAkhir = ref("2026-08-31");
    const isFetchingApi = ref(false);
    const selectedIds = ref<string[]>([]);

    const colFilters = ref({
      noRegaransi: "",
      namaDebitur: "",
      bankCedant: "",
      outstandingTunggakan: "",
      nominalKlaimRegaransi: "",
      createdAt: "",
      statusData: "",
    });

    const availableItems = computed(() => {
      return regaransiStore.itemsKredit.filter((i) => {
        const isAvailable = i.status === "AVAILABLE";
        const isInclude = (i.statusData || "Include") === "Include";
        const itemDate = i.createdAt.slice(0, 10);
        const inDateRange = (!tglAwal.value || itemDate >= tglAwal.value) && (!tglAkhir.value || itemDate <= tglAkhir.value);
        return isAvailable && isInclude && inDateRange;
      });
    });

    const filteredItems = computed(() => {
      return availableItems.value.filter((i) => {
        const matchNo = !colFilters.value.noRegaransi || i.noRegaransi.toLowerCase().includes(colFilters.value.noRegaransi.toLowerCase()) || i.noSertifikatPenjaminan.toLowerCase().includes(colFilters.value.noRegaransi.toLowerCase());
        const matchDebitur = !colFilters.value.namaDebitur || i.namaDebitur.toLowerCase().includes(colFilters.value.namaDebitur.toLowerCase());
        const matchBank = !colFilters.value.bankCedant || i.bankCedant.toLowerCase().includes(colFilters.value.bankCedant.toLowerCase());
        const matchTunggakan = !colFilters.value.outstandingTunggakan || i.outstandingTunggakan.toString().includes(colFilters.value.outstandingTunggakan);
        const matchKlaim = !colFilters.value.nominalKlaimRegaransi || i.nominalKlaimRegaransi.toString().includes(colFilters.value.nominalKlaimRegaransi);
        const matchDate = !colFilters.value.createdAt || i.createdAt.toLowerCase().includes(colFilters.value.createdAt.toLowerCase());
        const matchStatus = !colFilters.value.statusData || "include".includes(colFilters.value.statusData.toLowerCase());
        return matchNo && matchDebitur && matchBank && matchTunggakan && matchKlaim && matchDate && matchStatus;
      });
    });

    const isAllSelected = computed(() => {
      if (filteredItems.value.length === 0) return false;
      return filteredItems.value.every((i) => selectedIds.value.includes(i.id));
    });

    const totalSelectedKlaim = computed(() => {
      return regaransiStore.itemsKredit
        .filter((i) => selectedIds.value.includes(i.id))
        .reduce((sum, curr) => sum + curr.nominalKlaimRegaransi, 0);
    });

    const toggleSelectAll = (e: Event) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) {
        selectedIds.value = filteredItems.value.map((i) => i.id);
      } else {
        selectedIds.value = [];
      }
    };

    const handleFetchApi = () => {
      isFetchingApi.value = true;
      selectedIds.value = [];
      setTimeout(() => {
        isFetchingApi.value = false;
      }, 600);
    };

    const handleBatchSubmit = () => {
      regaransiStore.submitBatchKredit([...selectedIds.value]);
      selectedIds.value = [];
    };

    const formatNumber = (num: number) => {
      return num ? num.toLocaleString("id-ID") : "0";
    };

    return {
      regaransiStore,
      tglAwal,
      tglAkhir,
      isFetchingApi,
      selectedIds,
      colFilters,
      availableItems,
      filteredItems,
      isAllSelected,
      totalSelectedKlaim,
      toggleSelectAll,
      handleFetchApi,
      handleBatchSubmit,
      formatNumber,
    };
  },
});
</script>
