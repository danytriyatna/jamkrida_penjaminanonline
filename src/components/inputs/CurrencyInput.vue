<template>
  <div class="input-group">
    <span class="input-group-text bg-light-primary text-primary fw-bold border-0 px-3">Rp</span>
    <input
      ref="inputRef"
      class="form-control form-control-solid text-end"
      :class="inputClass"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useCurrencyInput } from "vue-currency-input";

const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    placeholder?: string;
    disabled?: boolean;
    inputClass?: string;
  }>(),
  {
    modelValue: null,
    placeholder: "0",
    disabled: false,
    inputClass: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

const { inputRef, numberValue, setValue } = useCurrencyInput(
  {
    locale: "id-ID",
    currency: "IDR",
    currencyDisplay: "hidden" as any, // Rp shown manually as input-group-text prefix
    precision: 0,
    autoDecimalDigits: false,
    valueRange: { min: 0 },
  },
  false // do NOT auto-emit; we handle it below
);

// Sync internal value → parent
watch(numberValue, (val) => {
  emit("update:modelValue", val ?? null);
});

// Sync parent → internal (e.g., when editing an existing record)
watch(
  () => props.modelValue,
  (val) => {
    setValue(val ?? 0);
  }
);
</script>
