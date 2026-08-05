<template>
  <div class="container-fluid py-8 px-6 px-lg-10">
    <!-- Header Banner -->
    <div class="card border-0 shadow-sm rounded-4 bg-gradient-primary text-white mb-8 overflow-hidden position-relative">
      <div class="card-body p-8 p-lg-10 position-relative z-index-1">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          <div>
            <span class="badge bg-white bg-opacity-20 text-white px-3 py-2 rounded-pill fs-8 fw-bold text-uppercase ls-1 mb-3">
              <i class="ki-solid ki-element-11 me-1"></i> Design System & Starter Kit Template
            </span>
            <h1 class="text-white fw-bolder fs-2x mb-2">UI Component & Design System Guide</h1>
            <p class="text-white text-opacity-80 fs-6 mb-0 max-w-700px">
              Standardized UI Template (Vue 3 + Bootstrap 5 + Metronic Theme). All components, modal dialogs, data tables, color tokens, typography, alerts, and forms ready for instant reuse and AI Agent prompting.
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-light text-primary fw-bold px-5" @click="copyPromptGuide">
              <i class="ki-solid ki-copy me-2"></i> Salin Prompt AI Agent
            </button>
            <a href="#modal-section" class="btn btn-outline-light fw-bold px-4">
              <i class="ki-solid ki-eye me-1"></i> Preview UI
            </a>
          </div>
        </div>
      </div>
      <!-- Background Decorative Watermark -->
      <div class="position-absolute end-0 bottom-0 opacity-10 pe-10 pb-5 pointer-events-none">
        <i class="ki-solid ki-code fs-9x text-white"></i>
      </div>
    </div>

    <!-- Quick Navigation Tabs -->
    <ul class="nav nav-pills nav-pills-custom mb-8 gap-2 bg-white p-2 rounded-4 shadow-xs border border-gray-100">
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'colors' }" @click="activeSection = 'colors'">
          <i class="ki-solid ki-palette me-2"></i> Color Palette
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'typography' }" @click="activeSection = 'typography'">
          <i class="ki-solid ki-text-number me-2"></i> Typography
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'cards' }" @click="activeSection = 'cards'">
          <i class="ki-solid ki-element-plus me-2"></i> Cards
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'tables' }" @click="activeSection = 'tables'">
          <i class="ki-solid ki-table me-2"></i> Tables & Badges
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'modals' }" @click="activeSection = 'modals'">
          <i class="ki-solid ki-notification-status me-2"></i> Modals & Alerts
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark fw-bold px-4 py-3 rounded-3" :class="{ active: activeSection === 'forms' }" @click="activeSection = 'forms'">
          <i class="ki-solid ki-element-7 me-2"></i> Forms & Buttons
        </a>
      </li>
    </ul>

    <!-- SECTION 1: COLOR PALETTE -->
    <div v-show="activeSection === 'colors'" class="mb-10">
      <UiCard title="1. Color Palette Tokens" subtitle="Standard palette tokens with dark/light mode soft variants" icon="ki-solid ki-palette" variant="primary">
        <div class="row g-4">
          <div v-for="color in colorsList" :key="color.name" class="col-6 col-sm-4 col-md-3 col-xl-2">
            <div class="card h-100 border border-gray-200 rounded-3 shadow-xs overflow-hidden">
              <div class="h-80px d-flex align-items-end p-3 text-white fw-bold fs-7" :style="{ backgroundColor: color.hex }">
                <span>{{ color.hex }}</span>
              </div>
              <div class="card-body p-3 bg-body">
                <span class="fw-bold text-dark fs-7 d-block">{{ color.name }}</span>
                <code class="fs-9 text-muted">{{ color.class }}</code>
                <div class="mt-2 p-2 rounded-2 fs-9 fw-semibold text-center" :class="color.softClass">
                  {{ color.softClass }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- SECTION 2: TYPOGRAPHY & FONTS -->
    <div v-show="activeSection === 'typography'" class="mb-10">
      <UiCard title="2. Typography & Fonts" subtitle="Heading hierarchy, body font styles, and badge labels" icon="ki-solid ki-text-number" variant="info">
        <div class="row g-6">
          <div class="col-lg-6">
            <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-4">Headings (Font-Family: System Sans / Inter)</h6>
            <div class="d-flex flex-column gap-3 p-4 bg-light rounded-3">
              <h1 class="mb-0 text-dark">H1 - Heading 1 (2.25rem / 36px)</h1>
              <h2 class="mb-0 text-dark">H2 - Heading 2 (1.75rem / 28px)</h2>
              <h3 class="mb-0 text-dark">H3 - Heading 3 (1.5rem / 24px)</h3>
              <h4 class="mb-0 text-dark">H4 - Heading 4 (1.25rem / 20px)</h4>
              <h5 class="mb-0 text-dark">H5 - Heading 5 (1.15rem / 18px)</h5>
              <h6 class="mb-0 text-dark">H6 - Heading 6 (1.0rem / 16px)</h6>
            </div>
          </div>
          <div class="col-lg-6">
            <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-4">Body Styles & Text Utility Classes</h6>
            <div class="d-flex flex-column gap-3 p-4 bg-light rounded-3">
              <p class="lead mb-0 text-dark">.lead - Lead paragraph text for prominent introduction.</p>
              <p class="fw-bold mb-0 text-dark">.fw-bold - Bold text standard weighting.</p>
              <p class="fw-semibold mb-0 text-gray-800">.fw-semibold - Semi bold body text.</p>
              <p class="text-muted mb-0">.text-muted - Muted subtitle and placeholder text style.</p>
              <p class="font-monospace mb-0 text-primary">.font-monospace - Code / ID numbers formatting (123-ABC-999).</p>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- SECTION 3: CARDS & STATS -->
    <div v-show="activeSection === 'cards'" class="mb-10">
      <h4 class="fw-bold text-dark mb-4"><i class="ki-solid ki-element-plus text-primary me-2"></i>3. Variasi Card & Stats Widgets Catalog</h4>
      
      <!-- VARIANT A: Minimalist KPI Stats Grid -->
      <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-3">Varian A: Minimalist Light KPI Cards</h6>
      <div class="row g-5 mb-8">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 bg-body p-6 hover-elevation transition-all">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="w-50px h-50px rounded-circle bg-light-primary d-flex align-items-center justify-content-center">
                <i class="ki-solid ki-document fs-2x text-primary"></i>
              </div>
              <UiBadge label="+12.5%" variant="success" soft pill icon="ki-solid ki-arrow-up" />
            </div>
            <span class="fs-7 text-muted fw-bold text-uppercase ls-1">Total Permohonan</span>
            <div class="d-flex align-items-baseline gap-2 mt-1">
              <h2 class="fw-bolder text-dark m-0 fs-2x">1,248</h2>
              <span class="fs-8 text-gray-500 fw-semibold">Berkas</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 bg-body p-6 hover-elevation transition-all">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="w-50px h-50px rounded-circle bg-light-success d-flex align-items-center justify-content-center">
                <i class="ki-solid ki-check-circle fs-2x text-success"></i>
              </div>
              <UiBadge label="94%" variant="success" soft pill />
            </div>
            <span class="fs-7 text-muted fw-bold text-uppercase ls-1">Disetujui / Terbit</span>
            <div class="d-flex align-items-baseline gap-2 mt-1">
              <h2 class="fw-bolder text-dark m-0 fs-2x">1,173</h2>
              <span class="fs-8 text-gray-500 fw-semibold">Polis</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 bg-body p-6 hover-elevation transition-all">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="w-50px h-50px rounded-circle bg-light-warning d-flex align-items-center justify-content-center">
                <i class="ki-solid ki-time fs-2x text-warning"></i>
              </div>
              <UiBadge label="Pending" variant="warning" soft pill />
            </div>
            <span class="fs-7 text-muted fw-bold text-uppercase ls-1">Menunggu Review</span>
            <div class="d-flex align-items-baseline gap-2 mt-1">
              <h2 class="fw-bolder text-dark m-0 fs-2x">45</h2>
              <span class="fs-8 text-gray-500 fw-semibold">Antrean</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 bg-body p-6 hover-elevation transition-all">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="w-50px h-50px rounded-circle bg-light-danger d-flex align-items-center justify-content-center">
                <i class="ki-solid ki-wallet fs-2x text-danger"></i>
              </div>
              <UiBadge label="Omni Bank" variant="danger" soft pill />
            </div>
            <span class="fs-7 text-muted fw-bold text-uppercase ls-1">Total Imbal Jasa</span>
            <div class="d-flex align-items-baseline gap-2 mt-1">
              <h2 class="fw-bolder text-dark m-0 fs-2">Rp 4.85B</h2>
              <span class="fs-8 text-gray-500 fw-semibold">IDR</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VARIANT B: Vibrant Gradient Cards with Sonar Pulse -->
      <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-3">Varian B: Vibrant Gradient KPI Cards (dengan Sonar Pulse & Visualisasi)</h6>
      <div class="row g-5 mb-8">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 rounded-4 transition-all cursor-pointer shadow-sm position-relative overflow-hidden p-6"
            style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); min-height: 160px;">
            <div class="position-absolute top-0 end-0 m-5">
              <div class="w-8px h-8px bg-white rounded-circle shadow-sm"></div>
            </div>
            <span class="fs-9 fw-boldest text-white text-opacity-70 text-uppercase ls-2">SEMUA DATA</span>
            <h4 class="fs-4 fw-boldest text-white mt-1 mb-4">Total Permohonan</h4>
            <div class="mt-auto">
              <div class="fs-2hx fw-boldest text-white lh-1">1,248</div>
              <span class="fs-9 text-white text-opacity-70">Berkas Terdeteksi</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 rounded-4 transition-all cursor-pointer shadow-sm position-relative overflow-hidden p-6"
            style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 160px;">
            <div class="position-absolute top-0 end-0 m-5">
              <div class="w-8px h-8px bg-white rounded-circle shadow-sm"></div>
            </div>
            <span class="fs-9 fw-boldest text-white text-opacity-70 text-uppercase ls-2">PROSES</span>
            <h4 class="fs-4 fw-boldest text-white mt-1 mb-4">Dalam Analisis</h4>
            <div class="mt-auto">
              <div class="fs-2hx fw-boldest text-white lh-1">45</div>
              <span class="fs-9 text-white text-opacity-70">Antrean Aktif</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 rounded-4 transition-all cursor-pointer shadow-sm position-relative overflow-hidden p-6"
            style="background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%); min-height: 160px;">
            <div class="position-absolute top-0 end-0 m-5">
              <div class="w-8px h-8px bg-white rounded-circle shadow-sm"></div>
            </div>
            <span class="fs-9 fw-boldest text-white text-opacity-70 text-uppercase ls-2">SELESAI</span>
            <h4 class="fs-4 fw-boldest text-white mt-1 mb-4">Polis Terbit</h4>
            <div class="mt-auto">
              <div class="fs-2hx fw-boldest text-white lh-1">1,173</div>
              <span class="fs-9 text-white text-opacity-70">Polis Aktif</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 rounded-4 transition-all cursor-pointer shadow-sm position-relative overflow-hidden p-6"
            style="background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); min-height: 160px;">
            <div class="position-absolute top-0 end-0 m-5">
              <div class="w-8px h-8px bg-white rounded-circle shadow-sm"></div>
            </div>
            <span class="fs-9 fw-boldest text-white text-opacity-70 text-uppercase ls-2">DITOLAK</span>
            <h4 class="fs-4 fw-boldest text-white mt-1 mb-4">Batal & Tolak</h4>
            <div class="mt-auto">
              <div class="fs-2hx fw-boldest text-white lh-1">30</div>
              <span class="fs-9 text-white text-opacity-70">Berkas Dibatalkan</span>
            </div>
          </div>
        </div>
      </div>

      <!-- VARIANT C: Hero Welcome Banner Card & Watermark Filter Card -->
      <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-3">Varian C: Hero Banner Welcome & Watermark Filter Cards</h6>
      <div class="row g-6 mb-8">
        <div class="col-lg-8">
          <div class="card card-flush shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div class="card-body p-8 d-flex align-items-center">
              <div class="symbol symbol-60px symbol-circle me-6">
                <div class="symbol-label bg-light-primary">
                  <i class="ki-solid ki-archive fs-2x text-primary"></i>
                </div>
              </div>
              <div class="d-flex flex-column text-start">
                <h3 class="fw-bolder text-gray-900 fs-3 mb-1">Card Hero / Banner Header Halaman</h3>
                <p class="text-gray-500 fs-7 fw-medium mb-0">
                  Format banner ini sangat ideal untuk ditaruh di bagian paling atas halaman utama sebagai penjelasan fungsi modul.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card card-flush shadow-sm border-0 rounded-4 overflow-hidden position-relative h-100 p-6">
            <i class="ki-outline ki-filter text-primary card-watermark-filter" style="font-size: 150px !important; top: 20px !important;"></i>
            <h5 class="fw-bold text-dark mb-2">Card Filter Watermark</h5>
            <p class="fs-8 text-muted mb-3">Card dengan ikon watermark transparan di pojok kanan belakang.</p>
            <UiButton label="Buka Filter" variant="light-primary" size="sm" icon="ki-solid ki-filter" />
          </div>
        </div>
      </div>

      <!-- VARIANT D: Standard Reusable Component Card -->
      <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-3">Varian D: Standard Reusable UiCard Component</h6>
      <div class="row g-6">
        <div class="col-lg-6">
          <UiCard title="Card Standard dengan Header & Actions" subtitle="Komponen `UiCard` dengan slot actions" icon="ki-solid ki-element-3" variant="primary">
            <template #actions>
              <UiButton label="Filter" variant="light" size="sm" icon="ki-solid ki-filter" />
              <UiButton label="Export" variant="primary" size="sm" icon="ki-solid ki-exit-up" />
            </template>
            <p class="text-gray-700 fs-7">
              Ini adalah contoh isi dari <code>UiCard</code>. Card ini memiliki header otomatis, ikon varian warna, serta area tindakan di sebelah kanan atas.
            </p>
            <template #footer>
              <div class="d-flex align-items-center justify-content-between w-100">
                <span class="text-muted fs-8">Terakhir diperbarui: 2 menit yang lalu</span>
                <UiButton label="Detail Lanjutan" variant="light-primary" size="sm" />
              </div>
            </template>
          </UiCard>
        </div>
        <div class="col-lg-6">
          <UiCard title="Card Informasi & Status System" subtitle="Format visual card dengan aksen latar soft" icon="ki-solid ki-information-4" variant="success">
            <div class="d-flex align-items-center gap-4 p-4 rounded-3 bg-light-success mb-4 border border-success border-opacity-25">
              <i class="ki-solid ki-shield-check fs-2x text-success"></i>
              <div>
                <h6 class="fw-bold text-success mb-1">Status Server Aktif</h6>
                <span class="fs-8 text-gray-700">Semua layanan API dan database berjalan optimal dengan waktu respons &lt; 40ms.</span>
              </div>
            </div>
            <p class="fs-7 text-gray-600 mb-0">
              Gunakan card ini untuk menampilkan status penting, statistik ringkas, atau formulir dalam kontainer rapi.
            </p>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- SECTION 4: TABLES & BADGES -->
    <div v-show="activeSection === 'tables'" class="mb-10">
      <UiCard title="4. Tables & Status Badges" subtitle="Standard responsive table with component `UiTable`, search filter, badges, and actions" icon="ki-solid ki-table" variant="success">
        <template #actions>
          <div class="d-flex align-items-center gap-3">
            <div class="position-relative">
              <i class="ki-outline ki-magnifier fs-4 position-absolute top-50 translate-middle-y ms-3 text-gray-500"></i>
              <input
                v-model="tableSearch"
                type="text"
                class="form-control form-control-sm form-control-solid rounded-pill ps-10 w-200px"
                placeholder="Cari data..."
              />
            </div>
            <UiButton label="+ Tambah Data" variant="success" size="sm" icon="ki-solid ki-plus" @click="showAddModal = true" />
          </div>
        </template>

        <!-- Component UiTable -->
        <UiTable
          :columns="tableColumns"
          :items="filteredTableItems"
          selectable
          @selection-change="handleSelectionChange"
        >
          <!-- Custom Cell: Principal -->
          <template #cell(principal)="{ item }">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-35px symbol-circle me-3 bg-light-primary text-primary fw-bold d-flex align-items-center justify-content-center">
                {{ item.principal.charAt(0) }}
              </div>
              <div class="d-flex flex-column">
                <span class="fw-bold text-dark fs-7">{{ item.principal }}</span>
                <span class="fs-8 text-muted">{{ item.code }}</span>
              </div>
            </div>
          </template>

          <!-- Custom Cell: Status Badge -->
          <template #cell(status)="{ item }">
            <UiBadge
              :label="item.statusLabel"
              :variant="item.statusVariant"
              soft
              pill
            />
          </template>

          <!-- Custom Cell: Amount -->
          <template #cell(amount)="{ item }">
            <span class="fw-bolder text-dark font-monospace">Rp {{ formatCurrency(item.amount) }}</span>
          </template>

          <!-- Custom Actions Cell -->
          <template #actions="{ item }">
            <div class="d-flex justify-content-end gap-1">
              <button class="btn btn-icon btn-sm btn-light-primary rounded-circle" @click="viewDetail(item)" title="Detail">
                <i class="ki-solid ki-eye fs-6"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-light-warning rounded-circle" @click="editItem(item)" title="Edit">
                <i class="ki-solid ki-pencil fs-6"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-light-danger rounded-circle" @click="deleteItem(item)" title="Hapus">
                <i class="ki-solid ki-trash fs-6"></i>
              </button>
            </div>
          </template>
        </UiTable>

        <div class="mt-4 d-flex align-items-center justify-content-between">
          <span class="text-muted fs-8">Terpilih: <b>{{ selectedRows.length }}</b> baris data</span>
          <app-pagination :page="1" :last-page="1" :total="filteredTableItems.length" :per-page="5" />
        </div>
      </UiCard>
    </div>

    <!-- SECTION 5: MODALS & ALERTS -->
    <div id="modal-section" v-show="activeSection === 'modals'" class="mb-10">
      <div class="row g-6 mb-6">
        <div class="col-lg-6">
          <UiCard title="Modals Interactive Trigger" subtitle="Demontrasi komponen modal standar (`UiModal`)" icon="ki-solid ki-notification-status" variant="primary">
            <p class="fs-7 text-gray-700 mb-4">
              Komponen modal mendukung slot kustom, backdrop click, loading state, dan berbagai ukuran (sm, md, lg, xl).
            </p>
            <div class="d-flex flex-wrap gap-2">
              <UiButton label="Modal Primary Form" variant="primary" icon="ki-solid ki-plus-circle" @click="showPrimaryModal = true" />
              <UiButton label="Modal Success Alert" variant="success" icon="ki-solid ki-check-circle" @click="showSuccessModal = true" />
              <UiButton label="Modal Confirm Delete" variant="danger" icon="ki-solid ki-trash" @click="showDeleteModal = true" />
            </div>
          </UiCard>
        </div>

        <div class="col-lg-6">
          <UiCard title="SweetAlert2 (fswal) Triggers" subtitle="Notifikasi popup SweetAlert2 dengan helper fswal.js" icon="ki-solid ki-notification-on" variant="warning">
            <p class="fs-7 text-gray-700 mb-4">
              Gunakan helper <code>fswal</code> untuk menampilkan popup alert interaktif, konfirmasi, atau toast message secara ringkas.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <UiButton label="Swal Success" variant="success" soft icon="ki-solid ki-check" @click="triggerSwalSuccess" />
              <UiButton label="Swal Confirm Dialog" variant="warning" soft icon="ki-solid ki-question-circle" @click="triggerSwalConfirm" />
              <UiButton label="Swal Toast Alert" variant="info" soft icon="ki-solid ki-bell" @click="triggerSwalToast" />
            </div>
          </UiCard>
        </div>
      </div>

      <!-- Alert Banners Showcase -->
      <UiCard title="Alert Banner UI Components" subtitle="Format Banner Peringatan (`UiAlert`)" icon="ki-solid ki-information-5" variant="info">
        <UiAlert variant="primary" title="Informasi Penting" icon="ki-solid ki-information-4" dismissible>
          Template ini menggunakan gabungan CSS Metronic dan Bootstrap 5 dengan desain yang sangat responsif.
        </UiAlert>
        <UiAlert variant="success" title="Transaksi Berhasil Disimpan" icon="ki-solid ki-check-circle" dismissible>
          Data permohonan penerbitan surety bond berhasil dikirimkan ke server.
        </UiAlert>
        <UiAlert variant="warning" title="Perhatian: Berkas Belum Lengkap" icon="ki-solid ki-information-2" dismissible>
          Mohon unggah dokumen Legalitas PT sebelum melanjutkan proses penerbitan polis.
        </UiAlert>
        <UiAlert variant="danger" title="Gagal Memproses Permintaan" icon="ki-solid ki-cross-circle" dismissible>
          Koneksi ke backend API terputus. Silakan periksa jaringan server Anda.
        </UiAlert>
      </UiCard>
    </div>

    <!-- SECTION 6: FORMS & BUTTONS -->
    <div v-show="activeSection === 'forms'" class="mb-10">
      <UiCard title="6. Form Elements & Button Variants" subtitle="Standardized input components, clearable inputs, dropdowns, and button states" icon="ki-solid ki-element-7" variant="dark">
        <form @submit.prevent>
          <div class="row g-5 mb-6">
            <div class="col-md-6">
              <label class="form-label fw-bold text-dark fs-7 required">Input Teks Standar</label>
              <input type="text" class="form-control form-control-solid rounded-3" placeholder="Masukkan nama..." v-model="formSample.name" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold text-dark fs-7">Input Clearable (`input-clearable`)</label>
              <input-clearable placeholder="Mencari kata kunci..." v-model="formSample.search" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold text-dark fs-7">Dropdown Select Custom (`select-dropdown`)</label>
              <select-dropdown
                v-model="formSample.category"
                :options="categoryOptions"
                placeholder="Pilih Kategori Produk..."
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-bold text-dark fs-7">Datepicker Tanggal (`VueDatePicker`)</label>
              <VueDatePicker v-model="formSample.date" auto-apply placeholder="Pilih Tanggal..." />
            </div>

            <div class="col-12">
              <label class="form-label fw-bold text-dark fs-7">Catatan / Deskripsi (Textarea)</label>
              <textarea class="form-control form-control-solid rounded-3" rows="3" placeholder="Tuliskan keterangan..." v-model="formSample.notes"></textarea>
            </div>
          </div>

          <h6 class="text-uppercase text-muted fs-8 fw-bold ls-1 mb-4">Variasi Tombol (`UiButton`)</h6>
          <div class="d-flex flex-wrap align-items-center gap-3">
            <UiButton label="Primary" variant="primary" icon="ki-solid ki-check" />
            <UiButton label="Secondary" variant="secondary" />
            <UiButton label="Success" variant="success" icon="ki-solid ki-check-circle" />
            <UiButton label="Danger" variant="danger" icon="ki-solid ki-trash" />
            <UiButton label="Warning" variant="warning" icon="ki-solid ki-exclamation" />
            <UiButton label="Info" variant="info" icon="ki-solid ki-information-4" />
            <UiButton label="Soft Light" variant="primary" soft icon="ki-solid ki-star" />
            <UiButton label="Outline" variant="primary" outline />
            <UiButton label="Loading..." variant="primary" loading />
            <UiButton label="Pill Button" variant="success" pill icon="ki-solid ki-send" />
          </div>
        </form>
      </UiCard>
    </div>

    <!-- MODAL IMPLEMENTATION EXAMPLES -->
    <!-- 1. Primary Modal -->
    <UiModal
      v-model="showPrimaryModal"
      title="Formulir Tambah Data Principal"
      subtitle="Isi data badan usaha utama untuk permohonan baru"
      icon="ki-solid ki-user-plus"
      variant="primary"
      size="lg"
      :loading="modalLoading"
      @confirm="submitModalForm"
    >
      <div class="row g-4">
        <div class="col-md-6">
          <label class="form-label fw-bold fs-7 required">Nama Perusahaan / Principal</label>
          <input type="text" class="form-control form-control-solid" placeholder="PT Contoh Maju Jaya" />
        </div>
        <div class="col-md-6">
          <label class="form-label fw-bold fs-7 required">NPWP Badan Usaha</label>
          <input type="text" class="form-control form-control-solid" placeholder="01.234.567.8-901.000" />
        </div>
        <div class="col-12">
          <label class="form-label fw-bold fs-7">Alamat Domisili Perusahaan</label>
          <textarea class="form-control form-control-solid" rows="2" placeholder="Jl. Soekarno Hatta No. 123..."></textarea>
        </div>
      </div>
    </UiModal>

    <!-- 2. Success Modal -->
    <UiModal
      v-model="showSuccessModal"
      title="Transaksi Berhasil!"
      subtitle="Notifikasi verifikasi dari sistem"
      icon="ki-solid ki-check-circle"
      variant="success"
      confirmText="Selesai"
      @confirm="showSuccessModal = false"
    >
      <div class="text-center py-4">
        <i class="ki-solid ki-verify fs-5x text-success mb-4"></i>
        <h4 class="fw-bold text-dark">Data Berhasil Diperbarui</h4>
        <p class="text-muted fs-7 max-w-400px mx-auto">
          Seluruh perubahan parameter dan status pada sistem telah disimpan secara permanen.
        </p>
      </div>
    </UiModal>

    <!-- 3. Delete Confirmation Modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Konfirmasi Hapus Data"
      subtitle="Tindakan ini tidak dapat dibatalkan"
      icon="ki-solid ki-trash"
      variant="danger"
      confirmText="Ya, Hapus Data"
      :loading="modalLoading"
      @confirm="confirmDeleteAction"
    >
      <p class="fs-7 text-gray-700 mb-0">
        Apakah Anda yakin ingin menghapus data permohonan <strong class="text-dark">PRM-2026-0092</strong>? Seluruh dokumen yang terhubung akan ikut terhapus.
      </p>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiTable from '@/components/ui/UiTable.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import InputClearable from '@/components/ui/input-clearable.vue'
