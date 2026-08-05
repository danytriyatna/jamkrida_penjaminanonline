<template>
  <div class="position-relative notification-dropdown-wrapper" ref="dropdownRef" style="z-index: 100;">
    <a href="#" class="btn btn-icon btn-sm btn-active-light-primary position-relative me-2" @click.prevent="toggleDropdown" title="Notifikasi">
      <i class="ki-outline ki-notification-on fs-1" :class="{ 'animate-swing': unreadCount > 0 && !hasOpened }"></i>
      <span v-if="unreadCount > 0" class="position-absolute top-0 end-0 badge badge-circle badge-danger w-18px h-18px fs-9 mt-n1 me-n1 pulse">
        {{ unreadCount }}
        <span class="pulse-ring"></span>
      </span>
    </a>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-350px shadow-lg show notification-menu bg-body"
      style="position: absolute; right: 0; top: 100%; margin-top: 10px; z-index: 99999;">
      
      <div class="px-5 py-3 d-flex align-items-center justify-content-between border-bottom border-gray-200 mb-2">
        <span class="fs-6 fw-bold text-gray-800">Notifikasi</span>
        <a v-if="unreadCount > 0" href="#" class="fs-8 fw-bold text-primary text-hover-primary" @click.prevent="markAllRead">
          Tandai Semua Dibaca
        </a>
      </div>

      <div class="scroll-y mh-325px px-2">
        <div v-if="notifications.length === 0" class="text-center py-10">
          <i class="ki-outline ki-notification-on fs-3x text-gray-300 mb-3"></i>
          <p class="text-gray-500 fs-7">Belum ada notifikasi baru</p>
        </div>

        <div v-else v-for="notif in notifications" :key="notif.id" @click="handleNotifClick(notif)" class="menu-item px-3 mb-1">
          <div class="menu-link px-4 py-4 rounded-3 d-flex align-items-start gap-4 transition-all" :class="{ 'unread-notif bg-light-soft-blue': !notif.isRead }">
            <!-- Icon Symbol -->
            <div class="symbol symbol-45px flex-shrink-0">
              <span class="symbol-label rounded-3" :class="getNotifBg(notif)">
                <i :class="[getNotifIcon(notif), 'fs-2 text-' + notif.type]"></i>
              </span>
            </div>

            <!-- Content -->
            <div class="d-flex flex-column flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="fs-7 fw-bold text-gray-900 text-truncate pe-2">{{ notif.title }}</span>
                <span class="fs-9 text-gray-500 flex-shrink-0">{{ notif.time }}</span>
              </div>
              <p class="fs-8 text-gray-600 mb-0 line-clamp-2 lh-base">{{ notif.message }}</p>
            </div>

            <!-- Unread Dot -->
            <div v-if="!notif.isRead" class="unread-dot bg-primary ms-2 mt-2"></div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 border-top border-gray-200 mt-2 text-center">
        <a href="#" @click.prevent="closeDropdown" class="fs-8 fw-bold text-gray-600 text-hover-primary">
          Tutup Notifikasi
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const hasOpened = ref(false)
const dropdownRef = ref(null)

const notifications = ref([
  {
    id: 1,
    title: 'Pengajuan Klaim Disetujui',
    message: 'Klaim debitur PT Constructo Karya (Jaminan Pelaksanaan) senilai Rp 250.000.000 telah disetujui komite.',
    type: 'success',
    time: '5 menit yang lalu',
    isRead: false
  },
  {
    id: 2,
    title: 'Berkas Perlu Perbaikan',
    message: 'Klaim CV Bina Nusantara (Jaminan Penawaran) dikembalikan karena lampiran SPG kurang lengkap.',
    type: 'warning',
    time: '2 jam yang lalu',
    isRead: false
  },
  {
    id: 3,
    title: 'Pembayaran Regaransi Berhasil',
    message: 'Pembayaran premi Regaransi Jiwa untuk 12 debitur Bank BJB telah divalidasi dan terbayar.',
    type: 'info',
    time: '1 hari yang lalu',
    isRead: true
  }
])

const unreadCount = ref(2)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    hasOpened.value = true
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const markAllRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  unreadCount.value = 0
}

const handleNotifClick = (notif) => {
  if (!notif.isRead) {
    notif.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
}

const getNotifIcon = (notif) => {
  if (notif.type === 'success') return 'ki-solid ki-shield-check'
  if (notif.type === 'warning') return 'ki-solid ki-information-3'
  if (notif.type === 'danger') return 'ki-solid ki-cross'
  return 'ki-solid ki-notification-on'
}

const getNotifBg = (notif) => {
  if (notif.type === 'success') return 'bg-light-success'
  if (notif.type === 'warning') return 'bg-light-warning'
  if (notif.type === 'danger') return 'bg-light-danger'
  return 'bg-light-primary'
}

// Click outside handling
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.mh-325px {
  max-height: 325px;
}
.unread-notif {
  position: relative;
}
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.bg-light-soft-blue {
  background-color: var(--bs-primary-light) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lh-base {
  line-height: 1.45 !important;
}
.pulse {
  animation: pulse-animation 2s infinite;
}
@keyframes pulse-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.animate-swing {
  animation: swing-animation 2s ease infinite;
}
@keyframes swing-animation {
  0%, 100% { transform: rotate(0); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-10deg); }
  30% { transform: rotate(5deg); }
  40% { transform: rotate(-5deg); }
  50% { transform: rotate(0); }
}
</style>
