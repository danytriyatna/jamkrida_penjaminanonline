<template>
  <div class="card mb-5 mb-xl-10">
    <!--begin::Card header-->
    <div class="card-header border-0 cursor-pointer" role="button">
      <!--begin::Card title-->
      <div class="card-title m-0">
        <h3 class="fw-bold m-0">Pengaturan Tampilan & Identitas Web</h3>
      </div>
      <!--end::Card title-->
    </div>
    <!--begin::Card header-->

    <!--begin::Content-->
    <div class="card-body border-top p-9">
      <div v-if="settingsStore.error" class="alert alert-danger d-flex align-items-center p-5 mb-10">
        <div class="d-flex flex-column">
          <h4 class="mb-1 text-dark">Terjadi Kesalahan</h4>
          <span>{{ settingsStore.error }}</span>
        </div>
      </div>

      <!--begin::Form-->
      <form @submit.prevent="onSaveSettings" class="form">
        <!--begin::Group: Branding-->
        <h5 class="text-gray-900 fw-bold mb-6">1. Branding & Identitas Visual</h5>
        
        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Nama Aplikasi</label>
          <div class="col-lg-8">
            <input
              type="text"
              class="form-control form-control-lg form-control-solid"
              v-model="form.appName"
              placeholder="Masukkan nama aplikasi"
              required
            />
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Warna Primer (Primary Hex)</label>
          <div class="col-lg-8 d-flex align-items-center gap-3">
            <input
              type="color"
              class="form-control form-control-color border-0 bg-transparent p-0 w-40px h-40px"
              v-model="form.primaryColor"
            />
            <input
              type="text"
              class="form-control form-control-lg form-control-solid w-150px"
              v-model="form.primaryColor"
              placeholder="#3f80ea"
              pattern="^#[a-fA-F0-9]{3,6}$"
              required
            />
            <span class="text-muted fs-7">Warna utama tombol, link, & menu aktif</span>
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Warna Sekunder (Secondary Hex)</label>
          <div class="col-lg-8 d-flex align-items-center gap-3">
            <input
              type="color"
              class="form-control form-control-color border-0 bg-transparent p-0 w-40px h-40px"
              v-model="form.secondaryColor"
            />
            <input
              type="text"
              class="form-control form-control-lg form-control-solid w-150px"
              v-model="form.secondaryColor"
              placeholder="#e5a93c"
              pattern="^#[a-fA-F0-9]{3,6}$"
              required
            />
            <span class="text-muted fs-7">Warna aksen/CTA & peringatan</span>
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Font Family</label>
          <div class="col-lg-8">
            <Multiselect
              v-model="form.fontFamily"
              :options="fontOptions"
              placeholder="Pilih Font Aplikasi"
              class="form-control form-control-solid p-0 border-0"
            />
          </div>
        </div>

        <div class="separator separator-dashed my-6"></div>

        <!--begin::Group: Assets-->
        <h5 class="text-gray-900 fw-bold mb-6">2. Unggah Media Asset</h5>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Logo Utama</label>
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-5 mb-3">
              <div v-if="settingsStore.logoUrl" class="symbol symbol-75px bg-light p-3 border">
                <img :src="settingsStore.logoUrl" alt="Logo" class="object-fit-contain" />
              </div>
              <div v-else class="text-muted border p-3 rounded bg-light fs-7 w-75px h-75px d-flex align-items-center justify-content-center">
                No Logo
              </div>
              <div class="d-flex flex-column">
                <input
                  type="file"
                  class="form-control form-control-solid fs-7 w-auto"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  @change="onLogoChange"
                />
                <span class="text-muted fs-8 mt-1">Format: PNG, JPG, SVG. Maks: 2MB.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Favicon</label>
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-5 mb-3">
              <div v-if="settingsStore.faviconUrl" class="symbol symbol-40px bg-light p-2 border">
                <img :src="settingsStore.faviconUrl" alt="Favicon" class="object-fit-contain" />
              </div>
              <div v-else class="text-muted border p-2 rounded bg-light fs-7 w-40px h-40px d-flex align-items-center justify-content-center">
                No Fav
              </div>
              <div class="d-flex flex-column">
                <input
                  type="file"
                  class="form-control form-control-solid fs-7 w-auto"
                  accept="image/png, image/x-icon"
                  @change="onFaviconChange"
                />
                <span class="text-muted fs-8 mt-1">Format: ICO, PNG. Maks: 512KB.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="separator separator-dashed my-6"></div>

        <!--begin::Group: Kontak & General-->
        <h5 class="text-gray-900 fw-bold mb-6">3. Informasi Kontak & Footer</h5>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Footer Text</label>
          <div class="col-lg-8">
            <input
              type="text"
              class="form-control form-control-lg form-control-solid"
              v-model="form.footerText"
              placeholder="Teks hak cipta di bagian bawah layout"
              required
            />
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Email Kontak</label>
          <div class="col-lg-8">
            <input
              type="email"
              class="form-control form-control-lg form-control-solid"
              v-model="form.contactEmail"
              placeholder="email@perusahaan.com"
              required
            />
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Telepon Kontak</label>
          <div class="col-lg-8">
            <input
              type="text"
              class="form-control form-control-lg form-control-solid"
              v-model="form.contactPhone"
              placeholder="021-xxxxxxxx"
              required
            />
          </div>
        </div>

        <div class="separator separator-dashed my-6"></div>

        <!--begin::Group: SEO-->
        <h5 class="text-gray-900 fw-bold mb-6">4. Optimasi Search Engine (SEO)</h5>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Meta Deskripsi</label>
          <div class="col-lg-8">
            <textarea
              class="form-control form-control-lg form-control-solid"
              rows="3"
              v-model="form.metaDescription"
              placeholder="Deskripsi singkat untuk pencarian Google"
            ></textarea>
          </div>
        </div>

        <div class="row mb-6">
          <label class="col-lg-4 col-form-label fw-semibold fs-6">Meta Keywords</label>
          <div class="col-lg-8">
            <input
              type="text"
              class="form-control form-control-lg form-control-solid"
              v-model="form.metaKeywords"
              placeholder="kata-kunci, jamkrida, klaim, dll"
            />
          </div>
        </div>

        <!--begin::Actions-->
        <div class="card-footer d-flex justify-content-end py-6 px-9">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            <span v-if="!saving">Simpan Pengaturan</span>
            <span v-else>
              Menyimpan...
              <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          </button>
        </div>
        <!--end::Actions-->
      </form>
      <!--end::Form-->
    </div>
    <!--end::Content-->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useSettingsStore } from "@/stores/settings";