import SelectDropdown from '@/components/ui/select-dropdown.vue'
import AppPagination from '@/components/ui/app-pagination.vue'
import { fswal } from '@/helpers/fswal.js'

const activeSection = ref('colors')

// Modal visibility states
const showPrimaryModal = ref(false)
const showSuccessModal = ref(false)
const showDeleteModal = ref(false)
const showAddModal = ref(false)
const modalLoading = ref(false)

// Sample Form State
const formSample = ref({
  name: '',
  search: '',
  category: '',
  date: null,
  notes: ''
})

const categoryOptions = [
  { id: 1, text: 'Jaminan Penawaran (Bid Bond)' },
  { id: 2, text: 'Jaminan Pelaksanaan (Performance Bond)' },
  { id: 3, text: 'Jaminan Uang Muka (Advance Payment Bond)' },
  { id: 4, text: 'Jaminan Pemeliharaan (Maintenance Bond)' }
]

// Colors palette list
const colorsList = [
  { name: 'Primary', hex: '#2c3691', class: '.bg-primary', softClass: '.bg-light-primary' },
  { name: 'Secondary', hex: '#00a3e0', class: '.bg-secondary', softClass: '.bg-light-info' },
  { name: 'Success', hex: '#0d9648', class: '.bg-success', softClass: '.bg-light-success' },
  { name: 'Danger', hex: '#f1416c', class: '.bg-danger', softClass: '.bg-light-danger' },
  { name: 'Warning', hex: '#ffc700', class: '.bg-warning', softClass: '.bg-light-warning' },
  { name: 'Info', hex: '#7239ea', class: '.bg-info', softClass: '.bg-light-info' },
  { name: 'Dark', hex: '#1e1e2d', class: '.bg-dark', softClass: '.bg-light-dark' },
  { name: 'Light', hex: '#f5f8fa', class: '.bg-light', softClass: '.bg-body' }
]

