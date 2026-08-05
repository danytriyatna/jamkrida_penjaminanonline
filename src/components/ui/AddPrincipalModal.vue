<template>
    <Teleport to="body">
        <div v-if="show" class="modal fade show d-block"
            style="background: rgba(0,0,0,0.6); z-index: 999999; backdrop-filter: blur(4px);" @click.self="closeModal">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <!-- Header -->
                    <div
                        class="modal-header bg-primary text-white p-5 border-0 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="ki-outline ki-plus-circle fs-1 me-3 text-white"></i>
                            <div>
                                <h4 class="m-0 fw-boldest text-white fs-5">Tambah Master Principal Baru</h4>
                                <span class="fs-9 opacity-75 fw-bold">Daftarkan data nasabah/pemohon baru ke
                                    database</span>
                            </div>
                        </div>
                        <button type="button"
                            class="btn btn-icon btn-sm btn-active-light-primary rounded-circle text-white border-0"
                            @click="closeModal">
                            <i class="bi bi-x fs-1 text-white"></i>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body p-8 bg-body overflow-auto text-start" style="max-height: 70vh;">
                        <!-- Alert Info -->
                        <div
                            class="alert alert-dismissible bg-light-warning border border-warning d-flex flex-column flex-sm-row p-5 mb-8 rounded-3">
                            <i class="ki-outline ki-information-5 fs-2hx text-warning me-4 mb-5 mb-sm-0"></i>
                            <div class="d-flex flex-column">
                                <h5 class="fw-boldest text-gray-900 fs-7 text-uppercase mb-1">Catatan Pengunggahan
                                    Berkas</h5>
                                <span class="text-gray-700 fs-7">Unggah dokumen legalitas (KTP, NIB, Akta, dll) dapat
                                    dilakukan **melalui menu Master Principal** setelah data dasar ini berhasil
                                    disimpan.</span>
                            </div>
                        </div>

                        <form @submit.prevent="submitForm">
                            <!-- GROUP 1: IDENTITAS & KONTAK UTAMA -->
                            <div class="card card-dashed border-gray-300 p-6 rounded-3 mb-6 bg-light bg-opacity-20">
                                <h4 class="fw-boldest text-primary fs-7 text-uppercase mb-5 ls-1">
                                    <i class="ki-outline ki-profile-user fs-4 me-2 text-primary"></i> 1. Identitas &amp;
                                    Kontak Utama
                                </h4>

                                <div class="row g-6">
                                    <!-- Jenis Usaha -->
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Jenis
                                            Usaha <span class="text-danger">*</span></label>
                                        <select v-model="form.jenis_usaha" class="form-select border-gray-300" required>
                                            <option value="1">Perorangan</option>
                                            <option value="2">Badan Usaha (PT/CV)</option>
                                        </select>
                                    </div>

                                    <!-- Nama -->
                                    <div class="col-md-8">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Nama
                                            Principal / Instansi <span class="text-danger">*</span></label>
                                        <input type="text" v-model="form.nama" class="form-control border-gray-300"
                                            placeholder="Contoh: PT. Raharja Usaha Abadi" required />
                                    </div>

                                    <!-- NIK / NPWP Utama -->
                                    <div class="col-md-4">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">NIK
                                            / NPWP Utama <span class="text-danger">*</span></label>
                                        <input type="text" v-model="form.no_identitas"
                                            class="form-control border-gray-300"
                                            placeholder="Masukkan nomor identitas..." required />
                                    </div>

                                    <!-- Email -->
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Email
                                            Aktif</label>
                                        <input type="email" v-model="form.email" class="form-control border-gray-300"
                                            placeholder="contoh@mail.com" />
                                    </div>

                                    <!-- Telepon -->
                                    <div class="col-md-4">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">No.
                                            Telepon / HP</label>
                                        <input type="text" v-model="form.telepon" class="form-control border-gray-300"
                                            placeholder="08XXXXXXXXXX" />
                                    </div>

                                    <!-- Alamat -->
                                    <div class="col-12">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Alamat
                                            Lengkap Kantor/Rumah <span class="text-danger">*</span></label>
                                        <textarea v-model="form.alamat" class="form-control border-gray-300" rows="2"
                                            placeholder="Tuliskan alamat lengkap..." required></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- GROUP 2: KONDISIONAL PERORANGAN -->
                            <div v-if="form.jenis_usaha == 1"
                                class="card card-dashed border-gray-300 p-6 rounded-3 mb-6 bg-light bg-opacity-20">
                                <h4 class="fw-boldest text-primary fs-7 text-uppercase mb-5 ls-1">
                                    <i class="ki-outline ki-user fs-4 me-2 text-primary"></i> 2. Informasi KYC
                                    Perorangan
                                </h4>

                                <div class="row g-6">
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Tempat
                                            Lahir</label>
                                        <input type="text" v-model="form.tempat_lahir"
                                            class="form-control border-gray-300" placeholder="Bandung, Jakarta, dll" />
                                    </div>
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Tanggal
                                            Lahir</label>
                                        <input type="date" v-model="form.tgl_lahir"
                                            class="form-control border-gray-300" />
                                    </div>
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Jenis
                                            Kelamin</label>
                                        <select v-model="form.jenis_kelamin" class="form-select border-gray-300">
                                            <option value="">Pilih</option>
                                            <option value="1">Laki-laki</option>
                                            <option value="2">Perempuan</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Pekerjaan</label>
                                        <input type="text" v-model="form.pekerjaan" class="form-control border-gray-300"
                                            placeholder="Wiraswasta, PNS, Karyawan Swasta, dll" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">NPWP
                                            Pribadi (Jika Ada)</label>
                                        <input type="text" v-model="form.npwp_pribadi"
                                            class="form-control border-gray-300"
                                            placeholder="Masukkan NPWP pribadi..." />
                                    </div>
                                </div>
                            </div>

                            <!-- GROUP 3: KONDISIONAL BADAN USAHA - LEGALITAS -->
                            <div v-if="form.jenis_usaha == 2"
                                class="card card-dashed border-gray-300 p-6 rounded-3 mb-6 bg-light bg-opacity-20">
                                <h4 class="fw-boldest text-primary fs-7 text-uppercase mb-5 ls-1">
                                    <i class="ki-outline ki-document fs-4 me-2 text-primary"></i> 2. Legalitas &amp;
                                    Perizinan Perusahaan
                                </h4>

                                <div class="row g-6">
                                    <div class="col-md-4">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">NIB
                                            (Nomor Induk Berusaha)</label>
                                        <input type="text" v-model="form.nib" class="form-control border-gray-300"
                                            placeholder="Masukkan nomor NIB..." />
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">NPWP
                                            Badan Usaha</label>
                                        <input type="text" v-model="form.npwp_badan"
                                            class="form-control border-gray-300"
                                            placeholder="Masukkan NPWP Perusahaan..." />
                                    </div>
                                    <div class="col-md-4">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Website
                                            Perusahaan</label>
                                        <input type="text" v-model="form.website" class="form-control border-gray-300"
                                            placeholder="www.perusahaan.com" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">No.
                                            Akta Pendirian</label>
                                        <input type="text" v-model="form.no_akta_pendirian"
                                            class="form-control border-gray-300"
                                            placeholder="Masukkan nomor akta pendirian..." />
                                    </div>
                                    <div class="col-md-6">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Tanggal
                                            Akta Pendirian</label>
                                        <input type="date" v-model="form.tgl_akta_pendirian"
                                            class="form-control border-gray-300" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">No.
                                            Akta Perubahan Terakhir</label>
                                        <input type="text" v-model="form.no_akta_perubahan"
                                            class="form-control border-gray-300"
                                            placeholder="Masukkan nomor akta perubahan..." />
                                    </div>
                                    <div class="col-md-6">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Tanggal
                                            Akta Perubahan</label>
                                        <input type="date" v-model="form.tgl_akta_perubahan"
                                            class="form-control border-gray-300" />
                                    </div>
                                </div>
                            </div>

                            <!-- GROUP 4: KONDISIONAL BADAN USAHA - PENGURUS -->
                            <div v-if="form.jenis_usaha == 2"
                                class="card card-dashed border-gray-300 p-6 rounded-3 mb-6 bg-light bg-opacity-20">
                                <h4 class="fw-boldest text-primary fs-7 text-uppercase mb-5 ls-1">
                                    <i class="ki-outline ki-security-user fs-4 me-2 text-primary"></i> 3. Detail
                                    Pengurus (Penandatangan Akta)
                                </h4>

                                <div class="row g-6">
                                    <div class="col-md-6">
                                        <label class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Nama
                                            Pengurus (Sesuai Akta) <span class="text-danger">*</span></label>
                                        <input type="text" v-model="form.nama_pengurus"
                                            class="form-control border-gray-300" placeholder="Masukkan nama pengurus..."
                                            required />
                                    </div>
                                    <div class="col-md-6">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Jabatan
                                            Pengurus</label>
                                        <input type="text" v-model="form.jabatan_pengurus"
                                            class="form-control border-gray-300"
                                            placeholder="Direktur Utama, Direktur, dll" />
                                    </div>
                                    <div class="col-12">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Alamat
                                            Lengkap Pengurus</label>
                                        <textarea v-model="form.alamat_pengurus" class="form-control border-gray-300"
                                            rows="2" placeholder="Tuliskan alamat lengkap pengurus..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- GROUP 5: AGUNAN & JAMINAN KONTRA -->
                            <div class="card card-dashed border-gray-300 p-6 rounded-3 mb-6 bg-light bg-opacity-20">
                                <h4 class="fw-boldest text-primary fs-7 text-uppercase mb-5 ls-1">
                                    <i class="ki-outline ki-finance-calculator fs-4 me-2 text-primary"></i> {{
                                        form.jenis_usaha == 2 ? '4' : '3' }}. Agunan &amp; Jaminan Kontra
                                </h4>

                                <div class="row g-6">
                                    <div class="col-12">
                                        <label
                                            class="form-label fw-boldest text-gray-700 fs-7 text-uppercase mb-3">Agunan
                                            / Jaminan Kontra (Jika Ada)</label>
                                        <textarea v-model="form.agunan" class="form-control border-gray-300" rows="2"
                                            placeholder="Detail jaminan kontra seperti Cash Collateral, BG, Sertifikat, dsb."></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="d-flex justify-content-end gap-3 mt-8">
                                <button type="button" class="btn btn-light rounded-pill px-6" @click="closeModal">
                                    Batal
                                </button>
                                <button type="submit" class="btn btn-primary rounded-pill px-6" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import axios from '@/lib/axios';
