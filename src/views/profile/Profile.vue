<template>
  <div class="d-flex flex-column gap-5 gap-xl-10">
    <!-- Header Card -->
    <div class="card mb-5 mb-xl-10">
      <div class="card-body pt-9 pb-0">
        <div class="d-flex flex-wrap flex-sm-nowrap mb-3">
          <!-- begin::Pic -->
          <div class="me-7 mb-4">
            <div class="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative border p-1 rounded bg-light">
              <img
                :src="avatarPreviewUrl || getAssetPath('media/avatars/300-1.jpg')"
                alt="Foto Profil"
                class="object-fit-cover rounded"
                style="width: 150px; height: 150px;"
              />
              <div class="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div>
            </div>
          </div>
          <!-- end::Pic -->

          <!-- begin::Info -->
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <span class="text-gray-900 fs-2 fw-bold me-1">
                    {{ user?.name || 'User' }}
                  </span>
                  <span class="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                    {{ user?.role?.nama || 'Staff' }}
                  </span>
                </div>

                <div class="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                  <span class="d-flex align-items-center text-gray-500 me-5 mb-2">
                    <KTIcon icon-name="sms" icon-class="fs-4 text-primary me-1" />
                    {{ user?.email }}
                  </span>
                  <span class="d-flex align-items-center text-gray-500 mb-2">
                    <KTIcon icon-name="shield-tick" icon-class="fs-4 text-success me-1" />
                    Kode Akses: {{ user?.role?.kode }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Avatar Uploader & Canvas Cropper -->
            <div class="d-flex my-4 align-items-center gap-4">
              <input
                type="file"
                ref="fileInput"
                class="d-none"
                accept="image/png, image/jpeg, image/jpg"
                @change="onFileSelected"
              />
              <button
                type="button"
                class="btn btn-sm btn-light-primary"
                @click="fileInput?.click()"
                :disabled="uploadingAvatar"
              >
                Pilih Foto
              </button>

              <button
                v-if="croppedFile"
                type="button"
                class="btn btn-sm btn-primary"
                @click="onUploadAvatar"
                :disabled="uploadingAvatar"
              >
                <span v-if="!uploadingAvatar">Unggah & Simpan</span>
                <span v-else>
                  Mengunggah...
                  <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                </span>
              </button>

              <span v-if="croppedFile" class="text-muted fs-8">
                *Foto profil telah di-crop otomatis rasio 1:1
              </span>
            </div>
          </div>
          <!-- end::Info -->
        </div>
      </div>
    </div>

    <!-- Forms Section -->
    <div class="row g-5 g-xl-10">
      <!-- Ubah Profil Form -->
      <div class="col-lg-6">
        <div class="card mb-5 mb-xl-10 h-100">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label fw-bold text-gray-900 fs-4">Ubah Data Profil</span>
              <span class="text-muted mt-1 fw-semibold fs-7">Perbarui nama dan alamat email login Anda</span>
            </h3>
          </div>

          <div class="card-body border-top p-9">
            <div v-if="profileError" class="alert alert-danger p-4 mb-5">
              {{ profileError }}
            </div>

            <div v-if="emailPendingNotice" class="alert alert-warning p-4 mb-5 fs-7 d-flex flex-column gap-1">
              <span class="fw-bold">Verifikasi Email Baru Diperlukan:</span>
              <span>Mohon konfirmasi tautan verifikasi yang dikirimkan ke email <strong>{{ emailPendingNotice }}</strong> agar dapat menggunakan email tersebut untuk login.</span>
            </div>

            <form @submit.prevent="onUpdateProfile">
              <div class="mb-6">
                <label class="form-label required fw-semibold fs-6">Nama Lengkap</label>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  v-model="profileForm.name"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              <div class="mb-8">
                <label class="form-label required fw-semibold fs-6">Email Login</label>
                <input
                  type="email"
                  class="form-control form-control-solid"
                  v-model="profileForm.email"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div class="d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="updatingProfile"
                >
                  <span v-if="!updatingProfile">Simpan Perubahan</span>
                  <span v-else>
                    Menyimpan...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Ubah Password Form -->
      <div class="col-lg-6">
        <div class="card mb-5 mb-xl-10 h-100">
          <div class="card-header border-0 pt-5">
            <h3 class="card-title align-items-start flex-column">
              <span class="card-label fw-bold text-gray-900 fs-4">Keamanan & Ubah Password</span>
              <span class="text-muted mt-1 fw-semibold fs-7">Ganti password secara berkala untuk menjaga keamanan akun</span>
            </h3>
          </div>

          <div class="card-body border-top p-9">
            <div v-if="passwordError" class="alert alert-danger p-4 mb-5">
              {{ passwordError }}
            </div>

            <form @submit.prevent="onUpdatePassword">
              <div class="mb-6">
                <label class="form-label required fw-semibold fs-6">Password Saat Ini</label>
                <input
                  type="password"
                  class="form-control form-control-solid"
                  v-model="passwordForm.currentPassword"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div class="mb-6">
                <label class="form-label required fw-semibold fs-6">Password Baru</label>
                <input
                  type="password"
                  class="form-control form-control-solid"
                  v-model="passwordForm.newPassword"
                  placeholder="Min 8 karakter"
                  required
                />
              </div>

              <div class="mb-8">
                <div class="form-check form-check-custom form-check-solid">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="passwordForm.logoutOthers"
                    id="logout_others"
                  />
                  <label class="form-check-label fw-bold text-gray-800 fs-7" for="logout_others">
                    Logout dari seluruh perangkat lain (invalidasi sesi lain)
                  </label>
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="updatingPassword"
                >
                  <span v-if="!updatingPassword">Ganti Password</span>
                  <span v-else>
                    Memperbarui...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent, onMounted, ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "user-profile",
  setup() {
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);

    const profileForm = ref({
      name: "",
      email: "",
    });

    const passwordForm = ref({
      currentPassword: "",
      newPassword: "",
      logoutOthers: false,
    });

    const fileInput = ref<HTMLInputElement | null>(null);
    const croppedFile = ref<File | null>(null);
    const avatarPreviewUrl = ref<string | null>(null);

    const uploadingAvatar = ref(false);
    const updatingProfile = ref(false);
    const updatingPassword = ref(false);

    const profileError = ref<string | null>(null);
    const passwordError = ref<string | null>(null);
    const emailPendingNotice = ref<string | null>(null);

    const getAvatarAbsoluteUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
      }
      const baseUrl = import.meta.env.VITE_APP_API_URL.replace(/\/api$/, "");
      return `${baseUrl}/storage/${path}`;
    };

    const initProfileForm = () => {
      if (user.value) {
        profileForm.value.name = user.value.name;
        profileForm.value.email = user.value.email;
        avatarPreviewUrl.value = getAvatarAbsoluteUrl(user.value.avatarPath as string | null);
      }
    };

    onMounted(async () => {
      // Re-fetch user profile to get freshest data
      if (authStore.isAuthenticated) {
        await authStore.verifyAuth();
        initProfileForm();
      }
    });

    // HTML5 Canvas client-side 1:1 center cropper
    const onFileSelected = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          // Crop square from center of image
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, startX, startY, size, size, 0, 0, 300, 300);
            canvas.toBlob((blob) => {
              if (blob) {
                const cropped = new File([blob], file.name, { type: file.type });
                croppedFile.value = cropped;
                avatarPreviewUrl.value = URL.createObjectURL(blob);
              }
            }, file.type);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };

    const onUploadAvatar = async () => {
      if (!croppedFile.value) return;

      uploadingAvatar.value = true;
      const formData = new FormData();
      formData.append("avatar", croppedFile.value);

      try {
        const res = await ApiService.post("profile/avatar", formData);
        
        // Update user state in Pinia store
        authStore.user = res.data.data;
        croppedFile.value = null;

        Swal.fire({
          text: "Foto profil berhasil diperbarui!",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        Swal.fire({
          text: err.response?.data?.message || "Gagal mengunggah foto profil.",
          icon: "error",
          buttonsStyling: false,
          confirmButtonText: "Mengerti",
          customClass: {
            confirmButton: "btn btn-danger",
          },
        });
      } finally {
        uploadingAvatar.value = false;
      }
    };

    const onUpdateProfile = async () => {
      updatingProfile.value = true;
      profileError.value = null;
      emailPendingNotice.value = null;

      try {
        const res = await ApiService.put("profile", {
          name: profileForm.value.name,
          email: profileForm.value.email,
        });

        // Update auth state
        authStore.user = res.data.data;

        // Check if there is pending email verification
        if (res.data.data.pendingEmail) {
          emailPendingNotice.value = res.data.data.pendingEmail;
        }

        Swal.fire({
          text: res.data.message || "Profil berhasil diperbarui.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        profileError.value = err.response?.data?.message || "Gagal memperbarui profil.";
      } finally {
        updatingProfile.value = false;
      }
    };

    const onUpdatePassword = async () => {
      updatingPassword.value = true;
      passwordError.value = null;

      try {
        await ApiService.put("profile/password", {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword,
          logoutOthers: passwordForm.value.logoutOthers,
        });

        passwordForm.value = {
          currentPassword: "",
          newPassword: "",
          logoutOthers: false,
        };

        Swal.fire({
          text: "Password berhasil diperbarui!",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: "btn btn-primary",
          },
        });
      } catch (err: any) {
        passwordError.value = err.response?.data?.message || "Gagal memperbarui password.";
      } finally {
        updatingPassword.value = false;
      }
    };

    return {
      user,
      profileForm,
      passwordForm,
      fileInput,
      croppedFile,
      avatarPreviewUrl,
      uploadingAvatar,
      updatingProfile,
      updatingPassword,
      profileError,
      passwordError,
      emailPendingNotice,
      onFileSelected,
      onUploadAvatar,
      onUpdateProfile,
      onUpdatePassword,
      getAssetPath,
    };
  },
});
</script>
