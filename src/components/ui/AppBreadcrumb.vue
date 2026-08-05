<template>
    <div id="kt_app_toolbar_container" class="app-container container-fluid d-flex flex-stack">
        <div class="page-title d-flex flex-column justify-content-center flex-wrap me-3">
            <h1 class="page-heading d-flex text-gray-900 fw-boldest fs-3 flex-column justify-content-center mb-2">
                {{ title }}
            </h1>
            <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 py-0" style="line-height: normal;">
                <li class="breadcrumb-item text-muted">
                    <router-link to="/dashboard" class="text-muted text-hover-primary d-flex align-items-center py-2">
                        <i class="ki-outline ki-home fs-7 me-1"></i> Beranda
                    </router-link>
                </li>
                <template v-for="(item, index) in items" :key="index">
                    <li class="breadcrumb-item d-flex align-items-center">
                        <span class="mx-2 text-gray-400">/</span>
                    </li>
                    <li class="breadcrumb-item d-flex align-items-center"
                        :class="index === items.length - 1 ? 'text-gray-900 fw-bold' : 'text-muted'">
                        <router-link v-if="item.route || item.to" :to="item.route || item.to"
                            class="text-muted text-hover-primary d-inline-flex align-items-center py-2 h-100">
                            {{ item.title }}
                        </router-link>
                        <a v-else-if="item.click" href="javascript:;" @click="item.click"
                            class="text-muted text-hover-primary d-inline-flex align-items-center py-2 h-100">
                            {{ item.title }}
                        </a>
                        <span v-else class="py-2 d-flex align-items-center">{{ item.title }}</span>
                    </li>
                </template>
            </ul>
        </div>

        <!-- Additional Toolbar Actions -->
        <div class="d-flex align-items-center">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        default: () => []
    }
});
</script>
