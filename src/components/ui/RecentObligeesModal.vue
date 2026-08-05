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
                                <h4 class="m-0 fw-boldest text-white fs-5">Riwayat Penerima Kerja (Obligee)</h4>
                                <span class="fs-9 opacity-75 fw-bold">Pilih dari daftar Obligee yang pernah diajukan sebelumnya</span>
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
                                    placeholder="Cari berdasarkan nama pemilik proyek/obligee..." />
                            </div>
                            <button type="button" class="btn btn-icon btn-light-primary rounded-circle"
                                @click="fetchObligees(searchQuery)" title="Segarkan Data">
                                <i class="bi bi-arrow-clockwise fs-3"></i>
                            </button>
                        </div>

                        <!-- Content Area -->
                        <div class="flex-grow-1 overflow-auto" style="max-height: 400px;">
                            <!-- Loading state -->
                            <div v-if="loading"
                                class="d-flex flex-column align-items-center justify-content-center h-100 py-10">
                                <div class="spinner-border text-primary w-40px h-40px" role="status"></div>
                                <p class="mt-4 fw-bold text-gray-600 fs-7">Memuat data obligee...</p>
                            </div>

                            <!-- Empty state -->
                            <div v-else-if="filteredObligees.length === 0"
                                class="d-flex flex-column align-items-center justify-content-center h-100 py-10 text-center">
                                <div class="symbol symbol-70px symbol-circle mb-5">
                                    <div class="symbol-label bg-light-warning">
                                        <i class="ki-outline ki-information-5 fs-2x text-warning"></i>
                                    </div>
                                </div>
                                <h5 class="fw-boldest text-gray-900 mb-2">Data Tidak Ditemukan</h5>
                                <p class="text-gray-500 fs-7 px-10 mb-6 mw-400px">
                                    Belum ada riwayat data obligee dari permohonan Anda.
                                </p>
                            </div>

                            <!-- List Table -->
                            <div v-else class="table-responsive">
                                <table
                                    class="table table-hover table-rounded table-striped border gy-3 gs-4 align-middle">
                                    <thead>
                                        <tr
                                            class="fw-boldest fs-9 text-gray-800 border-bottom-2 border-gray-200 text-uppercase bg-light">
                                            <th class="text-center" style="width: 50px;">NO.</th>
                                            <th>Nama Obligee</th>
                                            <th>Alamat Obligee</th>
                                            <th class="text-end" style="width: 120px;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, idx) in filteredObligees" :key="idx">
                                            <td class="text-center text-gray-500 fs-8">
                                                {{ (page - 1) * perPage + idx + 1 }}
                                            </td>
                                            <td>
                                                <div class="d-flex flex-column">
                                                    <span class="fw-boldest text-gray-900 fs-7">{{ item.name }}</span>
                                                </div>
                                            </td>
                                            <td class="fw-bold fs-8 text-gray-600">
                                                <div style="white-space: pre-wrap; word-break: break-word; max-width: 500px;">
                                                    {{ item.address || '-' }}
                                                </div>
                                            </td>
                                            <td class="text-end">
                                                <button type="button"
                                                    class="btn btn-sm btn-light-success btn-active-success fw-boldest rounded-pill px-4 py-1.5 fs-8"
                                                    @click="selectObligee(item)">
                                                    <i class="bi bi-check-lg me-1"></i> Gunakan
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Footer / Pagination -->
                    <div v-if="filteredObligees.length > 0"
                        class="modal-footer py-2 bg-light px-6 border-top text-start">
                        <div class="w-100">
                            <AppPagination :page="page" :lastPage="lastPage" :total="total" :perPage="perPage"
                                @update:page="val => { page = val; fetchObligees(searchQuery) }"
                                @update:perPage="val => { perPage = val; page = 1; fetchObligees(searchQuery) }" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from '@/lib/axios';
import { fswal } from '@/helpers/fswal';
import AppPagination from '@/components/ui/app-pagination.vue';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['update:show', 'select']);

const loading = ref(false);
const searchQuery = ref('');
const obligees = ref([]);
const filteredObligees = ref([]);

const page = ref(1);
const perPage = ref(5);
const total = ref(0);
const lastPage = ref(1);

let searchTimeout = null;

const fetchObligees = async (search = '') => {
    loading.value = true;
    try {
        const response = await axios.get('/submission/recent-obligees', {
            params: {
                search,
                page: page.value,
                limit: perPage.value
            }
        });
        if (response.data && response.data.success) {
            obligees.value = response.data.data.data || [];
            filteredObligees.value = obligees.value;
            total.value = response.data.data.total || 0;
            lastPage.value = response.data.data.last_page || 1;
        } else {
            obligees.value = [];
            filteredObligees.value = [];
            total.value = 0;
            lastPage.value = 1;
        }
    } catch (error) {
        console.error('Error fetching obligees:', error);
        fswal.fire({
            title: 'Error',
            text: 'Gagal memuat data riwayat Obligee.',
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
        fetchObligees(searchQuery.value);
    }, 400);
};

const closeModal = () => {
    emit('update:show', false);
};

const selectObligee = (item) => {
    emit('select', {
        name: item.name,
        address: item.address
    });
    closeModal();
};

watch(() => props.show, (newVal) => {
    if (newVal) {
        searchQuery.value = '';
        page.value = 1;
        fetchObligees();
    }
});
</script>
