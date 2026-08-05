<template>
  <RouterView />
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeMount, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useConfigStore } from "@/stores/config";
import { useThemeStore } from "@/stores/theme";
import { useBodyStore } from "@/stores/body";
import { useSettingsStore } from "@/stores/settings";
import { themeConfigValue } from "@/layouts/default-layout/config/helper";
import { initializeComponents } from "@/core/plugins/keenthemes";

export default defineComponent({
  name: "app",
  components: {
    RouterView,
  },
  setup() {
    const configStore = useConfigStore();
    const themeStore = useThemeStore();
    const bodyStore = useBodyStore();
    const settingsStore = useSettingsStore();

    onBeforeMount(() => {
      // Fetch dynamic settings from API
      settingsStore.fetchSettings();

      /**
       * Overrides the layout config using saved data from localStorage
       * remove this to use static config (@/layouts/default-layout/config/DefaultLayoutConfig.ts)
       */
      configStore.overrideLayoutConfig();

      /**
       *  Sets a mode from configuration
       */
      themeStore.setThemeMode(themeConfigValue.value);
    });

    onMounted(() => {
      nextTick(() => {
        initializeComponents();

        bodyStore.removeBodyClassName("page-loading");
      });
    });
  },
});
</script>

<style lang="scss">
@import "bootstrap-icons/font/bootstrap-icons.css";
@import "apexcharts/dist/apexcharts.css";
@import "quill/dist/quill.snow.css";
@import "animate.css";
@import "sweetalert2/dist/sweetalert2.css";
@import "nouislider/dist/nouislider.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
@import "socicon/css/socicon.css";
@import "line-awesome/dist/line-awesome/css/line-awesome.css";
@import "dropzone/dist/dropzone.css";
@import "@vueform/multiselect/themes/default.css";
@import "prism-themes/themes/prism-shades-of-purple.css";
@import "element-plus/dist/index.css";

// Main demo style scss
@import "assets/keenicons/duotone/style.css";
@import "assets/keenicons/outline/style.css";
@import "assets/keenicons/solid/style.css";
@import "assets/sass/element-ui.dark";
@import "assets/sass/plugins";
@import "assets/sass/style";

#app {
  display: contents;
}

// Global layout & styling overrides to bind Metronic theme elements
// to Settings Store variables (--bs-primary, --bs-secondary, --bs-font-sans-serif)
body, h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6, p, a, input, select, textarea, button, .menu-title, .table {
  font-family: var(--bs-font-sans-serif) !important;
}

/* --- Modern Custom Scrollbar (Surety Style) --- */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  border: 2px solid transparent;
  background-clip: padding-box;
}

body {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

/* --- Premium Scroll To Top --- */
#kt_scrolltop {
  background-color: #2c3691 !important;
  padding: 0 !important;
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(44, 54, 145, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  bottom: 25px !important;
  right: 25px !important;
}

#kt_scrolltop i {
  color: #ffffff !important;
  font-size: 1.1rem !important;
  margin: 0 !important;
}

#kt_scrolltop:hover {
  background-color: #0d9648 !important;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 15px rgba(13, 150, 72, 0.4) !important;
}

#kt_scrolltop::after {
  display: none !important;
}

/* --- Header Toolbar (Surety Style) --- */
.fb-toolbar {
  height: 70px;
}

[data-bs-theme="light"] .fb-toolbar {
  background-color: #ffffff !important;
}

[data-bs-theme="dark"] .fb-toolbar {
  background-color: #1e1e2d !important;
}

.fb-profile-btn {
  text-decoration: none;
}

.fb-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e4e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #050505;
  transition: all 0.2s;
  text-decoration: none;
}

.fb-action-btn:hover {
  background-color: #d8dadf;
}

[data-bs-theme="dark"] .fb-action-btn {
  background-color: #3a3b3c;
  color: #e4e6eb;
}

[data-bs-theme="dark"] .fb-action-btn:hover {
  background-color: #4e4f50;
}

/* --- Aside / Sidebar Layout (Surety Style) --- */
#kt_aside_toggle i {
  color: #ffffff !important;
}

.aside-logo {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s ease;
}

.aside-toolbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s ease;
}

[data-bs-theme="dark"] .aside,
[data-bs-theme="dark"] #kt_aside,
[data-bs-theme="dark"] .aside-logo,
[data-bs-theme="dark"] .aside-toolbar,
[data-bs-theme="dark"] #kt_aside_logo {
  background-color: #1e1e2d !important;
}

