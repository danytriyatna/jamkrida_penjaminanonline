<template>
    <div class="footer py-2 d-flex flex-lg-column" id="kt_footer">
        <!--begin::Container-->
        <div
            class="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between pb-4 pb-md-0">
            <!--begin::Copyright-->
            <div class="text-gray-900 order-2 order-md-1 fs-8">
                <span class="text-muted fw-semibold me-1">&copy; Copyright 2026</span>
                <a href="https://www.jamkrida-jabar.co.id" target="_blank" class="text-gray-800 text-hover-primary">
                    <span class="text-primary">PT Jamkrida Jabar (Perseroda)</span>
                </a>
            </div>
            <!--end::Copyright-->

            <!--begin::Menu-->
            <ul class="menu menu-gray-600 menu-hover-primary fw-semibold order-1 fs-8">
                <li class="menu-item">
                    <a href="#" target="_blank" class="menu-link px-2 text-primary">Next Generation System ,
                        Version: {{ version }}</a>
                </li>
            </ul>
            <!--end::Menu-->
        </div>
        <!--end::Container-->
    </div>
</template>
<script>
import { getEnv } from '@/helpers/env.js';

export default {
    data() {
        return {
            version: getEnv('VUE_APP_VERSION')
        }
    }
}
</script>
