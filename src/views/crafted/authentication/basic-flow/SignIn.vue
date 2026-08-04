<template>
  <!--begin::Wrapper-->
  <div class="w-lg-500px p-10">
    <!-- Lockout state countdown screen -->
    <div v-if="lockoutCountdown > 0" class="text-center py-10">
      <div class="mb-8">
        <div class="d-flex justify-content-center mb-6">
          <div class="symbol symbol-100px symbol-fixed position-relative border border-dashed border-danger p-4 rounded bg-light-danger">
            <KTIcon icon-name="lock-2" icon-class="fs-3x text-danger" />
          </div>
        </div>
        <h1 class="text-gray-900 mb-3 fs-2 fw-bold">Akun Terkunci Sementara</h1>
        <p class="text-gray-500 fs-6">
          Terlalu banyak percobaan login yang gagal. Akun Anda terkunci sementara demi keamanan.
        </p>
      </div>

      <!-- Lockout countdown timer display -->
      <div class="bg-light-danger p-8 rounded my-8 border border-danger border-dashed">
        <div class="fs-1 fw-bold text-danger mb-2">
          {{ formatTime(lockoutCountdown) }}
        </div>
        <div class="text-gray-600 fs-7">
          Silakan tunggu hingga hitung mundur selesai untuk mencoba masuk kembali.
        </div>
      </div>
      
      <button 
        type="button" 
        class="btn btn-light-danger btn-sm"
        @click="checkLockout"
      >
        Perbarui Status
      </button>
    </div>

    <!--begin::Form-->
    <VForm
      v-else
      class="form w-100"
      id="kt_login_signin_form"
      @submit="onSubmitLogin"
      :validation-schema="login"
    >
      <!--begin::Heading-->
      <div class="text-center mb-10">
        <!--begin::Title-->
        <h1 class="text-gray-900 mb-3 fs-2x fw-bold">Masuk Klaim Online</h1>
        <!--end::Title-->

        <!--begin::Link-->
        <div class="text-gray-500 fw-semibold fs-5">
          Aplikasi Klaim Online PT Jamkrida Jabar v2.0
        </div>
        <!--end::Link-->
      </div>
      <!--begin::Heading-->

      <!-- Quick Fill Mock Accounts -->
      <div class="mb-10 bg-light-primary p-6 rounded border border-primary border-dashed">
        <h5 class="text-primary fw-bold mb-3 d-flex align-items-center">
          <KTIcon icon-name="profile-circle" icon-class="fs-4 text-primary me-2" />
          Akun Mockup (Demo Mode)
        </h5>
        <p class="text-gray-600 fs-7 mb-4">
          Pilih salah satu akun demo untuk masuk dan mensimulasikan peran sistem secara instan:
        </p>
        <div class="d-flex flex-column gap-2">
          <div class="d-flex flex-wrap gap-2">
            <button type="button" @click="quickFill('superadmin@jamkrida.online', 'password123')" class="btn btn-xs btn-light-primary py-1 px-2 fs-8 fw-semibold">
              Super Admin
            </button>
            <button type="button" @click="quickFill('mitra@bjb.co.id', 'password123')" class="btn btn-xs btn-light-info py-1 px-2 fs-8 fw-semibold">
              Mitra (Bank BJB)
            </button>
            <button type="button" @click="quickFill('klaim@jamkrida.online', 'password123')" class="btn btn-xs btn-light-success py-1 px-2 fs-8 fw-semibold">
              Bagian Klaim
            </button>
            <button type="button" @click="quickFill('keuangan@jamkrida.online', 'password123')" class="btn btn-xs btn-light-warning py-1 px-2 fs-8 fw-semibold">
              Keuangan
            </button>
            <button type="button" @click="quickFill('kabag@jamkrida.online', 'password123')" class="btn btn-xs btn-light-dark py-1 px-2 fs-8 fw-semibold">
              Kabag Klaim
            </button>
          </div>
          <div class="border-top my-1 border-gray-200"></div>
          <div class="d-flex flex-wrap gap-2">
            <span class="fs-8 text-gray-500 align-self-center">Pejabat Komite (E-sign):</span>
            <button type="button" @click="quickFill('ketua.komite@jamkrida.online', 'password123')" class="btn btn-xs btn-outline btn-outline-secondary py-1 px-2 fs-8">
              Ketua
            </button>
            <button type="button" @click="quickFill('anggota1@jamkrida.online', 'password123')" class="btn btn-xs btn-outline btn-outline-secondary py-1 px-2 fs-8">
              Anggota 1
            </button>
            <button type="button" @click="quickFill('anggota2@jamkrida.online', 'password123')" class="btn btn-xs btn-outline btn-outline-secondary py-1 px-2 fs-8">
              Anggota 2
            </button>
          </div>
        </div>
      </div>

      <!--begin::Input group-->
      <div class="fv-row mb-10">
        <!--begin::Label-->
        <label class="form-label fs-6 fw-bold text-gray-900">Email</label>
        <!--end::Label-->

        <!--begin::Input-->
        <Field
          tabindex="1"
          class="form-control form-control-lg form-control-solid"
          type="text"
          name="email"
          v-model="emailVal"
          autocomplete="off"
        />
        <!--end::Input-->
        <div class="fv-plugins-message-container">
          <div class="fv-help-block">
            <ErrorMessage name="email" />
          </div>
        </div>
      </div>
      <!--end::Input group-->

      <!--begin::Input group-->
      <div class="fv-row mb-10">
        <!--begin::Wrapper-->
        <div class="d-flex flex-stack mb-2">
          <!--begin::Label-->
          <label class="form-label fw-bold text-gray-900 fs-6 mb-0">Password</label>
          <!--end::Label-->
        </div>
        <!--end::Wrapper-->

        <!--begin::Input-->
        <Field
          tabindex="2"
          class="form-control form-control-lg form-control-solid"
          type="password"
          name="password"
          v-model="passwordVal"
          autocomplete="off"
        />
        <!--end::Input-->
        <div class="fv-plugins-message-container">
          <div class="fv-help-block">
            <ErrorMessage name="password" />
          </div>
        </div>
      </div>
      <!--end::Input group-->

      <!--begin::Actions-->
      <div class="text-center">
        <!--begin::Submit button-->
        <button
          tabindex="3"
          type="submit"
          ref="submitButton"
          id="kt_sign_in_submit"
          class="btn btn-lg btn-primary w-100 mb-5"
        >
          <span class="indicator-label"> Masuk </span>

          <span class="indicator-progress">
            Harap tunggu...
            <span
              class="spinner-border spinner-border-sm align-middle ms-2"
            ></span>
          </span>
        </button>
        <!--end::Submit button-->
      </div>
      <!--end::Actions-->
    </VForm>
    <!--end::Form-->
  </div>
  <!--end::Wrapper-->
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { ErrorMessage, Field, Form as VForm } from "vee-validate";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import Swal from "sweetalert2/dist/sweetalert2.js";
import * as Yup from "yup";

