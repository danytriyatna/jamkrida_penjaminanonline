<template>
  <div
    v-if="visible"
    class="alert d-flex align-items-center p-5 rounded-3 mb-5 border-0 shadow-xs"
    :class="[`alert-${variant}`, `bg-light-${variant}`]"
    role="alert"
  >
    <div
      v-if="icon"
      class="w-40px h-40px rounded-circle d-flex align-items-center justify-content-center me-4 flex-shrink-0 shadow-xs"
      :class="`bg-${variant}`"
    >
      <i :class="[icon, 'fs-3 text-white']" style="color: #ffffff !important;"></i>
    </div>
    <div class="d-flex flex-column flex-grow-1">
      <h5 v-if="title" class="mb-1 fw-bold" :class="`text-${variant}`">{{ title }}</h5>
      <div class="fs-7 alert-message-body">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="btn-close ms-3"
      @click="dismiss"
      aria-label="Close"
    ></button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  variant: { type: String, default: 'primary' }, // primary, success, danger, warning, info
  icon: { type: String, default: '' },
  dismissible: { type: Boolean, default: false }
})

const emit = defineEmits(['dismiss'])
const visible = ref(true)

const dismiss = () => {
  visible.value = false
  emit('dismiss')
}
</script>

<style scoped>
.alert-message-body {
  color: inherit;
}

/* Dark Mode Support for Alert Banners */
[data-bs-theme="dark"] .alert {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
[data-bs-theme="dark"] .alert-primary {
  background-color: rgba(44, 54, 145, 0.25) !important;
  color: #a5b4fc !important;
}
[data-bs-theme="dark"] .alert-success {
  background-color: rgba(13, 150, 72, 0.25) !important;
  color: #86efac !important;
}
[data-bs-theme="dark"] .alert-warning {
  background-color: rgba(255, 199, 0, 0.25) !important;
  color: #fde047 !important;
}
[data-bs-theme="dark"] .alert-danger {
  background-color: rgba(241, 65, 108, 0.25) !important;
  color: #fca5a5 !important;
}
[data-bs-theme="dark"] .alert-info {
  background-color: rgba(114, 57, 234, 0.25) !important;
  color: #d8b4fe !important;
}
[data-bs-theme="dark"] .btn-close {
  filter: invert(1);
}
</style>
