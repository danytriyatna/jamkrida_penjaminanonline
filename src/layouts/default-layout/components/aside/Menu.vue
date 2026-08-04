<template>
  <!--begin::Menu wrapper-->
  <div
    id="kt_aside_menu_wrapper"
    ref="scrollElRef"
    class="hover-scroll-overlay-y px-2 my-5 my-lg-5"
    data-kt-scroll="true"
    data-kt-scroll-height="auto"
    data-kt-scroll-dependencies="{default: '#kt_aside_toolbar, #kt_aside_footer', lg: '#kt_header, #kt_aside_toolbar, #kt_aside_footer'}"
    data-kt-scroll-wrappers="#kt_aside_menu"
    data-kt-scroll-offset="5px"
  >
    <!--begin::Menu-->
    <div
      id="#kt_aside_menu"
      class="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500"
      data-kt-menu="true"
    >
      <template v-for="(item, i) in finalMenuConfig" :key="i">
        <div v-if="item.heading" class="menu-item">
          <div class="menu-content pt-8 pb-2">
            <span class="menu-section text-muted text-uppercase fs-8 ls-1">
              {{ translate(item.heading) }}
            </span>
          </div>
        </div>
        <template v-for="(menuItem, j) in item.pages" :key="j">
          <template v-if="menuItem.heading">
            <div class="menu-item">
              <router-link
                v-if="menuItem.route"
                class="menu-link"
                active-class="active"
                :to="menuItem.route"
              >
                <span
                  v-if="menuItem.keenthemesIcon || menuItem.bootstrapIcon"
                  class="menu-icon"
                >
                  <i
                    v-if="asideMenuIcons === 'bootstrap'"
                    :class="menuItem.bootstrapIcon"
                    class="bi fs-3"
                  ></i>
                  <KTIcon
                    v-else-if="asideMenuIcons === 'keenthemes'"
                    :icon-name="menuItem.keenthemesIcon"
                    icon-class="fs-2"
                  />
                </span>
                <span class="menu-title">{{
                  translate(menuItem.heading)
                }}</span>
              </router-link>
            </div>
          </template>
          <div
            v-if="menuItem.sectionTitle && menuItem.route"
            :class="{ show: hasActiveChildren(menuItem.route) }"
            class="menu-item menu-accordion"
            data-kt-menu-sub="accordion"
            data-kt-menu-trigger="click"
          >
            <span class="menu-link">
              <span
                v-if="menuItem.keenthemesIcon || menuItem.bootstrapIcon"
                class="menu-icon"
              >
                <i
                  v-if="asideMenuIcons === 'bootstrap'"
                  :class="menuItem.bootstrapIcon"
                  class="bi fs-3"
                ></i>
                <KTIcon
                  v-else-if="asideMenuIcons === 'keenthemes'"
                  :icon-name="menuItem.keenthemesIcon"
                  icon-class="fs-2"
                />
              </span>
              <span class="menu-title">{{
                translate(menuItem.sectionTitle)
              }}</span>
              <span class="menu-arrow"></span>
            </span>
            <div
              v-if="menuItem.route"
              :class="{ show: hasActiveChildren(menuItem.route) }"
              class="menu-sub menu-sub-accordion"
            >
              <template v-for="(item2, k) in menuItem.sub" :key="k">
                <div v-if="item2.heading" class="menu-item">
                  <router-link
                    v-if="item2.route"
                    class="menu-link"
                    active-class="active"
                    :to="item2.route"
                  >
                    <span class="menu-bullet">
                      <span class="bullet bullet-dot"></span>
                    </span>
                    <span class="menu-title">{{
                      translate(item2.heading)
                    }}</span>
                  </router-link>
                </div>
                <div
                  v-if="item2.sectionTitle && item2.route"
                  :class="{ show: hasActiveChildren(item2.route) }"
                  class="menu-item menu-accordion"
                  data-kt-menu-sub="accordion"
                  data-kt-menu-trigger="click"
                >
                  <span class="menu-link">
                    <span class="menu-bullet">
                      <span class="bullet bullet-dot"></span>
                    </span>
                    <span class="menu-title">{{
                      translate(item2.sectionTitle)
                    }}</span>
                    <span class="menu-arrow"></span>
                  </span>
                  <div
                    :class="{ show: hasActiveChildren(item2.route) }"
                    class="menu-sub menu-sub-accordion"
                  >
                    <template v-for="(item3, k) in item2.sub" :key="k">
                      <div v-if="item3.heading" class="menu-item">
                        <router-link
                          v-if="item3.route"
                          class="menu-link"
                          active-class="active"
                          :to="item3.route"
                        >
                          <span class="menu-bullet">
                            <span class="bullet bullet-dot"></span>
                          </span>
                          <span class="menu-title">{{
                            translate(item3.heading)
                          }}</span>
                        </router-link>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </template>
    </div>
    <!--end::Menu-->
  </div>
  <!--end::Menu wrapper-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent, onMounted, ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { version } from "@/core/helpers/system";
