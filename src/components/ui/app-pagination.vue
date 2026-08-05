<template>
    <div class="d-flex flex-stack flex-wrap pt-8 px-9 mb-5 border-top border-gray-100">
        <!-- Summary Stats -->
        <div class="d-flex align-items-center mb-1 mb-md-0 gap-4">
            <div class="fs-9 text-gray-600 text-uppercase">Tampil</div>
            <div class="w-100px">
                <SelectDropdown :model-value="perPage" :options="perPageOptions" :clearable="false" :showRefresh="false"
                    @update:model-value="v => $emit('update:perPage', v)" />
            </div>
            <div class="fs-9 text-gray-600 text-uppercase">
                {{ total }} Data
            </div>
        </div>

        <!-- Pagination Controls -->
        <ul class="pagination pagination-circle">
            <li class="page-item previous" :class="{ disabled: page === 1 }">
                <button class="page-link rounded-pill border-secondary border-opacity-20"
                    @click="page > 1 && $emit('update:page', page - 1)">
                    <i class="ki-outline ki-left fs-2"></i>
                </button>
            </li>
            <li v-for="(p, idx) in pages" :key="idx" class="page-item"
                :class="{ active: p === page, disabled: p === '...' }">
                <button class="page-link px-4 rounded-pill border-secondary border-opacity-20"
                    @click="p !== '...' && $emit('update:page', p)">
                    {{ p }}
                </button>
            </li>
            <li class="page-item next" :class="{ disabled: page === lastPage }">
                <button class="page-link rounded-pill border-secondary border-opacity-20"
                    @click="page < lastPage && $emit('update:page', page + 1)">
                    <i class="ki-outline ki-right fs-2"></i>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { getPaginationPages, perPageOptions } from '@/helpers/common';
import SelectDropdown from '@/components/ui/select-dropdown.vue';

const props = defineProps({
    page: { type: Number, required: true },
    lastPage: { type: Number, required: true },
    total: { type: Number, required: true },
    perPage: { type: Number, required: true }
});

defineEmits(['update:page', 'update:perPage']);

const pages = computed(() => getPaginationPages(props.page, props.lastPage));
</script>
