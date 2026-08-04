<template>
  <div class="d-flex flex-column flex-column-fluid">
    <!-- Filter Periode From - To Date Card -->
    <div class="card card-flush mb-5">
      <div class="card-header align-items-center py-5">
        <div class="card-title d-flex flex-column">
          <h3 class="fw-bold m-0">Persetujuan & Sidang Komite Regaransi Kredit Macet</h3>
          <span class="text-muted fs-7 mt-1">Pilih rentang periode tanggal, tampilkan data klaim yang perlu disetujui Komite, centang klaim terpilih, lalu klik Setujui Terpilih di header.</span>
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
              Tampilkan Data Persetujuan Klaim
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
            Daftar Klaim Menunggu Persetujuan Komite (Periode: {{ tglAwal }} s/d {{ tglAkhir }})
          </span>
        </div>
        <div class="card-toolbar d-flex align-items-center gap-3">
          <div v-if="selectedIds.length > 0" class="text-danger fw-bold fs-6">
            {{ selectedIds.length }} Klaim Dipilih
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
                <th>Debitur</th>
                <th>Bank Cedant</th>
                <th>Outstanding Tunggakan</th>
                <th>Pengajuan Klaim</th>
                <th>Tanggal Transaksi</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
              </tr>
              <!-- Column Search Filter Row -->
              <tr class="bg-light gs-0">
                <th></th>
                <th><input type="text" v-model="colFilters.noRegaransi" class="form-control form-control-sm" placeholder="Cari No. Reg..." /></th>
                <th><input type="text" v-model="colFilters.namaDebitur" class="form-control form-control-sm" placeholder="Cari Debitur..." /></th>
                <th><input type="text" v-model="colFilters.bankCedant" class="form-control form-control-sm" placeholder="Cari Bank..." /></th>
                <th><input type="text" v-model="colFilters.outstandingTunggakan" class="form-control form-control-sm" placeholder="Cari Tunggakan..." /></th>
                <th><input type="text" v-model="colFilters.nominalKlaimRegaransi" class="form-control form-control-sm" placeholder="Cari Klaim..." /></th>
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
                <td>{{ item.namaDebitur }}</td>
                <td>{{ item.bankCedant }}</td>
                <td>Rp {{ formatNumber(item.outstandingTunggakan) }}</td>
                <td class="text-danger fw-bold fs-5">Rp {{ formatNumber(item.nominalKlaimRegaransi) }}</td>
                <td><span class="text-gray-800 fw-bold">{{ item.createdAt }}</span></td>
                <td><span class="text-danger fw-bold">{{ item.createdAt }}</span></td>
                <td>
                  <span class="badge badge-light-warning text-warning px-3 py-2">
                    <i class="bi bi-hourglass-split me-1"></i> {{ item.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-2x text-warning d-block mb-2"></i>
                  Tidak ada pengajuan klaim kredit macet yang sesuai kriteria pencarian pada rentang tanggal {{ tglAwal }} s/d {{ tglAkhir }}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pop Up Modal Form Persetujuan -->
    <el-dialog v-model="showApproveModalDialog" title="Form Persetujuan Komite Klaim Kredit Macet" width="500px">
      <div v-if="selectedIds.length > 0" class="mb-4 p-3 bg-light-success rounded">
        <div class="fw-bold text-success">Persetujuan Massal Komite ({{ selectedIds.length }} Data Terpilih)</div>
      </div>
      <form @submit.prevent="submitApprove">
        <div class="mb-3">
          <label class="form-label required fw-bold">Nomor Persetujuan / SK Komite Klaim</label>
          <input type="text" v-model="approveForm.noPersetujuan" class="form-control" required placeholder="SK-KOMITE-KM/2026/08/XXX" />
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
  name: "persetujuan-kredit",
  setup() {
    const regaransiStore = useRegaransiStore();
    const tglAwal = ref("2026-08-01");
    const tglAkhir = ref("2026-08-31");
    const isFetchingApi = ref(false);
    const selectedIds = ref<string[]>([]);

    const showApproveModalDialog = ref(false);

    const colFilters = ref({
      noRegaransi: "",
      namaDebitur: "",
      bankCedant: "",
      outstandingTunggakan: "",
      nominalKlaimRegaransi: "",
      createdAt: "",
      tglPengajuan: "",
      status: "",
    });

    const approveForm = ref({
      noPersetujuan: "",
      tglPersetujuan: new Date().toISOString().slice(0, 10),
      bankTujuan: "Bank bjb",
      noRekening: "001-99201-11",
      catatan: "Komite klaim menyetujui.",
    });

    const pendingItems = computed(() => {
      return regaransiStore.itemsKredit.filter((i) => {
        const isPengajuan = i.status === "PENGAJUAN";
        const itemDate = i.createdAt.slice(0, 10);
        const inDateRange = (!tglAwal.value || itemDate >= tglAwal.value) && (!tglAkhir.value || itemDate <= tglAkhir.value);
        return isPengajuan && inDateRange;
      });
    });

    const filteredItems = computed(() => {
      return pendingItems.value.filter((i) => {
        const matchNo = !colFilters.value.noRegaransi || i.noRegaransi.toLowerCase().includes(colFilters.value.noRegaransi.toLowerCase());
        const matchDebitur = !colFilters.value.namaDebitur || i.namaDebitur.toLowerCase().includes(colFilters.value.namaDebitur.toLowerCase());
        const matchBank = !colFilters.value.bankCedant || i.bankCedant.toLowerCase().includes(colFilters.value.bankCedant.toLowerCase());
        const matchTunggakan = !colFilters.value.outstandingTunggakan || i.outstandingTunggakan.toString().includes(colFilters.value.outstandingTunggakan);
        const matchKlaim = !colFilters.value.nominalKlaimRegaransi || i.nominalKlaimRegaransi.toString().includes(colFilters.value.nominalKlaimRegaransi);
        const matchDate = !colFilters.value.createdAt || i.createdAt.toLowerCase().includes(colFilters.value.createdAt.toLowerCase());
        const matchAjukan = !colFilters.value.tglPengajuan || i.createdAt.toLowerCase().includes(colFilters.value.tglPengajuan.toLowerCase());
        const matchStatus = !colFilters.value.status || i.status.toLowerCase().includes(colFilters.value.status.toLowerCase());
        return matchNo && matchDebitur && matchBank && matchTunggakan && matchKlaim && matchDate && matchAjukan && matchStatus;
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
      approveForm.value.noPersetujuan = `SK-KOMITE-KM/2026/08/SK-${seq}`;
      approveForm.value.tglPersetujuan = new Date().toISOString().slice(0, 10);
      showApproveModalDialog.value = true;
    };

    const submitApprove = () => {
      if (selectedIds.value.length > 0) {
        regaransiStore.approveBatchKredit([...selectedIds.value], { ...approveForm.value });
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
