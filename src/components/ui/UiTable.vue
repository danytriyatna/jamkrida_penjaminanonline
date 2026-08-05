<template>
  <div class="table-responsive rounded-3 border border-gray-200">
    <table class="table align-middle table-row-dashed fs-7 gy-4 mb-0">
      <thead class="bg-light">
        <tr class="text-start text-gray-500 fw-bold fs-8 text-uppercase ls-1">
          <th v-if="selectable" class="w-10px ps-4">
            <div class="form-check form-check-sm form-check-custom form-check-solid">
              <input
                class="form-check-input"
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </div>
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[col.headerClass || '', col.align ? `text-${col.align}` : '']"
            :style="{ width: col.width || 'auto' }"
          >
            {{ col.label }}
          </th>
          <th v-if="$slots.actions" class="text-end pe-4">Aksi</th>
        </tr>
      </thead>
      <tbody class="fw-semibold text-gray-700">
        <template v-if="loading">
          <tr>
            <td :colspan="totalColumns" class="text-center py-10">
              <div class="spinner-border text-primary me-2" role="status"></div>
              <span class="text-muted fs-7">Memuat data...</span>
            </td>
          </tr>
        </template>
        <template v-else-if="items && items.length > 0">
          <tr v-for="(item, index) in items" :key="item.id || index" class="hover-bg-light transition-all">
            <td v-if="selectable" class="ps-4">
              <div class="form-check form-check-sm form-check-custom form-check-solid">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="item.id || index"
                  v-model="selectedIds"
                />
              </div>
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[col.cellClass || '', col.align ? `text-${col.align}` : '']"
            >
              <slot :name="`cell(${col.key})`" :item="item" :index="index" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="text-end pe-4">
              <slot name="actions" :item="item" :index="index"></slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td :colspan="totalColumns" class="text-center py-10 text-muted">
              <i class="ki-outline ki-folder-missing fs-3x d-block mb-3 text-gray-400"></i>
              <span class="fw-bold fs-7">{{ emptyText }}</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key: 'name', label: 'Nama', align: 'start', width: '200px' }]
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  emptyText: { type: String, default: 'Belum ada data tersedia' }
})

const emit = defineEmits(['selection-change'])
const selectedIds = ref([])

const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  return count
})

const isAllSelected = computed(() => {
  if (!props.items.length) return false
  return selectedIds.value.length === props.items.length
})

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedIds.value = props.items.map((item, idx) => item.id || idx)
  } else {
    selectedIds.value = []
  }
}

watch(selectedIds, (newVal) => {
  emit('selection-change', newVal)
})
</script>

<style scoped>
[data-bs-theme="dark"] .table-responsive {
  border-color: #2b2b40 !important;
}
[data-bs-theme="dark"] table thead {
  background-color: #1b1b29 !important;
}
[data-bs-theme="dark"] table thead th {
  color: #a1a5b7 !important;
}
[data-bs-theme="dark"] table tbody td {
  color: #cdcdde !important;
  border-color: #2b2b40 !important;
}
[data-bs-theme="dark"] .hover-bg-light:hover {
  background-color: #2b2b40 !important;
}
</style>
