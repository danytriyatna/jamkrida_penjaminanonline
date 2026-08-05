<template>
  <div class="aside-menu flex-column-fluid d-flex flex-column w-100 p-0 m-0">
    <!--begin::Aside Menu-->
    <div class="hover-scroll-overlay-y ps-0 m-0" id="kt_aside_menu_wrapper" data-kt-scroll="true"
      data-kt-scroll-height="auto"
      data-kt-scroll-dependencies="{default: '#kt_aside_toolbar, #kt_aside_footer', lg: '#kt_header, #kt_aside_toolbar, #kt_aside_footer'}"
      data-kt-scroll-wrappers="#kt_aside_menu" data-kt-scroll-offset="5px">
      <!--begin::Menu-->
      <div
        class="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500"
        id="kt_aside_menu" data-kt-menu="true">

        <template v-for="(item, index) in finalMenuConfig" :key="index">

          <!-- NO CHILDREN (Direct Link Menu) -->
          <div v-if="!item.children || item.children.length === 0" class="menu-item menu-accordion">
            <span :class="['menu-link', $route.path === item.route ? 'active' : '']" @click="$router.push(item.route)"
              data-kt-menu-dismiss="true">
              <span class="menu-icon">
                <i :class="[item.icon, 'fs-2']"></i>
              </span>
              <span class="menu-title">{{ item.title }}</span>
            </span>
          </div>

          <!-- WITH CHILDREN (Accordion/Dropdown Menu) -->
          <div v-else
            :class="['menu-item menu-accordion', isParentActive(item) ? 'here' : '', (expandedItems.includes(index) && !isMinimized) ? 'show' : '']">
            <span class="menu-link" @click="!isMinimized ? toggleExpanded(index) : null">
              <span class="menu-icon">
                <i :class="[item.icon, 'fs-1']"></i>
              </span>
              <span class="menu-title">{{ item.title }}</span>
              <span class="menu-arrow"></span>
            </span>

            <div
              :class="['menu-sub', isMinimized ? 'menu-sub-dropdown-custom w-225px px-2 py-4 shadow-lg border-0' : 'menu-sub-accordion']"
              :style="!isMinimized ? { display: (expandedItems.includes(index) ? 'block' : 'none') } : {}">
              <template v-for="(sub, subIdx) in item.children" :key="subIdx">
                <div class="menu-item" @click="hideMenus">
                  <router-link :to="{ path: sub.route }"
                    :class="[$route.path === sub.route ? 'menu-link active' : 'menu-link']" data-kt-menu-dismiss="true">
                    <span class="menu-bullet">
                      <span class="bullet bullet-dot"></span>
                    </span>
                    <span class="menu-title text-truncate">{{ sub.title }}</span>
                  </router-link>
                </div>
              </template>
            </div>
          </div>

        </template>
      </div>
      <!--end::Menu-->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "AsideMenu",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const expandedItems = ref<number[]>([]);
    const isMinimized = ref(false);
    const dbMenuConfig = ref<any[]>([]);
    const dbMenuConfigUtama = ref<any[]>([]);
    let observer: MutationObserver | null = null;

    const MODUL_UTAMA_KODES = ["pengajuan", "verifikasi", "komite", "pembayaran"];

    const fetchDbMenu = async () => {
      if (!authStore.isAuthenticated) {
        dbMenuConfig.value = [];
        dbMenuConfigUtama.value = [];
        return;
      }
      try {
        const response = await ApiService.get("utility/modules?parentOnly=1&perPage=100");
        let modules = response.data.data;

        const role = authStore.user?.role;
        const isSuperAdmin = !!role?.isSuperAdmin;

        if (!isSuperAdmin) {
          const perms = role?.modulePermissions || [];
          const canViewModule = (mod: any) =>
            perms.some((p: any) => (p.moduleId === mod.id || p.module?.id === mod.id) && p.canView);

          modules = modules
            .map((mod: any) => {
              const children = (mod.children || []).filter((child: any) => canViewModule(child));
              const hasDirectAccess = canViewModule(mod);
              if (!hasDirectAccess && children.length === 0) {
                return null;
              }
              return { ...mod, children };
            })
            .filter((mod: any) => mod !== null);
        }

        const toPage = (mod: any) => {
          const children = mod.children || [];
          if (children.length > 0) {
            return {
              title: mod.nama,
              route: `/${mod.routeSlug}`,
              icon: `ki-outline ki-${mod.icon || "element-11"}`,
              children: children.map((child: any) => ({
                title: child.nama,
                route: `/${child.routeSlug}`
              }))
            };
          } else {
            return {
              title: mod.nama,
              route: `/${mod.routeSlug}`,
              icon: `ki-outline ki-${mod.icon || "element-11"}`
            };
          }
        };

        const utamaModules = modules.filter((mod: any) => MODUL_UTAMA_KODES.includes(mod.kode));
        const sistemModules = modules.filter((mod: any) => !MODUL_UTAMA_KODES.includes(mod.kode));

        dbMenuConfigUtama.value = utamaModules.map(toPage);
        dbMenuConfig.value = sistemModules.map(toPage);
      } catch (err) {
        console.error("Gagal memuat menu database:", err);
        dbMenuConfig.value = [];
        dbMenuConfigUtama.value = [];
      }
    };

    const finalMenuConfig = computed(() => {
      const user = authStore.user;
      const isMitra = user?.role?.kode === "mitra" || user?.roleId === 2 || user?.email === "mitra@bjb.co.id";

      if (isMitra) {
        return [
          {
            title: "Pengajuan Online",
            route: "/pengajuan",
            icon: "ki-outline ki-file-sheet"
          }
        ];
      }

      const baseMenu = [
        {
          title: "Dashboard",
          route: "/dashboard",
          icon: "ki-outline ki-element-11"
        }
      ];

      return [...baseMenu, ...dbMenuConfigUtama.value, ...dbMenuConfig.value];
    });

    const checkMinimized = () => {
      isMinimized.value = document.body.getAttribute("data-kt-aside-minimize") === "on";
    };

    onMounted(() => {
      fetchDbMenu();
      checkMinimized();

      observer = new MutationObserver(() => {
        checkMinimized();
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-kt-aside-minimize"]
      });
    });

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }
    });

    const isParentActive = (item: any) => {
      if (!item.children || item.children.length === 0) return false;
      return item.children.some((sub: any) => route.path === sub.route);
    };

    const autoExpandActiveParent = () => {
      if (isMinimized.value) return;
      finalMenuConfig.value.forEach((item, index) => {
        if (isParentActive(item)) {
          if (!expandedItems.value.includes(index)) {
            expandedItems.value.push(index);
          }
        }
      });
    };

    watch(() => route.path, () => {
      autoExpandActiveParent();
    }, { immediate: true });

    watch(isMinimized, (newVal) => {
      nextTick(() => {
        if ((window as any).KTMenu) {
          (window as any).KTMenu.createInstances();
        }
        if (!newVal) {
          autoExpandActiveParent();
        }
      });
    });

    const toggleExpanded = (index: number) => {
      if (expandedItems.value.includes(index)) {
        expandedItems.value = expandedItems.value.filter(i => i !== index);
      } else {
        expandedItems.value.push(index);
      }
    };

    const hideMenus = () => {
      if (isMinimized.value) {
        expandedItems.value = [];
      }
    };

    return {
      finalMenuConfig,
      expandedItems,
      isMinimized,
      isParentActive,
      toggleExpanded,
      hideMenus
    };
  }
});
</script>