[data-bs-theme="light"] .aside,
[data-bs-theme="light"] #kt_aside,
[data-bs-theme="light"] #kt_aside_logo,
[data-bs-theme="light"] #kt_aside_toolbar {
  background-color: #2c3691 !important;
  border: none !important;
}

[data-bs-theme="light"] .aside-menu .menu .menu-item .menu-link .menu-title {
  color: #ffffff !important;
}

[data-bs-theme="light"] .aside-menu .menu .menu-item .menu-link .menu-icon i {
  color: #ffffff !important;
}

[data-bs-theme="light"] .aside-menu .menu .menu-item .menu-link:hover .menu-title,
[data-bs-theme="light"] .aside-menu .menu .menu-item .menu-link:hover .menu-icon i {
  color: #ffffff !important;
}

[data-bs-theme="light"] .aside-user-info .text-white {
  color: #ffffff !important;
}

[data-bs-theme="light"] .aside-user-info .text-gray-400 {
  color: #a1a5b7 !important;
}

[data-bs-theme="light"] .aside-logo .toggle-icon {
  color: #ffffff !important;
}

[data-bs-theme="light"] #kt_aside_logo {
  background-color: #2c3691 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Premium Buttons */
.btn-primary {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
  
  &:hover:not(.disabled) {
    background-color: var(--bs-primary) !important;
    border-color: var(--bs-primary) !important;
    filter: brightness(92%);
  }
}

.btn-secondary {
  background-color: var(--bs-secondary) !important;
  border-color: var(--bs-secondary) !important;
  
  &:hover:not(.disabled) {
    background-color: var(--bs-secondary) !important;
    border-color: var(--bs-secondary) !important;
    filter: brightness(92%);
  }
}

