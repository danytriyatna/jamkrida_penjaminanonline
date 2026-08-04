import { ref } from "vue";
import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";
import JwtService from "@/core/services/JwtService";

export interface Role {
  id: number;
  kode: string;
  nama: string;
  isSuperAdmin: boolean;
  active: boolean;
  modulePermissions?: any[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  avatarPath?: string | null;
  active?: boolean;
  role?: Role;
  mitraId?: number | null;
  pejabatKomiteId?: number | null;
}

export const useAuthStore = defineStore("auth", () => {
  const errors = ref<Record<string, any>>({});
  const user = ref<User>({} as User);
  const isAuthenticated = ref(!!JwtService.getToken());

  function setAuth(authUser: User, token?: string) {
    isAuthenticated.value = true;
    user.value = authUser;
    errors.value = {};
    if (token) {
      JwtService.saveToken(token);
    }
    ApiService.setHeader();
  }

  function setError(error: any) {
    errors.value = { ...error };
  }

  function purgeAuth() {
    isAuthenticated.value = false;
    user.value = {} as User;
    errors.value = {};
    JwtService.destroyToken();
    ApiService.setHeader();
  }

  function login(credentials: any) {
    errors.value = {};
    return ApiService.post("login", credentials)
      .then(({ data }) => {
        setAuth(data.data.user, data.data.accessToken);
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          if (err.response.data.errors) {
            setError(err.response.data.errors);
          } else if (err.response.data.message) {
            setError({
              message: err.response.data.message,
              retryAfter: err.response.data.retryAfter,
            });
          } else {
            setError({ message: "Terjadi kesalahan." });
          }
        } else {
          setError({ message: "Koneksi ke server gagal." });
        }
      });
  }

  function logout() {
    return ApiService.post("logout", {})
      .then(() => {
        purgeAuth();
      })
      .catch((err) => {
        purgeAuth();
      });
  }

  function register(credentials: any) {
    errors.value = {};
    return ApiService.post("register", credentials)
      .then(({ data }) => {
        setAuth(data.data.user, data.data.accessToken);
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          if (err.response.data.errors) {
            setError(err.response.data.errors);
          } else if (err.response.data.message) {
            setError({ message: err.response.data.message });
          } else {
            setError({ message: "Terjadi kesalahan." });
          }
        } else {
          setError({ message: "Koneksi ke server gagal." });
        }
      });
  }

  function forgotPassword(email: string) {
    errors.value = {};
    return ApiService.post("forgot_password", { email })
      .then(() => {
        setError({});
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          if (err.response.data.errors) {
            setError(err.response.data.errors);
          } else if (err.response.data.message) {
            setError({ message: err.response.data.message });
          } else {
            setError({ message: "Terjadi kesalahan." });
          }
        } else {
          setError({ message: "Koneksi ke server gagal." });
        }
      });
  }

  function verifyAuth() {
    if (JwtService.getToken()) {
      ApiService.setHeader();
      return ApiService.get("user")
        .then(({ data }) => {
          setAuth(data.data);
        })
        .catch((err) => {
          if (err.response && err.response.data) {
            if (err.response.data.errors) {
              setError(err.response.data.errors);
            } else if (err.response.data.message) {
              setError({ message: err.response.data.message });
            }
          }
          purgeAuth();
        });
    } else {
      purgeAuth();
      return Promise.resolve();
    }
  }

  return {
    errors,
    user,
    isAuthenticated,
    login,
    logout,
    register,
    forgotPassword,
    verifyAuth,
  };
});
