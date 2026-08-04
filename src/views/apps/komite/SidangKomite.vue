<template>
  <div>
    <!-- Info Banner for Current User Role -->
    <div class="alert alert-dismissible bg-light-primary border-primary border-dashed d-flex flex-column flex-sm-row p-5 mb-8 no-print" v-if="activePejabat">
      <KTIcon icon-name="profile-circle" icon-class="fs-2hx text-primary me-4 mb-5 mb-sm-0" />
      <div class="d-flex flex-column pe-0 pe-sm-10">
        <h5 class="fw-bold">Mode Pejabat Komite Aktif</h5>
        <span>
          Anda masuk sebagai <strong>{{ activePejabat.nama }}</strong> ({{ activePejabat.jabatan }}). Anda memiliki otorisasi untuk menandatangani berkas Sidang Komite.
        </span>
      </div>
    </div>
    <div class="alert alert-dismissible bg-light-danger border-danger border-dashed d-flex flex-column flex-sm-row p-5 mb-8 no-print" v-else>
      <KTIcon icon-name="information-5" icon-class="fs-2hx text-danger me-4 mb-5 mb-sm-0" />
      <div class="d-flex flex-column pe-0 pe-sm-10">
        <h5 class="fw-bold text-danger">Bukan Akun Pejabat Komite</h5>
        <span>
          Akun Anda saat ini ({{ currentUser?.name }}) tidak terdaftar sebagai anggota Komite. Anda hanya dapat memantau berkas sidang, tombol tanda tangan dinonaktifkan.
          <strong>Untuk mencoba alur E-sign:</strong> Silakan logout dan masuk sebagai salah satu Pejabat Komite (Ketua/Anggota).
        </span>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="row g-9">
      <!-- Left Column: List of Sidang Claims -->
      <div class="col-lg-5 no-print" v-if="viewMode === 'list'">
        <div class="card card-flush shadow-sm">
          <div class="card-header border-0 pt-6">
            <h3 class="card-title fw-bold text-gray-900">
              {{ listTab === 'aktif' ? 'Berkas Sidang Aktif' : 'Riwayat Keputusan Komite' }}
            </h3>
            <div class="card-toolbar">
              <div class="nav-group nav-group-outline border-primary">
                <button
                  type="button"
                  @click="switchListTab('aktif')"
                  :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-3 fw-bold', listTab === 'aktif' ? 'active' : '']"
                >
                  Aktif
                  <span v-if="claims.length > 0" class="badge badge-xs fs-9 ms-1 badge-light-danger">{{ claims.length }}</span>
                </button>
                <button
                  type="button"
                  @click="switchListTab('riwayat')"
                  :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-3 fw-bold', listTab === 'riwayat' ? 'active' : '']"
                >
                  Riwayat
                </button>
              </div>
            </div>
          </div>
          <div class="card-body pt-0">
            <div v-if="listTab === 'aktif'">
              <div v-if="loading" class="text-center py-10">
                <span class="spinner-border text-primary" role="status"></span>
              </div>
              <div v-else-if="claims.length === 0" class="text-center py-10 border border-dashed rounded bg-light">
                <KTIcon icon-name="folder-check" icon-class="fs-2x text-gray-400 mb-2" />
                <p class="text-muted fs-7 mb-0">Tidak ada berkas yang memerlukan tanda tangan komite.</p>
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div
                  v-for="c in claims"
                  :key="c.id"
                  :class="['card border p-4 cursor-pointer hover-elevate-up', selectedClaimId === c.id ? 'bg-light-primary border-primary border-dashed' : 'bg-white']"
                  @click="selectClaim(c.id)"
                >
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-gray-900">{{ c.kodeKlaim }}</span>
                    <span class="badge badge-light-danger py-1 px-2 fs-9">Menunggu TTE</span>
                  </div>
                  <div class="fs-7 text-gray-700 fw-bold mb-1">{{ c.sertifikatPenjaminan?.namaDebitur }}</div>
                  <div class="d-flex justify-content-between text-muted fs-8">
                    <span>{{ c.mitra?.namaMitra.split(' (')[0] }}</span>
                    <span class="text-primary fw-bold">{{ formatCurrency(c.nilaiKlaim) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="loadingHistory" class="text-center py-10">
                <span class="spinner-border text-primary" role="status"></span>
              </div>
              <div v-else-if="historyClaims.length === 0" class="text-center py-10 border border-dashed rounded bg-light">
                <KTIcon icon-name="archive" icon-class="fs-2x text-gray-400 mb-2" />
                <p class="text-muted fs-7 mb-0">Belum ada keputusan komite yang selesai.</p>
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div
                  v-for="c in historyClaims"
                  :key="c.id"
                  :class="['card border p-4 cursor-pointer hover-elevate-up', selectedClaimId === c.id ? 'bg-light-primary border-primary border-dashed' : 'bg-white']"
                  @click="selectClaim(c.id)"
                >
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-gray-900">{{ c.kodeKlaim }}</span>
                    <div class="d-flex align-items-center gap-2">
                      <span v-if="c.status?.kode === 'disetujui' && c.disetujuiConfirmedByMitra" class="badge py-1 px-2 fs-9 badge-light-success text-success border border-success">✅ Disetujui (Mitra Setuju)</span>
                      <span v-else-if="c.status?.kode === 'disetujui'" class="badge py-1 px-2 fs-9 badge-light-warning text-warning border border-warning border-dashed">⏳ Menunggu Respon Mitra</span>
                      <span v-else :class="`badge py-1 px-2 fs-9 badge-light-${getStatusColor(c.status?.kode)}`">{{ c.status?.nama }}</span>
                      <button
                        type="button"
                        @click.stop="openDocumentTab(c.id)"
                        class="btn btn-icon btn-xs btn-light-primary"
                        title="Lihat dokumen di tab baru"
                      >
                        <KTIcon icon-name="file-sheet" icon-class="fs-5" />
                      </button>
                    </div>
                  </div>
                  <div class="fs-7 text-gray-700 fw-bold mb-1">{{ c.sertifikatPenjaminan?.namaDebitur }}</div>
                  <div class="d-flex justify-content-between text-muted fs-8">
                    <span>{{ c.suratKeputusan?.nomorSk || c.beritaAcara?.nomorBa || '-' }}</span>
                    <span class="text-primary fw-bold">{{ formatCurrency(c.nilaiKlaim) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Document Details & Esign Sheet -->
      <div :class="[viewMode === 'list' ? 'col-lg-7' : 'col-12']">
        <div v-if="loadingDetail" class="card card-flush shadow-sm p-15 text-center">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat dokumen...</span>
        </div>

        <div v-else-if="!selectedClaim" class="card card-flush shadow-sm p-15 text-center bg-light">
          <KTIcon icon-name="document" icon-class="fs-3x text-gray-400 mb-3" />
          <h4 class="fw-bold text-gray-800">Lembar Sidang Komite</h4>
          <p class="text-gray-500 fs-7">Pilih salah satu berkas sidang aktif di sebelah kiri untuk meninjau dokumen Berita Acara / Surat Keputusan dan menandatanganinya.</p>
        </div>

        <div v-else class="d-flex flex-column gap-8">
          <!-- Toolbar (disembunyikan saat cetak/PDF) -->
          <div class="d-flex justify-content-between align-items-center no-print">
            <span class="text-muted fs-7">
              <KTIcon icon-name="file-sheet" icon-class="fs-4 me-1" />
              {{ docTitle }} — Nomor: {{ docNumber }}
            </span>
            <button type="button" @click="openDocumentTab(selectedClaim.id)" class="btn btn-sm btn-light-primary fw-bold">
              <KTIcon icon-name="file-down" icon-class="fs-4 me-1" />
              Unduh / Cetak PDF
            </button>
          </div>

          <!-- Document Mockup (Premium Visual) -->
          <div id="printable-doc" class="card shadow-sm border border-gray-300 bg-white">
            <div class="card-body p-10 p-lg-15">
              <!-- Print header logo mockup -->
              <div class="text-center border-bottom border-gray-400 pb-5 mb-8">
                <h2 class="fw-bold text-gray-900 mb-1">PT JAMKRIDA JABAR</h2>
                <h5 class="text-muted mb-0">PERSEROAN DAERAH PENJAMINAN KREDIT JAWA BARAT</h5>
                <span class="fs-9 text-muted">Jl. Lodaya No. 44, Bandung • Telp: (022) 730-7300</span>
              </div>

              <!-- Document Title -->
              <div class="text-center mb-8">
                <h3 class="fw-bold text-gray-900 text-uppercase mb-2">
                  {{ docTitle }}
                </h3>
                <span class="fw-bold fs-7 text-gray-700">Nomor: {{ docNumber }}</span>
              </div>

              <!-- Document Body text -->
              <div class="fs-7 text-gray-800 mb-8" style="line-height: 1.6">
                <!-- BERITA ACARA: narasi hasil sidang -->
                <template v-if="!selectedClaim.suratKeputusan">
                  <p>
                    Pada hari ini, <strong>{{ getDayName() }}</strong> tanggal <strong>{{ getCurrentDateText() }}</strong>, Komite Klaim PT Jamkrida Jabar telah mengadakan sidang evaluasi atas berkas pengajuan klaim penjaminan yang diajukan oleh mitra penerima jaminan dengan rincian data sebagai berikut:
                  </p>

                  <table class="table table-bordered border-gray-400 my-6 fs-7 align-middle">
                    <tbody>
                      <tr><td class="fw-bold bg-light w-150px">Kode Klaim</td><td class="fw-bold">{{ selectedClaim.kodeKlaim }}</td></tr>
                      <tr><td class="fw-bold bg-light">Nama Debitur</td><td>{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</td></tr>
                      <tr><td class="fw-bold bg-light">Nomor SP</td><td>{{ selectedClaim.sertifikatPenjaminan?.nomorSp }}</td></tr>
                      <tr><td class="fw-bold bg-light">Mitra Pengaju</td><td>{{ selectedClaim.mitra?.namaMitra }}</td></tr>
                      <tr><td class="fw-bold bg-light">Baki Debet Klaim</td><td class="text-danger fw-bold">{{ formatCurrency(selectedClaim.bakiDebetKlaim) }}</td></tr>
                      <tr><td class="fw-bold bg-light">Nilai Jaminan (Cover)</td><td>{{ selectedClaim.coverPercentageSnapshot * 100 }}% cover dari produk {{ selectedClaim.sertifikatPenjaminan?.produk?.nama }}</td></tr>
                      <tr><td class="fw-bold bg-light text-primary">REKOMENDASI KLAIM</td><td class="text-primary fw-bold fs-6">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</td></tr>
                      <tr><td class="fw-bold bg-light">Penyebab Macet</td><td>{{ selectedClaim.penyebabKlaim?.namaPenyebab }}</td></tr>
                    </tbody>
                  </table>

                  <p>
                    Berdasarkan hasil verifikasi dokumen penunjang dan laporan evaluasi kelayakan risiko, Komite mengambil keputusan terhadap permohonan klaim tersebut di atas dengan membubuhkan tanda tangan elektronik (E-sign) sah di bawah ini.
                  </p>
                </template>

                <!-- SURAT KEPUTUSAN: struktur Menimbang - Mengingat - Memutuskan -->
                <template v-else>
                  <p class="fw-bold mb-1">Menimbang:</p>
                  <p class="ps-6 mb-1">a. bahwa berdasarkan Berita Acara Sidang Komite Nomor <strong>{{ selectedClaim.beritaAcara?.nomorBa }}</strong> tanggal {{ formatDate(selectedClaim.beritaAcara?.tanggalBa) }}, permohonan klaim penjaminan atas nama Debitur <strong>{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</strong> telah dievaluasi dan dinyatakan memenuhi syarat untuk disetujui pembayarannya;</p>
                  <p class="ps-6 mb-4">b. bahwa untuk memberikan kepastian hukum atas persetujuan tersebut, perlu ditetapkan Surat Keputusan Komite Klaim.</p>

                  <p class="fw-bold mb-1">Mengingat:</p>
                  <p class="ps-6 mb-4">
                    1. Anggaran Dasar PT Jamkrida Jabar (Perseroda);<br />
                    2. Peraturan Otoritas Jasa Keuangan tentang Penyelenggaraan Usaha Perusahaan Penjaminan;<br />
                    3. Perjanjian Kerja Sama Penjaminan Kredit antara PT Jamkrida Jabar dengan Mitra Penerima Jaminan;<br />
                    4. Berita Acara Sidang Komite Nomor {{ selectedClaim.beritaAcara?.nomorBa }}.
                  </p>

                  <table class="table table-bordered border-gray-400 my-6 fs-7 align-middle">
                    <tbody>
                      <tr><td class="fw-bold bg-light w-150px">Kode Klaim</td><td class="fw-bold">{{ selectedClaim.kodeKlaim }}</td></tr>
                      <tr><td class="fw-bold bg-light">Nama Debitur</td><td>{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</td></tr>
                      <tr><td class="fw-bold bg-light">Nomor SP</td><td>{{ selectedClaim.sertifikatPenjaminan?.nomorSp }}</td></tr>
                      <tr><td class="fw-bold bg-light">Mitra Pengaju</td><td>{{ selectedClaim.mitra?.namaMitra }}</td></tr>
                      <tr><td class="fw-bold bg-light text-primary">NILAI KLAIM DISETUJUI</td><td class="text-primary fw-bold fs-6">{{ formatCurrency(selectedClaim.suratKeputusan?.nilaiDisetujui || selectedClaim.nilaiKlaim) }}</td></tr>
                    </tbody>
                  </table>

                  <p class="fw-bold text-center my-6">MEMUTUSKAN:</p>
                  <table class="table table-borderless fs-7 mb-6">
                    <tbody>
                      <tr>
                        <td class="fw-bold align-top w-100px">KESATU</td>
                        <td>: Menyetujui pembayaran Klaim (Ganti Rugi) Penjaminan Kredit kepada <strong>{{ selectedClaim.mitra?.namaMitra }}</strong> atas nama Debitur <strong>{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</strong> (No. SP {{ selectedClaim.sertifikatPenjaminan?.nomorSp }}) sebesar <strong>{{ formatCurrency(selectedClaim.suratKeputusan?.nilaiDisetujui || selectedClaim.nilaiKlaim) }}</strong>.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold align-top">KEDUA</td>
                        <td>: Pembayaran klaim sebagaimana dimaksud pada diktum KESATU dilaksanakan sesuai ketentuan yang berlaku, selambat-lambatnya 15 (lima belas) hari kerja sejak Surat Keputusan ini ditetapkan.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold align-top">KETIGA</td>
                        <td>: Surat Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan akan diadakan perbaikan sebagaimana mestinya apabila di kemudian hari terdapat kekeliruan dalam penetapan ini.</td>
                      </tr>
                    </tbody>
                  </table>

                  <p>
                    Ditetapkan di Bandung, pada tanggal <strong>{{ getCurrentDateText() }}</strong>, dan disahkan dengan pembubuhan tanda tangan elektronik (E-sign) oleh Komite Klaim sebagaimana berikut:
                  </p>
                </template>
              </div>

              <!-- Signatures Row (3 blocks) -->
              <div class="row g-4 mt-15 text-center">
                <div class="col-4" v-for="sig in selectedClaim.esignSignatures" :key="sig.id">
                  <div class="d-flex flex-column align-items-center">
                    <span class="fs-8 text-muted fw-semibold mb-1">{{ sig.pejabatKomite?.jabatan }}</span>
                    
                    <!-- Signature Status Box -->
                    <div class="border rounded p-3 my-2 w-100 bg-light d-flex flex-column align-items-center justify-content-center" style="min-height: 100px;">
                      <!-- SIGNED STATE (QR Code ala tanda tangan elektronik tersertifikasi) -->
                      <div v-if="sig.status === 'signed'" class="text-success text-center w-100">
                        <img :src="qrCodeUrl(sig)" :alt="`QR Verifikasi TTE ${sig.pejabatKomite?.nama}`" width="72" height="72" class="mb-1" />
                        <span class="d-flex align-items-center justify-content-center gap-1 fs-9 fw-bold">
                          <KTIcon icon-name="verify" icon-class="fs-6 text-success" />
                          E-SIGNED SECURE
                        </span>
                        <span class="d-block text-muted" style="font-size: 8px;">{{ formatDate(sig.signedAt) }}</span>
                      </div>
                      
                      <!-- REJECTED STATE -->
                      <div v-else-if="sig.status === 'rejected'" class="text-danger text-center">
                        <KTIcon icon-name="cross-circle" icon-class="fs-2x text-danger mb-1" />
                        <span class="d-block fs-9 fw-bold">REJECTED / DITOLAK</span>
                        <span class="d-block text-muted" style="font-size: 8px;">{{ formatDate(sig.signedAt) }}</span>
                      </div>
                      
                      <!-- PENDING STATE (ACTIONABLE) -->
                      <div v-else class="w-100">
                        <div v-if="canActionSig(sig)" class="d-flex flex-column gap-2">
                          <button @click="executeEsign(sig.id, 'sign')" class="btn btn-xs btn-success py-1 fw-bold w-100">
                            Setujui & TTE
                          </button>
                          <button @click="executeEsign(sig.id, 'reject')" class="btn btn-xs btn-danger py-1 fw-bold w-100">
                            Tolak
                          </button>
                        </div>
                        <span class="text-muted fs-8" v-else>Menunggu TTE</span>
                      </div>
                    </div>

                    <span class="fw-bold text-gray-900 fs-7 decoration-underline">{{ sig.pejabatKomite?.nama }}</span>
                    <span class="text-muted fs-9">NIP. JAMK-20260{{ sig.pejabatKomite?.id }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ApiService from "@/core/services/ApiService";
import { useAuthStore } from "@/stores/auth";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "sidang-komite",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const viewMode = ref<"list" | "detail">("list");
    const loading = ref(false);
    const loadingDetail = ref(false);

    const authStore = useAuthStore();
    const claims = ref<any[]>([]);
    const historyClaims = ref<any[]>([]);
    const loadingHistory = ref(false);
    const listTab = ref<"aktif" | "riwayat">("aktif");
    const historyLoaded = ref(false);

    const selectedClaimId = ref<number | null>(null);
    const selectedClaim = ref<any>(null);

    const currentUser = computed(() => authStore.user);
    
    // Check if current user maps to a committee official
    const activePejabat = computed(() => {
      const u = currentUser.value;
      if (u && u.role?.kode === "komite" && u.pejabatKomiteId) {
        return u.role.modulePermissions ? { id: u.pejabatKomiteId, nama: u.name, jabatan: u.pejabatKomiteId === 1 ? "Ketua Komite Klaim" : "Anggota Komite Klaim" } : null;
      }
      return null;
    });

    const HISTORY_STATUS_KODES = ["disetujui", "memo", "dibayar", "selesai", "ditolak"];

    const fetchClaims = async () => {
      loading.value = true;
      try {
        // Sidang komite is active for claims in status 'komite'
        const res = await ApiService.get("klaims?statusGroup=proses");
        claims.value = res.data.data.filter((k: any) => k.status?.kode === "komite");
      } catch (err) {
        console.error("Gagal mengambil antrean sidang:", err);
      } finally {
        loading.value = false;
      }
    };

    const fetchHistory = async () => {
      loadingHistory.value = true;
      try {
        // Ambil berkas yang sudah melewati tahap Sidang Komite (BA sudah diterbitkan)
        const res = await ApiService.get("klaims?perPage=100");
        historyClaims.value = res.data.data.filter(
          (k: any) => HISTORY_STATUS_KODES.includes(k.status?.kode) && k.beritaAcara
        );
        historyLoaded.value = true;
      } catch (err) {
        console.error("Gagal mengambil riwayat komite:", err);
      } finally {
        loadingHistory.value = false;
      }
    };

    const switchListTab = (tab: "aktif" | "riwayat") => {
      listTab.value = tab;
      if (tab === "riwayat" && !historyLoaded.value) {
        fetchHistory();
      }
    };

    const initPage = async () => {
      await Promise.all([fetchClaims(), fetchHistory()]);

      // Jika datang dari link luar (mis. Dashboard) dengan claimId spesifik, pilih berkas itu
      const targetId = route.query.claimId ? Number(route.query.claimId) : null;
      if (targetId && claims.value.some((c: any) => c.id === targetId)) {
        listTab.value = "aktif";
        selectClaim(targetId);
      } else if (targetId && historyClaims.value.some((c: any) => c.id === targetId)) {
        listTab.value = "riwayat";
        selectClaim(targetId);
      } else if (claims.value.length > 0 && !selectedClaimId.value) {
        // Auto-select first active claim if list is not empty
        selectClaim(claims.value[0].id);
      }
    };

    const selectClaim = async (id: number) => {
      selectedClaimId.value = id;
      loadingDetail.value = true;
      try {
        const res = await ApiService.get(`klaims/${id}`);
        selectedClaim.value = res.data.data;
      } catch (err) {
        console.error("Gagal mengambil detail klaim:", err);
      } finally {
        loadingDetail.value = false;
      }
    };

    const canActionSig = (sig: any) => {
      // Must be logged in as the specific official and the signature status is pending
      const pj = activePejabat.value;
      return pj && sig.pejabatKomiteId === pj.id && sig.status === "pending";
    };

    const executeEsign = (sigId: number, action: "sign" | "reject") => {
      const docName = selectedClaim.value.suratKeputusan ? "Surat Keputusan (SK)" : "Berita Acara (BA)";
      
      const title = action === "sign" 
        ? `Tandatangani ${docName}?` 
        : `Tolak ${docName}?`;
        
      const text = action === "sign"
        ? "Tindakan ini akan membubuhkan tanda tangan elektronik resmi Anda pada berkas."
        : "PERHATIAN: Menolak dokumen ini akan langsung membatalkan proses klaim dan berkas ditolak secara final!";

      Swal.fire({
        title,
        text,
        icon: action === "sign" ? "success" : "warning",
        showCancelButton: true,
        confirmButtonText: action === "sign" ? "Ya, Tandatangani!" : "Ya, Tolak Klaim!",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: action === "sign" ? "btn btn-success" : "btn btn-danger",
          cancelButton: "btn btn-light"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          loadingDetail.value = true;
          try {
            await ApiService.post(`klaims/${selectedClaim.value.id}/esign`, {
              esignSignatureId: sigId,
              action
            });

            Swal.fire({
              text: action === "sign" 
                ? "Tanda tangan digital berhasil disematkan!"
                : "Dokumen ditolak. Proses klaim dihentikan.",
              icon: "success",
              confirmButtonText: "Selesai",
              customClass: { confirmButton: "btn btn-primary" }
            });

            // Reload data (aktif + riwayat, karena berkas mungkin baru pindah ke riwayat)
            selectedClaimId.value = null;
            selectedClaim.value = null;
            await Promise.all([fetchClaims(), fetchHistory()]);
          } catch (err: any) {
            Swal.fire({
              text: err.response?.data?.message || "Terjadi kesalahan.",
              icon: "error"
            });
            loadingDetail.value = false;
          }
        }
      });
    };

    // Document styling helpers
    const docTitle = computed(() => {
      if (!selectedClaim.value) return "";
      return selectedClaim.value.suratKeputusan 
        ? "SURAT KEPUTUSAN KELAYAKAN KLAIM" 
        : "BERITA ACARA SIDANG EVALUASI KLAIM";
    });

    const docNumber = computed(() => {
      if (!selectedClaim.value) return "";
      return selectedClaim.value.suratKeputusan 
        ? selectedClaim.value.suratKeputusan.nomorSk 
        : selectedClaim.value.beritaAcara?.nomorBa;
    });

    // Formatting utilities
    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "Rp 0";
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (val: string) => {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", { 
        day: "numeric", 
        month: "long", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }) + " WIB";
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

    // Mock Date display helpers for PDF feel
    const getDayName = () => {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      return days[new Date().getDay()];
    };

    const getCurrentDateText = () => {
      const date = new Date();
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const printDocument = () => {
      window.print();
    };

    // Buka dokumen BA/SK di tab baru (halaman cetak tersendiri, tanpa sidebar aplikasi)
    const openDocumentTab = (claimId: number) => {
      const url = router.resolve({ name: "komite-cetak", params: { id: claimId } }).href;
      window.open(url, "_blank");
    };

    // Bangun QR Code verifikasi tanda tangan elektronik.
    // Mengkodekan nomor dokumen, identitas penandatangan, dan waktu TTE
    // sebagai kode verifikasi keaslian (dapat dipindai untuk cross-check).
    const qrCodeUrl = (sig: any) => {
      const payload = [
        `DOK:${docNumber.value}`,
        `PENANDATANGAN:${sig.pejabatKomite?.nama || '-'}`,
        `JABATAN:${sig.pejabatKomite?.jabatan || '-'}`,
        `NIP:${sig.pejabatKomite?.nip || '-'}`,
        `KLAIM:${selectedClaim.value?.kodeKlaim || '-'}`,
        `WAKTU:${sig.signedAt || '-'}`,
      ].join(" | ");

      return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(payload)}`;
    };

    onMounted(() => {
      initPage();
    });

    return {
      viewMode,
      loading,
      loadingDetail,
      claims,
      historyClaims,
      loadingHistory,
      listTab,
      switchListTab,
      selectedClaimId,
      selectedClaim,
      currentUser,
      activePejabat,
      docTitle,
      docNumber,
      selectClaim,
      canActionSig,
      executeEsign,
      formatCurrency,
      formatDate,
      getStatusColor,
      getDayName,
      getCurrentDateText,
      printDocument,
      qrCodeUrl,
      openDocumentTab,
      fetchClaims
    };
  }
});
</script>

<style scoped>
.hover-elevate-up:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}
.decoration-underline {
  text-decoration: underline;
}
</style>

<style>
/* Cetak/Unduh PDF: hanya tampilkan kartu dokumen (#printable-doc), sembunyikan sisanya */
@media print {
  #kt_aside,
  #kt_header,
  #kt_toolbar_container,
  .no-print {
    display: none !important;
  }

  #kt_app_root,
  #kt_content,
  .app-main,
  .app-content {
    margin: 0 !important;
    padding: 0 !important;
  }

  #printable-doc {
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