import { asideMenuIcons } from "@/layouts/default-layout/config/helper";
import MainMenuConfig from "@/layouts/default-layout/config/MainMenuConfig";
import ApiService from "@/core/services/ApiService";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
  name: "kt-menu",
  components: {},
  setup() {
    const { t, te } = useI18n();
    const route = useRoute();
    const scrollElRef = ref<null | HTMLElement>(null);
    const authStore = useAuthStore();
    const dbMenuConfig = ref<any[]>([]);
    const dbMenuConfigUtama = ref<any[]>([]);

    // Modules that belong in "Modul Utama" (core claim workflow), everything else stays in "Modul Sistem"
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

        // Terapkan filter Role & Izin: sembunyikan modul yang tidak diizinkan untuk role user saat ini.
        // Super Admin (isSuperAdmin) melihat semua modul tanpa filter.
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
              sectionTitle: mod.nama,
              route: `/${mod.routeSlug}`,
              keenthemesIcon: mod.icon || "element-11",
              bootstrapIcon: `bi-${mod.icon || 'grid'}`,
              sub: children.map((child: any) => ({
                heading: child.nama,
                route: `/${child.routeSlug}`
              }))
            };
          } else {
            return {
              heading: mod.nama,
              route: `/${mod.routeSlug}`,
              keenthemesIcon: mod.icon || "element-11",
              bootstrapIcon: `bi-${mod.icon || 'grid'}`
            };
          }
        };

        const utamaModules = modules.filter((mod: any) => MODUL_UTAMA_KODES.includes(mod.kode));
        const sistemModules = modules.filter((mod: any) => !MODUL_UTAMA_KODES.includes(mod.kode));

        dbMenuConfigUtama.value = utamaModules.length > 0 ? [
          {
            heading: "Modul Utama",
            pages: utamaModules.map(toPage)
          }
        ] : [];

        dbMenuConfig.value = sistemModules.length > 0 ? [
          {
            heading: "Modul Sistem",
            pages: sistemModules.map(toPage)
          }
        ] : [];
      } catch (err) {
        console.error("Gagal memuat menu database:", err);
        dbMenuConfig.value = [];
        dbMenuConfigUtama.value = [];
      }
    };

    onMounted(() => {
      if (scrollElRef.value) {
        scrollElRef.value.scrollTop = 0;
      }
      fetchDbMenu();
    });

    watch(() => authStore.isAuthenticated, (newVal) => {
      if (newVal) {
        fetchDbMenu();
      } else {
        dbMenuConfig.value = [];
      }
    });

    const finalMenuConfig = computed(() => {
      const user = authStore.user;
      const isMitra = user?.role?.kode === "mitra" || user?.roleId === 2 || user?.email === "mitra@bjb.co.id";

      if (isMitra) {
        return [
          {
            heading: "Modul Utama",
            pages: [
              {
                heading: "Pengajuan Online",
                route: "/pengajuan",
                keenthemesIcon: "file-sheet",
                bootstrapIcon: "bi-file-earmark-text",
              },
            ],
          },
        ];
      }

      // Order: Dashboard/Layout builder -> Modul Utama (klaim workflow) -> Crafted -> Modul Sistem
      const [dashboardGroup, ...restMainMenu] = MainMenuConfig;
      return [dashboardGroup, ...dbMenuConfigUtama.value, ...restMainMenu, ...dbMenuConfig.value];
    });

    const translate = (text: string) => {
      if (te(text)) {
        return t(text);
      } else {
        return text;
      }
    };

    const hasActiveChildren = (match: string) => {
      return route.path.indexOf(match) !== -1;
    };

    return {
      hasActiveChildren,
      finalMenuConfig,
      asideMenuIcons,
      version,
      translate,
      scrollElRef,
      getAssetPath,
    };
  },
});
</script>
