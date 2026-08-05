<template>
  <!-- Loading Screen (Surety-style) -->
  <loading-screen v-if="inprocess" />

  <!-- begin:: Body -->
  <div v-show="!inprocess" class="page d-flex flex-row flex-column-fluid">
    <!-- begin:: Aside Left (Surety Style) -->
    <div id="kt_aside" class="aside d-flex flex-column" data-kt-drawer="true"
      data-kt-drawer-name="aside" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'200px', '300px': '280px'}" data-kt-drawer-direction="start"
      data-kt-drawer-toggle="#kt_aside_mobile_toggle">
      
      <!-- Logo & Toggle -->
      <div class="aside-logo flex-column-auto px-10 d-flex align-items-center justify-content-between"
        id="kt_aside_logo" style="height: 70px;">
        <router-link to="/" class="d-flex align-items-center text-decoration-none">
          <img alt="Logo Jamkrida" :src="settingsStore.logoUrl || logoDefault" class="h-40px brand-logo-default" />
          <img alt="Logo Jamkrida Mini" src="@/assets/logo.png" class="h-30px brand-logo-mini d-none" />
        </router-link>
        <div id="kt_aside_toggle"
          class="btn btn-icon btn-sm btn-active-color-primary ms-2 minimize-button d-none d-lg-flex"
          @click="toggleSidebar">
          <i class="ki-duotone ki-double-left fs-2 text-white toggle-icon">
            <span class="path1"></span>
            <span class="path2"></span>
          </i>
        </div>
      </div>

      <!-- User Profile widget inside sidebar -->
      <div class="aside-toolbar flex-column-auto" id="kt_aside_toolbar">
        <router-link to="/profile" class="aside-user d-flex align-items-center px-10 py-5 text-decoration-none">
          <div class="symbol symbol-40px symbol-circle me-4 position-relative">
            <div class="symbol-label fs-3 fw-bold bg-light-primary text-primary">
              {{ userInfo.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <!-- Role Badge -->
            <div
              class="position-absolute bottom-0 end-0 bg-white rounded-circle border border-2 border-white w-18px h-18px d-flex align-items-center justify-content-center"
              style="transform: translate(25%, 25%); z-index: 1;">
              <span class="badge badge-circle w-8px h-8px p-0" :class="'badge-' + roleBadgeColor"></span>
            </div>
          </div>
          <div class="aside-user-info flex-row-fluid overflow-hidden me-2">
            <span class="text-white text-hover-primary fs-6 fw-bold text-truncate d-block mb-1" :title="userInfo.name">
              {{ userInfo.name }}
            </span>
            <span class="text-gray-400 fw-semibold d-block fs-8">{{ userInfo.email }}</span>
          </div>
        </router-link>
      </div>

      <!-- Menu Navigation -->
      <div class="aside-menu flex-column-fluid">
        <SidebarMenu />
      </div>
    </div>
    <!-- end:: Aside Left -->

    <!-- begin:: Wrapper -->
    <div id="kt_wrapper" class="d-flex flex-column flex-row-fluid wrapper">
      <!-- Header -->
      <div id="kt_header" class="header align-items-stretch">
        <div class="fb-toolbar flex-grow-1 d-flex align-items-center justify-content-between px-6 px-lg-12">
          
          <!-- Left: Mobile Hamburger & Desktop Social Links -->
          <div class="d-flex align-items-center fb-left">
            <div class="d-lg-none me-2" @click="toggleMobileSidebar" style="cursor: pointer;">
              <div class="btn btn-icon btn-active-color-primary w-35px h-35px">
                <i class="ki-outline ki-abstract-14 fs-1"></i>
              </div>
            </div>
            <div class="d-none d-lg-flex align-items-center gap-2">
              <a target="_blank" href="https://www.jamkrida-jabar.co.id" class="btn btn-icon btn-sm btn-active-light-primary" title="Official Website">
                <i class="fas fa-globe fs-4 text-gray-500"></i>
              </a>
              <a target="_blank" href="https://www.youtube.com/@jamkridajabar5378" class="btn btn-icon btn-sm btn-active-light-danger" title="YouTube Channel">
                <i class="fab fa-youtube fs-4 text-gray-500 text-hover-white"></i>
              </a>
              <a target="_blank" href="https://www.instagram.com/jamkridajabar" class="btn btn-icon btn-sm btn-active-light-warning" title="Instagram">
                <i class="fab fa-instagram fs-4 text-gray-500 text-hover-white"></i>
              </a>
            </div>
          </div>

          <!-- Center: Title -->
          <div class="d-flex align-items-center h-100 fb-center">
            <span class="fw-bold fs-5 text-gray-800">{{ currentTitle }}</span>
          </div>

          <!-- Right: Action items & Profile -->
          <div class="d-flex align-items-center gap-2 fb-right">
            <!-- Notification Dropdown -->
            <NotificationDropdown />

            <!-- Profile Dropdown Button -->
            <div class="ms-2">
              <a href="#" class="fb-profile-btn position-relative cursor-pointer d-block" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                <div class="symbol symbol-40px symbol-circle">
                  <div class="symbol-label fs-4 fw-bold bg-light-primary text-primary border border-1 border-gray-300">
                    {{ userInfo.name?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                </div>
                <div class="position-absolute bottom-0 end-0 bg-light rounded-circle border border-2 border-white w-15px h-15px d-flex align-items-center justify-content-center">
                  <i class="ki-solid ki-down fs-9 text-dark"></i>
                </div>
              </a>

              <!-- User Menu Dropdown -->
              <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-300px fb-user-menu" data-kt-menu="true">
                <!-- User Profile Info -->
                <div class="menu-item px-3">
                  <div class="menu-content d-flex align-items-center px-3">
                    <div class="symbol symbol-50px me-5">
                      <div class="symbol-label fs-2 fw-bold bg-light-primary text-primary border border-primary border-opacity-10">
                        {{ userInfo.name?.charAt(0).toUpperCase() || 'U' }}
                      </div>
                    </div>
                    <div class="d-flex flex-column">
                      <div class="fw-bold d-flex align-items-center fs-5 text-dark">
                        {{ userInfo.name?.split(' ')[0] }}
                        <span class="badge badge-light-success fw-boldest fs-9 px-2 py-1 ms-2 rounded-pill text-uppercase">
                          {{ userInfo.roleName }}
                        </span>
                      </div>
                      <span class="fw-semibold text-muted fs-7 text-truncate mw-150px">{{ userInfo.email }}</span>
                    </div>
                  </div>
                </div>

                <div class="separator my-2"></div>

                <div class="menu-item px-5">
                  <router-link to="/profile" class="menu-link px-5">
                    <span class="menu-icon me-2 text-primary"><i class="ki-outline ki-user fs-2"></i></span>
                    <span class="menu-title">Profil Saya</span>
                  </router-link>
                </div>

                <!-- Mode Tema Submenu -->
                <div class="menu-item px-5" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="left-start">
                  <a href="#" class="menu-link px-5">
                    <span class="menu-icon me-2 text-primary"><i class="ki-outline ki-night-day fs-2"></i></span>
                    <span class="menu-title position-relative">
                      Mode Tema
                      <span class="ms-5 position-absolute translate-middle-y top-50 end-0">
                        <i class="ki-outline ki-night-day theme-light-show fs-2"></i>
                        <i class="ki-outline ki-moon theme-dark-show fs-2"></i>
                      </span>
                    </span>
                    <span class="menu-arrow"></span>
                  </a>
                  <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px" data-kt-menu="true" data-kt-element="theme-mode-menu">
                    <div class="menu-item px-3 my-0">
                      <a href="#" class="menu-link px-3 py-2" @click.prevent="setThemeMode('light')" data-kt-element="mode" data-kt-value="light">
                        <span class="menu-icon" data-kt-element="icon"><i class="ki-outline ki-night-day fs-2"></i></span>
                        <span class="menu-title">Terang</span>
                      </a>
                    </div>
                    <div class="menu-item px-3 my-0">
                      <a href="#" class="menu-link px-3 py-2" @click.prevent="setThemeMode('dark')" data-kt-element="mode" data-kt-value="dark">
                        <span class="menu-icon" data-kt-element="icon"><i class="ki-outline ki-moon fs-2"></i></span>
                        <span class="menu-title">Gelap</span>
                      </a>
                    </div>
                    <div class="menu-item px-3 my-0">
                      <a href="#" class="menu-link px-3 py-2" @click.prevent="setThemeMode('system')" data-kt-element="mode" data-kt-value="system">
                        <span class="menu-icon" data-kt-element="icon"><i class="ki-outline ki-screen fs-2"></i></span>
                        <span class="menu-title">Sistem</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="separator my-2"></div>

                <div class="menu-item px-5">
                  <a href="#" @click.prevent="logout" class="menu-link px-5">
                    <span class="menu-icon me-2 text-danger"><i class="ki-outline ki-exit-right fs-2"></i></span>
                    <span class="menu-title text-danger">Keluar</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- begin:: Content -->
      <div id="kt_content" class="content d-flex flex-column flex-column-fluid">
        <!-- begin:: Content Body -->
        <div class="post d-flex flex-column-fluid">
          <div id="kt_content_container" class="container-fluid px-6 px-lg-12">
            <router-view />
          </div>
        </div>
        <!-- end:: Content Body -->
      </div>
      <!-- end:: Content -->
      <KTFooter />
    </div>
    <!-- end:: Wrapper -->
  </div>
  <!-- end:: Body -->

  <KTScrollTop />
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeMount, onMounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarMenu from "@/layouts/Aside.vue";
import KTFooter from "@/layouts/default-layout/components/footer/Footer.vue";
import KTScrollTop from "@/layouts/default-layout/components/extras/ScrollTop.vue";
import LoadingScreen from "@/components/ui/loading-screen.vue";
import logoDefault from "@/assets/media/logos/jamkridastr.png";
import NotificationDropdown from "@/components/ui/NotificationDropdown.vue";

import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import LayoutService from "@/core/services/LayoutService";
import { reinitializeComponents } from "@/core/plugins/keenthemes";
import Swal from "sweetalert2";

export default defineComponent({
  name: "default-layout",
  components: {
    SidebarMenu,
    KTFooter,
    KTScrollTop,
    NotificationDropdown,
    "loading-screen": LoadingScreen,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const settingsStore = useSettingsStore();
    const themeStore = useThemeStore();

    const inprocess = ref(true);

    const userInfo = computed(() => {
      const u = authStore.user as any;
      return {
        name: u?.name || "",
        email: u?.email || "",
        roleName: u?.role?.nama || u?.role?.kode || "",
        roleKode: (u?.role?.kode || "").toLowerCase(),
      };
    });

    const roleBadgeColor = computed(() => {
      const map: Record<string, string> = {
        superadmin: "danger",
        admin: "danger",
        internal: "primary",
        mitra: "warning",
        komite: "info"
      };
      return map[userInfo.value.roleKode] || "secondary";
    });

    const currentTitle = computed(() => {
      return route.meta?.pageTitle || "Klaim Online";
    });

    const toggleSidebar = () => {
      const body = document.body;
      const isMinimized = body.getAttribute("data-kt-aside-minimize") === "on";
      const newState = isMinimized ? "off" : "on";
      body.setAttribute("data-kt-aside-minimize", newState);
      localStorage.setItem("sidebar_minimize", newState);
    };

    const toggleMobileSidebar = () => {
      const aside = document.getElementById("kt_aside");
      if (aside && (window as any).KTDrawer) {
        const drawer = (window as any).KTDrawer.getInstance(aside);
        if (drawer) {
          drawer.toggle();
          return;
        }
      }
      const body = document.body;
      if (body.classList.contains("mobile-aside-open")) {
        body.classList.remove("mobile-aside-open");
        document.getElementById("custom_aside_overlay")?.remove();
      } else {
        body.classList.add("mobile-aside-open");
        if (!document.getElementById("custom_aside_overlay")) {
          const overlay = document.createElement("div");
          overlay.id = "custom_aside_overlay";
          overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:10000;";
          overlay.onclick = () => toggleMobileSidebar();
          document.body.appendChild(overlay);
        }
      }
    };

    const setThemeMode = (mode: string) => {
      themeStore.setThemeMode(mode);
    };

    const logout = () => {
      Swal.fire({
        title: "Logout dari aplikasi?",
        text: "Apakah anda akan keluar dari aplikasi sekarang?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, keluar!",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "btn btn-danger px-8 rounded-pill fw-bold",
          cancelButton: "btn btn-light px-8 rounded-pill fw-bold",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          authStore.logout().finally(() => {
            router.push({ name: "sign-in" });
          });
        }
      });
    };

    onBeforeMount(() => {
      console.log("[Layout] onBeforeMount");
      try {
        LayoutService.init();
      } catch (e) {
        console.error("LayoutService.init error:", e);
      }
    });

    onMounted(() => {
      console.log("[Layout] onMounted, inprocess:", inprocess.value);
      nextTick(() => {
        setTimeout(() => {
          try {
            console.log("[Layout] Reinitializing Metronic components");
            reinitializeComponents();
          } catch (e) {
            console.warn("reinitializeComponents error:", e);
          } finally {
            inprocess.value = false;
            console.log("[Layout] inprocess set to false");
          }
        }, 500);
      });
    });

    // Failsafe timeout: Pastikan loading screen ditutup setelah 1.5 detik
    setTimeout(() => {
      console.log("[Layout] Failsafe timeout triggered, forcing inprocess = false");
      inprocess.value = false;
    }, 1500);

    watch(inprocess, (newVal) => {
      console.log("[Layout] Watcher - inprocess changed to:", newVal);
    });

    watch(() => route.path, () => {
      const body = document.body;
      if (body.classList.contains("mobile-aside-open")) {
        toggleMobileSidebar();
      }
      nextTick(() => {
        reinitializeComponents();
      });
    });

    return {
      inprocess,
      logoDefault,
      userInfo,
      roleBadgeColor,
      currentTitle,
      settingsStore,
      toggleSidebar,
      toggleMobileSidebar,
      setThemeMode,
      logout,
    };
  }
});
</script>