// Table Columns & Data
const tableSearch = ref('')
const selectedRows = ref([])

const tableColumns = [
  { key: 'principal', label: 'Principal / Perusahaan', width: '250px' },
  { key: 'product', label: 'Produk Jaminan' },
  { key: 'status', label: 'Status Approval', align: 'center' },
  { key: 'amount', label: 'Nilai Jaminan', align: 'end' }
]

const tableItems = ref([
  { id: 1, principal: 'PT Constructo Karya', code: 'PRM-2026-001', product: 'Jaminan Pelaksanaan', statusLabel: 'Disetujui', statusVariant: 'success', amount: 250000000 },
  { id: 2, principal: 'CV Bina Nusantara', code: 'PRM-2026-002', product: 'Jaminan Penawaran', statusLabel: 'Review Subdit', statusVariant: 'warning', amount: 50000000 },
  { id: 3, principal: 'PT Tech Indo Mandiri', code: 'PRM-2026-003', product: 'Jaminan Uang Muka', statusLabel: 'Ditolak', statusVariant: 'danger', amount: 120000000 },
  { id: 4, principal: 'PT Delta Energi Utama', code: 'PRM-2026-004', product: 'Jaminan Pemeliharaan', statusLabel: 'Draft', statusVariant: 'secondary', amount: 75000000 },
  { id: 5, principal: 'CV Sinar Jaya Abadi', code: 'PRM-2026-005', product: 'Jaminan Pelaksanaan', statusLabel: 'Disetujui', statusVariant: 'success', amount: 310000000 }
])

