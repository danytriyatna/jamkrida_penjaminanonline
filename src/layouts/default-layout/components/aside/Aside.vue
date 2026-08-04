<template>
  <!--begin::Aside-->
  <div
    id="kt_aside"
    class="aside"
    data-kt-drawer="true"
    data-kt-drawer-name="aside"
    data-kt-drawer-activate="{default: true, lg: false}"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
    data-kt-drawer-direction="start"
    data-kt-drawer-toggle="#kt_aside_mobile_toggle"
  >
    <!--begin::Aside Toolbarl-->
    <div class="aside-toolbar flex-column-auto" id="kt_aside_toolbar">
      <!--begin::Aside user-->
      <AsideToolbar />
      <!--end::Aside user-->
    </div>
    <!--end::Aside Toolbarl-->

    <!--begin::Aside menu-->
    <div class="aside-menu flex-column-fluid">
      <KTMenu></KTMenu>
    </div>
    <!--end::Aside menu-->
  </div>
  <!--end::Aside-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import KTMenu from "@/layouts/default-layout/components/aside/Menu.vue";
import AsideToolbar from "@/layouts/default-layout/components/aside/AsideToolbar.vue";

export default defineComponent({
  name: "KTAside",
  components: {
    KTMenu,
    AsideToolbar,
  },
  props: {
    lightLogo: String,
    darkLogo: String,
  },
  setup() {
    return {
      getAssetPath,
    };
  },
});
</script>
