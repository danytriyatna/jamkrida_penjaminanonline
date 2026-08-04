<template>
  <div>
    <!-- Roles Info banner -->
    <div class="row g-5 mb-8">
      <div class="col-md-4">
        <div :class="['card border-dashed p-4 d-flex flex-row align-items-center', isKlaim ? 'bg-light-primary border-primary' : 'bg-light border-gray-300']">
          <KTIcon icon-name="document" :icon-class="`fs-2hx me-3 text-${isKlaim ? 'primary' : 'muted'}`" />
          <div>
            <span class="fw-bold d-block fs-7 text-gray-800">Otoritas Staf Klaim Jamkrida</span>
            <span class="fs-9 text-muted" v-if="isKlaim">Anda Aktif. Berwenang untuk menerbitkan Memo Bayar dan mengirimkan bukti transfer ke Mitra.</span>
            <span class="fs-9 text-muted" v-else>Nonaktif. Masuk sebagai akun Staf Klaim untuk menerbitkan memo/bukti bayar.</span>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div :class="['card border-dashed p-4 d-flex flex-row align-items-center', isKabagKlaim ? 'bg-light-dark border-dark' : 'bg-light border-gray-300']">
          <KTIcon icon-name="verify" :icon-class="`fs-2hx me-3 text-${isKabagKlaim ? 'dark' : 'muted'}`" />
          <div>
            <span class="fw-bold d-block fs-7 text-gray-800">Otoritas Kepala Bagian Klaim</span>
            <span class="fs-9 text-muted" v-if="isKabagKlaim">Anda Aktif. Berwenang untuk menyetujui & menandatangani (E-sign) Memo Bayar.</span>
            <span class="fs-9 text-muted" v-else>Nonaktif. Masuk sebagai akun Kabag Klaim untuk TTE Memo Bayar.</span>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div :class="['card border-dashed p-4 d-flex flex-row align-items-center', isKeuangan ? 'bg-light-success border-success' : 'bg-light border-gray-300']">
          <KTIcon icon-name="wallet" :icon-class="`fs-2hx me-3 text-${isKeuangan ? 'success' : 'muted'}`" />
          <div>
            <span class="fw-bold d-block fs-7 text-gray-800">Otoritas Staf Keuangan</span>
            <span class="fs-9 text-muted" v-if="isKeuangan">Anda Aktif. Berwenang untuk melakukan input realisasi pembayaran transfer bank & upload bukti bayar.</span>
            <span class="fs-9 text-muted" v-else>Nonaktif. Masuk sebagai akun Keuangan untuk mencatat transfer pembayaran.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CARD -->
    <div class="card card-flush shadow-sm">
      <div class="card-header border-0 pt-6">
        <!-- Tabs For Payment Steps -->
        <div class="card-title">
          <div class="nav-group nav-group-outline border-primary">
            <button
              v-for="tab in paymentTabs"
              :key="tab.id"
              @click="activeStep = tab.id"
              :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-4 fw-bold', activeStep === tab.id ? 'active' : '']"
            >
              {{ tab.label }}
              <span :class="`badge badge-xs fs-8 ms-2 badge-light-${tab.badgeColor}`" v-if="tab.count > 0">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body pt-3">
        <div v-if="loading" class="text-center py-15">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat antrean...</span>
        </div>

        <div v-else-if="claims.length === 0" class="text-center py-15 border border-dashed rounded bg-light">
          <KTIcon icon-name="bill" icon-class="fs-3x text-gray-400 mb-3" />
          <p class="text-gray-500 fs-6 fw-semibold">Tidak ada berkas klaim dalam antrean ini.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 rounded-start">Kode Klaim</th>
                <th>Debitur / SP</th>
                <th>Mitra</th>
                <th>Nilai Klaim disetujui</th>
                <th>Informasi Terkait</th>
                <th class="text-end rounded-end pe-4">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in claims" :key="c.id">
                <td class="ps-4">
                  <span class="text-gray-900 fw-bold fs-6 d-block">{{ c.kodeKlaim }}</span>
                  <span class="text-muted fs-8">Status: {{ c.status?.nama }}</span>
                </td>
                <td>
                  <span class="text-gray-900 fw-bold fs-7 d-block">{{ c.sertifikatPenjaminan?.namaDebitur }}</span>
                  <span class="badge badge-light-secondary fs-8">{{ c.sertifikatPenjaminan?.nomorSp }}</span>
                </td>
                <td>
                  <span class="text-gray-700 fs-7 d-block">{{ c.mitra?.namaMitra.split(' (')[0] }}</span>
                </td>
                <td>
                  <span class="text-primary fw-bold fs-6">{{ formatCurrency(c.nilaiKlaim) }}</span>
                </td>
                <td>
                  <!-- Dynamic details based on current step (per-baris jika tab "Semua Berkas") -->
                  <div v-if="stepOf(c) === 'disetujui'">
                    <span class="text-muted fs-8 d-block">TTE SK Selesai</span>
                    <span v-if="c.disetujuiConfirmedByMitra" class="badge badge-light-success fs-9 mt-1">
                      <i class="bi bi-check-circle-fill me-1"></i> Disetujui Mitra
                    </span>
                    <span v-else class="badge badge-light-warning fs-9 mt-1">Menunggu Persetujuan Mitra</span>
                  </div>
                  <div v-else-if="stepOf(c) === 'memo'">
                    <span class="fw-bold text-gray-800 fs-8 d-block">{{ c.memoPembayaran?.nomorMemo }}</span>
                    <span class="text-muted fs-9 d-block">Terbit: {{ formatDate(c.memoPembayaran?.createdAt) }}</span>
                    <span v-if="c.memoPembayaran?.status === 'disetujui'" class="badge badge-light-success fs-9 mt-1">
                      <i class="bi bi-patch-check-fill me-1"></i> TTE Kabag: {{ c.memoPembayaran?.disetujuiOleh }}
                    </span>
                    <span v-else class="badge badge-light-warning fs-9 mt-1">Menunggu TTE Kabag Klaim</span>
                  </div>
                  <div v-else-if="stepOf(c) === 'dibayar'">
                    <span class="text-success fs-8 d-block"><i class="bi bi-check-circle text-success me-1"></i>Telah Ditransfer</span>
                    <span class="text-muted fs-9 d-block">Tgl Bayar: {{ formatDate(c.pembayaran?.tanggalBayar) }}</span>
                    <span class="text-muted fs-9 d-block">No. Pembayaran: {{ c.pembayaran?.nomorReferensiTransfer || "-" }}</span>
                  </div>
                  <div v-else-if="stepOf(c) === 'selesai'">
                    <span class="text-gray-800 fs-8 d-block">{{ c.memoPembayaran?.nomorMemo }}</span>
                    <a :href="c.pembayaran?.buktiBayarPath" target="_blank" class="text-link fs-9">Unduh Bukti Bayar</a>
                  </div>
                </td>
                <td class="text-end pe-4">
                  <!-- ACTION STEP 1: Terbit Memo Bayar (Role: Klaim) - hanya setelah Mitra Setuju -->
                  <div v-if="stepOf(c) === 'disetujui'">
                    <span v-if="!c.disetujuiConfirmedByMitra" class="text-muted fs-8">Menunggu persetujuan Mitra</span>
                    <button
                      v-else-if="isKlaim"
                      @click="openMemoForm(c)"
                      class="btn btn-sm btn-primary fw-bold"
                      :disabled="actionLoading === c.id"
                    >
                      Terbit Memo Bayar
                    </button>
                    <span v-else class="text-muted fs-8 fst-italic">Hanya Staf Klaim yang dapat menerbitkan memo</span>
                  </div>

                  <!-- ACTION STEP 2a: TTE Memo Bayar (Role: Kabag Klaim) -->
                  <div v-if="stepOf(c) === 'memo' && c.memoPembayaran?.status !== 'disetujui'">
                    <div v-if="isKabagKlaim" class="d-flex gap-2 justify-content-end">
                      <button
                        @click="tolakMemo(c)"
                        class="btn btn-sm btn-light-danger fw-bold"
                        :disabled="actionLoading === c.id"
                      >
                        Tolak
                      </button>
                      <button
                        @click="esignMemo(c)"
                        class="btn btn-sm btn-dark fw-bold"
                        :disabled="actionLoading === c.id"
                      >
                        Setujui & TTE Memo
                      </button>
                    </div>
                    <span v-else class="text-muted fs-8 fst-italic">Hanya Kabag Klaim yang dapat menyetujui memo</span>
                  </div>

                  <!-- ACTION STEP 2b: Catat Bayar (Role: Keuangan) - hanya setelah memo di-TTE Kabag -->
                  <div v-if="stepOf(c) === 'memo' && c.memoPembayaran?.status === 'disetujui'">
                    <button
                      v-if="isKeuangan"
                      @click="openPaymentForm(c)"
                      class="btn btn-sm btn-success fw-bold"
                      :disabled="actionLoading === c.id"
                    >
                      Catat Transfer Bayar
                    </button>
                    <span v-else class="text-muted fs-8 fst-italic">Hanya Staf Keuangan yang dapat mencatat transfer</span>
                  </div>

                  <!-- ACTION STEP 3: Kirim Bukti Bayar (Role: Klaim) -->
                  <div v-if="stepOf(c) === 'dibayar'">
                    <button
                      v-if="isKlaim"
                      @click="kirimBuktiBayar(c)"
                      class="btn btn-sm btn-info fw-bold"
                      :disabled="actionLoading === c.id"
                    >
                      Kirim Bukti ke Mitra
                    </button>
                    <span v-else class="text-muted fs-8 fst-italic">Hanya Staf Klaim yang dapat mengirim bukti bayar</span>
                  </div>

                  <!-- No action needed for completed claims -->
                  <div v-if="stepOf(c) === 'selesai'">
                    <span class="badge badge-light-success fs-7 fw-semibold">Siklus Selesai</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MEMO BAYAR CREATION MODAL -->
    <div v-if="showMemoModal && selectedClaim" class="modal fade show d-block" style="background: rgba(0,0,0,0.5); overflow-y:auto;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Pembuatan Memo Bayar Klaim</h5>
            <button type="button" class="btn-close" @click="showMemoModal = false"></button>
          </div>
          <form @submit.prevent="submitMemo">
            <div class="modal-body">
              <div class="bg-light p-4 rounded mb-6 fs-7">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Kode Klaim</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.kodeKlaim }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Nama Debitur</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted fw-bold text-primary">Nominal Memo Bayar</span>
                  <span class="fw-bold text-primary fs-6">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</span>
                </div>
              </div>

              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Nama Penerima</label>
                <input type="text" class="form-control form-control-solid" v-model="memoForm.namaPenerima" required />
              </div>

              <div class="row">
                <div class="col-md-7 fv-row mb-6">
                  <label class="required fs-6 fw-semibold mb-2">Bank Penerima</label>
                  <input type="text" class="form-control form-control-solid" v-model="memoForm.bankPenerima" required />
                </div>
                <div class="col-md-5 fv-row mb-6">
                  <label class="required fs-6 fw-semibold mb-2">No. Rekening</label>
                  <input type="text" class="form-control form-control-solid" v-model="memoForm.noRekeningPenerima" required />
                </div>
              </div>

              <span class="text-muted fs-8">Data rekening diambil dari data Mitra terdaftar. Periksa kembali sebelum menerbitkan memo — memo akan diteruskan ke Kepala Bagian Klaim untuk persetujuan & TTE.</span>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light btn-sm" @click="showMemoModal = false">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm">Terbitkan Memo</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- PAYMENT RECORDING MODAL -->
    <div v-if="showPaymentModal && selectedClaim" class="modal fade show d-block" style="background: rgba(0,0,0,0.5); overflow-y:auto;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Pencatatan Pembayaran Klaim</h5>
            <button type="button" class="btn-close" @click="showPaymentModal = false"></button>
          </div>
          <form @submit.prevent="submitPayment">
            <div class="modal-body">
              <div class="bg-light p-4 rounded mb-6 fs-7">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Kode Klaim</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.kodeKlaim }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Nama Debitur</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted fw-bold text-primary">Nominal Transfer</span>
                  <span class="fw-bold text-primary fs-6">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</span>
                </div>
              </div>

              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Tanggal Pembayaran / Transfer</label>
                <input type="date" class="form-control form-control-solid" v-model="paymentForm.tanggalBayar" required />
              </div>

              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Nomor Pembayaran (No. Referensi Transfer)</label>
                <input type="text" class="form-control form-control-solid" v-model="paymentForm.nomorReferensiTransfer" placeholder="Contoh: TRF/20260803/000123" required />
                <span class="text-muted fs-8">Nomor referensi/kwitansi dari sistem transfer bank Jamkrida.</span>
              </div>

              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Unggah Bukti Transfer Bank (PDF/Image)</label>
                <input type="file" @change="onSelectReceipt" class="form-control form-control-solid" required />
                <span class="text-muted fs-8">Kwitansi/Receipt transfer bank Jamkrida ke rekening Mitra.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light btn-sm" @click="showPaymentModal = false">Batal</button>
              <button type="submit" class="btn btn-success btn-sm">Simpan Pembayaran</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import ApiService from "@/core/services/ApiService";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "pembayaran-klaim",
  setup() {
    const route = useRoute();
    const activeStep = ref<string>("semua");
    const PAYMENT_STATUSES = ["disetujui", "memo", "dibayar", "selesai"];
    const loading = ref(false);
    const actionLoading = ref<number | null>(null);

    const authStore = useAuthStore();
    const claims = ref<any[]>([]);
    
    const showPaymentModal = ref(false);
    const selectedClaim = ref<any>(null);
    const paymentForm = ref({
      tanggalBayar: "",
      nomorReferensiTransfer: "",
      buktiBayarUploaded: false
    });

    const paymentTabs = ref([
      { id: "semua", label: "Semua Berkas", count: 0, badgeColor: "dark" },
      { id: "disetujui", label: "Menunggu Memo", count: 0, badgeColor: "primary" },
      { id: "memo", label: "Menunggu Transfer", count: 0, badgeColor: "warning" },
      { id: "dibayar", label: "Konfirmasi Bukti", count: 0, badgeColor: "info" },
      { id: "selesai", label: "Selesai", count: 0, badgeColor: "success" }
    ]);

    // Ketika tab "Semua Berkas" aktif, kolom Informasi Terkait & Tindakan di tiap baris
    // harus mengikuti status klaim itu sendiri (bukan activeStep global) karena daftarnya
    // berisi campuran berbagai tahap.
    const stepOf = (c: any) => (activeStep.value === "semua" ? c.status?.kode : activeStep.value);

    const currentUser = computed(() => authStore.user);
    
    // Authorization helpers
    const isKlaim = computed(() => {
      const u = currentUser.value;
      return u?.role?.isSuperAdmin || u?.role?.kode === "klaim";
    });

    const isKeuangan = computed(() => {
      const u = currentUser.value;
      return u?.role?.isSuperAdmin || u?.role?.kode === "keuangan";
    });

    const isKabagKlaim = computed(() => {
      const u = currentUser.value;
      return u?.role?.isSuperAdmin || u?.role?.kode === "kabag_klaim";
    });

    const fetchClaims = async () => {
      loading.value = true;
      try {
        if (activeStep.value === "semua") {
          const [setujuRes, finalRes] = await Promise.all([
            ApiService.get("klaims?statusGroup=setuju&perPage=100"),
            ApiService.get("klaims?statusGroup=final&perPage=100")
          ]);
          const combined = [...setujuRes.data.data, ...finalRes.data.data];
          claims.value = combined.filter((k: any) => PAYMENT_STATUSES.includes(k.status?.kode));

          paymentTabs.value[1].count = combined.filter((k: any) => k.status?.kode === "disetujui").length;
          paymentTabs.value[2].count = combined.filter((k: any) => k.status?.kode === "memo").length;
          paymentTabs.value[3].count = combined.filter((k: any) => k.status?.kode === "dibayar").length;
          paymentTabs.value[4].count = combined.filter((k: any) => k.status?.kode === "selesai").length;
          paymentTabs.value[0].count = claims.value.length;
        } else {
          const res = await ApiService.get(`klaims?statusGroup=${getStatusGroup(activeStep.value)}`);
          claims.value = res.data.data.filter((k: any) => k.status?.kode === activeStep.value);

          // Fetch count for badges
          const [stat1, stat4] = await Promise.all([
            ApiService.get("klaims?statusGroup=setuju&perPage=100"),
            ApiService.get("klaims?statusGroup=final&perPage=100")
          ]);

          paymentTabs.value[1].count = stat1.data.data.filter((k: any) => k.status?.kode === "disetujui").length;
          paymentTabs.value[2].count = stat1.data.data.filter((k: any) => k.status?.kode === "memo").length;
          paymentTabs.value[3].count = stat4.data.data.filter((k: any) => k.status?.kode === "dibayar").length;
          paymentTabs.value[4].count = stat4.data.data.filter((k: any) => k.status?.kode === "selesai").length;
          paymentTabs.value[0].count = paymentTabs.value[1].count + paymentTabs.value[2].count + paymentTabs.value[3].count + paymentTabs.value[4].count;
        }
      } catch (err) {
        console.error("Gagal memuat pembayaran:", err);
      } finally {
        loading.value = false;
      }
    };

    const getStatusGroup = (step: string) => {
      if (step === "selesai") return "final";
      return "setuju";
    };

    const showMemoModal = ref(false);
    const memoForm = ref({
      namaPenerima: "",
      bankPenerima: "",
      noRekeningPenerima: ""
    });

    const openMemoForm = (claim: any) => {
      selectedClaim.value = claim;
      memoForm.value = {
        namaPenerima: claim.mitra?.namaMitra?.split(" (")[0] || "",
        bankPenerima: claim.mitra?.bankPenerima || "",
        noRekeningPenerima: claim.mitra?.noRekeningPenerima || ""
      };
      showMemoModal.value = true;
    };

    const submitMemo = async () => {
      if (!selectedClaim.value) return;
      showMemoModal.value = false;
      actionLoading.value = selectedClaim.value.id;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/terbit-memo`, {
          namaPenerima: memoForm.value.namaPenerima,
          bankPenerima: memoForm.value.bankPenerima,
          noRekeningPenerima: memoForm.value.noRekeningPenerima
        });
        Swal.fire({
          text: "Memo Pembayaran berhasil diterbitkan, menunggu TTE Kepala Bagian Klaim!",
          icon: "success",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });
        activeStep.value = "memo";
        fetchClaims();
      } catch (err: any) {
        console.error(err);
        Swal.fire({
          text: err.response?.data?.message || "Gagal menerbitkan memo bayar.",
          icon: "error"
        });
      } finally {
        actionLoading.value = null;
        selectedClaim.value = null;
      }
    };

    const esignMemo = async (claim: any) => {
      actionLoading.value = claim.id;
      Swal.fire({
        title: "Setujui & TTE Memo Bayar?",
        text: `Anda akan menandatangani (E-sign) Memo Pembayaran untuk klaim ${claim.kodeKlaim} sebagai Kepala Bagian Klaim.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui & TTE",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "btn btn-dark",
          cancelButton: "btn btn-light"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ApiService.post(`klaims/${claim.id}/esign-memo`, { action: "sign" });
            Swal.fire({
              text: "Memo Pembayaran berhasil disetujui & ditandatangani!",
              icon: "success",
              confirmButtonText: "Mengerti",
              customClass: { confirmButton: "btn btn-primary" }
            });
            fetchClaims();
          } catch (err) {
            console.error(err);
          } finally {
            actionLoading.value = null;
          }
        } else {
          actionLoading.value = null;
        }
      });
    };

    const tolakMemo = async (claim: any) => {
      const { value: catatan, isConfirmed } = await Swal.fire({
        title: "Tolak Memo Bayar?",
        input: "textarea",
        inputLabel: "Alasan penolakan",
        inputPlaceholder: "Tuliskan alasan menolak Memo Pembayaran ini...",
        showCancelButton: true,
        confirmButtonText: "Ya, Tolak",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-light"
        }
      });

      if (!isConfirmed) return;

      actionLoading.value = claim.id;
      try {
        await ApiService.post(`klaims/${claim.id}/esign-memo`, { action: "reject", catatan });
        Swal.fire({
          text: "Memo Pembayaran ditolak. Berkas dikembalikan ke Staf Klaim untuk diterbitkan ulang.",
          icon: "info",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        actionLoading.value = null;
      }
    };

    const openPaymentForm = (claim: any) => {
      selectedClaim.value = claim;
      paymentForm.value = {
        tanggalBayar: new Date().toISOString().split("T")[0],
        nomorReferensiTransfer: "",
        buktiBayarUploaded: false
      };
      showPaymentModal.value = true;
    };

    const onSelectReceipt = () => {
      // Mock upload success
      paymentForm.value.buktiBayarUploaded = true;
    };

    const submitPayment = async () => {
      if (!paymentForm.value.buktiBayarUploaded) {
        Swal.fire({ text: "Harap unggah berkas bukti transfer bank terlebih dahulu.", icon: "warning" });
        return;
      }

      showPaymentModal.value = false;
      actionLoading.value = selectedClaim.value.id;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/bayar`, {
          tanggalBayar: paymentForm.value.tanggalBayar,
          nomorReferensiTransfer: paymentForm.value.nomorReferensiTransfer
        });

        Swal.fire({
          text: "Realisasi transfer berhasil dicatat! Berkas siap dikonfirmasi oleh Staf Klaim.",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: { confirmButton: "btn btn-primary" }
        });

        activeStep.value = "dibayar";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        actionLoading.value = null;
        selectedClaim.value = null;
      }
    };

    const kirimBuktiBayar = async (claim: any) => {
      actionLoading.value = claim.id;
      Swal.fire({
        title: "Kirim Bukti Pembayaran?",
        text: "Mitra akan menerima bukti transfer transfer bank dan status berkas akan dinyatakan Selesai (Final).",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Kirim!",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-light"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ApiService.post(`klaims/${claim.id}/konfirmasi-bukti`);
            Swal.fire({
              text: "Konfirmasi bukti bayar berhasil terkirim ke Mitra dan berkas dinyatakan Selesai!",
              icon: "success",
              confirmButtonText: "Selesai",
              customClass: { confirmButton: "btn btn-primary" }
            });
            activeStep.value = "selesai";
            fetchClaims();
          } catch (err) {
            console.error(err);
          } finally {
            actionLoading.value = null;
          }
        } else {
          actionLoading.value = null;
        }
      });
    };

    // Formatting utilities
    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "Rp 0";
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (val: string) => {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    };

    onMounted(async () => {
      // Jika datang dari link luar (mis. Dashboard) dengan claimId spesifik,
      // arahkan tab aktif ke tahap tempat berkas itu berada saat ini.
      const targetId = route.query.claimId;
      if (targetId) {
        try {
          const res = await ApiService.get("klaims", String(targetId));
          const kode = res.data.data?.status?.kode;
          if (kode && paymentTabs.value.some((t) => t.id === kode)) {
            if (activeStep.value === kode) {
              fetchClaims();
            } else {
              activeStep.value = kode; // watcher akan memicu fetchClaims()
            }
            return;
          }
        } catch (err) {
          console.error("Gagal memuat berkas tujuan:", err);
        }
      }
      fetchClaims();
    });

    watch(activeStep, () => {
      fetchClaims();
    });

    return {
      activeStep,
      stepOf,
      loading,
      actionLoading,
      claims,
      paymentTabs,
      showPaymentModal,
      selectedClaim,
      paymentForm,
      showMemoModal,
      memoForm,
      isKlaim,
      isKeuangan,
      isKabagKlaim,
      openMemoForm,
      submitMemo,
      esignMemo,
      tolakMemo,
      openPaymentForm,
      onSelectReceipt,
      submitPayment,
      kirimBuktiBayar,
      formatCurrency,
      formatDate,
      fetchClaims
    };
  }
});
</script>
