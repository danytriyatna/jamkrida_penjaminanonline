<template>
  <button
    :type="type"
    class="btn d-inline-flex align-items-center justify-content-center transition-all fw-semibold"
    :class="[
      buttonVariantClass,
      buttonSizeClass,
      pill ? 'rounded-pill' : '',
      block ? 'w-100' : ''
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
    <i v-else-if="icon && iconPosition === 'left'" :class="[icon, 'me-2', iconSizeClass]"></i>

    <span><slot>{{ label }}</slot></span>

    <i v-if="!loading && icon && iconPosition === 'right'" :class="[icon, 'ms-2', iconSizeClass]"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  variant: { type: String, default: 'primary' }, // primary, secondary, success, danger, warning, info, light, dark
  soft: { type: Boolean, default: false }, // btn-light-primary style
  outline: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // sm, md, lg
  icon: { type: String, default: '' },
  iconPosition: { type: String, default: 'left' }, // left, right
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  pill: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' }
})

defineEmits(['click'])

const buttonVariantClass = computed(() => {
  if (props.soft) return `btn-light-${props.variant}`
  if (props.outline) return `btn-outline-${props.variant}`
  return `btn-${props.variant}`
})

const buttonSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'btn-sm fs-8 px-3 py-2'
    case 'lg': return 'btn-lg fs-6 px-6 py-3'
    default: return 'fs-7 px-4 py-2'
  }
})

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'fs-7'
    case 'lg': return 'fs-4'
    default: return 'fs-6'
  }
})
</script>
