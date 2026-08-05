<template>
  <div class="card shadow-sm border-0 rounded-4 overflow-hidden" :class="cardClass">
    <!-- Header -->
    <div
      v-if="title || $slots.header || $slots.actions"
      class="card-header border-0 pt-6 pb-2 px-7 d-flex align-items-center justify-content-between bg-transparent"
    >
      <div class="card-title d-flex align-items-center gap-3 m-0">
        <div
          v-if="icon"
          class="w-35px h-35px rounded-circle d-flex align-items-center justify-content-center"
          :class="`bg-light-${variant}`"
        >
          <i :class="[icon, `text-${variant}`, 'fs-4']"></i>
        </div>
        <div>
          <h3 class="fw-bold text-dark fs-5 m-0">{{ title }}</h3>
          <span v-if="subtitle" class="text-muted fs-8 fw-medium d-block mt-1">{{ subtitle }}</span>
        </div>
      </div>
      <div v-if="$slots.actions" class="card-toolbar d-flex align-items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body px-7" :class="[paddingClass, bodyClass]">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="card-footer border-0 pb-6 pt-0 px-7 bg-transparent">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  variant: { type: String, default: 'primary' },
  cardClass: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  dense: { type: Boolean, default: false }
})

const paddingClass = computed(() => (props.dense ? 'py-4' : 'py-6'))
</script>

<style scoped>
[data-bs-theme="dark"] .card {
  background-color: #1e1e2d !important;
  border: 1px solid #2b2b40 !important;
}
[data-bs-theme="dark"] .card-title h3 {
  color: #ffffff !important;
}
</style>
