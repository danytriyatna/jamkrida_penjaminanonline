<template>
  <!--begin::Action group-->
  <div class="d-flex align-items-center overflow-auto pt-3 pt-lg-0">
    <!--begin::Theme mode-->
    <div class="d-flex align-items-center ms-3">
      <!--begin::Menu toggle-->
      <a
        href="#"
        class="btn btn-sm btn-icon btn-icon-muted btn-active-icon-primary"
        data-kt-menu-trigger="{default:'click', lg: 'hover'}"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        <KTIcon icon-name="night-day" icon-class="theme-light-show fs-2" />
        <KTIcon icon-name="moon" icon-class="theme-dark-show fs-2" />
      </a>
      <!--begin::Menu toggle-->
      <KTThemeModeSwitcher></KTThemeModeSwitcher>
    </div>
    <!--end::Theme mode-->

    <!--begin::Log out button-->
    <div class="d-flex align-items-center ms-3">
      <button
        @click="handleLogout"
        class="btn btn-sm btn-light-danger d-flex align-items-center gap-2 fw-semibold px-3 py-2"
        title="Keluar dari Sistem"
      >
        <KTIcon icon-name="entrance-right" icon-class="fs-4 text-danger" />
        <span>Keluar</span>
      </button>
    </div>
    <!--end::Log out button-->
  </div>
  <!--end::Action group-->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import KTThemeModeSwitcher from "@/layouts/default-layout/components/theme-mode/ThemeModeSwitcher.vue";

export default defineComponent({
  name: "layout-topbar",
  components: {
    KTThemeModeSwitcher,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const handleLogout = async () => {
      await authStore.logout();
      router.push({ name: "sign-in" });
    };

    return {
      handleLogout,
    };
  },
});
</script>
