<template>
  <!--begin::Menu-->
  <div
    class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold py-4 fs-6 w-275px"
    data-kt-menu="true"
  >
    <!--begin::Menu item-->
    <div class="menu-item px-3">
      <div class="menu-content d-flex align-items-center px-3">
        <!--begin::Avatar-->
        <div class="symbol symbol-50px me-5">
          <img alt="Logo" :src="avatarUrl || getAssetPath('media/avatars/300-1.jpg')" />
        </div>
        <!--end::Avatar-->

        <!--begin::Username-->
        <div class="d-flex flex-column">
          <div class="fw-bold d-flex align-items-center fs-5">
            {{ user?.name || 'User' }}
            <span class="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
              {{ user?.role?.nama || 'Staff' }}
            </span>
          </div>
          <span class="fw-semibold text-muted fs-7">{{ user?.email }}</span>
        </div>
        <!--end::Username-->
      </div>
    </div>
    <!--end::Menu item-->

    <!--begin::Menu separator-->
    <div class="separator my-2"></div>
    <!--end::Menu separator-->

    <!--begin::Menu item-->
    <div class="menu-item px-5">
      <router-link to="/profile" class="menu-link px-5">
        Profil Saya
      </router-link>
    </div>
    <!--end::Menu item-->

    <!--begin::Menu item-->
    <div class="menu-item px-5 my-1">
      <router-link to="/profile" class="menu-link px-5">
        Pengaturan Akun
      </router-link>
    </div>
    <!--end::Menu item-->

    <!--begin::Menu separator-->
    <div class="separator my-2"></div>
    <!--end::Menu separator-->

    <!--begin::Menu item-->
    <div class="menu-item px-5">
      <a @click.prevent="signOut()" class="menu-link text-danger fw-semibold px-5">
        <KTIcon icon-name="entrance-right" icon-class="fs-4 text-danger me-2" />
        Keluar / Log Out
      </a>
    </div>
    <!--end::Menu item-->
  </div>
  <!--end::Menu-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "kt-user-menu",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const user = computed(() => authStore.user);

    const avatarUrl = computed(() => {
      const path = authStore.user?.avatarPath;
      if (!path) return null;
      if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
      }
      const baseUrl = import.meta.env.VITE_APP_API_URL.replace(/\/api$/, "");
      return `${baseUrl}/storage/${path}`;
    });

    const signOut = async () => {
      await authStore.logout();
      router.push({ name: "sign-in" });
    };

    return {
      user,
      avatarUrl,
      signOut,
      getAssetPath,
    };
  },
});
</script>
