<template>
    <div class="toolbar d-flex align-items-stretch">
        <div
            class="container-xxl py-6 py-lg-0 d-flex flex-column flex-lg-row align-items-lg-stretch justify-content-lg-between">
            <div class="page-title d-flex justify-content-center flex-column me-5">
                <h1 class="d-flex flex-column text-gray-900 fw-bold fs-3 mb-0">{{ $route.meta.description }}</h1>
                <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 pt-1"
                    v-if="$route.name !== 'Halaman Utama'">
                    <li class="breadcrumb-item text-muted">
                        <router-link to="/">Beranda</router-link>
                    </li>
                    <li class="breadcrumb-item">
                        <span class="bullet bg-gray-300 w-5px h-2px"></span>
                    </li>
                    <li class="breadcrumb-item text-muted">{{ $route.name }}</li>
                </ul>
            </div>

            <div class="d-flex align-items-stretch overflow-auto pt-3 pt-lg-0">
                <div class="d-flex align-items-center"></div>
                <div class="d-flex align-items-center">
                    <a href="#" class="btn btn-sm btn-icon btn-icon-muted btn-active-icon-primary"
                        data-kt-menu-trigger="{default:'click', lg: 'hover'}" data-kt-menu-attach="parent"
                        data-kt-menu-placement="bottom-end">
                        <i class="ki-duotone ki-night-day theme-light-show fs-1"><span class="path1"></span><span
                                class="path2"></span><span class="path3"></span><span class="path4"></span><span
                                class="path5"></span><span class="path6"></span><span class="path7"></span><span
                                class="path8"></span><span class="path9"></span><span class="path10"></span></i>
                        <i class="ki-duotone ki-moon theme-dark-show fs-1"><span class="path1"></span><span
                                class="path2"></span></i></a>
                    <div class="bullet bg-secondary h-35px w-1px mx-5"></div>
                    <a href="#" @click="logout()" data-bs-toggle="tooltip" data-bs-placement="top" title="Logout"
                        class="btn btn-sm btn-icon btn-icon-muted btn-active-icon-primary"
                        data-kt-menu-trigger="{default:'click', lg: 'hover'}" data-kt-menu-attach="parent"
                        data-kt-menu-placement="bottom-end">
                        <i class="ki-duotone ki-exit-right theme-light-show fs-1"><span class="path1"></span><span
                                class="path2"></span><span class="path3"></span><span class="path4"></span><span
                                class="path5"></span><span class="path6"></span><span class="path7"></span><span
                                class="path8"></span><span class="path9"></span><span class="path10"></span></i>
                        <i class="ki-duotone ki-exit-right theme-dark-show fs-1"><span class="path1"></span><span
                                class="path2"></span></i></a>
                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-700 menu-active-bg menu-state-color fw-semibold py-2 fs-7 w-135px"
                        data-kt-menu="true" data-kt-element="theme-mode-menu">
                        <div class="menu-item px-2 my-0">
                            <a href="#" class="menu-link px-2 py-1" data-kt-element="mode" data-kt-value="light">
                                <span class="menu-icon" data-kt-element="icon">
                                    <i class="ki-outline ki-night-day fs-3"></i>
                                </span>
                                <span class="menu-title"> Light </span>
                            </a>
                        </div>
                        <div class="menu-item px-2 my-0">
                            <a href="#" class="menu-link px-2 py-1" data-kt-element="mode" data-kt-value="dark">
                                <span class="menu-icon" data-kt-element="icon">
                                    <i class="ki-outline ki-moon fs-3"></i>
                                </span>
                                <span class="menu-title"> Dark </span>
                            </a>
                        </div>
                        <div class="menu-item px-2 my-0">
                            <a href="#" class="menu-link px-2 py-1" data-kt-element="mode" data-kt-value="system">
                                <span class="menu-icon" data-kt-element="icon">
                                    <i class="ki-outline ki-screen fs-3"></i>
                                </span>
                                <span class="menu-title"> System </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { fswal } from '@/helpers/fswal.js'

export default {
    methods: {
        logout() {
            fswal.fire({
                title: "Logout dari aplikasi ?",
                text: "Apakah anda akan keluar dari aplikasi sekarang ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Ya, lanjut !",
                cancelButtonText: "Ga, batalkan !"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$router.push('/logout')
                }
            });

        }
    }
};
</script>
