<template>
  <div>
    <!-- Dashboard Stats row -->
    <div class="row g-5 mb-8">
      <!-- Stat 1: Total Plafond -->
      <div class="col-xl-3 col-md-6">
        <div class="card card-flush h-xl-100 bg-primary">
          <div class="card-body d-flex flex-column justify-content-between pb-5">
            <div class="d-flex flex-stack mb-5">
              <span class="text-white fw-bold fs-6">Plafon Kredit Dijamin</span>
              <KTIcon icon-name="briefcase" icon-class="fs-1 text-white opacity-50" />
            </div>
            <div>
              <div class="fs-2hx fw-bold text-white mb-2">{{ formatCurrency(totalPlafon) }}</div>
              <span class="text-white opacity-75 fs-7">5 Debitur portofolio aktif</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat 2: Total Claim Value -->
      <div class="col-xl-3 col-md-6">
        <div class="card card-flush h-xl-100 bg-danger">
          <div class="card-body d-flex flex-column justify-content-between pb-5">
            <div class="d-flex flex-stack mb-5">
              <span class="text-white fw-bold fs-6">Nominal Pengajuan Klaim</span>
              <KTIcon icon-name="file-sheet" icon-class="fs-1 text-white opacity-50" />
            </div>
            <div>
              <div class="fs-2hx fw-bold text-white mb-2">{{ formatCurrency(totalNilaiKlaim) }}</div>
              <span class="text-white opacity-75 fs-7">Total nominal klaim diajukan</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat 3: Total Approved -->
      <div class="col-xl-3 col-md-6">
        <div class="card card-flush h-xl-100 bg-success">
          <div class="card-body d-flex flex-column justify-content-between pb-5">
            <div class="d-flex flex-stack mb-5">
              <span class="text-white fw-bold fs-6">Realisasi Bayar Klaim</span>
              <KTIcon icon-name="wallet" icon-class="fs-1 text-white opacity-50" />
            </div>
            <div>
              <div class="fs-2hx fw-bold text-white mb-2">{{ formatCurrency(totalBayar) }}</div>
              <span class="text-white opacity-75 fs-7">TTE SK Sidang Komite selesai</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat 4: Pending actions -->
      <div class="col-xl-3 col-md-6">
        <div class="card card-flush h-xl-100 bg-warning">
          <div class="card-body d-flex flex-column justify-content-between pb-5">
            <div class="d-flex flex-stack mb-5">
              <span class="text-white fw-bold fs-6">Rasio Approval Sidang</span>
              <KTIcon icon-name="check-circle" icon-class="fs-1 text-white opacity-50" />
            </div>
            <div>
              <div class="fs-2hx fw-bold text-white mb-2">100%</div>
              <span class="text-white opacity-75 fs-7">Seluruh usulan TTE disetujui</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts & Active Claims List -->
    <div class="row g-5 mb-8">
      <!-- Left: Active Claims Table -->
      <div class="col-xxl-12">
        <div class="card card-flush h-md-100 shadow-sm">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label fw-bold fs-3 text-gray-900">
                {{ listTab === 'aktif' ? 'Pengajuan Aktif' : 'Riwayat Pengajuan' }}
              </span>
              <span class="text-muted mt-1 fw-semibold fs-7">
                {{ listTab === 'aktif' ? 'Status real-time berkas aktif' : 'Berkas yang sudah melewati tahap Anda' }}
              </span>
            </h3>
            <div class="card-toolbar gap-2">
              <div class="nav-group nav-group-outline border-primary">
                <button
                  type="button"
                  @click="listTab = 'aktif'"
                  :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-3 fw-bold', listTab === 'aktif' ? 'active' : '']"
                >
                  Pengajuan Aktif
                  <span v-if="activeClaims.length > 0" class="badge badge-xs fs-9 ms-1 badge-light-danger">{{ activeClaims.length }}</span>
                </button>
                <button
                  type="button"
                  @click="listTab = 'riwayat'"
                  :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-3 fw-bold', listTab === 'riwayat' ? 'active' : '']"
                >
                  Riwayat Pengajuan
                </button>
              </div>
              <router-link to="/pengajuan" class="btn btn-sm btn-light-primary fw-bold">Semua Berkas</router-link>
            </div>
          </div>

          <div class="card-body py-3">
            <div v-if="loading" class="text-center py-10">
              <span class="spinner-border text-primary" role="status"></span>
            </div>

            <div v-else-if="displayedClaims.length === 0" class="text-center py-10 border border-dashed rounded bg-light">
              <KTIcon icon-name="folder-check" icon-class="fs-2x text-gray-400 mb-2" />
              <p class="text-muted fs-7 mb-0">
                {{ listTab === 'aktif' ? 'Tidak ada berkas aktif saat ini.' : 'Belum ada riwayat berkas.' }}
              </p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                <thead>
                  <tr class="fw-bold text-muted bg-light">
                    <th class="ps-4 rounded-start">Kode Klaim</th>
                    <th>Debitur</th>
                    <th>Baki Debet</th>
                    <th>Proyeksi Klaim</th>
                    <th>Status</th>
                    <th class="text-end rounded-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="c in displayedClaims"
                    :key="c.id"
                    class="cursor-pointer hover-bg-light"
                    @click="openDetailModal(c)"
                  >
                    <td class="ps-4">
                      <span class="text-primary fw-bold fs-7 text-hover-underline">{{ c.kodeKlaim }}</span>
                    </td>
                    <td>
                      <span class="text-gray-900 fw-bold d-block fs-7">{{ c.sertifikatPenjaminan?.namaDebitur }}</span>
                      <span class="text-muted fs-8">{{ c.mitra?.namaMitra ? c.mitra.namaMitra.split(' (')[0] : '-' }}</span>
                    </td>
                    <td>
                      <span class="text-gray-700 fs-7">{{ formatCurrency(c.bakiDebetKlaim) }}</span>
                    </td>
                    <td>
                      <span class="text-primary fw-bold fs-7">{{ formatCurrency(c.nilaiKlaim) }}</span>
                    </td>
                    <td>
                      <span v-if="c.status?.kode === 'perbaikan' && (c.isResubmitted || c.is_resubmitted)" class="badge py-1 px-2 fs-8 fw-bold badge-light-primary text-primary border border-primary">
                        🔄 Perbaikan Diajukan Ulang
                      </span>
                      <span v-else-if="c.status?.kode === 'perbaikan'" class="badge py-1 px-2 fs-8 fw-bold badge-light-danger text-danger border border-danger border-dashed">
                        ⚠️ Perlu Perbaikan Data
                      </span>
                      <span v-else-if="c.status?.kode === 'disetujui' && c.disetujuiConfirmedByMitra" class="badge py-1 px-2 fs-8 fw-bold badge-light-success text-success border border-success">
                        ✅ Disetujui (Mitra Setuju)
                      </span>
                      <span v-else-if="c.status?.kode === 'disetujui'" class="badge py-1 px-2 fs-8 fw-bold badge-light-warning text-warning border border-warning border-dashed">
                        ⏳ Disetujui (Menunggu Respon Mitra)
                      </span>
                      <span v-else :class="`badge py-1 px-2 fs-8 fw-bold badge-light-${getStatusColor(c.status?.kode)}`">
                        {{ c.status?.nama }}
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      <button 
                        type="button" 
                        class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                        @click.stop="openDetailModal(c)"
                        title="Lihat Detail Berkas"
                      >
                        <KTIcon icon-name="eye" icon-class="fs-3 text-primary" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- DETAIL MODAL POPUP (Using Reusable UiModal) -->
    <UiModal
      :modelValue="!!selectedClaim"
      @update:modelValue="closeDetailModal"
      title="Detail Berkas Klaim"
      :subtitle="selectedClaim ? `Kode Klaim: ${selectedClaim.kodeKlaim}` : ''"
      icon="ki-solid ki-file-sheet"
      variant="primary"
      size="lg"
      :showDefaultFooter="false"
    >
      <div v-if="selectedClaim" class="text-start">
        <!-- Header Badges -->
        <div class="d-flex align-items-center justify-content-between mb-6 pb-4 border-bottom">
          <div>
            <span class="text-muted fs-7 d-block">Status Berkas Saat Ini:</span>
            <span v-if="selectedClaim.status?.kode === 'disetujui' && selectedClaim.disetujuiConfirmedByMitra" class="badge py-2 px-3 fs-7 fw-bold badge-light-success text-success border border-success">
              ✅ Disetujui (Mitra Setuju)
            </span>
            <span v-else-if="selectedClaim.status?.kode === 'disetujui'" class="badge py-2 px-3 fs-7 fw-bold badge-light-warning text-warning border border-warning border-dashed">
              ⏳ Disetujui (Menunggu Respon Mitra)
            </span>
            <span v-else :class="`badge py-2 px-3 fs-7 fw-bold badge-light-${getStatusColor(selectedClaim.status?.kode)}`">
              {{ selectedClaim.status?.nama || 'Status Tidak Diketahui' }}
            </span>
          </div>
          <div class="text-end">
            <span class="text-muted fs-7 d-block">Tanggal Pengajuan:</span>
            <span class="fw-bold text-gray-800 fs-7">{{ formatDate(selectedClaim.tanggalPengajuan) }}</span>
          </div>
        </div>

        <!-- Detail Grid -->
        <div class="row g-6 mb-6">
          <!-- Left Column: Debitur & SP Info -->
          <div class="col-md-6 border-end">
            <h5 class="fw-bold text-gray-800 mb-4 pb-2 border-bottom">Informasi Debitur & Sertifikat</h5>
            
            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Nama Debitur</span>
              <span class="fw-bold text-gray-900 fs-6">{{ selectedClaim.sertifikatPenjaminan?.namaDebitur || '-' }}</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Nomor Sertifikat Penjaminan (SP)</span>
              <span class="fw-bold text-primary fs-7">{{ selectedClaim.sertifikatPenjaminan?.nomorSp || '-' }}</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Mitra Bank / BPR</span>
              <span class="fw-bold text-gray-800 fs-7">{{ selectedClaim.mitra?.namaMitra || '-' }}</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Cabang Rekanan</span>
              <span class="fw-bold text-gray-800 fs-7">{{ selectedClaim.sertifikatPenjaminan?.cabangMitra || '-' }}</span>
            </div>
          </div>

          <!-- Right Column: Financial Info -->
          <div class="col-md-6">
            <h5 class="fw-bold text-gray-800 mb-4 pb-2 border-bottom">Informasi Keuangan Klaim</h5>
            
            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Plafond Kredit Awal</span>
              <span class="fw-bold text-gray-800 fs-6">{{ formatCurrency(selectedClaim.sertifikatPenjaminan?.plafonKredit) }}</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Baki Debet Macet Terlapor</span>
              <span class="fw-bold text-danger fs-6">{{ formatCurrency(selectedClaim.bakiDebetKlaim) }}</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Tingkat Penutupan (Cover Snapshot)</span>
              <span class="fw-bold text-gray-800 fs-7">{{ selectedClaim.coverPercentageSnapshot * 100 }}% Penjaminan</span>
            </div>

            <div class="mb-4">
              <span class="text-muted fs-8 d-block">Nilai Tuntutan Klaim</span>
              <span class="fw-bold text-primary fs-5">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</span>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-6">
          <button type="button" class="btn btn-light btn-sm" @click="closeDetailModal">Tutup</button>
          <button type="button" class="btn btn-primary btn-sm" @click="navigateToModule(selectedClaim)">
            <KTIcon icon-name="external-drive" icon-class="fs-3 me-1" />
            Buka Modul Berkas
          </button>
        </div>
      </div>
    </UiModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import ApiService from "@/core/services/ApiService";
