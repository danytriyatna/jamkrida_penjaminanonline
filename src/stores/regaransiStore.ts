import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { regaransiService } from "@/core/services/regaransiService";

export interface ItemJiwa {
  id: string;
  noRegaransi: string;
  namaPeserta: string;
  nik: string;
  tglLahir: string;
  mitraReasuradur: string;
  uangPertanggungan: number;
  premiRegaransi: number;
  sharePercentage: number;
  tglMulai: string;
  tglAkhir: string;
  periode: string;
  statusData: "Include" | "Exclude";
  status: "AVAILABLE" | "PENGAJUAN" | "DISETUJUI" | "DITOLAK" | "PAID";
  noPersetujuan?: string;
  tglPersetujuan?: string;
  catatanUnderwriting?: string;
  noTransaksiBayar?: string;
  tglBayar?: string;
  metodeBayar?: string;
  buktiBayarFileName?: string;
  createdAt: string;
}

export interface ItemKredit {
  id: string;
  noRegaransi: string;
  noSertifikatPenjaminan: string;
  namaDebitur: string;
  bankCedant: string;
  plafondKredit: number;
  outstandingTunggakan: number;
  nominalKlaimRegaransi: number;
  kolektibilitas: string;
  alasanKlaim: string;
  periode: string;
  statusData: "Include" | "Exclude";
  status: "AVAILABLE" | "PENGAJUAN" | "DISETUJUI" | "DITOLAK" | "PAID";
  noPersetujuan?: string;
  tglPersetujuan?: string;
  catatanKomite?: string;
  nominalDisetujui?: number;
  noTransaksiDisbursement?: string;
  tglDisbursement?: string;
  bankTujuan?: string;
  noRekening?: string;
  buktiBayarFileName?: string;
  createdAt: string;
}