const filteredTableItems = computed(() => {
  if (!tableSearch.value) return tableItems.value
  const q = tableSearch.value.toLowerCase()
  return tableItems.value.filter(item =>
    item.principal.toLowerCase().includes(q) ||
    item.product.toLowerCase().includes(q) ||
    item.code.toLowerCase().includes(q)
  )
})

const handleSelectionChange = (ids) => {
  selectedRows.value = ids
}

const formatCurrency = (val) => {
  if (!val) return '0'
  return new Intl.NumberFormat('id-ID').format(val)
}

// Modal Handlers
const submitModalForm = () => {
  modalLoading.value = true
  setTimeout(() => {
    modalLoading.value = false
    showPrimaryModal.value = false
    fswal.success('Data Principal berhasil disimpan!', 'Sukses')
  }, 1000)
}

const confirmDeleteAction = () => {
  modalLoading.value = true
  setTimeout(() => {
    modalLoading.value = false
    showDeleteModal.value = false
    fswal.success('Data permohonan berhasil dihapus.', 'Terhapus')
  }, 800)
}

// SweetAlert2 Helper Triggers
const triggerSwalSuccess = () => {
  fswal.success('Proses klaim jaminan berhasil diverifikasi!', 'Operasi Sukses')
}

const triggerSwalConfirm = () => {
  fswal.confirm('Apakah Anda yakin ingin memproses transaksi ini?', 'Konfirmasi Tindakan', (confirmed) => {
    if (confirmed) {
      fswal.toast('Tindakan dikonfirmasi!', 'success')
    }
  })
}

