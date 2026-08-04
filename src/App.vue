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

// Sidebar background override
.aside {
  background-color: var(--bs-primary) !important;
}

// Sidebar headers/toolbar override
.header-brand {
  background-color: var(--bs-primary) !important;
}

// Toggle button indicators override to remain white/readable
#kt_aside_toggle i, #kt_aside_mobile_toggle i {
  color: #ffffff !important;
}

// Sidebar menu elements color configuration
.aside .menu-item .menu-link {
  .menu-title, .menu-icon, .menu-icon i, .menu-arrow::after {
    color: rgba(255, 255, 255, 0.75) !important;
  }
  
  &:hover:not(.disabled):not(.active) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    .menu-title, .menu-icon, .menu-icon i {
      color: #ffffff !important;
    }
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.15) !important;
    .menu-title, .menu-icon, .menu-icon i {
      color: var(--bs-secondary, #e5a93c) !important;
    }
  }
}

// Separator lines in sidebar
.aside .separator {
  border-bottom-color: rgba(255, 255, 255, 0.15) !important;
}

// Aside toolbar user text readability
.aside-user-info span.text-white, .aside-user-info span.text-gray-600 {
  color: #ffffff !important;
}
.aside-user-info span.text-gray-600 {
  opacity: 0.8;
}

// Global premium button and links hover
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

// Full-width container overrides
#kt_content_container {
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}
</style>
