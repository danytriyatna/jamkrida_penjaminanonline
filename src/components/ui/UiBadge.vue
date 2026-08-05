<template>
  <span
    class="badge font-medium transition-all"
    :class="[
      soft ? `badge-light-${variant}` : `badge-${variant}`,
      pill ? 'rounded-pill' : 'rounded-2',
      sizeClass,
      customClass
    ]"
  >
    <i v-if="icon" :class="[icon, 'me-1']"></i>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  variant: { type: String, default: 'primary' }, // primary, success, danger, warning, info, dark, secondary
  soft: { type: Boolean, default: true },
  pill: { type: Boolean, default: true },
  size: { type: String, default: 'md' }, // sm, md, lg
  icon: { type: String, default: '' },
  customClass: { type: String, default: '' }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-2 py-1 fs-9'
    case 'lg': return 'px-4 py-2 fs-7'
    default: return 'px-3 py-1 fs-8'
  }
})
</script>