import { useAuthStore } from "@/stores/auth";
import UiModal from "@/components/ui/UiModal.vue";

// Aturan Aktif/Riwayat berlaku sama untuk semua role: begitu klaim sudah dibayar
// (dibayar/selesai/ditolak = tuntas), masuk Riwayat. Sebelum itu, semua tahap proses
// (diajukan s.d. memo) masih dianggap Pengajuan Aktif.
const HISTORY_STATUSES = ["dibayar", "selesai", "ditolak"];

export default defineComponent({
  name: "dashboard-main",
  components: {
    UiModal
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(true);
    const recentClaims = ref<any[]>([]);
    const activeClaims = ref<any[]>([]);
    const historyClaims = ref<any[]>([]);
    const listTab = ref<"aktif" | "riwayat">("aktif");
    const selectedClaim = ref<any | null>(null);

    const displayedClaims = computed(() =>
      listTab.value === "aktif" ? activeClaims.value : historyClaims.value
    );

    const totalPlafon = ref(755000000); // Seeding stats values
    const totalNilaiKlaim = ref(88000000);
    const totalBayar = ref(0);

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        const res = await ApiService.get("klaims?perPage=50");
        const allClaims = res.data.data || [];

        // Aturan sama untuk semua role: sudah dibayar/selesai/ditolak = Riwayat,
        // selain itu (masih berproses) = Pengajuan Aktif.
        historyClaims.value = allClaims.filter((c: any) => HISTORY_STATUSES.includes(c.status?.kode));
        activeClaims.value = allClaims.filter((c: any) => !HISTORY_STATUSES.includes(c.status?.kode));

        recentClaims.value = activeClaims.value.slice(0, 10);

        // Calculate totals dynamically based on mock DB
        let claimTotal = 0;
        let payTotal = 0;

        allClaims.forEach((k: any) => {
          claimTotal += k.nilaiKlaim;
          if (k.status?.kode === "dibayar" || k.status?.kode === "selesai") {
            payTotal += k.nilaiKlaim;
          }
        });

        totalNilaiKlaim.value = claimTotal;
        totalBayar.value = payTotal;

      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
      } finally {
        loading.value = false;
      }
    };

    const openDetailModal = (claim: any) => {
      selectedClaim.value = claim;
    };

    const closeDetailModal = () => {
      selectedClaim.value = null;
    };

    // Tentukan halaman modul yang tepat berdasarkan tahap status klaim saat ini,
    // supaya tombol "Buka Modul Berkas" mengarah ke halaman yang benar-benar bisa diakses
    // oleh role yang sedang login (bukan selalu ke /verifikasi).
    const STATUS_TO_ROUTE: Record<string, string> = {
      draft: "/pengajuan",
      diajukan: "/verifikasi",
      verifikasi: "/verifikasi",
      perbaikan: "/verifikasi",
      assessment: "/verifikasi",
      survei: "/verifikasi",
      komite: "/komite",
      banding: "/komite",
      disetujui: "/pembayaran",
      memo: "/pembayaran",
      dibayar: "/pembayaran",
      selesai: "/pembayaran",
      ditolak: "/komite",
    };

    const navigateToModule = (claim: any) => {
      const claimId = claim?.id;
      const statusKode = claim?.status?.kode;
      const targetPath = STATUS_TO_ROUTE[statusKode] || "/verifikasi";
      selectedClaim.value = null;
      router.push({ path: targetPath, query: { claimId: String(claimId) } });
    };

    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "Rp 0";
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
    };

    const getStatusColor = (code: string) => {
      const colors: Record<string, string> = {
        draft: "secondary",
        diajukan: "info",
        verifikasi: "warning",
        perbaikan: "danger",
        assessment: "primary",
        survei: "info",
        komite: "danger",
        disetujui: "success",
        ditolak: "danger",
        banding: "warning",
        memo: "success",
        dibayar: "success",
        selesai: "success"
      };
      return colors[code] || "secondary";
    };

    const formatDate = (val: string) => {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return {
      loading,
      recentClaims,
      activeClaims,
      historyClaims,
      listTab,
      displayedClaims,
      selectedClaim,
      totalPlafon,
      totalNilaiKlaim,
      totalBayar,
      openDetailModal,
      closeDetailModal,
      navigateToModule,
      formatCurrency,
      getStatusColor,
      formatDate
    };
  }
});
</script>