<style scoped>
/* Base Color Override for Dark Blue Background */
.aside-menu .menu .menu-item .menu-link {
  overflow: hidden;
  white-space: nowrap;
}

.aside-menu .menu .menu-item .menu-link .menu-title {
  color: #a1a5b7;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.aside-menu .menu .menu-item .menu-link .menu-icon {
  transition: transform 0.3s ease, margin 0.3s ease;
}

.aside-menu .menu .menu-item .menu-link .menu-icon i {
  color: #a1a5b7;
}

.aside-menu .menu .menu-item .menu-link .menu-arrow {
  transition: transform 0.3s ease;
  opacity: 0.8;
}

.aside-menu .menu .menu-item .menu-link .menu-arrow::after {
  background-color: #ffffff !important;
}

.aside-menu .menu .menu-item.show>.menu-link .menu-arrow {
  transform: rotate(90deg);
  opacity: 1;
}

/* Compact Sub Menu Links */
.menu-sub .menu-item .menu-link {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  border-radius: 8px;
  margin: 2px 10px;
}

.aside-menu .menu .menu-item.show>.menu-link .menu-arrow::after,
.aside-menu .menu .menu-item.here>.menu-link .menu-arrow::after,
.aside-menu .menu .menu-item:hover>.menu-link .menu-arrow::after {
  background-color: #ffffff !important;
  opacity: 1;
}

.aside-menu .menu .menu-item .menu-link .menu-bullet .bullet-dot {
  background-color: #a1a5b7;
  transition: all 0.3s ease;
}

/* Hover State - Soft Glassmorphism Highlight */
.aside-menu .menu .menu-item .menu-link.active {
  background-color: #0d9648 !important;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  position: relative;
}

.aside-menu .menu .menu-item .menu-link.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15%;
  bottom: 15%;
  width: 4px;
  background: white;
  border-radius: 4px 0 0 4px;
}

.aside-menu .menu .menu-item .menu-link.active .menu-title {
  color: white !important;
}

.aside-menu .menu .menu-item .menu-link.active .menu-icon,
.aside-menu .menu .menu-item .menu-link.active .menu-icon i {
  color: white !important;
}

/* Premium Hover Effect */
.aside-menu .menu-item:not(.here) .menu-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-radius: 0.65rem;
}

.aside-menu .menu-item:not(.here) .menu-link:hover:not(.active) .menu-title {
  color: #ffffff !important;
}

.aside-menu .menu-item:not(.here) .menu-link:hover:not(.active) .menu-icon i {
  color: #ffffff !important;
}

/* Minibar Hover Specifics */
[data-kt-aside-minimize="on"] .aside-menu .menu-item .menu-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
}
</style>

<style>
[data-kt-aside-minimize="on"] .aside-menu .menu-title,
[data-kt-aside-minimize="on"] .aside-menu .menu-arrow {
  display: none !important;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-link {
  justify-content: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-icon {
  margin-right: 0 !important;
}

/* Force Sub-Menu dropdown positioning in Minimized View */
[data-kt-aside-minimize="on"] .aside-menu .menu-item {
  position: relative;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-item .menu-sub-dropdown-custom.menu-sub {
  display: none !important;
  position: absolute !important;
  top: 0 !important;
  left: 100% !important;
  background-color: #1e1e2d !important;
  z-index: 1000 !important;
  border-radius: 0.65rem !important;
  max-height: 400px !important;
  height: auto !important;
  overflow-y: auto !important;
  opacity: 1 !important;
  visibility: visible !important;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-item:nth-last-child(-n+4) .menu-sub-dropdown-custom.menu-sub {
  top: auto !important;
  bottom: 0 !important;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-item:hover>.menu-sub-dropdown-custom.menu-sub {
  display: block !important;
}

[data-kt-aside-minimize="on"] .aside-menu .menu-sub-dropdown-custom.menu-sub .menu-link .menu-title {
  display: block !important;
}
</style>