/* --- Desktop Layout Grid Fixes (Surety Style) --- */
@media (min-width: 992px) {
  .aside {
    width: 280px !important;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0 !important;
    z-index: 101 !important;
    display: flex !important;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  /* --- SIDEBAR MINIMIZE ENGINE (Surety Style) --- */
  body[data-kt-aside-minimize="on"] .aside {
    width: 70px !important;
  }

  body[data-kt-aside-minimize="on"] .brand-logo-default {
    display: none !important;
  }

  body[data-kt-aside-minimize="on"] .brand-logo-mini {
    display: block !important;
    margin: 0 auto;
  }

  body[data-kt-aside-minimize="on"] .aside-logo {
    width: 70px !important;
    padding: 10px 0 !important;
    justify-content: center !important;
    flex-direction: column !important;
    height: 100px !important;
  }

  body[data-kt-aside-minimize="on"] .aside-logo a {
    margin-bottom: 10px;
  }

  body[data-kt-aside-minimize="on"] .aside-logo .minimize-button {
    margin: 0 !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-item,
  body[data-kt-aside-minimize="on"] .aside .menu-link {
    padding: 0 !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  body[data-kt-aside-minimize="on"] .aside .symbol.me-4 {
    margin: 0 !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-icon {
    width: 70px !important;
    height: 44px !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-icon i {
    font-size: 1.6rem !important;
    color: #ffffff !important;
    margin: 0 !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-title,
  body[data-kt-aside-minimize="on"] .aside .menu-arrow,
  body[data-kt-aside-minimize="on"] .aside-user-info {
    display: none !important;
  }

  body[data-kt-aside-minimize="on"] .aside-toolbar {
    padding: 10px 0 !important;
    display: flex !important;
    justify-content: center !important;
  }

  body[data-kt-aside-minimize="on"] .aside-user {
    padding: 0 !important;
    margin: 0 !important;
    justify-content: center !important;
  }

  /* --- FLOATING POP-OUT MENU FOR MINI SIDEBAR --- */
  body[data-kt-aside-minimize="on"] .aside,
  body[data-kt-aside-minimize="on"] .aside-menu,
  body[data-kt-aside-minimize="on"] #kt_aside_menu,
  body[data-kt-aside-minimize="on"] #kt_aside_menu_wrapper,
  body[data-kt-aside-minimize="on"] .hover-scroll-overlay-y {
    overflow: visible !important;
    padding: 0 !important;
    width: 70px !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-item {
    position: relative !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-item.show>.menu-sub,
  body[data-kt-aside-minimize="on"] .aside .menu-item:hover>.menu-sub {
    display: block !important;
    position: absolute !important;
    left: 70px !important;
    top: 0 !important;
    min-width: 250px !important;
    z-index: 10000 !important;
    padding: 5px 5px !important;
    border-radius: 0 10px 10px 0 !important;
    box-shadow: 15px 0 40px rgba(0, 0, 0, 0.6) !important;
    margin: 0 !important;
  }

  [data-bs-theme="light"] body[data-kt-aside-minimize="on"] .aside .menu-item.show>.menu-sub,
  [data-bs-theme="light"] body[data-kt-aside-minimize="on"] .aside .menu-item:hover>.menu-sub {
    background-color: #2c3691 !important;
  }

  [data-bs-theme="dark"] body[data-kt-aside-minimize="on"] .aside .menu-item.show>.menu-sub,
  [data-bs-theme="dark"] body[data-kt-aside-minimize="on"] .aside .menu-item:hover>.menu-sub {
    background-color: #1b1b28 !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-sub .menu-link {
    padding-left: 10px !important;
    padding-right: 10px !important;
    border-radius: 6px !important;
    display: flex !important;
    align-items: center !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-sub .menu-title {
    display: block !important;
    color: #ffffff !important;
    padding: 0 1px !important;
  }

  body[data-kt-aside-minimize="on"] .aside .menu-sub .menu-icon {
    width: 30px !important;
  }

  body[data-kt-aside-minimize="on"] .toggle-icon {
    transform: rotate(180deg);
  }
  
  /* Layout Grid positioning */
  .header {
    position: fixed;
    top: 0;
    right: 0;
    left: 280px;
    height: 70px;
    z-index: 100;
    display: flex !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  body[data-kt-aside-minimize="on"] .header {
    left: 70px !important;
  }
  
  .wrapper {
    padding-top: 70px !important;
    margin-left: 280px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
  }
  
  body[data-kt-aside-minimize="on"] .wrapper {
    margin-left: 70px !important;
  }
}

.toggle-icon {
  transition: transform 0.3s ease;
}

/* --- Mobile View Support --- */
@media (max-width: 991px) {
  .aside {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 10005;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  body.mobile-aside-open .aside {
    transform: translateX(0) !important;
    left: 0 !important;
    width: 250px !important;
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.4) !important;
  }
  
  .header {
    left: 0 !important;
    height: 60px !important;
  }
  
  .wrapper {
    padding-top: 60px !important;
    margin-left: 0 !important;
  }
}

/* Full Width Container standard */
#kt_content_container {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

/* --- Global Card Surety Style Overrides --- */
.card {
  border: 0 !important;
  border-radius: 1rem !important; /* rounded-4 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important; /* premium soft shadow */
}
.card-header {
  border-bottom: 0 !important;
}
.card-footer {
  border-top: 0 !important;
}

/* --- Global Modal Surety Style Overrides --- */
.modal-content {
  border: 0 !important;
  border-radius: 1.25rem !important; /* premium rounded */
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15) !important;
}
.modal-header {
  border-bottom: 0 !important;
}
.modal-footer {
  border-top: 0 !important;
}

/* --- Global Alert Surety Style Overrides --- */
.alert {
  border-radius: 1rem !important; /* rounded-4 */
}

/* --- Global Table Surety Style Overrides --- */
.table {
  vertical-align: middle !important;
}
.table th {
  font-weight: 700 !important;
  color: #5e6278 !important;
  text-transform: uppercase !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}
[data-bs-theme="dark"] .table th {
  color: #a1a5b7 !important;
}
.table td {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

/* --- Global Nav Group Outline Overrides (Surety Style) --- */
.nav-group-outline {
  background-color: var(--bs-gray-100) !important;
  border: 1px solid var(--bs-gray-300) !important;
  border-radius: 0.65rem !important;
  padding: 4px !important;
  display: inline-flex !important;
  align-items: center !important;
}
[data-bs-theme="dark"] .nav-group-outline {
  background-color: #1b1b29 !important;
  border-color: #2b2b40 !important;
}
.nav-group-outline .btn {
  border-radius: 0.5rem !important;
  border: 0 !important;
  transition: all 0.2s ease !important;
}
.nav-group-outline .btn.active {
  background-color: var(--bs-body) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  color: var(--bs-primary) !important;
}
[data-bs-theme="dark"] .nav-group-outline .btn.active {
  background-color: #212130 !important;
  color: var(--bs-primary) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}
</style>
