<template>
  <select ref="select" class="form-select form-select-solid" multiple>
    <option value=""></option>
    <template v-for="group in options" :key="group.label || group.value">
      <optgroup v-if="group.children && group.children.length > 0" :label="group.label">
        <option v-for="option in group.children" :value="option.value" :key="option.value" :disabled="option.disabled">
          {{ option.text }}
        </option>
      </optgroup>
      <option v-else :value="group.value" :disabled="group.disabled">
        {{ group.text }}
      </option>
    </template>
  </select>
</template>

<script>
/* global $ */
export default {
  name: 'SelectDropdownMultiple',
  props: {
    options: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Pilih...'
    },
    showRefresh: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change', 'multiple'],
  watch: {
    modelValue: {
      handler(newVal) {
        const select = $(this.$refs.select);
        if (JSON.stringify(select.val()) !== JSON.stringify(newVal)) {
          select.val(newVal).trigger('change.select2');
        }
      },
      deep: true
    },
    options: {
      handler() {
        this.$nextTick(() => {
          this.reinitSelect2();
        });
      },
      deep: true
    }
  },
  mounted() {
    this.initSelect2();
  },
  methods: {
    initSelect2() {
      const vm = this;
      const select = $(this.$refs.select);

      select.select2({
        placeholder: this.placeholder,
        allowClear: true,
        dropdownParent: select.parent(),
        escapeMarkup: (markup) => markup,
        templateResult: function (data) {
          if (!data.id) {
            return data.text;
          }
          if (data.text && data.text.includes('||')) {
            const parts = data.text.split('||');
            let html = '<div class="d-flex flex-column py-3 px-1">';
            html += `<span class="fw-bolder text-primary fs-6 mb-1 text-uppercase">${parts[0]}</span>`;
            if (parts[1]) {
              html += `<span class="fs-8 text-gray-800 fw-bold mb-1"><i class="ki-outline ki-briefcase fs-6 me-2 text-gray-400"></i>${parts[1]}</span>`;
            }
            if (parts[2]) {
              html += `<span class="fs-8 text-gray-500 fw-semibold"><i class="ki-outline ki-abstract-24 fs-7 me-2 text-gray-400"></i>${parts[2]}</span>`;
            }
            html += '</div>';
            return $(html);
          }
          return data.text;
        },
        templateSelection: function (data) {
          if (!data.id) {
            return data.text;
          }
          if (data.text && data.text.includes('||')) {
            const parts = data.text.split('||');
            return parts[0];
          }
          return data.text;
        }
      })
        .val(this.modelValue)
        .trigger('change')
        .on('change', function () {
          const val = $(this).val() || [];
          vm.$emit('update:modelValue', val);
          vm.$emit('change', val);
          vm.$emit('multiple', val);
        });

      // Inject Refresh Button in Search Area
      select.on('select2:open', () => {
        if (!vm.showRefresh) return;

        vm.$nextTick(() => {
          const container = select.data('select2').dropdown.$dropdown;
          if (container && container.length) {
            const searchContainer = container.find('.select2-search--dropdown');
            if (searchContainer.length && !searchContainer.find('.btn-refresh-select2').length) {
              searchContainer.addClass('position-relative');
              const searchField = searchContainer.find('.select2-search__field');
              searchField.css('padding-right', '35px');

              const refreshBtn = $(`
                <button type="button" class="btn btn-icon btn-sm btn-active-color-primary position-absolute btn-refresh-select2" 
                  style="right: 20px; top: 50%; transform: translateY(-50%); z-index: 10;" 
                  title="Segarkan Data">
                  <i class="ki-outline ki-arrows-circle fs-5"></i>
                </button>
              `);

              searchContainer.append(refreshBtn);

              refreshBtn.on('mousedown click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                vm.reinitSelect2();
                vm.$emit('refresh');

                setTimeout(() => {
                  $(vm.$refs.select).select2('open');
                }, 100);
              });
            }
          }
        });
      });
    },
    reinitSelect2() {
      const select = $(this.$refs.select);
      if (select.data('select2')) {
        select.select2('destroy');
      }
      this.initSelect2();
    }
  },
  beforeUnmount() {
    const select = $(this.$refs.select);
    if (select.data('select2')) {
      select.select2('destroy');
    }
  }
}
</script>

<style>
.select2-container--bootstrap5 .select2-selection--multiple:not(.form-select-sm):not(.form-select-lg) .select2-selection__choice .select2-selection__choice__display {
  margin-left: 1.1rem;
  font-size: inherit !important;
}
</style>
