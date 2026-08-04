import { ref } from "vue";
import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";

function hexToRgb(hex: string): string | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

export const useSettingsStore = defineStore("settings", () => {
  const appName = ref("Aplikasi Klaim Online PT Jamkrida Jabar");
  const logoUrl = ref<string | null>(null);
  const faviconUrl = ref<string | null>(null);
  const primaryColor = ref("#2c3691");
  const secondaryColor = ref("#0da24b");
  const fontFamily = ref("Inter");
  const footerText = ref("© 2026 PT Jamkrida Jabar (Perseroda). All rights reserved.");
  const contactEmail = ref("info@jamkridajabar.co.id");
  const contactPhone = ref("022-123456");
  const metaDescription = ref("Aplikasi Klaim Online PT Jamkrida Jabar");
  const metaKeywords = ref("jamkrida, klaim, online, jabar");

  const loading = ref(false);
  const error = ref<string | null>(null);

  function applyStyles() {
    const root = document.documentElement;
    
    if (primaryColor.value) {
      root.style.setProperty("--bs-primary", primaryColor.value);
      root.style.setProperty("--kt-primary", primaryColor.value);
      const rgb = hexToRgb(primaryColor.value);
      if (rgb) {
        root.style.setProperty("--bs-primary-rgb", rgb);
        root.style.setProperty("--kt-primary-rgb", rgb);
      }
    }
    
    if (secondaryColor.value) {
      root.style.setProperty("--bs-secondary", secondaryColor.value);
      root.style.setProperty("--kt-secondary", secondaryColor.value);
      const rgb = hexToRgb(secondaryColor.value);
      if (rgb) {
        root.style.setProperty("--bs-secondary-rgb", rgb);
        root.style.setProperty("--kt-secondary-rgb", rgb);
      }
    }

    if (fontFamily.value) {
      // Dynamic Google Font injection
      const fontId = "dynamic-google-font";
      let fontLink: HTMLLinkElement | null = document.getElementById(fontId) as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement("link");
        fontLink.id = fontId;
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
      }
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontFamily.value.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;

      root.style.setProperty("--bs-font-sans-serif", `"${fontFamily.value}", sans-serif`);
      document.body.style.fontFamily = `"${fontFamily.value}", sans-serif`;
    }

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl.value || "/media/logos/jamkrida-jabar-official.svg";
  }

  function setStates(data: any) {
    appName.value = data.appName;
    logoUrl.value = data.logoUrl;
    faviconUrl.value = data.faviconUrl;
    primaryColor.value = data.primaryColor;
    secondaryColor.value = data.secondaryColor;
    fontFamily.value = data.fontFamily;
    footerText.value = data.footerText;
    contactEmail.value = data.contactEmail;
    contactPhone.value = data.contactPhone;
    metaDescription.value = data.metaDescription;
    metaKeywords.value = data.metaKeywords;
    
    applyStyles();
  }

  function fetchSettings() {
    loading.value = true;
    error.value = null;
    return ApiService.get("settings")
      .then(({ data }) => {
        setStates(data.data);
      })
      .catch((err) => {
        console.error("Gagal mengambil app settings:", err);
        error.value = "Gagal mengambil konfigurasi aplikasi.";
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function updateSettings(payload: any) {
    loading.value = true;
    error.value = null;
    return ApiService.put("settings", payload)
      .then(({ data }) => {
        setStates(data.data);
      })
      .catch((err) => {
        console.error("Gagal memperbarui app settings:", err);
        error.value = err.response?.data?.message || "Gagal memperbarui konfigurasi.";
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function uploadLogo(file: File) {
    loading.value = true;
    error.value = null;
    const formData = new FormData();
    formData.append("logo", file);

    return ApiService.post("settings/logo", formData)
      .then(({ data }) => {
        setStates(data.data);
      })
      .catch((err) => {
        console.error("Gagal upload logo:", err);
        error.value = err.response?.data?.message || "Gagal upload logo.";
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function uploadFavicon(file: File) {
    loading.value = true;
    error.value = null;
    const formData = new FormData();
    formData.append("favicon", file);

    return ApiService.post("settings/favicon", formData)
      .then(({ data }) => {
        setStates(data.data);
      })
      .catch((err) => {
        console.error("Gagal upload favicon:", err);
        error.value = err.response?.data?.message || "Gagal upload favicon.";
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    appName,
    logoUrl,
    faviconUrl,
    primaryColor,
    secondaryColor,
    fontFamily,
    footerText,
    contactEmail,
    contactPhone,
    metaDescription,
    metaKeywords,
    loading,
    error,
    fetchSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon,
    applyStyles,
  };
});
