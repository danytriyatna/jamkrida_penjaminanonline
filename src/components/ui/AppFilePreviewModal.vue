<template>
    <Teleport to="body">
        <div v-if="show" class="modal fade show d-block"
            style="background: rgba(0,0,0,0.8); z-index: 20000; backdrop-filter: blur(8px);"
            @click.self="$emit('update:show', false)">
            <div class="modal-dialog modal-dialog-centered"
                :class="isFullscreen ? 'modal-fullscreen' : 'modal-xl h-90vh'">
                <div class="modal-content border-0 shadow-lg bg-transparent">
                    <div class="d-flex justify-content-between align-items-center p-3 text-white px-2">
                        <div class="d-flex align-items-center">
                            <i :class="getIconClass" class="fs-1 me-3 text-white"></i>
                            <div>
                                <h4 class="m-0 fw-boldest text-white fs-5">{{ title }}</h4>
                                <span class="fs-9 opacity-75 fw-bold">{{ subtitle }}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button @click="toggleFullscreen"
                                class="btn btn-icon btn-sm btn-active-light-primary rounded-circle"
                                :title="isFullscreen ? 'Kecilkan' : 'Layar Penuh'">
                                <i :class="isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"
                                    class="fs-2"></i>
                            </button>
                            <button @click="downloadFile"
                                class="btn btn-icon btn-sm btn-active-light-primary rounded-circle" title="Unduh">
                                <i class="bi bi-download fs-2"></i>
                            </button>
                            <button @click="$emit('update:show', false)"
                                class="btn btn-icon btn-sm btn-active-light-danger rounded-circle me-4">
                                <i class="bi bi-x fs-2"></i>
                            </button>
                        </div>
                    </div>

                    <div class="modal-body p-0 rounded-4 overflow-hidden bg-body shadow-lg d-flex flex-column"
                        :class="isFullscreen ? 'h-fullscreen' : 'h-75vh'">
                        <div v-if="loading" class="text-center py-20 my-auto bg-body">
                            <div class="spinner-border text-primary w-60px h-60px" role="status"></div>
                            <p class="mt-5 fw-bold text-gray-800 fs-5">Sedang memuat dokumen...</p>
                        </div>

                        <template v-else>
                            <!-- Image Preview -->
                            <div v-if="isImage"
                                class="d-flex align-items-center justify-content-center h-100 p-5 bg-light overflow-auto">
                                <img :src="fileUrl" class="img-fluid rounded shadow-sm max-h-100" />
                            </div>

                            <!-- PDF Preview -->
                            <div v-else-if="isPdf" class="h-100">
                                <iframe :src="fileUrl" class="w-100 h-100 border-0"></iframe>
                            </div>

                            <!-- Unsupported -->
                            <div v-else class="text-center py-20 my-auto px-10">
                                <div
                                    class="bg-light-warning p-10 rounded-4 d-inline-block border border-warning border-opacity-10 shadow-xs">
                                    <i class="bi bi-exclamation-triangle-fill text-warning fs-5x mb-5"></i>
                                    <h3 class="fw-boldest text-gray-900">Preview Tidak Tersedia</h3>
                                    <p class="text-gray-700 mb-5 fs-6">Formulir dokumen ini tidak mendukung pratinjau
                                        langsung.</p>
                                    <button @click="downloadFile" class="btn btn-primary fw-boldest rounded-pill px-10">
                                        <i class="bi bi-download me-2"></i> Unduh untuk Melihat Segera
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    show: Boolean,
    fileUrl: String,
    title: String,
    subtitle: String,
    loading: Boolean
});

const emit = defineEmits(['update:show', 'download']);

const isImage = computed(() => {
    if (!props.subtitle) return false;
    const ext = props.subtitle.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif', 'svg'];

    // Check extension
    if (imageExtensions.includes(ext)) return true;

    // Fallback: Check if fileUrl itself (if not blob) contains image markers
    if (props.fileUrl && !props.fileUrl.startsWith('blob:')) {
        return imageExtensions.some(e => props.fileUrl.toLowerCase().includes('.' + e));
    }

    return false;
});

const isPdf = computed(() => {
    if (!props.subtitle) return false;
    return props.subtitle.toLowerCase().endsWith('.pdf') || (props.fileUrl && props.fileUrl.toLowerCase().includes('.pdf') && !props.fileUrl.startsWith('blob:'));
});

const getIconClass = computed(() => {
    if (isImage.value) return 'bi bi-image';
    if (isPdf.value) return 'bi bi-file-pdf';
    return 'bi bi-file-earmark';
});

const isFullscreen = ref(true);
const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
};

// Reset fullscreen state when modal closes
watch(() => props.show, (newVal) => {
    if (!newVal) isFullscreen.value = false;
});

const handleEsc = (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
        // Prevent closing modal, just exit fullscreen
        e.stopImmediatePropagation();
        isFullscreen.value = false;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleEsc, true); // Use capture to intercept before Bootstrap
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc, true);
});

const downloadFile = () => {
    emit('download');
};
</script>

<style scoped>
.h-90vh {
    height: 90vh;
}

.h-75vh {
    height: 75vh;
}

.max-h-100 {
    max-height: 100%;
}

.h-fullscreen {
    height: calc(100vh - 150px);
}
</style>
