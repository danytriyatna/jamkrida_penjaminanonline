<template>
    <Teleport to="body">
        <div v-if="show" class="modal fade show d-block"
            style="background: rgba(0,0,0,0.6); z-index: 99999; backdrop-filter: blur(4px);" @click.self="closeModal">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <!-- Header -->
                    <div
                        class="modal-header bg-primary text-white p-5 border-0 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="ki-outline ki-profile-user fs-1 me-3 text-white"></i>
                            <div>
                                <h4 class="m-0 fw-boldest text-white fs-5">Daftar Pemohon / Principal</h4>
                                <span class="fs-9 opacity-75 fw-bold">Pilih data pemohon dari database Master
                                    Principal</span>
                            </div>
                        </div>
                        <button type="button"
                            class="btn btn-icon btn-sm btn-active-light-primary rounded-circle text-white border-0"
                            @click="closeModal">
                            <i class="bi bi-x fs-1 text-white"></i>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body p-6 bg-body d-flex flex-column" style="min-height: 380px;">
                        <!-- Search & Action Toolbar -->
                        <div class="d-flex gap-3 mb-5">
                            <div class="input-group input-group-sm flex-grow-1">
                                <span class="input-group-text bg-light border-0">
                                    <i class="ki-outline ki-magnifier fs-3"></i>
                                </span>
                                <input type="text" v-model="searchQuery" @input="debouncedSearch"
                                    class="form-control form-control-solid border-0 ps-2"
                                    placeholder="Cari berdasarkan nama atau NIK/NPWP..." />
                            </div>
                            <button type="button" class="btn btn-icon btn-light-primary rounded-circle"
                                @click="fetchPrincipals(searchQuery)" title="Segarkan Data">
                                <i class="bi bi-arrow-clockwise fs-3"></i>
                            </button>
                            <button type="button" class="btn btn-icon btn-primary rounded-circle"
                                @click="addNewPrincipal" title="Tambah Principal Baru">
                                <i class="bi bi-plus-lg fs-3"></i>
                            </button>
                        </div>

                        <!-- Content Area -->
                        <div class="flex-grow-1 overflow-auto">
                            <!-- Loading state -->
                            <div v-if="loading"
                                class="d-flex flex-column align-items-center justify-content-center h-100 py-10">
                                <div class="spinner-border text-primary w-40px h-40px" role="status"></div>
                                <p class="mt-4 fw-bold text-gray-600 fs-7">Memuat data principal...</p>
                            </div>

                            <!-- Empty state -->
                            <div v-else-if="filteredPrincipals.length === 0"
                                class="d-flex flex-column align-items-center justify-content-center h-100 py-10 text-center">
                                <div class="symbol symbol-70px symbol-circle mb-5">
                                    <div class="symbol-label bg-light-warning">
                                        <i class="ki-outline ki-information-5 fs-2x text-warning"></i>
                                    </div>
                                </div>
                                <h5 class="fw-boldest text-gray-900 mb-2">Data Tidak Ditemukan</h5>
                                <p class="text-gray-500 fs-7 px-10 mb-6 mw-400px">
                                    Belum ada data principal yang terdaftar di database Master Principal Anda.
                                </p>
                                <button type="button" class="btn btn-primary btn-sm px-6 rounded-pill fw-boldest"
                                    @click="addNewPrincipal">
                                    <i class="bi bi-plus-lg fs-5 me-1"></i> Daftarkan Principal Baru
                                </button>
                            </div>

                            <!-- List Table -->
                            <div v-else class="table-responsive">
                                <table
                                    class="table table-hover table-rounded table-striped border gy-3 gs-4 align-middle">
                                    <thead>
                                        <tr
                                            class="fw-boldest fs-8 text-gray-800 border-bottom-2 border-gray-200 text-uppercase bg-light">
                                            <th>Nama Pemohon</th>
                                            <th>NIK / NPWP</th>
                                            <th>Jenis Usaha</th>
                                            <th class="text-end">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in filteredPrincipals" :key="item.id">
                                            <td>
                                                <div class="d-flex flex-column">
                                                    <span class="fw-boldest text-gray-900 fs-6">{{ item.nama }}</span>
                                                    <span class="fs-9 text-gray-500 text-truncate mw-250px"
                                                        :title="item.alamat">
                                                        {{ item.alamat }}
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="fw-bold fs-7 text-gray-700">{{ item.no_identitas }}</td>
                                            <td>
                                                <span class="badge badge-light-primary fw-bold fs-9">
                                                    {{ item.jenis_usaha == 2 ? 'Badan Usaha' : 'Perorangan' }}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <button type="button"
                                                    class="btn btn-sm btn-light-success btn-active-success fw-boldest rounded-pill px-4"
                                                    @click="selectPrincipal(item)">
                                                    <i class="bi bi-check-lg me-1"></i> Gunakan
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div v-if="filteredPrincipals.length > 0"
                        class="modal-footer py-0 bg-light px-6 border-top text-start">
                        <div class="w-100">
                            <AppPagination :page="page" :lastPage="lastPage" :total="total" :perPage="perPage"
                                @update:page="val => { page = val; fetchPrincipals(searchQuery) }"
                                @update:perPage="val => { perPage = val; page = 1; fetchPrincipals(searchQuery) }" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Principal Modal -->
        <AddPrincipalModal :show="showAddModal" @update:show="val => showAddModal = val" @saved="onPrincipalSaved" />
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from '@/lib/axios';
import { fswal } from '@/helpers/fswal';
import AppPagination from '@/components/ui/app-pagination.vue';
import AddPrincipalModal from '@/components/ui/AddPrincipalModal.vue';