import Multiselect from "@vueform/multiselect";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "app-settings",
  components: {
    Multiselect,
  },
  setup() {
    const settingsStore = useSettingsStore();
    const saving = ref(false);

    const fontOptions = ["Inter", "Roboto", "Poppins", "Nunito"];

    const form = ref({
      appName: "",
      primaryColor: "",
      secondaryColor: "",
      fontFamily: "Inter",
      footerText: "",
      contactEmail: "",
      contactPhone: "",
      metaDescription: "",
      metaKeywords: "",
    });

    const initForm = () => {
      form.value = {
        appName: settingsStore.appName,
        primaryColor: settingsStore.primaryColor,
        secondaryColor: settingsStore.secondaryColor,
        fontFamily: settingsStore.fontFamily,
        footerText: settingsStore.footerText,
        contactEmail: settingsStore.contactEmail,
        contactPhone: settingsStore.contactPhone,
        metaDescription: settingsStore.metaDescription,
        metaKeywords: settingsStore.metaKeywords,
      };
    };

    onMounted(async () => {
      await settingsStore.fetchSettings();
      initForm();
    });

    const onSaveSettings = async () => {
      saving.value = true;
      try {
        await settingsStore.updateSettings(form.value);
        Swal.fire({
          text: "Konfigurasi web berhasil disimpan dan diterapkan secara instan!",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        Swal.fire({
          text: settingsStore.error || "Gagal menyimpan konfigurasi web.",
          icon: "error",
          buttonsStyling: false,
          confirmButtonText: "Coba Lagi",
          customClass: {
            confirmButton: "btn btn-danger",
          },
        });
      } finally {
        saving.value = false;
      }
    };

    const onLogoChange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        await settingsStore.uploadLogo(file);
        Swal.fire({
          text: "Logo aplikasi berhasil diunggah!",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        Swal.fire({
          text: settingsStore.error || "Gagal mengunggah logo.",
          icon: "error",
          buttonsStyling: false,
          confirmButtonText: "Coba Lagi",
          customClass: {
            confirmButton: "btn btn-danger",
          },
        });
      }
    };

    const onFaviconChange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        await settingsStore.uploadFavicon(file);
        Swal.fire({
          text: "Favicon berhasil diunggah!",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        Swal.fire({
          text: settingsStore.error || "Gagal mengunggah favicon.",
          icon: "error",
          buttonsStyling: false,
          confirmButtonText: "Coba Lagi",
          customClass: {
            confirmButton: "btn btn-danger",
          },
        });
      }
    };

    return {
      settingsStore,
      saving,
      fontOptions,
      form,
      onSaveSettings,
      onLogoChange,
      onFaviconChange,
    };
  },
});
</script>