export default defineComponent({
  name: "sign-in",
  components: {
    Field,
    VForm,
    ErrorMessage,
  },
  setup() {
    const store = useAuthStore();
    const router = useRouter();

    const submitButton = ref<HTMLButtonElement | null>(null);
    const lockoutCountdown = ref(0);
    let countdownInterval: any = null;
    const lockoutExpiryKey = "login_lockout_expiry";

    const emailVal = ref("superadmin@jamkrida.online");
    const passwordVal = ref("password123");

    const quickFill = (email: string, pass: string) => {
      emailVal.value = email;
      passwordVal.value = pass;
    };

    const startCountdown = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        if (lockoutCountdown.value > 0) {
          lockoutCountdown.value--;
        } else {
          clearInterval(countdownInterval);
          localStorage.removeItem(lockoutExpiryKey);
        }
      }, 1000);
    };

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const checkLockout = () => {
      const expiry = localStorage.getItem(lockoutExpiryKey);
      if (expiry) {
        const remaining = Math.ceil((parseInt(expiry) - Date.now()) / 1000);
        if (remaining > 0) {
          lockoutCountdown.value = remaining;
          startCountdown();
        } else {
          lockoutCountdown.value = 0;
          localStorage.removeItem(lockoutExpiryKey);
        }
      }
    };

    onMounted(() => {
      checkLockout();
    });

    onUnmounted(() => {
      if (countdownInterval) clearInterval(countdownInterval);
    });

    //Create form validation object
    const login = Yup.object().shape({
      email: Yup.string().email().required().label("Email"),
      password: Yup.string().min(4).required().label("Password"),
    });

    //Form submit function
    const onSubmitLogin = async (values: any) => {
      // Clear existing errors
      store.logout();

      if (submitButton.value) {
        submitButton.value!.disabled = true;
        submitButton.value.setAttribute("data-kt-indicator", "on");
      }

      // Send login request
      await store.login({ email: emailVal.value, password: passwordVal.value });
      const error = Object.values(store.errors);

      if (error.length === 0) {
        const loggedUser = store.user;
        const isMitraUser = loggedUser?.role?.kode === "mitra" || loggedUser?.roleId === 2 || loggedUser?.email === "mitra@bjb.co.id";

        Swal.fire({
          text: "Login berhasil! Selamat datang di Aplikasi Klaim Online PT Jamkrida Jabar.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonText: isMitraUser ? "Masuk ke Pengajuan Online" : "Masuk ke Dashboard",
          heightAuto: false,
          customClass: {
            confirmButton: "btn fw-semibold btn-light-primary",
          },
        }).then(() => {
          // Go to designated page for role
          if (isMitraUser) {
            router.push({ name: "pengajuan" });
          } else {
            router.push({ name: "dashboard" });
          }
        });
      } else {
        // Check if error is a 429 lockout error
        if (store.errors.retryAfter !== undefined) {
          const retrySeconds = parseInt(store.errors.retryAfter);
          lockoutCountdown.value = retrySeconds;
          localStorage.setItem(lockoutExpiryKey, (Date.now() + retrySeconds * 1000).toString());
          startCountdown();

          Swal.fire({
            text: store.errors.message || "Terlalu banyak percobaan login. Akun Anda terkunci sementara.",
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Mengerti",
            heightAuto: false,
            customClass: {
              confirmButton: "btn fw-semibold btn-light-danger",
            },
          });
        } else {
          let displayError = error[0];
          if (Array.isArray(displayError)) {
            displayError = displayError[0];
          }
          Swal.fire({
            text: (displayError || "Email atau password salah.") as string,
            icon: "error",
            buttonsStyling: false,
            confirmButtonText: "Coba Lagi",
            heightAuto: false,
            customClass: {
              confirmButton: "btn fw-semibold btn-light-danger",
            },
          }).then(() => {
            store.errors = {};
          });
        }
      }

      //Deactivate indicator
      submitButton.value?.removeAttribute("data-kt-indicator");
      if (submitButton.value) {
        submitButton.value!.disabled = false;
      }
    };

    return {
      onSubmitLogin,
      login,
      submitButton,
      lockoutCountdown,
      formatTime,
      checkLockout,
      emailVal,
      passwordVal,
      quickFill
    };
  },
});
</script>
