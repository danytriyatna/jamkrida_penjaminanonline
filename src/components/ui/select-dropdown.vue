<template>
  <select ref="select" class="form-select form-select-solid p-3 fs-7" :data-allow-clear="clearable"
    :disabled="disabled">
    <option value=""></option>
    <template v-for="group in groupedOptions" :key="group.label || group.value">
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
import apiClient from '@/lib/axios';

export default {
  name: 'SelectDropdown',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Pilih opsi...'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    ajaxUrl: {
      type: String,
      default: ''
    },
    extraParams: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showRefresh: {
      type: Boolean,
      default: true
    },
    initialText: {
      type: String,
      default: ''
    },
    dropdownParentSelector: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change', 'refresh', 'select'],
  computed: {
    groupedOptions() {
      return this.options || [];
    }
  },
  watch: {
    modelValue(newVal) {
      if ($(this.$refs.select).val() !== newVal) {
        $(this.$refs.select).val(newVal).trigger('change.select2');
      }
    },
    disabled() {
      this.reinitSelect2();
    },
    options: {
      deep: true,
      handler(newVal, oldVal) {
        // Hanya re-init jika data benar-benar berubah untuk mencegah dropdown menutup sendiri saat background refresh
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.reinitSelect2();
        }
      }
    },
    ajaxUrl() {
      this.reinitSelect2();
    },
    initialText() {
      this.reinitSelect2();
    },
    extraParams: {
      deep: true,
      handler() {
        this.reinitSelect2();
      }
    }
  },
  mounted() {
    this.initSelect2();
  },
  methods: {
    reinitSelect2() {
      // Re-initialize select2 so it picks up the new DOM elements or config
      this.$nextTick(() => {
        const select = $(this.$refs.select);
        if (select.data('select2')) {
          select.select2('destroy');
        }
        this.initSelect2();
      });
    },
    initSelect2() {
      const vm = this;
      const select = $(this.$refs.select);

      const config = {
        placeholder: this.placeholder,
        allowClear: this.clearable,
        dropdownParent: this.dropdownParentSelector ? $(this.dropdownParentSelector) : select.parent(),
        width: '100%',
        minimumInputLength: 0,
        escapeMarkup: (markup) => markup,
        templateResult: (item) => {
          if (!item.id || !item.text) return item.text;
          const parts = item.text.split('||');
          if (parts.length > 1) {
            // Case 4 parts: LOGO || NO_REK || BANK_INFO || AN
            if (parts.length >= 4) {
              let logoHtml = '';
              if (parts[0] && parts[0] !== '-') {
                logoHtml = `<div class="symbol symbol-30px symbol-circle me-3"><img src="/assets/images/partner/${parts[0]}" alt="logo" style="object-fit: contain;"></div>`;
              } else {
                logoHtml = `<div class="symbol symbol-30px symbol-circle me-3 bg-light-primary"><span class="symbol-label fs-8 fw-boldest text-primary text-uppercase">${parts[1].charAt(0)}</span></div>`;
              }

              let html = `<div class="d-flex align-items-center py-2 px-1">
                ${logoHtml}
                <div class="d-flex flex-column">
                  <span class="fs-6 fw-boldest text-gray-900 lh-1 mb-1">${parts[1]}</span>
                  <span class="fs-8 fw-bold text-gray-600 mb-1">${parts[2]}</span>
                  <span class="fs-9 fw-semibold text-gray-500 italic">${parts[3]}</span>
                </div>
              </div>`;
              return $(html);
            }

            // Default 2-3 parts
            let html = '<div class="d-flex flex-column py-3 px-1">';
            html += `<span class="fw-bolder text-primary fs-6 mb-1 text-uppercase">${parts[0]}</span>`;
            if (parts[1]) {
              html += `<span class="fs-8 text-gray-800 dark-text-gray-300 fw-bold mb-1"><i class="ki-outline ki-briefcase fs-6 me-2 text-gray-400"></i>${parts[1]}</span>`;
            }
            if (parts[2]) {
              html += `<span class="fs-8 text-gray-500 dark-text-gray-400 fw-semibold"><i class="ki-outline ki-abstract-24 fs-7 me-2 text-gray-400"></i>${parts[2]}</span>`;
            }
            html += '</div>';
            return $(html);
          }
          return item.text;
        },
        templateSelection: (item) => {
          if (!item.id || !item.text) return item.text;
          const parts = item.text.split('||');
          if (parts.length >= 4) return `${parts[2]} - ${parts[1]}`; // BANK_INFO - NO_REK
          return parts.length > 1 ? parts[0] : item.text;
        }
      };

      if (this.ajaxUrl) {
        config.ajax = {
          url: this.ajaxUrl,
          dataType: 'json',
          delay: 300,
          transport: (params, success, failure) => {
            return apiClient.get(params.url, { params: params.data })
              .then(res => success(res.data))
              .catch(err => failure(err));
          },
          data: (params) => {
            return {
              search: params.term,
              page: params.page || 1,
              ...this.extraParams
            };
          },
          processResults: (data) => {
            const content = data.content || data;
            // Handle nested data from Laravel Paginate: data.data.data
            const items = Array.isArray(content) ? content : (content.data?.data || content.data || []);
            return {
              results: items.map(item => ({
                id: item.id || item.kode_kelurahan || item.kode_kecamatan || item.kode_kabupaten || item.kode_provinsi || item.kode_bank ||
                  item.kode_jabatan || item.kode_unit || item.id_scoring_header || item.id_laporan_keuangan || item.kode_akun,
                text: item.nama_bank || item.nama_provinsi || item.nama_kabupaten || item.nama_kecamatan || item.nama_kelurahan ||
                  item.nama_unit || item.nama_lengkap || item.text || item.nama || item.name
              })),
              pagination: {
                more: (content.data?.current_page || content.current_page) < (content.data?.last_page || content.last_page)
              }
            };
          },
          cache: true
        };
      }

      select.select2(config);

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
              searchField.css('padding-right', '35px'); // Sedikit dikurangi agar pas

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

                // Re-init will destroy and recreate the select2
                vm.reinitSelect2();

                // Emit event to parent in case they want to fetch fresh data
                vm.$emit('refresh');

                // Re-open after re-init
                setTimeout(() => {
                  $(vm.$refs.select).select2('open');
                }, 100);
              });
            }
          }
        });
      });

      // Set initial value correctly
      if (this.modelValue) {
        if (this.ajaxUrl && this.initialText && !select.find(`option[value="${this.modelValue}"]`).length) {
          const newOption = new Option(this.initialText, this.modelValue, true, true);
          select.append(newOption).trigger('change');
        } else {
          select.val(this.modelValue).trigger('change.select2');
        }
      }

      select.on('change select2:select select2:unselect', function (e) {
        const val = $(this).val();
        vm.$emit('update:modelValue', val);
        vm.$emit('change', val);

        if (e.type === 'select2:select') {
          vm.$emit('select', e.params.data);
        } else if (e.type === 'select2:unselect') {
          vm.$emit('select', null);
        }

        // Remove the automatic browser tooltip (title attribute) that Select2 adds
        vm.$nextTick(() => {
          $(this).next().find('.select2-selection__rendered').removeAttr('title');
        });
      });

      // Remove title immediately after init
      vm.$nextTick(() => {
        select.next().find('.select2-selection__rendered').removeAttr('title');
      });
    }
  },
  beforeUnmount() {
    if ($(this.$refs.select).data('select2')) {
      $(this.$refs.select).select2('destroy');
    }
  }
}
</script>

<style>
/* Universal Select2 Theme Adjustments (Metronic 8 Solid) */
.select2-container .select2-selection--single {
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  border: 1px solid #e5e5e5 !important;
}

[data-bs-theme="dark"] .select2-container .select2-selection--single {
  background-color: #1B1C22 !important;
  border-color: var(--bs-gray-300) !important;
  color: #ffffff !important;
}

[data-bs-theme="dark"] .select2-container .select2-selection__rendered {
  color: #cdcdde !important;
}

[data-bs-theme="dark"] .select2-container .select2-dropdown {
  background-color: #1B1C22 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-bs-theme="dark"] .select2-container .select2-results__option--highlighted {
  background-color: #1B1C22 !important;
}

/* Custom Text Dark Mode Helpers */
[data-bs-theme="dark"] .dark-text-gray-300 {
  color: #cdcdde !important;
}

[data-bs-theme="dark"] .dark-text-gray-400 {
  color: #a1a1af !important;
}
</style>
