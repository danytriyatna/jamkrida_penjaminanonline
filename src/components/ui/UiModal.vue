<template>
  <div
    v-if="modelValue"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1055;"
    @click.self="handleBackdropClick"
  >
    <div
      class="modal-dialog modal-dialog-centered"
      :class="[
        sizeClass,
        scrollable ? 'modal-dialog-scrollable' : ''
      ]"
    >
      <div class="modal-content border-0 shadow-lg rounded-4">
        <!-- Header -->
        <div class="modal-header border-0 pb-0 pt-6 px-7 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div
              v-if="icon"
              class="w-40px h-40px rounded-circle d-flex align-items-center justify-content-center"
              :class="iconBgClass"
            >
              <i :class="[icon, iconColorClass, 'fs-3']"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold text-dark fs-4 mb-0">{{ title }}</h5>
              <p v-if="subtitle" class="text-muted fs-8 mb-0 mt-1">{{ subtitle }}</p>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-icon btn-sm btn-active-light-primary rounded-circle"
            @click="close"
            aria-label="Close"
          >
            <i class="ki-outline ki-cross fs-2 text-gray-500"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body py-6 px-7">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer || showDefaultFooter" class="modal-footer border-0 pt-0 pb-6 px-7 bg-transparent">
          <slot name="footer">
            <button type="button" class="btn btn-light" @click="close">
              {{ cancelText }}
            </button>
            <button
              v-if="showConfirm"
              type="button"
              class="btn"
              :class="confirmBtnClass"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Modal Title' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  variant: { type: String, default: 'primary' }, // primary, success, danger, warning, info
  size: { type: String, default: 'md' }, // sm, md, lg, xl
  scrollable: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
  showDefaultFooter: { type: Boolean, default: true },
  showConfirm: { type: Boolean, default: true },
  cancelText: { type: String, default: 'Batal' },
  confirmText: { type: String, default: 'Simpan' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'modal-sm'
    case 'lg': return 'modal-lg'
    case 'xl': return 'modal-xl'
    default: return ''
  }
})

const iconBgClass = computed(() => `bg-light-${props.variant}`)
const iconColorClass = computed(() => `text-${props.variant}`)
const confirmBtnClass = computed(() => `btn-${props.variant}`)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Manage body overflow when modal is open
watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
[data-bs-theme="dark"] .modal-content {
  background-color: #1e1e2d !important;
  color: #cdcdde !important;
  border: 1px solid #2b2b40 !important;
}
[data-bs-theme="dark"] .modal-title {
  color: #ffffff !important;
}
</style>