const showAddModal = ref(false);

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['update:show', 'select']);

const loading = ref(false);
const searchQuery = ref('');
const principals = ref([]);
const filteredPrincipals = ref([]);

const page = ref(1);
const perPage = ref(5);
const total = ref(0);
const lastPage = ref(1);

let searchTimeout = null;

const fetchPrincipals = async (search = '') => {
    loading.value = true;
    try {
        const response = await axios.get('/master/principal', {
            params: {
                search,
                page: page.value,
                limit: perPage.value
            }
        });
        if (response.data && response.data.success) {
            principals.value = response.data.data.data || [];
            filteredPrincipals.value = principals.value;
            total.value = response.data.data.total || 0;
            lastPage.value = response.data.data.last_page || 1;
        } else {
            principals.value = [];
            filteredPrincipals.value = [];
            total.value = 0;
            lastPage.value = 1;
        }
    } catch (error) {
        console.error('Error fetching principals:', error);
        fswal.fire({
            title: 'Error',
            text: 'Gagal memuat data Master Principal.',
            icon: 'error',
            timer: 2000
        });
    } finally {
        loading.value = false;
    }
};

const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        page.value = 1;
        fetchPrincipals(searchQuery.value);
    }, 400);
};

const closeModal = () => {
    emit('update:show', false);
};

const addNewPrincipal = () => {
    showAddModal.value = true;
};

const onPrincipalSaved = (newPrincipal) => {
    selectPrincipal(newPrincipal);
};

const selectPrincipal = (item) => {
    // Petakan properti dari Master Principal ke penamaan form t_permohonan
    const mapped = {
        principal_id: item.id,
        jenis_usaha: String(item.jenis_usaha),
        pemohon_nama: item.nama,
        pemohon_alamat: item.alamat,
        no_identitas: item.no_identitas,
        email: item.email || '',
        telphone: item.telepon || '',
        pengurus_nama: item.nama_pengurus || '',
        pengurus_alamat: item.alamat_pengurus || '',
        pengurus_jabatan: item.jabatan_pengurus || '',
        agunan: item.agunan || ''
    };
    emit('select', mapped);
    closeModal();
};

watch(() => props.show, (newVal) => {
    if (newVal) {
        searchQuery.value = '';
        page.value = 1;
        fetchPrincipals();
    }
});
</script>

<style scoped>
.mw-250px {
    max-width: 250px;
}
</style>
