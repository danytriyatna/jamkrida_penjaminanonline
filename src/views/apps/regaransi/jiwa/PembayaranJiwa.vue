<template>
  <div class="d-flex flex-column flex-column-fluid">
    <!-- Filter Periode From - To Date Card -->
    <div class="card card-flush mb-5">
      <div class="card-header align-items-center py-5">
        <div class="card-title d-flex flex-column">
          <h3 class="fw-bold m-0">Pembayaran Regaransi Asuransi Jiwa</h3>
          <span class="text-muted fs-7 mt-1">Pilih rentang periode tanggal, tampilkan data tagihan yang telah disetujui/lunas, centang tagihan terpilih, lalu klik Proses Pembayaran Terpilih di header.</span>
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
              Tampilkan Data Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Table Payment (Single Page with Horizontal Scroll & Sub-header Search) -->
    <div class="card card-flush">
      <div class="card-header align-items-center py-5 gap-2 gap-md-5">
        <div class="card-title">
          <span class="fs-4 fw-bold text-gray-900">
            Daftar Tagihan & Pelunasan Regaransi Jiwa (Periode: {{ tglAwal }} s/d {{ tglAkhir }})
          </span>
        </div>
        <div class="card-toolbar d-flex align-items-center gap-3">
          <div v-if="selectedIds.length > 0" class="text-primary fw-bold fs-6">
            {{ selectedIds.length }} Tagihan Dipilih | Total: Rp {{ formatNumber(totalSelectedPremi) }}
          </div>
          <button
            class="btn btn-primary"
            :disabled="selectedIds.length === 0"
            @click="openBatchPayModal"
          >
            <i class="bi bi-credit-card me-2"></i> Proses Pembayaran Terpilih ({{ selectedIds.length }})
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
                <th>Nama Peserta</th>
                <th>Reasuradur / Mitra</th>
                <th>Nominal Tagihan Premi</th>
                <th>Tanggal Transaksi</th>
                <th>Tanggal Pengajuan</th>
                <th>Status</th>
                <th>No. Persetujuan</th>
                <th>Tanggal Persetujuan</th>
                <th>No. Pembayaran</th>
                <th>Tgl Pembayaran</th>
                <th class="text-end">Bukti Bayar</th>
              </tr>
              <!-- Column Search Filter Row -->
              <tr class="bg-light gs-0">
                <th></th>
                <th><input type="text" v-model="colFilters.noRegaransi" class="form-control form-control-sm" placeholder="Cari No. Reg..." /></th>
                <th><input type="text" v-model="colFilters.namaPeserta" class="form-control form-control-sm" placeholder="Cari Nama..." /></th>
                <th><input type="text" v-model="colFilters.mitraReasuradur" class="form-control form-control-sm" placeholder="Cari Mitra..." /></th>
                <th><input type="text" v-model="colFilters.premiRegaransi" class="form-control form-control-sm" placeholder="Cari Nominal..." /></th>
                <th><input type="text" v-model="colFilters.createdAt" class="form-control form-control-sm" placeholder="Cari Tgl Trx..." /></th>
                <th><input type="text" v-model="colFilters.tglPengajuan" class="form-control form-control-sm" placeholder="Cari Tgl Ajukan..." /></th>
                <th><input type="text" v-model="colFilters.status" class="form-control form-control-sm" placeholder="Cari Status..." /></th>
                <th><input type="text" v-model="colFilters.noPersetujuan" class="form-control form-control-sm" placeholder="Cari No. SK..." /></th>
                <th><input type="text" v-model="colFilters.tglPersetujuan" class="form-control form-control-sm" placeholder="Cari Tgl SK..." /></th>
                <th><input type="text" v-model="colFilters.noTransaksiBayar" class="form-control form-control-sm" placeholder="Cari No. Bayar..." /></th>
                <th><input type="text" v-model="colFilters.tglBayar" class="form-control form-control-sm" placeholder="Cari Tgl Bayar..." /></th>
                <th></th>
              </tr>
            </thead>
            <tbody class="fw-semibold text-gray-600">
              <tr v-for="item in filteredTableItems" :key="item.id">
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="item.id"
                    v-model="selectedIds"
                    :disabled="item.status === 'PAID'"
                  />
                </td>
                <td><span class="text-gray-800 fw-bold">{{ item.noRegaransi }}</span></td>
                <td>{{ item.namaPeserta }}</td>
                <td>{{ item.mitraReasuradur }}</td>
                <td class="text-primary fw-bold fs-5">Rp {{ formatNumber(item.premiRegaransi) }}</td>
                <td><span class="text-gray-800 fw-bold">{{ item.createdAt }}</span></td>
                <td><span class="text-primary fw-bold">{{ item.createdAt }}</span></td>
                <td>
                  <span v-if="item.status === 'PAID'" class="badge badge-light-success text-success px-3 py-2">
                    <i class="bi bi-check-all me-1"></i> PAID (LUNAS)
                  </span>
                  <span v-else class="badge badge-light-primary text-primary px-3 py-2">
                    <i class="bi bi-hourglass-split me-1"></i> {{ item.status }}
                  </span>
                </td>
                <td><span class="text-success fw-bold">{{ item.noPersetujuan || '-' }}</span></td>
                <td><span class="text-gray-800 fw-bold">{{ item.tglPersetujuan || '-' }}</span></td>
                <td>
                  <span v-if="item.noTransaksiBayar" class="text-primary fw-bold">{{ item.noTransaksiBayar }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="item.tglBayar" class="text-gray-800 fw-bold">{{ item.tglBayar }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-end">
                  <button
                    v-if="item.status === 'PAID'"
                    class="btn btn-sm btn-light-primary"
                    @click="viewBuktiBayar(item)"
                  >
                    <i class="bi bi-file-earmark-pdf text-primary me-1"></i> Lihat Bukti
                  </button>
                  <span v-else class="badge badge-light text-muted">Belum Ada</span>
                </td>
              </tr>
              <tr v-if="filteredTableItems.length === 0">
                <td colspan="13" class="text-center py-5 text-muted">
                  <i class="bi bi-search fs-2x text-warning d-block mb-2"></i>
                  Tidak ada tagihan regaransi jiwa yang sesuai kriteria pencarian pada rentang tanggal {{ tglAwal }} s/d {{ tglAkhir }}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pop Up Modal Form Pembayaran -->
    <el-dialog v-model="showPayModalDialog" title="Form Pembayaran Tagihan Regaransi Jiwa" width="520px">
      <div v-if="selectedIds.length > 0" class="mb-4 p-3 bg-light-primary rounded">
        <div class="fw-bold text-primary">Pembayaran Massal ({{ selectedIds.length }} Tagihan Terpilih)</div>
        <div class="fs-7 text-muted">Total Pembayaran: Rp {{ formatNumber(totalSelectedPremi) }}</div>
      </div>
      <form @submit.prevent="submitPayment">
        <div class="mb-3">
          <label class="form-label required fw-bold">Nomor Bukti Transaksi Pembayaran / Reff</label>
          <input type="text" v-model="payForm.noTransaksi" class="form-control" required placeholder="TRX-PAY-JW/2026/08/XXX" />
        </div>
        <div class="mb-3">
          <label class="form-label required fw-bold">Tanggal Pembayaran</label>
          <input type="date" v-model="payForm.tglBayar" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label required fw-bold">Upload File Bukti Bayar</label>
          <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png" required @change="onFileSelected" />
          <div class="form-text fs-8 text-muted">Format file yang diizinkan: .pdf, .jpg, .png (Max: 5MB)</div>
        </div>
        <div class="d-flex justify-content-end mt-4 pt-3 border-top">
          <button type="button" class="btn btn-light me-2" @click="showPayModalDialog = false">Batal</button>
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check-circle me-1"></i> Konfirmasi & Proses Bayar (Lunas)
          </button>
        </div>
      </form>
    </el-dialog>

    <!-- Pop Up Modal View Dokumen Bukti Bayar -->
    <el-dialog v-model="showViewDocModalDialog" title="Dokumen Bukti Transaksi Pembayaran" width="550px">
      <div v-if="selectedDocItem" class="p-4 border rounded bg-light">
        <div class="d-flex align-items-center mb-3">
          <i class="bi bi-file-earmark-pdf fs-3x text-danger me-3"></i>
          <div>
            <div class="fw-bold text-gray-900 fs-5">{{ selectedDocItem.buktiBayarFileName || 'Bukti_Pembayaran_Premi.pdf' }}</div>
            <div class="text-muted fs-7">No. Regaransi: {{ selectedDocItem.noRegaransi }}</div>
          </div>
        </div>
        <div class="row g-2 pt-3 border-top fs-7">
          <div class="col-6"><b>No. Pembayaran:</b> {{ selectedDocItem.noTransaksiBayar || '-' }}</div>
          <div class="col-6"><b>Tgl Pembayaran:</b> {{ selectedDocItem.tglBayar || '-' }}</div>
          <div class="col-6"><b>Nama Peserta:</b> {{ selectedDocItem.namaPeserta }}</div>
          <div class="col-6"><b>Nominal Lunas:</b> Rp {{ formatNumber(selectedDocItem.premiRegaransi) }}</div>
        </div>
        <div class="alert alert-primary d-flex align-items-center mt-4 m-0 py-2">
          <i class="bi bi-shield-check fs-2 text-primary me-2"></i>
          <span class="fs-7">Dokumen bukti transfer terverifikasi sah oleh PT Jamkrida Jabar.</span>
        </div>
      </div>
      <div class="d-flex justify-content-end mt-4">
        <button class="btn btn-primary btn-sm" @click="showViewDocModalDialog = false">Tutup</button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRegaransiStore, type ItemJiwa } from "@/stores/regaransiStore";

export default defineComponent({
  name: "pembayaran-jiwa",
  setup() {
    const regaransiStore = useRegaransiStore();
    const tglAwal = ref("2026-08-01");
    const tglAkhir = ref("2026-08-31");
    const isFetchingApi = ref(false);
    const selectedIds = ref<string[]>([]);

    const showPayModalDialog = ref(false);
    const showViewDocModalDialog = ref(false);
    const selectedDocItem = ref<ItemJiwa | null>(null);

    const colFilters = ref({
      noRegaransi: "",
      namaPeserta: "",
      mitraReasuradur: "",
      premiRegaransi: "",
      createdAt: "",
      tglPengajuan: "",
      status: "",
      noPersetujuan: "",
      tglPersetujuan: "",
      noTransaksiBayar: "",
      tglBayar: "",
    });

    const payForm = ref({
      noTransaksi: "",
      tglBayar: new Date().toISOString().slice(0, 10),
      uploadedFileName: "",
    });

    const paymentTableItems = computed(() => {
      return regaransiStore.itemsJiwa.filter((i) => {
        const isEligible = i.status === "DISETUJUI" || i.status === "PAID";
        const itemDate = i.createdAt.slice(0, 10);
        const inDateRange = (!tglAwal.value || itemDate >= tglAwal.value) && (!tglAkhir.value || itemDate <= tglAkhir.value);
        return isEligible && inDateRange;
      });
    });

    const filteredTableItems = computed(() => {
      return paymentTableItems.value.filter((i) => {
        const matchNo = !colFilters.value.noRegaransi || i.noRegaransi.toLowerCase().includes(colFilters.value.noRegaransi.toLowerCase());
        const matchNama = !colFilters.value.namaPeserta || i.namaPeserta.toLowerCase().includes(colFilters.value.namaPeserta.toLowerCase());
        const matchMitra = !colFilters.value.mitraReasuradur || i.mitraReasuradur.toLowerCase().includes(colFilters.value.mitraReasuradur.toLowerCase());
        const matchPremi = !colFilters.value.premiRegaransi || i.premiRegaransi.toString().includes(colFilters.value.premiRegaransi);
        const matchDate = !colFilters.value.createdAt || i.createdAt.toLowerCase().includes(colFilters.value.createdAt.toLowerCase());
        const matchAjukan = !colFilters.value.tglPengajuan || i.createdAt.toLowerCase().includes(colFilters.value.tglPengajuan.toLowerCase());
        const matchStatus = !colFilters.value.status || i.status.toLowerCase().includes(colFilters.value.status.toLowerCase());
        const matchNoSK = !colFilters.value.noPersetujuan || (i.noPersetujuan && i.noPersetujuan.toLowerCase().includes(colFilters.value.noPersetujuan.toLowerCase()));
        const matchTglSK = !colFilters.value.tglPersetujuan || (i.tglPersetujuan && i.tglPersetujuan.toLowerCase().includes(colFilters.value.tglPersetujuan.toLowerCase()));
        const matchNoBayar = !colFilters.value.noTransaksiBayar || (i.noTransaksiBayar && i.noTransaksiBayar.toLowerCase().includes(colFilters.value.noTransaksiBayar.toLowerCase()));
        const matchTglBayar = !colFilters.value.tglBayar || (i.tglBayar && i.tglBayar.toLowerCase().includes(colFilters.value.tglBayar.toLowerCase()));
        return matchNo && matchNama && matchMitra && matchPremi && matchDate && matchAjukan && matchStatus && matchNoSK && matchTglSK && matchNoBayar && matchTglBayar;
      });
    });

    const pendingPayItems = computed(() => {
      return filteredTableItems.value.filter((i) => i.status === "DISETUJUI");
    });

    const isAllSelected = computed(() => {
      if (pendingPayItems.value.length === 0) return false;
      return pendingPayItems.value.every((i) => selectedIds.value.includes(i.id));
    });

    const totalSelectedPremi = computed(() => {
      return regaransiStore.itemsJiwa
        .filter((i) => selectedIds.value.includes(i.id))
        .reduce((sum, curr) => sum + curr.premiRegaransi, 0);
    });

    const toggleSelectAll = (e: Event) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) {
        selectedIds.value = pendingPayItems.value.map((i) => i.id);
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

    const openBatchPayModal = () => {
      const seq = Math.floor(100 + Math.random() * 900);
      payForm.value.noTransaksi = `TRX-PAY-JW/2026/08/TRX-${seq}`;
      payForm.value.tglBayar = new Date().toISOString().slice(0, 10);
      payForm.value.uploadedFileName = "";
      showPayModalDialog.value = true;
    };

    const onFileSelected = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        payForm.value.uploadedFileName = files[0].name;
      }
    };

    const submitPayment = () => {
      if (selectedIds.value.length > 0) {
        regaransiStore.payBatchJiwa([...selectedIds.value], {
          noTransaksi: payForm.value.noTransaksi,
          tglBayar: payForm.value.tglBayar,
        });
        selectedIds.value = [];
      }
      showPayModalDialog.value = false;
    };

    const viewBuktiBayar = (item: ItemJiwa) => {
      selectedDocItem.value = item;
      showViewDocModalDialog.value = true;
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
      paymentTableItems,
      filteredTableItems,
      pendingPayItems,
      isAllSelected,
      totalSelectedPremi,
      toggleSelectAll,
      handleFetchApi,
      showPayModalDialog,
      showViewDocModalDialog,
      selectedDocItem,
      payForm,
      openBatchPayModal,
      onFileSelected,
      submitPayment,
      viewBuktiBayar,
      formatNumber,
    };
  },
});
</script>