export const useRegaransiStore = defineStore("regaransi", () => {
  const itemsJiwa = ref<ItemJiwa[]>([]);
  const itemsKredit = ref<ItemKredit[]>([]);
  const isLoading = ref(false);

  // Fetch Jiwa dari backend Laravel
  async function fetchJiwa(tglAwal?: string, tglAkhir?: string) {
    isLoading.value = true;
    try {
      const res = await regaransiService.getJiwa(tglAwal, tglAkhir);
      if (res && res.data) {
        itemsJiwa.value = res.data.map((item: any) => ({
          id: item.id.toString(),
          noRegaransi: item.no_regaransi,
          namaPeserta: item.nama_peserta,
          nik: item.nik,
          tglLahir: item.tgl_lahir,
          mitraReasuradur: item.mitra_reasuradur,
          uangPertanggungan: Number(item.uang_pertanggungan),
          premiRegaransi: Number(item.premi_regaransi),
          sharePercentage: Number(item.share_percentage || 50),
          tglMulai: item.tgl_mulai,
          tglAkhir: item.tgl_akhir,
          periode: item.periode,
          statusData: item.status_data || "Include",
          status: item.status,
          noPersetujuan: item.no_persetujuan,
          tglPersetujuan: item.tgl_persetujuan,
          catatanUnderwriting: item.catatan_underwriting,
          noTransaksiBayar: item.no_transaksi_bayar,
          tglBayar: item.tgl_bayar,
          metodeBayar: item.metode_bayar,
          buktiBayarFileName: item.bukti_bayar_file,
          createdAt: item.created_at ? item.created_at.slice(0, 16).replace("T", " ") : "2026-08-01 09:00",
        }));
      }
    } catch (err) {
      console.error("Gagal mengambil data Regaransi Jiwa dari API", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch Kredit dari backend Laravel
  async function fetchKredit(tglAwal?: string, tglAkhir?: string) {
    isLoading.value = true;
    try {
      const res = await regaransiService.getKredit(tglAwal, tglAkhir);
      if (res && res.data) {
        itemsKredit.value = res.data.map((item: any) => ({
          id: item.id.toString(),
          noRegaransi: item.no_regaransi,
          noSertifikatPenjaminan: item.no_sertifikat_penjaminan,
          namaDebitur: item.nama_debitur,
          bankCedant: item.bank_cedant,
          plafondKredit: Number(item.plafond_kredit),
          outstandingTunggakan: Number(item.outstanding_tunggakan),
          nominalKlaimRegaransi: Number(item.nominal_klaim_regaransi),
          kolektibilitas: item.kolektibilitas,
          alasanKlaim: item.alasan_klaim,
          periode: item.periode,
          statusData: item.status_data || "Include",
          status: item.status,
          noPersetujuan: item.no_persetujuan,
          tglPersetujuan: item.tgl_persetujuan,
          catatanKomite: item.catatan_komite,
          nominalDisetujui: item.nominal_disetujui ? Number(item.nominal_disetujui) : Number(item.nominal_klaim_regaransi),
          noTransaksiDisbursement: item.no_transaksi_disbursement,
          tglDisbursement: item.tgl_disbursement,
          bankTujuan: item.bank_tujuan,
          noRekening: item.no_rekening,
          buktiBayarFileName: item.bukti_bayar_file,
          createdAt: item.created_at ? item.created_at.slice(0, 16).replace("T", " ") : "2026-08-01 09:00",
        }));
      }
    } catch (err) {
      console.error("Gagal mengambil data Regaransi Kredit Macet dari API", err);
    } finally {
      isLoading.value = false;
    }
  }

  // Submit Batch Jiwa
  async function submitBatchJiwa(ids: string[]) {
    if (ids.length === 0) return;
    try {
      await regaransiService.ajukanJiwa(ids);
      itemsJiwa.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "PENGAJUAN";
        }
      });
      Swal.fire({
        icon: "success",
        title: "Pengajuan Berhasil!",
        text: `${ids.length} data regaransi jiwa berhasil diajukan.`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat menghubungkan ke server.", heightAuto: false });
    }
  }

  // Submit Batch Kredit
  async function submitBatchKredit(ids: string[]) {
    if (ids.length === 0) return;
    try {
      await regaransiService.ajukanKredit(ids);
      itemsKredit.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "PENGAJUAN";
        }
      });
      Swal.fire({
        icon: "success",
        title: "Pengajuan Klaim Berhasil!",
        text: `${ids.length} data klaim kredit macet berhasil diajukan.`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat menghubungkan ke server.", heightAuto: false });
    }
  }

  // Approve Batch Jiwa
  async function approveBatchJiwa(ids: string[], payload: { noPersetujuan: string; tglPersetujuan: string }) {
    try {
      await regaransiService.setujuiJiwa(ids, payload.noPersetujuan, payload.tglPersetujuan);
      itemsJiwa.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "DISETUJUI";
          item.noPersetujuan = payload.noPersetujuan;
          item.tglPersetujuan = payload.tglPersetujuan;
        }
      });
      Swal.fire({
        icon: "success",
        title: "Persetujuan Berhasil!",
        text: `${ids.length} data regaransi jiwa disetujui (SK: ${payload.noPersetujuan}).`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memproses persetujuan ke server.", heightAuto: false });
    }
  }

  // Approve Batch Kredit
  async function approveBatchKredit(ids: string[], payload: { noPersetujuan: string; tglPersetujuan: string }) {
    try {
      await regaransiService.setujuiKredit(ids, payload.noPersetujuan, payload.tglPersetujuan);
      itemsKredit.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "DISETUJUI";
          item.noPersetujuan = payload.noPersetujuan;
          item.tglPersetujuan = payload.tglPersetujuan;
          item.nominalDisetujui = item.nominalKlaimRegaransi;
        }
      });
      Swal.fire({
        icon: "success",
        title: "Persetujuan Komite Berhasil!",
        text: `${ids.length} klaim disetujui Komite (SK: ${payload.noPersetujuan}).`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memproses persetujuan Komite ke server.", heightAuto: false });
    }
  }

  // Pay Batch Jiwa
  async function payBatchJiwa(ids: string[], payload: { noTransaksi: string; tglBayar: string; fileBukti?: File }) {
    try {
      await regaransiService.bayarJiwa(ids, payload.noTransaksi, payload.tglBayar, payload.fileBukti);
      itemsJiwa.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "PAID";
          item.noTransaksiBayar = payload.noTransaksi;
          item.tglBayar = payload.tglBayar;
          item.metodeBayar = "Transfer Bank";
          item.buktiBayarFileName = payload.fileBukti ? payload.fileBukti.name : `Bukti_Bayar_${item.id}.pdf`;
        }
      });
      Swal.fire({
        icon: "success",
        title: "Pembayaran Berhasil!",
        text: `${ids.length} tagihan premi regaransi jiwa berhasil dibayar (LUNAS).`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memproses pembayaran ke server.", heightAuto: false });
    }
  }

  // Pay Batch Kredit
  async function payBatchKredit(ids: string[], payload: { noTransaksi: string; tglDisbursement: string; fileBukti?: File }) {
    try {
      await regaransiService.cairkanKredit(ids, payload.noTransaksi, payload.tglDisbursement, payload.fileBukti);
      itemsKredit.value.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = "PAID";
          item.noTransaksiDisbursement = payload.noTransaksi;
          item.tglDisbursement = payload.tglDisbursement;
          item.buktiBayarFileName = payload.fileBukti ? payload.fileBukti.name : `Bukti_Disbursement_${item.id}.pdf`;
        }
      });
      Swal.fire({
        icon: "success",
        title: "Pencairan Klaim Berhasil!",
        text: `${ids.length} klaim kredit macet berhasil dicairkan (PAID).`,
        confirmButtonText: "OK",
        heightAuto: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memproses pencairan klaim ke server.", heightAuto: false });
    }
  }

  const summaryJiwa = computed(() => {
    const total = itemsJiwa.value.length;
    const available = itemsJiwa.value.filter((i) => i.status === "AVAILABLE" && i.statusData === "Include").length;
    const pengajuan = itemsJiwa.value.filter((i) => i.status === "PENGAJUAN").length;
    const disetujui = itemsJiwa.value.filter((i) => i.status === "DISETUJUI").length;
    const paid = itemsJiwa.value.filter((i) => i.status === "PAID").length;
    const totalUP = itemsJiwa.value.reduce((acc, curr) => acc + curr.uangPertanggungan, 0);
    const totalPremi = itemsJiwa.value.reduce((acc, curr) => acc + curr.premiRegaransi, 0);
    return { total, available, pengajuan, disetujui, paid, totalUP, totalPremi };
  });

  const summaryKredit = computed(() => {
    const total = itemsKredit.value.length;
    const available = itemsKredit.value.filter((i) => i.status === "AVAILABLE" && i.statusData === "Include").length;
    const pengajuan = itemsKredit.value.filter((i) => i.status === "PENGAJUAN").length;
    const disetujui = itemsKredit.value.filter((i) => i.status === "DISETUJUI").length;
    const paid = itemsKredit.value.filter((i) => i.status === "PAID").length;
    const totalKlaim = itemsKredit.value.reduce((acc, curr) => acc + curr.nominalKlaimRegaransi, 0);
    return { total, available, pengajuan, disetujui, paid, totalKlaim };
  });

  // Muat data awal saat store pertama kali dipakai
  fetchJiwa("2026-08-01", "2026-08-31");
  fetchKredit("2026-08-01", "2026-08-31");

  return {
    itemsJiwa,
    itemsKredit,
    isLoading,
    summaryJiwa,
    summaryKredit,
    fetchJiwa,
    fetchKredit,
    submitBatchJiwa,
    submitBatchKredit,
    approveBatchJiwa,
    approveBatchKredit,
    payBatchJiwa,
    payBatchKredit,
  };
});