const triggerSwalToast = () => {
  fswal.toast('Sesi Anda berhasil diperbarui', 'info')
}

// Action Handlers
const viewDetail = (item) => {
  fswal.info(`Melihat detail: ${item.principal} (${item.code})`, 'Detail Data')
}

const editItem = (item) => {
  showPrimaryModal.value = true
}

const deleteItem = (item) => {
  showDeleteModal.value = true
}

const copyPromptGuide = () => {
  const text = `PROMPT SYSTEM FOR AI AGENT:
Gunakan template UI Vue 3 + Bootstrap 5 + Metronic yang ada di proyek ini.
- Gunakan komponen UiCard, UiModal, UiTable, UiAlert, UiBadge, dan UiButton dari '@/components/ui/'.
- Warna utama: Primary (#2c3691), Success (#0d9648), Danger (#f1416c), Warning (#ffc700).
- Untuk notifikasi popup gunakan helper fswal dari '@/helpers/fswal.js'.
- Ikuti standar layout dan typography sesuai file TEMPLATE_GUIDE.md.`
  navigator.clipboard.writeText(text)
  fswal.toast('Prompt AI Agent berhasil disalin ke clipboard!', 'success')
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #2c3691 0%, #1a2266 100%);
}
.hover-elevation:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
}
.nav-pills-custom .nav-link {
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-pills-custom .nav-link.active {
  background-color: #2c3691 !important;
  color: #ffffff !important;
}
.max-w-700px { max-width: 700px; }
.max-w-400px { max-width: 400px; }

/* Dark Mode Responsive Overrides */
[data-bs-theme="dark"] .nav-pills-custom {
  background-color: #1e1e2d !important;
  border-color: #2b2b40 !important;
}
[data-bs-theme="dark"] .nav-pills-custom .nav-link {
  color: #a1a5b7 !important;
}
[data-bs-theme="dark"] .nav-pills-custom .nav-link.active {
  background-color: #2c3691 !important;
  color: #ffffff !important;
}
[data-bs-theme="dark"] .text-dark,
[data-bs-theme="dark"] .text-gray-900,
[data-bs-theme="dark"] h1,
[data-bs-theme="dark"] h2,
[data-bs-theme="dark"] h3,
[data-bs-theme="dark"] h4,
[data-bs-theme="dark"] h5,
[data-bs-theme="dark"] h6 {
  color: #ffffff !important;
}
[data-bs-theme="dark"] .text-gray-700,
[data-bs-theme="dark"] .text-gray-800 {
  color: #cdcdde !important;
}
[data-bs-theme="dark"] .bg-light {
  background-color: #1b1b29 !important;
  color: #cdcdde !important;
}
[data-bs-theme="dark"] .card {
  background-color: #1e1e2d !important;
  border-color: #2b2b40 !important;
}
[data-bs-theme="dark"] .border-gray-100,
[data-bs-theme="dark"] .border-gray-200 {
  border-color: #2b2b40 !important;
}
[data-bs-theme="dark"] .form-control {
  background-color: #1b1b29 !important;
  color: #cdcdde !important;
  border-color: #2b2b40 !important;
}
</style>
