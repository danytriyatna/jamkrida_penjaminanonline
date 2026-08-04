<template>
  <div class="d-flex flex-column flex-column-fluid">
    <!-- Filter Periode From - To Date Card -->
    <div class="card card-flush mb-5">
      <div class="card-header align-items-center py-5">
        <div class="card-title d-flex flex-column">
          <h3 class="fw-bold m-0">Persetujuan & Underwriting Regaransi Jiwa</h3>
          <span class="text-muted fs-7 mt-1">Pilih rentang periode tanggal, tampilkan data pengajuan yang perlu disetujui, centang data terpilih, lalu klik Setujui Terpilih di header.</span>
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
            <button type="submit" class="btn btn-primary w-100" :disabled="isFetchingApi">
              <span v-if="isFetchingApi" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-cloud-download me-2"></i>
              Tampilkan Data Persetujuan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table Pending Approval (Single Page with Horizontal Scroll & Sub-header Search) -->
    <div class="card card-flush">
      <div class="card-header align-items-center py-5 gap-2 gap-md-5">
        <div class="card-title">
          <span class="fs-4 fw-bold text-gray-900">
            Daftar Pengajuan Menunggu Persetujuan (Periode: {{ tglAwal }} s/d {{ tglAkhir }})
          </span>
        </div>
        <div class="card-toolbar d-flex align-items-center gap-3">
          <div v-if="selectedIds.length > 0" class="text-success fw-bold fs-6">
            {{ selectedIds.length }} Data Dipilih
          </div>
          <button
            class="btn btn-success"
            :disabled="selectedIds.length === 0"
            @click="openBatchApproveModal"
          >
            <i class="bi bi-check-circle me-2"></i> Setujui Terpilih ({{ selectedIds.length }})
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
                <th>No. Regaransi</th>
                <th>Nama Peserta / NIK</th>
                <th>Reasuradur / Mitra</th>
                <th>Uang Pertanggungan</th>
                <th>Premi Regaransi</th>
                <th>Tanggal Transaksi</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
              </tr>
              <!-- Column Search Filter Row -->
              <tr class="bg-light gs-0">
                <th></th>
                <th><input type="text" v-model="colFilters.noRegaransi" class="form-control form-control-sm" placeholder="Cari No. Reg..." /></th>
                <th><input type="text" v-model="colFilters.namaPeserta" class="form-control form-control-sm" placeholder="Cari Nama/NIK..." /></th>
                <th><input type="text" v-model="colFilters.mitraReasuradur" class="form-control form-control-sm" placeholder="Cari Mitra..." /></th>
                <th><input type="text" v-model="colFilters.uangPertanggungan" class="form-control form-control-sm" placeholder="Cari UP..." /></th>
                <th><input type="text" v-model="colFilters.premiRegaransi" class="form-control form-control-sm" placeholder="Cari Premi..." /></th>
                <th><input type="text" v-model="colFilters.createdAt" class="form-control form-control-sm" placeholder="Cari Tgl Trx..." /></th>
                <th><input type="text" v-model="colFilters.tglPengajuan" class="form-control form-control-sm" placeholder="Cari Tgl Ajukan..." /></th>
                <th><input type="text" v-model="colFilters.status" class="form-control form-control-sm" placeholder="Cari Status..." /></th>
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
                <td><span class="text-gray-800 fw-bold">{{ item.noRegaransi }}</span></td>
                <td>
                  <div class="text-gray-800 fw-bold">{{ item.namaPeserta }}</div>
                  <div class="fs-7 text-muted">NIK: {{ item.nik }}</div>
                </td>
                <td>{{ item.mitraReasuradur }}</td>
                <td class="fw-bold text-dark">Rp {{ formatNumber(item.uangPertanggungan) }}</td>
                <td class="text-primary fw-bold">Rp {{ formatNumber(item.premiRegaransi) }}</td>
                <td><span class="text-gray-800 fw-bold">{{ item.createdAt }}</span></td>
                <td><span class="text-primary fw-bold">{{ item.createdAt }}</span></td>
                <td>
                  <span class="badge badge-light-warning text-warning px-3 py-2">
                    <i class="bi bi-hourglass-split me-1"></i> {{ item.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-2x text-warning d-block mb-2"></i>
                  Tidak ada pengajuan regaransi jiwa yang sesuai kriteria pencarian pada rentang tanggal {{ tglAwal }} s/d {{ tglAkhir }}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pop Up Modal Form Persetujuan -->
    <el-dialog v-model="showApproveModalDialog" title="Form Persetujuan Regaransi Jiwa" width="500px">
      <div v-if="selectedIds.length > 0" class="mb-4 p-3 bg-light-success rounded">
        <div class="fw-bold text-success">Persetujuan Massal ({{ selectedIds.length }} Data Terpilih)</div>
      </div>
      <form @submit.prevent="submitApprove">
        <div class="mb-3">
          <label class="form-label required fw-bold">Nomor Persetujuan / SK Underwriting</label>
          <input type="text" v-model="approveForm.noPersetujuan" class="form-control" required placeholder="SK-REG-JW/2026/08/XXX" />
        </div>
        <div class="mb-3">
          <label class="form-label required fw-bold">Tanggal Persetujuan</label>
          <input type="date" v-model="approveForm.tglPersetujuan" class="form-control" required />
        </div>
        <div class="d-flex justify-content-end mt-4 pt-3 border-top">
          <button type="button" class="btn btn-light me-2" @click="showApproveModalDialog = false">Batal</button>
          <button type="submit" class="btn btn-success">
            <i class="bi bi-check-circle me-1"></i> Konfirmasi & Setujui (Pindah ke Pembayaran)
          </button>
        </div>
      </form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRegaransiStore } from "@/stores/regaransiStore";

export default defineComponent({
  name: "persetujuan-jiwa",
  setup() {
    const regaransiStore = useRegaransiStore();
    const tglAwal = ref("2026-08-01");
    const tglAkhir = ref("2026-08-31");
    const isFetchingApi = ref(false);
    const selectedIds = ref<string[]>([]);

    const showApproveModalDialog = ref(false);

    const colFilters = ref({
      noRegaransi: "",
      namaPeserta: "",
      mitraReasuradur: "",
      uangPertanggungan: "",
      premiRegaransi: "",
      createdAt: "",
      tglPengajuan: "",
      status: "",
    });

    const approveForm = ref({
      noPersetujuan: "",
      tglPersetujuan: new Date().toISOString().slice(0, 10),
      sharePercentage: 50,
      catatan: "Disetujui.",
    });

    const pendingItems = computed(() => {
      return regaransiStore.itemsJiwa.filter((i) => {
        const isPengajuan = i.status === "PENGAJUAN";
        const itemDate = i.createdAt.slice(0, 10);
        const inDateRange = (!tglAwal.value || itemDate >= tglAwal.value) && (!tglAkhir.value || itemDate <= tglAkhir.value);
        return isPengajuan && inDateRange;
      });
    });

    const filteredItems = computed(() => {
      return pendingItems.value.filter((i) => {
        const matchNo = !colFilters.value.noRegaransi || i.noRegaransi.toLowerCase().includes(colFilters.value.noRegaransi.toLowerCase());
        const matchNama = !colFilters.value.namaPeserta || i.namaPeserta.toLowerCase().includes(colFilters.value.namaPeserta.toLowerCase()) || i.nik.includes(colFilters.value.namaPeserta);
        const matchMitra = !colFilters.value.mitraReasuradur || i.mitraReasuradur.toLowerCase().includes(colFilters.value.mitraReasuradur.toLowerCase());
        const matchUP = !colFilters.value.uangPertanggungan || i.uangPertanggungan.toString().includes(colFilters.value.uangPertanggungan);
        const matchPremi = !colFilters.value.premiRegaransi || i.premiRegaransi.toString().includes(colFilters.value.premiRegaransi);
        const matchDate = !colFilters.value.createdAt || i.createdAt.toLowerCase().includes(colFilters.value.createdAt.toLowerCase());
        const matchAjukan = !colFilters.value.tglPengajuan || i.createdAt.toLowerCase().includes(colFilters.value.tglPengajuan.toLowerCase());
        const matchStatus = !colFilters.value.status || i.status.toLowerCase().includes(colFilters.value.status.toLowerCase());
        return matchNo && matchNama && matchMitra && matchUP && matchPremi && matchDate && matchAjukan && matchStatus;
      });
    });

    const isAllSelected = computed(() => {
      if (filteredItems.value.length === 0) return false;
      return filteredItems.value.every((i) => selectedIds.value.includes(i.id));
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

    const openBatchApproveModal = () => {
      const seq = Math.floor(100 + Math.random() * 900);
      approveForm.value.noPersetujuan = `SK-REG-JW/2026/08/SK-${seq}`;
      approveForm.value.tglPersetujuan = new Date().toISOString().slice(0, 10);
      showApproveModalDialog.value = true;
    };

    const submitApprove = () => {
      if (selectedIds.value.length > 0) {
        regaransiStore.approveBatchJiwa([...selectedIds.value], { ...approveForm.value });
        selectedIds.value = [];
      }
      showApproveModalDialog.value = false;
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
      pendingItems,
      filteredItems,
      isAllSelected,
      toggleSelectAll,
      handleFetchApi,
      showApproveModalDialog,
      approveForm,
      openBatchApproveModal,
      submitApprove,
      formatNumber,
    };
  },
});
</script>
