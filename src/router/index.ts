import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";
import { useSettingsStore } from "@/stores/settings";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("@/layouts/default-layout/DefaultLayout.vue"),
    meta: {
      middleware: "auth",
    },
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: {
          pageTitle: "Dashboard",
          breadcrumbs: ["Dashboards"],
        },
      },
      {
        path: "/builder",
        name: "builder",
        component: () => import("@/views/LayoutBuilder.vue"),
        meta: {
          pageTitle: "Layout Builder",
          breadcrumbs: ["Layout"],
        },
      },
      {
        path: "/utility/setting-web",
        name: "utility-setting-web",
        component: () => import("@/views/utility/Settings.vue"),
        meta: {
          pageTitle: "Setting Web",
          breadcrumbs: ["Utility", "Setting Web"],
        },
      },
      {
        path: "/utility/log-access",
        name: "utility-log-access",
        component: () => import("@/views/utility/Logs.vue"),
        meta: {
          pageTitle: "Log Akses",
          breadcrumbs: ["Utility", "Log Akses"],
        },
      },
      {
        path: "/utility/role-module",
        name: "utility-role-module",
        component: () => import("@/views/utility/Roles.vue"),
        meta: {
          pageTitle: "Role & Module",
          breadcrumbs: ["Utility", "Role & Module"],
        },
      },
      {
        path: "/referensi",
        name: "referensi",
        component: () => import("@/views/referensi/Referensi.vue"),
        meta: {
          pageTitle: "Data Referensi",
          breadcrumbs: ["Referensi"],
        },
      },
      {
        path: "/profile",
        name: "profile",
        component: () => import("@/views/profile/Profile.vue"),
        meta: {
          pageTitle: "Profil Saya",
          breadcrumbs: ["Profil"],
        },
      },
      {
        path: "/pengajuan",
        name: "pengajuan",
        component: () => import("@/views/apps/pengajuan/PengajuanKlaim.vue"),
        meta: {
          pageTitle: "Pengajuan Klaim",
          breadcrumbs: ["Klaim", "Pengajuan"],
        },
      },
      {
        path: "/verifikasi",
        name: "verifikasi",
        component: () => import("@/views/apps/verifikasi/VerifikasiKlaim.vue"),
        meta: {
          pageTitle: "Analisa & Verifikasi",
          breadcrumbs: ["Klaim", "Verifikasi"],
        },
      },
      {
        path: "/komite",
        name: "komite",
        component: () => import("@/views/apps/komite/SidangKomite.vue"),
        meta: {
          pageTitle: "Sidang Komite",
          breadcrumbs: ["Klaim", "Sidang Komite"],
        },
      },
      {
        path: "/pembayaran",
        name: "pembayaran",
        component: () => import("@/views/apps/pembayaran/PembayaranKlaim.vue"),
        meta: {
          pageTitle: "Pembayaran Klaim",
          breadcrumbs: ["Klaim", "Pembayaran"],
        },
      },
      {
        path: "/regaransi",
        redirect: "/regaransi-jiwa/pengajuan",
      },
      {
        path: "/regaransi-jiwa/pengajuan",
        name: "regaransi-jiwa-pengajuan",
        component: () => import("@/views/apps/regaransi/jiwa/PengajuanJiwa.vue"),
        meta: {
          pageTitle: "Pengajuan Regaransi Jiwa",
          breadcrumbs: ["Regaransi", "Asuransi Jiwa", "Pengajuan"],
        },
      },
      {
        path: "/regaransi-jiwa/persetujuan",
        name: "regaransi-jiwa-persetujuan",
        component: () => import("@/views/apps/regaransi/jiwa/PersetujuanJiwa.vue"),
        meta: {
          pageTitle: "Persetujuan Regaransi Jiwa",
          breadcrumbs: ["Regaransi", "Asuransi Jiwa", "Persetujuan"],
        },
      },
      {
        path: "/regaransi-jiwa/pembayaran",
        name: "regaransi-jiwa-pembayaran",
        component: () => import("@/views/apps/regaransi/jiwa/PembayaranJiwa.vue"),
        meta: {
          pageTitle: "Pembayaran Regaransi Jiwa",
          breadcrumbs: ["Regaransi", "Asuransi Jiwa", "Pembayaran"],
        },
      },
      {
        path: "/kredit-macet/pengajuan",
        name: "kredit-macet-pengajuan",
        component: () => import("@/views/apps/regaransi/kredit/PengajuanKredit.vue"),
        meta: {
          pageTitle: "Pengajuan Kredit Macet",
          breadcrumbs: ["Regaransi", "Kredit Macet", "Pengajuan"],
        },
      },
      {
        path: "/kredit-macet/persetujuan",
        name: "kredit-macet-persetujuan",
        component: () => import("@/views/apps/regaransi/kredit/PersetujuanKredit.vue"),
        meta: {
          pageTitle: "Persetujuan Kredit Macet",
          breadcrumbs: ["Regaransi", "Kredit Macet", "Persetujuan"],
        },
      },
      {
        path: "/kredit-macet/pembayaran",
        name: "kredit-macet-pembayaran",
        component: () => import("@/views/apps/regaransi/kredit/PembayaranKredit.vue"),
        meta: {
          pageTitle: "Pembayaran Kredit Macet",
          breadcrumbs: ["Regaransi", "Kredit Macet", "Pembayaran"],
        },
      },
      {
        path: "/template-show",
        name: "template-show",
        component: () => import("@/views/TemplateShow.vue"),
        meta: {
          pageTitle: "Template & Design System",
          breadcrumbs: ["Template"],
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "/sign-in",
        name: "sign-in",
        component: () =>
          import("@/views/crafted/authentication/basic-flow/SignIn.vue"),
        meta: {
          pageTitle: "Sign In",
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/SystemLayout.vue"),
    children: [
      {
        path: "/komite/cetak/:id",
        name: "komite-cetak",
        component: () => import("@/views/apps/komite/CetakDokumenKomite.vue"),
        meta: {
          pageTitle: "Cetak Dokumen Komite",
        },
      },
      {
        path: "/404",
        name: "404",
        component: () => import("@/views/crafted/authentication/Error404.vue"),
        meta: {
          pageTitle: "Error 404",
        },
      },
      {
        path: "/500",
        name: "500",
        component: () => import("@/views/crafted/authentication/Error500.vue"),
        meta: {
          pageTitle: "Error 500",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 80,
        behavior: "smooth",
      };
    } else {
      return {
        top: 0,
        left: 0,
        behavior: "smooth",
      };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const configStore = useConfigStore();
  const settingsStore = useSettingsStore();

  document.title = `${to.meta.pageTitle} - ${settingsStore.appName || 'Penjaminan Online'}`;

  configStore.resetLayoutConfig();

  if (authStore.isAuthenticated && (!authStore.user || Object.keys(authStore.user).length === 0)) {
    await authStore.verifyAuth();
  }

  if (to.meta.middleware == "auth") {
    if (authStore.isAuthenticated) {
      const user = authStore.user;
      const isMitra = user?.role?.kode === "mitra" || user?.roleId === 2 || user?.email === "mitra@bjb.co.id";

      // 1. Direct handling for Mitra role
      if (isMitra) {
        if (to.name === "pengajuan" || to.name === "profile") {
          next();
        } else {
          next({ name: "pengajuan" });
        }
        return;
      }

      // 2. Direct handling for SuperAdmin & Internal Staff Dashboard
      if (user?.role?.isSuperAdmin || to.name === "dashboard" || to.path === "/") {
        next();
        return;
      }

      // 3. Permission check for specific modules
      const routeName = to.name as string;
      const targetModules = [
        "utility-setting-web",
        "utility-log-access",
        "utility-role-module",
        "referensi",
        "akses",
        "pengajuan",
        "verifikasi",
        "komite",
        "pembayaran",
        "regaransi",
        "regaransi-jiwa-pengajuan",
        "regaransi-jiwa-persetujuan",
        "regaransi-jiwa-pembayaran",
        "kredit-macet-pengajuan",
        "kredit-macet-persetujuan",
        "kredit-macet-pembayaran",
        "profile"
      ];

      if (routeName && targetModules.includes(routeName)) {
        const perms = user?.role?.modulePermissions || [];
        const hasPermission = perms.some(
          (p: any) => p.module?.kode === routeName && p.canView
        );

        if (!hasPermission) {
          if (to.name !== "dashboard") {
            next({ name: "dashboard" });
          } else {
            next();
          }
          return;
        }
      }

      next();
    } else {
      next({ name: "sign-in" });
    }
  } else {
    if ((to.name === "sign-in" || to.name === "sign-up") && authStore.isAuthenticated) {
      const user = authStore.user;
      const isMitra = user?.role?.kode === "mitra" || user?.roleId === 2 || user?.email === "mitra@bjb.co.id";
      next({ name: isMitra ? "pengajuan" : "dashboard" });
    } else {
      next();
    }
  }
});

export default router;
