<template>
  <div class="min-vh-100 bg-secondary bg-opacity-10 py-10">
    <div class="container" style="max-width: 900px;">
      <!-- Toolbar (disembunyikan saat cetak/PDF) -->
      <div class="d-flex justify-content-between align-items-center mb-5 no-print">
        <span class="text-muted fs-7" v-if="claim">
          <KTIcon icon-name="file-sheet" icon-class="fs-4 me-1" />
          {{ docTitle }} — Nomor: {{ docNumber }}
        </span>
        <span v-else></span>
        <button type="button" @click="printDocument" class="btn btn-sm btn-light-primary fw-bold">
          <KTIcon icon-name="file-down" icon-class="fs-4 me-1" />
          Unduh / Cetak PDF
        </button>
      </div>

      <div v-if="loading" class="card card-flush shadow-sm p-15 text-center">
        <span class="spinner-border text-primary" role="status"></span>
        <span class="text-gray-500 d-block mt-2">Memuat dokumen...</span>
      </div>

      <div v-else-if="!claim" class="card card-flush shadow-sm p-15 text-center bg-light">
        <KTIcon icon-name="document" icon-class="fs-3x text-gray-400 mb-3" />
        <h4 class="fw-bold text-gray-800">Berkas Tidak Ditemukan</h4>
        <p class="text-gray-500 fs-7">Klaim yang Anda cari tidak tersedia atau belum melalui Sidang Komite.</p>
      </div>

      <!-- Document Mockup (Premium Visual) -->
      <div v-else id="printable-doc" class="card shadow-sm border border-gray-300 bg-white">
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
            <template v-if="!claim.suratKeputusan">
              <p>
                Pada hari ini, <strong>{{ getDayName() }}</strong> tanggal <strong>{{ getCurrentDateText() }}</strong>, Komite Klaim PT Jamkrida Jabar telah mengadakan sidang evaluasi atas berkas pengajuan klaim penjaminan yang diajukan oleh mitra penerima jaminan dengan rincian data sebagai berikut:
              </p>

              <table class="table table-bordered border-gray-400 my-6 fs-7 align-middle">
                <tbody>
                  <tr><td class="fw-bold bg-light w-150px">Kode Klaim</td><td class="fw-bold">{{ claim.kodeKlaim }}</td></tr>
                  <tr><td class="fw-bold bg-light">Nama Debitur</td><td>{{ claim.sertifikatPenjaminan?.namaDebitur }}</td></tr>
                  <tr><td class="fw-bold bg-light">Nomor SP</td><td>{{ claim.sertifikatPenjaminan?.nomorSp }}</td></tr>
                  <tr><td class="fw-bold bg-light">Mitra Pengaju</td><td>{{ claim.mitra?.namaMitra }}</td></tr>
                  <tr><td class="fw-bold bg-light">Baki Debet Klaim</td><td class="text-danger fw-bold">{{ formatCurrency(claim.bakiDebetKlaim) }}</td></tr>
                  <tr><td class="fw-bold bg-light">Nilai Jaminan (Cover)</td><td>{{ claim.coverPercentageSnapshot * 100 }}% cover dari produk {{ claim.sertifikatPenjaminan?.produk?.nama }}</td></tr>
                  <tr><td class="fw-bold bg-light text-primary">REKOMENDASI KLAIM</td><td class="text-primary fw-bold fs-6">{{ formatCurrency(claim.nilaiKlaim) }}</td></tr>
                  <tr><td class="fw-bold bg-light">Penyebab Macet</td><td>{{ claim.penyebabKlaim?.namaPenyebab }}</td></tr>
                </tbody>
              </table>

              <p>
                Berdasarkan hasil verifikasi dokumen penunjang dan laporan evaluasi kelayakan risiko, Komite mengambil keputusan terhadap permohonan klaim tersebut di atas dengan membubuhkan tanda tangan elektronik (E-sign) sah di bawah ini.
              </p>
            </template>

            <!-- SURAT KEPUTUSAN: struktur Menimbang - Mengingat - Memutuskan -->
            <template v-else>
              <p class="fw-bold mb-1">Menimbang:</p>
              <p class="ps-6 mb-1">a. bahwa berdasarkan Berita Acara Sidang Komite Nomor <strong>{{ claim.beritaAcara?.nomorBa }}</strong> tanggal {{ formatDate(claim.beritaAcara?.tanggalBa) }}, permohonan klaim penjaminan atas nama Debitur <strong>{{ claim.sertifikatPenjaminan?.namaDebitur }}</strong> telah dievaluasi dan dinyatakan memenuhi syarat untuk disetujui pembayarannya;</p>
              <p class="ps-6 mb-4">b. bahwa untuk memberikan kepastian hukum atas persetujuan tersebut, perlu ditetapkan Surat Keputusan Komite Klaim.</p>

              <p class="fw-bold mb-1">Mengingat:</p>
              <p class="ps-6 mb-4">
                1. Anggaran Dasar PT Jamkrida Jabar (Perseroda);<br />
                2. Peraturan Otoritas Jasa Keuangan tentang Penyelenggaraan Usaha Perusahaan Penjaminan;<br />
                3. Perjanjian Kerja Sama Penjaminan Kredit antara PT Jamkrida Jabar dengan Mitra Penerima Jaminan;<br />
                4. Berita Acara Sidang Komite Nomor {{ claim.beritaAcara?.nomorBa }}.
              </p>

              <table class="table table-bordered border-gray-400 my-6 fs-7 align-middle">
                <tbody>
                  <tr><td class="fw-bold bg-light w-150px">Kode Klaim</td><td class="fw-bold">{{ claim.kodeKlaim }}</td></tr>
                  <tr><td class="fw-bold bg-light">Nama Debitur</td><td>{{ claim.sertifikatPenjaminan?.namaDebitur }}</td></tr>
                  <tr><td class="fw-bold bg-light">Nomor SP</td><td>{{ claim.sertifikatPenjaminan?.nomorSp }}</td></tr>
                  <tr><td class="fw-bold bg-light">Mitra Pengaju</td><td>{{ claim.mitra?.namaMitra }}</td></tr>
                  <tr><td class="fw-bold bg-light text-primary">NILAI KLAIM DISETUJUI</td><td class="text-primary fw-bold fs-6">{{ formatCurrency(claim.suratKeputusan?.nilaiDisetujui || claim.nilaiKlaim) }}</td></tr>
                </tbody>
              </table>

              <p class="fw-bold text-center my-6">MEMUTUSKAN:</p>
              <table class="table table-borderless fs-7 mb-6">
                <tbody>
                  <tr>
                    <td class="fw-bold align-top w-100px">KESATU</td>
                    <td>: Menyetujui pembayaran Klaim (Ganti Rugi) Penjaminan Kredit kepada <strong>{{ claim.mitra?.namaMitra }}</strong> atas nama Debitur <strong>{{ claim.sertifikatPenjaminan?.namaDebitur }}</strong> (No. SP {{ claim.sertifikatPenjaminan?.nomorSp }}) sebesar <strong>{{ formatCurrency(claim.suratKeputusan?.nilaiDisetujui || claim.nilaiKlaim) }}</strong>.</td>
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
            <div class="col-4" v-for="sig in claim.esignSignatures" :key="sig.id">
              <div class="d-flex flex-column align-items-center">
                <span class="fs-8 text-muted fw-semibold mb-1">{{ sig.pejabatKomite?.jabatan }}</span>

                <div class="border rounded p-3 my-2 w-100 bg-light d-flex flex-column align-items-center justify-content-center" style="min-height: 100px;">
                  <div v-if="sig.status === 'signed'" class="text-success text-center w-100">
                    <img :src="qrCodeUrl(sig)" :alt="`QR Verifikasi TTE ${sig.pejabatKomite?.nama}`" width="72" height="72" class="mb-1" />
                    <span class="d-flex align-items-center justify-content-center gap-1 fs-9 fw-bold">
                      <KTIcon icon-name="verify" icon-class="fs-6 text-success" />
                      E-SIGNED SECURE
                    </span>
                    <span class="d-block text-muted" style="font-size: 8px;">{{ formatDate(sig.signedAt) }}</span>
                  </div>

                  <div v-else-if="sig.status === 'rejected'" class="text-danger text-center">
                    <KTIcon icon-name="cross-circle" icon-class="fs-2x text-danger mb-1" />
                    <span class="d-block fs-9 fw-bold">REJECTED / DITOLAK</span>
                    <span class="d-block text-muted" style="font-size: 8px;">{{ formatDate(sig.signedAt) }}</span>
                  </div>

                  <span v-else class="text-muted fs-8">Menunggu TTE</span>
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
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "cetak-dokumen-komite",
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const claim = ref<any>(null);

    const fetchClaim = async () => {
      loading.value = true;
      try {
        const res = await ApiService.get("klaims", String(route.params.id));
        claim.value = res.data.data;
      } catch (err) {
        console.error("Gagal memuat dokumen:", err);
        claim.value = null;
      } finally {
        loading.value = false;
      }
    };

    const docTitle = computed(() => {
      if (!claim.value) return "";
      return claim.value.suratKeputusan
        ? "SURAT KEPUTUSAN KELAYAKAN KLAIM"
        : "BERITA ACARA SIDANG EVALUASI KLAIM";
    });

    const docNumber = computed(() => {
      if (!claim.value) return "";
      return claim.value.suratKeputusan
        ? claim.value.suratKeputusan.nomorSk
        : claim.value.beritaAcara?.nomorBa;
    });

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

    const getDayName = () => {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      return days[new Date().getDay()];
    };

    const getCurrentDateText = () => {
      const date = new Date();
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const qrCodeUrl = (sig: any) => {
      const payload = [
        `DOK:${docNumber.value}`,
        `PENANDATANGAN:${sig.pejabatKomite?.nama || '-'}`,
        `JABATAN:${sig.pejabatKomite?.jabatan || '-'}`,
        `NIP:${sig.pejabatKomite?.nip || '-'}`,
        `KLAIM:${claim.value?.kodeKlaim || '-'}`,
        `WAKTU:${sig.signedAt || '-'}`,
      ].join(" | ");

      return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(payload)}`;
    };

    const printDocument = () => {
      window.print();
    };

    onMounted(() => {
      fetchClaim();
    });

    return {
      loading,
      claim,
      docTitle,
      docNumber,
      formatCurrency,
      formatDate,
      getDayName,
      getCurrentDateText,
      qrCodeUrl,
      printDocument,
    };
  }
});
</script>

<style scoped>
.decoration-underline {
  text-decoration: underline;
}
</style>

<style>
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #fff !important;
  }
  #printable-doc {
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
