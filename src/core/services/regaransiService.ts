import ApiService from "@/core/services/ApiService";

export const regaransiService = {
  // ============ Regaransi Asuransi Jiwa ============
  async getJiwa(tglAwal?: string, tglAkhir?: string, status?: string) {
    const params: Record<string, string> = {};
    if (tglAwal) params.tgl_awal = tglAwal;
    if (tglAkhir) params.tgl_akhir = tglAkhir;
    if (status) params.status = status;

    const res = await ApiService.query("regaransi-jiwa", { params });
    return res.data;
  },

  async ajukanJiwa(ids: string[]) {
    const res = await ApiService.post("regaransi-jiwa/ajukan", { ids });
    return res.data;
  },

  async setujuiJiwa(ids: string[], noPersetujuan: string, tglPersetujuan: string) {
    const res = await ApiService.post("regaransi-jiwa/setujui", {
      ids,
      no_persetujuan: noPersetujuan,
      tgl_persetujuan: tglPersetujuan,
    });
    return res.data;
  },

  async bayarJiwa(ids: string[], noTransaksi: string, tglBayar: string, fileBukti?: File) {
    const formData = new FormData();
    ids.forEach((id) => formData.append("ids[]", id));
    formData.append("no_transaksi", noTransaksi);
    formData.append("tgl_bayar", tglBayar);
    if (fileBukti) {
      formData.append("file_bukti", fileBukti);
    }

    const res = await ApiService.post("regaransi-jiwa/bayar", formData);
    return res.data;
  },

  // ============ Regaransi Kredit Macet ============
  async getKredit(tglAwal?: string, tglAkhir?: string, status?: string) {
    const params: Record<string, string> = {};
    if (tglAwal) params.tgl_awal = tglAwal;
    if (tglAkhir) params.tgl_akhir = tglAkhir;
    if (status) params.status = status;

    const res = await ApiService.query("regaransi-kredit", { params });
    return res.data;
  },

  async ajukanKredit(ids: string[]) {
    const res = await ApiService.post("regaransi-kredit/ajukan", { ids });
    return res.data;
  },

  async setujuiKredit(ids: string[], noPersetujuan: string, tglPersetujuan: string) {
    const res = await ApiService.post("regaransi-kredit/setujui", {
      ids,
      no_persetujuan: noPersetujuan,
      tgl_persetujuan: tglPersetujuan,
    });
    return res.data;
  },

  async cairkanKredit(ids: string[], noTransaksi: string, tglDisbursement: string, fileBukti?: File) {
    const formData = new FormData();
    ids.forEach((id) => formData.append("ids[]", id));
    formData.append("no_transaksi", noTransaksi);
    formData.append("tgl_disbursement", tglDisbursement);
    if (fileBukti) {
      formData.append("file_bukti", fileBukti);
    }

    const res = await ApiService.post("regaransi-kredit/cairkan", formData);
    return res.data;
  },
};

export default regaransiService;