import { fswal } from '@/helpers/fswal';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['update:show', 'saved']);

const saving = ref(false);

const getInitialForm = () => ({
    jenis_usaha: '2',
    nama: '',
    alamat: '',
    no_identitas: '',
    email: '',
    telepon: '',
    tempat_lahir: '',
    tgl_lahir: '',
    jenis_kelamin: '',
    pekerjaan: '',
    npwp_pribadi: '',
    nib: '',
    npwp_badan: '',
    website: '',
    no_akta_pendirian: '',
    tgl_akta_pendirian: '',
    no_akta_perubahan: '',
    tgl_akta_perubahan: '',
    nama_pengurus: '',
    jabatan_pengurus: '',
    alamat_pengurus: '',
    agunan: ''
});

const form = ref(getInitialForm());

const closeModal = () => {
    form.value = getInitialForm();
    emit('update:show', false);
};

const submitForm = async () => {
    // 1. Validasi NIK / NPWP (Hanya angka, 15-16 digit)
    const rawNoIdentitas = (form.value.no_identitas || '').replace(/\D/g, '');
    if (rawNoIdentitas.length < 15 || rawNoIdentitas.length > 16) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Nomor Identitas (NIK/NPWP Utama) harus berupa 15 atau 16 digit angka.',
            icon: 'warning'
        });
        return;
    }
    form.value.no_identitas = rawNoIdentitas;

    // 2. Validasi Telepon (Minimal 5 karakter)
    const tel = (form.value.telepon || '').trim();
    if (!tel) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Nomor Telepon / HP wajib diisi.',
            icon: 'warning'
        });
        return;
    }
    if (tel.length < 5) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Nomor Telepon / HP minimal harus 5 karakter.',
            icon: 'warning'
        });
        return;
    }

    // 3. Validasi Email
    const email = (form.value.email || '').trim();
    if (!email) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Email Aktif wajib diisi.',
            icon: 'warning'
        });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Format Email Aktif tidak valid.',
            icon: 'warning'
        });
        return;
    }

    // 4. Validasi Nama Pengurus (Wajib jika Badan Usaha)
    if (form.value.jenis_usaha == '2' && !(form.value.nama_pengurus || '').trim()) {
        fswal.fire({
            title: 'Validasi Gagal',
            text: 'Nama Pengurus (Sesuai Akta) wajib diisi untuk Badan Usaha.',
            icon: 'warning'
        });
        return;
    }

    saving.value = true;
    try {
        const response = await axios.post('/master/principal', form.value);
        if (response.data && response.data.success) {
            fswal.fire({
                title: 'Berhasil',
                text: 'Master Principal baru berhasil disimpan.',
                icon: 'success',
                timer: 2000
            });
            emit('saved', response.data.data);
            closeModal();
        } else {
            fswal.fire({
                title: 'Gagal',
                text: response.data.message || 'Gagal menyimpan data.',
                icon: 'error'
            });
        }
    } catch (error) {
        console.error('Error saving principal:', error);
        const errMsg = error.response?.data?.message || 'Terjadi kesalahan sistem saat menyimpan data.';
        fswal.fire({
            title: 'Error',
            text: errMsg,
            icon: 'error'
        });
    } finally {
        saving.value = false;
    }
};
</script>
