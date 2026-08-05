<template>
    <div class="position-relative w-100">
        <input v-bind="$attrs" :type="type" :value="modelValue" class="form-control rounded-3 pe-clearable"
            :placeholder="placeholder" :maxlength="maxlength" :disabled="disabled" :readonly="readonly"
            @input="$emit('update:modelValue', $event.target.value)" />

        <button v-if="clearable && modelValue && !disabled && !readonly" type="button"
            class="btn btn-icon btn-sm btn-active-color-primary position-absolute end-0 top-50 translate-middle-y me-1 bg-transparent border-0 h-30px w-30px z-index-2"
            @click="clear" title="Bersihkan">
            <i class="ki-outline ki-cross fs-2 opacity-50 opacity-100-hover"></i>
        </button>
    </div>
</template>

<script>
export default {
    inheritAttrs: false
}
</script>

<script setup>
defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    maxlength: {
        type: [String, Number],
        default: ''
    },
    clearable: {
        type: Boolean,
        default: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'clear']);

const clear = () => {
    emit('update:modelValue', '');
    emit('clear');
};
</script>

<style scoped>
.form-control.pe-clearable {
    padding-right: 2rem !important;
}

.btn-icon:hover i {
    color: var(--bs-primary) !important;
}
</style>
