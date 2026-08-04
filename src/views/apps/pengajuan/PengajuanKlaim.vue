<template>
  <div>
    <!-- Header Summary Widget -->
    <div class="row g-5 mb-8">
      <div class="col-md-3" v-for="(stat, i) in claimStats" :key="i">
        <div 
          :class="['card hoverable cursor-pointer transition-all', activeGroup === stat.group ? `bg-light-${stat.color} border border-2 border-${stat.color} shadow-sm` : 'bg-light']" 
          @click="toggleGroupFilter(stat.group)"
        >
          <div class="card-body my-2">
            <div class="d-flex align-items-center justify-content-between">
              <span :class="`text-${stat.color} fw-bold fs-6 d-block`">{{ stat.title }}</span>
              <span v-if="activeGroup === stat.group" :class="`badge badge-${stat.color} fs-9`">Aktif Filter</span>
            </div>
            <div class="d-flex align-items-center mt-2">
              <span class="fs-2hx fw-bold text-gray-900 me-2">{{ stat.count }}</span>
              <span class="text-muted fs-7">berkas</span>
            </div>
            <div class="progress h-6px mt-3" style="background: rgba(255,255,255,0.5)">
              <div :class="`progress-bar bg-${stat.color}`" role="progressbar" :style="`width: ${stat.pct}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CARD -->
    <div class="card card-flush shadow-sm">
      <!-- List Header -->
      <div class="card-header border-0 pt-6" v-if="viewMode === 'list'">
        <div class="card-title">
          <div class="d-flex align-items-center position-relative my-1">
            <KTIcon icon-name="magnifier" icon-class="fs-1 position-absolute ms-6" />
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearch"
              class="form-control form-control-solid w-250px ps-15"
              placeholder="Cari Debitur / No. SP..."
            />
          </div>
        </div>
        <div class="card-toolbar">
          <div class="d-flex justify-content-end gap-3">
            <!-- Filter Tabs -->
            <div class="nav-group nav-group-outline border-primary">
              <button
                v-for="grp in filterGroups"
                :key="grp.id"
                @click="activeGroup = grp.id"
                :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-4 fw-bold', activeGroup === grp.id ? 'active' : '']"
              >
                {{ grp.label }}
              </button>
            </div>

            <!-- Create button -->
            <button @click="openCreateForm" class="btn btn-primary btn-sm">
              <KTIcon icon-name="plus" icon-class="fs-2 me-1" />
              Ajukan Klaim Baru
            </button>
          </div>
        </div>
      </div>

      <!-- List Body -->
      <div class="card-body pt-0" v-if="viewMode === 'list'">
        <div v-if="loading" class="text-center py-15">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat data pengajuan...</span>
        </div>

        <div v-else-if="claims.length === 0" class="text-center py-15 border border-dashed rounded bg-light">
          <KTIcon icon-name="folder-question" icon-class="fs-3x text-gray-400 mb-3" />
          <p class="text-gray-500 fs-6 fw-semibold">Belum ada pengajuan klaim dalam grup ini.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 rounded-start">Kode Klaim</th>
                <th>Debitur / SP</th>
                <th>Mitra</th>
                <th>Plafond / Baki Debet</th>
                <th>Nilai Klaim</th>
                <th>Tgl Pengajuan</th>
                <th>Status</th>
                <th class="text-end rounded-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in claims" :key="c.id">
                <td class="ps-4">
                  <span class="text-gray-900 fw-bold fs-6 d-block">{{ c.kodeKlaim }}</span>
                  <span class="text-muted fs-8">ID: {{ c.id }}</span>
                </td>
                <td>
                  <span class="text-gray-900 fw-bold fs-7 d-block">{{ c.sertifikatPenjaminan?.namaDebitur }}</span>
                  <span class="badge badge-light-secondary fs-8">{{ c.sertifikatPenjaminan?.nomorSp }}</span>
                </td>
                <td>
                  <span class="text-gray-700 fs-7 d-block">{{ c.mitra?.namaMitra ? c.mitra.namaMitra.split(' (')[0] : (c.mitraId ? 'Mitra #' + c.mitraId : '-') }}</span>
                </td>
                <td>
                  <span class="text-gray-600 fs-7 d-block">P: {{ formatCurrency(c.sertifikatPenjaminan?.plafonKredit) }}</span>
                  <span class="text-danger fs-7 d-block">B: {{ formatCurrency(c.bakiDebetKlaim) }}</span>
                </td>
                <td>
                  <span class="text-primary fw-bold fs-6">{{ formatCurrency(c.nilaiKlaim) }}</span>
                  <span class="text-muted fs-8 d-block">{{ c.coverPercentageSnapshot * 100 }}% cover</span>
                </td>
                <td>
                  <span class="text-gray-600 fs-7">{{ formatDate(c.tanggalPengajuan) }}</span>
                </td>
                <td>
                  <span v-if="c.status?.kode === 'perbaikan'" class="badge py-2 px-3 fs-7 fw-bold badge-light-danger text-danger border border-danger border-dashed">
                    ⚠️ Perlu Perbaikan (Dikembalikan)
                  </span>
                  <span v-else-if="c.status?.kode === 'diajukan' && (c.isResubmitted || c.is_resubmitted)" class="badge py-2 px-3 fs-7 fw-bold badge-light-primary text-primary border border-primary">
                    🔄 Diajukan Ulang (dari Perbaikan)
                  </span>
                  <span v-else-if="c.status?.kode === 'disetujui' && c.disetujuiConfirmedByMitra" class="badge py-2 px-3 fs-7 fw-bold badge-light-success text-success border border-success">
                    ✅ Disetujui (Anda Sudah Setuju)
                  </span>
                  <span v-else-if="c.status?.kode === 'disetujui'" class="badge py-2 px-3 fs-7 fw-bold badge-light-warning text-warning border border-warning border-dashed">
                    ⏳ Disetujui Komite (Menunggu Respon Anda)
                  </span>
                  <span v-else :class="`badge py-2 px-3 fs-7 fw-bold badge-light-${getStatusColor(c.status?.kode)}`">
                    {{ c.status?.nama }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button @click="viewDetail(c)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1" title="Lihat Detail & Upload Dokumen">
                    <KTIcon icon-name="eye" icon-class="fs-3" />
                  </button>
                  <button v-if="c.status?.kode === 'draft' || c.status?.kode === 'perbaikan'" @click="editClaim(c)" class="btn btn-icon btn-bg-light btn-active-color-warning btn-sm me-1" title="Edit Data Draft">
                    <KTIcon icon-name="pencil" icon-class="fs-3" />
                  </button>
                  <button v-if="c.status?.kode === 'draft' || c.status?.kode === 'perbaikan'" @click="submitDraft(c)" class="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1" title="Ajukan Klaim Sekarang">
                    <KTIcon icon-name="rocket" icon-class="fs-3" />
                  </button>
                  <button v-if="c.status?.kode === 'draft'" @click="deleteClaim(c)" class="btn btn-icon btn-bg-light btn-active-color-danger btn-sm" title="Hapus Draft Klaim">
                    <KTIcon icon-name="trash" icon-class="fs-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CREATE / EDIT FORM -->
      <div class="card-body py-10" v-if="viewMode === 'create' || viewMode === 'edit'">
        <h3 class="card-title fw-bold text-gray-900 mb-8 d-flex align-items-center">
          <button @click="viewMode = 'list'" class="btn btn-sm btn-icon btn-light me-4">
            <i class="bi bi-arrow-left fs-4"></i>
          </button>
          {{ viewMode === 'edit' ? 'Formulir Edit Data Draft Klaim' : 'Formulir Pengajuan Klaim Baru' }}
        </h3>

        <form @submit.prevent="saveClaim">
          <div class="row g-9 mb-8">
            <!-- Step 1: Pilih Sertifikat -->
            <div class="col-md-6 border-end">
              <h4 class="fw-bold text-gray-800 mb-5">1. Sertifikat Penjaminan (Kredit)</h4>
              
              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Pilih Sertifikat Debitur Macet</label>
                <select class="form-select form-select-solid" v-model="form.sertifikatPenjaminanId" @change="onSelectSp" required>
                  <option value="" disabled>-- Cari/Pilih Debitur --</option>
                  <option v-for="sp in availableSps" :key="sp.id" :value="sp.id">
                    {{ sp.nomorSp }} — {{ sp.namaDebitur }} ({{ sp.bidangUsaha }})
                  </option>
                </select>
                <span class="text-muted fs-8">Mitra hanya dapat memilih debitur yang tercatat dalam portofolio aktif.</span>
              </div>

              <!-- SP Details (Read Only) -->
              <div v-if="selectedSp" class="bg-light p-6 rounded border border-dashed">
                <div class="row g-4 fs-7">
                  <div class="col-6">
                    <span class="text-muted d-block">Nama Debitur</span>
                    <span class="fw-bold text-gray-900 fs-6">{{ selectedSp.namaDebitur }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Bidang Usaha</span>
                    <span class="fw-bold text-gray-900 fs-6">{{ selectedSp.bidangUsaha }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Plafon Kredit</span>
                    <span class="fw-bold text-gray-900 fs-6 text-primary">{{ formatCurrency(selectedSp.plafonKredit) }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Baki Debet Portofolio</span>
                    <span class="fw-bold text-gray-900 fs-6 text-danger">{{ formatCurrency(selectedSp.bakiDebet) }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Produk Penjaminan</span>
                    <span class="fw-bold text-gray-900">{{ selectedSp.produk?.nama }} ({{ selectedSp.produk?.kode }})</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Persentase Cover</span>
                    <span class="fw-bold text-gray-900">{{ selectedSp.produk?.coverPercentage * 100 }}%</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Jatuh Tempo Penjaminan</span>
                    <span class="fw-bold text-gray-900">{{ formatDate(selectedSp.tanggalExpire) }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Kolektibilitas</span>
                    <span class="badge badge-light-danger fw-bold">KOL-{{ selectedSp.kolektibilitas }} (Macet)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Rincian Klaim -->
            <div class="col-md-6">
              <h4 class="fw-bold text-gray-800 mb-5">2. Rincian & Nominal Klaim</h4>
              
              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Baki Debet Saat Pengajuan (Rp)</label>
                <input 
                  type="number" 
                  class="form-control form-control-solid" 
                  v-model.number="form.bakiDebetKlaim" 
                  @input="recalculateClaimValue"
                  required
                />
                <span class="text-muted fs-8">Bisa disesuaikan jika debitur sempat mencicil setelah penjaminan diterbitkan.</span>
              </div>

              <!-- Computed Claim Value (Premium Widget) -->
              <div class="bg-light-primary p-6 rounded mb-6 border border-primary border-dashed">
                <span class="text-primary fw-semibold fs-7 d-block mb-1">PROYEKSI NILAI KLAIM (OTOMATIS)</span>
                <div class="d-flex align-items-baseline">
                  <span class="fs-2hx fw-bold text-gray-900 me-2">{{ formatCurrency(form.nilaiKlaim) }}</span>
                  <span class="text-gray-600 fs-7">({{ coverPct * 100 }}% cover dari baki debet)</span>
                </div>
              </div>

              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Penyebab Klaim</label>
                <select class="form-select form-select-solid" v-model="form.penyebabKlaimId" required>
                  <option value="" disabled>-- Pilih Penyebab --</option>
                  <option v-for="p in penyebabList" :key="p.id" :value="p.id">
                    {{ p.namaPenyebab }}
                  </option>
                </select>
              </div>

              <div class="fv-row mb-6" v-if="!selectedSp?.tanggalMacet">
                <label class="required fs-6 fw-semibold mb-2">Tanggal Mulai Macet (Kolektibilitas 5)</label>
                <input type="date" class="form-control form-control-solid" v-model="form.tanggalMacet" required />
              </div>
            </div>

            <!-- Info Alert -->
            <div class="col-12 mt-4">
              <div class="alert alert-primary d-flex align-items-center p-4">
                <i class="bi bi-info-circle-fill text-primary fs-2 me-3"></i>
                <div class="d-flex flex-column fs-7">
                  <span class="fw-bold">Tahap 1: Pengisian Data Awal Klaim</span>
                  <span>Setelah data awal disimpan, Anda dapat mengunggah seluruh dokumen persyaratan melalui tombol Edit / View sebelum mengajukan berkas ke Jamkrida.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 mt-8">
            <button type="button" @click="viewMode = 'list'" class="btn btn-light btn-sm" :disabled="saving">
              Batal
            </button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Simpan Draft Pengajuan
            </button>
          </div>
        </form>
      </div>

      <!-- DETAIL VIEW -->
      <div class="card-body py-10" v-if="viewMode === 'detail' && selectedClaim">
        <!-- Detail Header -->
        <div class="d-flex align-items-center justify-content-between mb-10 border-bottom pb-6">
          <div class="d-flex align-items-center">
            <button @click="viewMode = 'list'" class="btn btn-sm btn-icon btn-light me-4">
              <i class="bi bi-arrow-left fs-4"></i>
            </button>
            <div>
              <h3 class="fw-bold text-gray-900 m-0">Klaim: {{ selectedClaim.kodeKlaim }}</h3>
              <span class="text-muted fs-7">Diajukan oleh {{ selectedClaim.mitra?.namaMitra }} • {{ formatDate(selectedClaim.tanggalPengajuan) }}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <button v-if="selectedClaim.status?.kode === 'draft' || selectedClaim.status?.kode === 'perbaikan'" @click="editClaim(selectedClaim)" class="btn btn-sm btn-light-warning d-flex align-items-center gap-1">
              <i class="bi bi-pencil fs-6"></i> Edit Data
            </button>
            <button v-if="selectedClaim.status?.kode === 'draft'" @click="deleteClaim(selectedClaim)" class="btn btn-sm btn-light-danger d-flex align-items-center gap-1">
              <i class="bi bi-trash fs-6"></i> Hapus Draft
            </button>
            <span v-if="selectedClaim.status?.kode === 'perbaikan'" class="badge py-3 px-4 fs-6 fw-bold badge-light-danger text-danger border border-danger border-dashed">
              ⚠️ Perlu Perbaikan Data
            </span>
            <span v-else-if="selectedClaim.status?.kode === 'diajukan' && (selectedClaim.isResubmitted || selectedClaim.is_resubmitted)" class="badge py-3 px-4 fs-6 fw-bold badge-light-primary text-primary border border-primary">
              🔄 Diajukan Ulang (dari Perbaikan)
            </span>
            <span v-else-if="selectedClaim.status?.kode === 'disetujui' && selectedClaim.disetujuiConfirmedByMitra" class="badge py-3 px-4 fs-6 fw-bold badge-light-success text-success border border-success">
              ✅ Disetujui (Anda Sudah Setuju)
            </span>
            <span v-else-if="selectedClaim.status?.kode === 'disetujui'" class="badge py-3 px-4 fs-6 fw-bold badge-light-warning text-warning border border-warning border-dashed">
              ⏳ Disetujui Komite (Menunggu Respon Anda)
            </span>
            <span v-else :class="`badge py-3 px-4 fs-6 fw-bold badge-light-${getStatusColor(selectedClaim.status?.kode)}`">
              {{ selectedClaim.status?.nama }}
            </span>
          </div>
        </div>

        <div class="row g-9">
          <!-- Left Column: Details -->
          <div class="col-lg-5">
            <div class="card bg-light border-0 p-6 mb-8">
              <h4 class="fw-bold text-gray-800 mb-6"><i class="bi bi-info-circle text-primary me-2"></i>Informasi Ringkas</h4>
              <div class="d-flex flex-column gap-4 fs-7">
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nomor SP</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.nomorSp }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nama Debitur</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Plafon Kredit</span>
                  <span class="fw-bold text-gray-900">{{ formatCurrency(selectedClaim.sertifikatPenjaminan?.plafonKredit) }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Baki Debet Klaim</span>
                  <span class="fw-bold text-danger">{{ formatCurrency(selectedClaim.bakiDebetKlaim) }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Persentase Cover</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.coverPercentageSnapshot * 100 }}%</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nominal Klaim</span>
                  <span class="fw-bold text-primary fs-6">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Penyebab Klaim</span>
                  <span class="fw-semibold text-gray-900">{{ selectedClaim.penyebabKlaim?.namaPenyebab }}</span>
                </div>
              </div>
            </div>

            <!-- Status Banners: Survei & Perbaikan -->
            <div v-if="selectedClaim.status?.kode === 'survei'" class="alert alert-info d-flex align-items-start p-5 mb-8 border-info border-dashed bg-light-info shadow-sm">
              <i class="bi bi-geo-alt-fill text-info fs-2hx me-4 mt-1"></i>
              <div class="d-flex flex-column flex-grow-1">
                <span class="fs-6 fw-bold text-info">Klaim Sedang Dalam Proses Survei Lapangan</span>
                <span class="fs-7 text-gray-700 mt-1 mb-3">Tim Jamkrida akan melakukan survei lapangan untuk klaim ini. Berikut informasi jadwal survei:</span>
                <div class="fs-7 text-gray-800 fw-semibold p-3 bg-white rounded border border-info border-opacity-50 d-flex flex-column gap-2">
                  <div><span class="text-muted">No. Survei:</span> {{ selectedClaim.survey?.nomorPermohonan || '-' }}</div>
                  <div><span class="text-muted">Tanggal Survei (Usulan):</span> {{ selectedClaim.survey?.tanggalSurvey || '-' }}</div>
                  <div><span class="text-muted">Catatan:</span> {{ selectedClaim.survey?.catatan || '-' }}</div>
                </div>

                <template v-if="selectedClaim.survey?.denganMitra">
                  <div v-if="!selectedClaim.survey?.konfirmasiMitra" class="mt-3">
                    <span class="fs-8 text-warning fw-semibold d-block mb-2"><i class="bi bi-exclamation-circle-fill me-1"></i>Mohon konfirmasi jadwal survei di atas.</span>
                    <button @click="konfirmasiJadwalSurvei" class="btn btn-sm btn-info fw-bold" :disabled="confirmingSurvey">
                      <i class="bi bi-check2-circle me-1"></i> Konfirmasi Jadwal Survei
                    </button>
                  </div>
                  <span v-else class="badge badge-light-success fs-8 mt-2"><i class="bi bi-check-circle-fill me-1"></i>Jadwal Survei Telah Dikonfirmasi</span>
                </template>
              </div>
            </div>

            <div v-else-if="selectedClaim.status?.kode === 'perbaikan'" class="alert alert-danger d-flex align-items-start p-5 mb-8 border-danger border-dashed bg-light-danger shadow-sm">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-2hx me-4 mt-1"></i>
              <div class="d-flex flex-column flex-grow-1">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fs-6 fw-bold text-danger-900">Catatan Perbaikan Data dari Verifikator Jamkrida:</span>
                  <span class="badge badge-danger fs-8 fw-bold">Status: Perlu Perbaikan</span>
                </div>
                <div class="fs-7 text-gray-800 fw-semibold p-3 bg-white rounded border border-danger border-opacity-50">
                  <i class="bi bi-chat-quote-fill text-danger me-2 fs-6"></i>
                  "{{ selectedClaim.catatanPerbaikan || 'Mohon periksa dan unggah ulang berkas yang berstatus Tidak Disetujui di bawah ini.' }}"
                </div>
                <span class="text-muted fs-8 mt-2">
                  <i class="bi bi-info-circle me-1"></i> Silakan periksa catatan spesifik pada setiap dokumen yang bertanda <b>✗ Tidak Disetujui (Perlu Perbaikan)</b> di bawah ini, lalu klik tombol <b>Ganti File</b> untuk mengunggah berkas perbaikan.
                </span>
              </div>
            </div>

            <div v-else-if="selectedClaim.status?.kode === 'disetujui' && selectedClaim.suratKeputusan" class="alert alert-success d-flex align-items-start p-5 mb-8 border-success border-dashed bg-light-success shadow-sm">
              <i class="bi bi-patch-check-fill text-success fs-2hx me-4 mt-1"></i>
              <div class="d-flex flex-column flex-grow-1">
                <span class="fs-6 fw-bold text-success">Klaim Disetujui Komite</span>
                <span class="fs-7 text-gray-700 mt-1 mb-3">Surat Keputusan {{ selectedClaim.suratKeputusan.nomorSk }} telah ditetapkan. Nilai klaim yang disetujui: <b>{{ formatCurrency(selectedClaim.suratKeputusan.nilaiDisetujui) }}</b>.</span>

                <template v-if="!selectedClaim.disetujuiConfirmedByMitra">
                  <span class="text-muted fs-8 d-block mb-2">Mohon konfirmasi keputusan ini: setujui untuk melanjutkan proses pembayaran, atau ajukan banding jika tidak sependapat.</span>
                  <div class="d-flex gap-2">
                    <button @click="setujuiKeputusan" class="btn btn-sm btn-success fw-bold" :disabled="confirmingApproval">
                      <i class="bi bi-check2-circle me-1"></i> Setuju
                    </button>
                    <button @click="openBandingModal" class="btn btn-sm btn-light-danger fw-bold">
                      <i class="bi bi-arrow-left-right me-1"></i> Ajukan Banding
                    </button>
                  </div>
                </template>
                <span v-else class="badge badge-light-success fs-8"><i class="bi bi-check-circle-fill me-1"></i>Anda Telah Menyetujui Keputusan Ini — Proses pembayaran akan segera diproses oleh Jamkrida.</span>
              </div>
            </div>

            <div v-else-if="selectedClaim.status?.kode === 'banding'" class="alert alert-warning d-flex align-items-start p-5 mb-8 border-warning border-dashed bg-light-warning shadow-sm">
              <i class="bi bi-arrow-left-right text-warning fs-2hx me-4 mt-1"></i>
              <div class="d-flex flex-column flex-grow-1">
                <span class="fs-6 fw-bold text-warning">Banding Sedang Diproses</span>
                <span class="fs-7 text-gray-700 mt-1">Banding Anda sedang dinilai ulang oleh Jamkrida. Alasan yang Anda ajukan:</span>
                <div class="fs-7 text-gray-800 fw-semibold p-3 bg-white rounded border border-warning border-opacity-50 mt-2">
                  "{{ selectedClaim.banding?.alasan || '-' }}"
                </div>
              </div>
            </div>

            <!-- E-sign signatures visualization -->
            <div v-if="selectedClaim.esignSignatures && selectedClaim.esignSignatures.length > 0" class="card border border-dashed p-6">
              <h5 class="fw-bold text-gray-800 mb-4"><i class="bi bi-fingerprint text-success me-2"></i>Status Persetujuan Komite (E-sign)</h5>
              
              <div v-if="selectedClaim.beritaAcara" class="mb-4">
                <span class="badge badge-light-secondary fs-8 fw-semibold mb-2">Dokumen: {{ selectedClaim.beritaAcara.nomorBa }}</span>
              </div>
              <div v-if="selectedClaim.suratKeputusan" class="mb-4">
                <span class="badge badge-light-secondary fs-8 fw-semibold mb-2">Dokumen: {{ selectedClaim.suratKeputusan.nomorSk }}</span>
              </div>

              <div class="d-flex flex-column gap-3">
                <div v-for="sig in selectedClaim.esignSignatures" :key="sig.id" class="d-flex align-items-center justify-content-between bg-white p-3 border rounded shadow-xs">
                  <div>
                    <span class="fw-bold text-gray-900 fs-7 d-block">{{ sig.pejabatKomite?.nama }}</span>
                    <span class="text-muted fs-9">{{ sig.pejabatKomite?.jabatan }}</span>
                  </div>
                  <span :class="`badge fs-8 fw-bold badge-light-${sig.status === 'signed' ? 'success' : sig.status === 'rejected' ? 'danger' : 'warning'}`">
                    {{ sig.status === 'signed' ? 'Telah TTE' : sig.status === 'rejected' ? 'Ditolak' : 'Menunggu' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Tabs (Documents & Audit Trail) -->
          <div class="col-lg-7">
            <!-- Tabs Nav -->
            <ul class="nav nav-tabs nav-line-tabs mb-5 fs-6">
              <li class="nav-item">
                <a class="nav-link text-active-primary cursor-pointer active" data-bs-toggle="tab" href="#kt_tab_docs">Dokumen Berkas</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-active-primary cursor-pointer" data-bs-toggle="tab" href="#kt_tab_history">Audit Trail / Jejak</a>
              </li>
            </ul>

            <div class="tab-content">
              <!-- Tab Documents -->
              <div class="tab-pane fade show active" id="kt_tab_docs" role="tabpanel">
                <!-- Status Banners -->
                <div v-if="selectedClaim.documents && selectedClaim.documents.some(d => d.isReplaced || d.is_replaced)" class="alert alert-primary d-flex align-items-start p-5 mb-6 border-primary border-dashed bg-light-primary shadow-sm">
                  <i class="bi bi-arrow-repeat text-primary fs-2hx me-4 mt-1"></i>
                  <div class="d-flex flex-column flex-grow-1">
                    <span class="fs-6 fw-bold text-primary">Berkas Perbaikan Sudah Diajukan Ulang</span>
                    <span class="fs-7 text-gray-700 mt-1">Dokumen yang sebelumnya diminta perbaikan sudah diganti dengan berkas baru. Berkas ini sedang menunggu proses verifikasi ulang oleh tim Jamkrida.</span>
                  </div>
                </div>

                <div v-else-if="uploadedDocsCount >= 8" class="alert alert-success d-flex align-items-center p-4 mb-5 shadow-xs">
                  <i class="bi bi-check-circle-fill text-success fs-2 me-3"></i>
                  <div class="fs-7 text-success-800">
                    <b>Dokumen Lengkap!</b> Seluruh {{ uploadedDocsCount }} dokumen wajib telah diunggah dan siap diajukan ke Jamkrida.
                  </div>
                </div>

                <div v-else class="alert alert-warning d-flex align-items-center p-4 mb-5 shadow-xs">
                  <i class="bi bi-exclamation-triangle-fill text-warning fs-2 me-3"></i>
                  <div class="fs-7 text-warning-800">
                    <b>Perhatian:</b> Terdapat {{ 8 - uploadedDocsCount }} dokumen wajib yang belum diunggah! Lengkapi seluruh unggahan sebelum mengajukan klaim.
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-5">
                  <h5 class="fw-bold text-gray-800 m-0">Dokumen Penunjang Klaim (8 Wajib)</h5>
                  <span class="badge badge-light-primary fs-8">{{ uploadedDocsCount }} dari 8 diunggah</span>
                </div>

                <!-- Document Items List -->
                <div class="d-flex flex-column gap-3 mb-6">
                  <div 
                    v-for="doc in selectedClaim.documents" 
                    :key="doc.id" 
                    :class="[
                      'p-4 rounded border transition-all', 
                      doc.isReplaced || doc.is_replaced
                        ? 'border-primary border-2 bg-light-primary shadow-xs border-start border-start-4 border-start-primary'
                        : doc.kesesuaian === 'tidak_sesuai' 
                          ? 'border-danger border-2 border-dashed bg-light-danger shadow-xs border-start border-start-4 border-start-danger' 
                          : doc.kesesuaian === 'sesuai' 
                            ? 'border-success border-2 bg-light-success bg-opacity-25 border-start border-start-4 border-start-success' 
                            : 'bg-white border-gray-300'
                    ]"
                  >
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-start gap-3">
                        <KTIcon 
                          :icon-name="doc.ada ? 'file-sheet' : 'file-down'" 
                          :icon-class="`fs-2x text-${(doc.isReplaced || doc.is_replaced) ? 'primary' : doc.kesesuaian === 'tidak_sesuai' ? 'danger' : doc.kesesuaian === 'sesuai' ? 'success' : doc.ada ? 'primary' : 'gray-400'} mt-1`" 
                        />
                        <div>
                          <span class="fw-bold text-gray-900 fs-6 d-block">{{ doc.jenisDokumen?.nama }}</span>
                          <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
                            <!-- Status Badges dari Bagian Klaim -->
                            <span v-if="doc.isReplaced || doc.is_replaced" class="badge badge-primary py-1.5 px-3 fs-9 fw-bold text-white shadow-xs">
                              <i class="bi bi-arrow-repeat text-white fs-9 me-1"></i> Sudah Diganti - Menunggu Verifikasi Ulang
                            </span>
                            <span v-else-if="doc.kesesuaian === 'sesuai'" class="badge badge-success py-1.5 px-3 fs-9 fw-bold text-white shadow-xs">
                              <i class="bi bi-check-circle-fill text-white fs-9 me-1"></i> Disetujui (Sesuai)
                            </span>
                            <span v-else-if="doc.kesesuaian === 'tidak_sesuai'" class="badge badge-danger py-1.5 px-3 fs-9 fw-bold text-white shadow-xs">
                              <i class="bi bi-x-circle-fill text-white fs-9 me-1"></i> Tidak Disetujui (Perlu Perbaikan)
                            </span>
                            <span v-else-if="doc.ada" class="badge badge-light-primary py-1 px-2 fs-9 fw-semibold">
                              Tersedia (Menunggu Verifikasi)
                            </span>
                            <span v-else class="badge badge-light-danger py-1 px-2 fs-9 fw-bold">
                              Wajib Diunggah
                            </span>

                            <span class="text-muted fs-8" v-if="doc.ada">
                              {{ (doc.isReplaced || doc.is_replaced) ? 'Diperbarui:' : 'Diunggah:' }} {{ formatDate(doc.replacedAt || doc.replaced_at || doc.uploadedAt || doc.uploaded_at) }}
                            </span>
                          </div>

                          <!-- Catatan Verifikator: hanya tampil selama belum diganti ulang -->
                          <div v-if="doc.kesesuaian === 'tidak_sesuai' && !(doc.isReplaced || doc.is_replaced)" class="mt-3 p-3 bg-white rounded border border-danger border-dashed text-danger fs-8">
                            <i class="bi bi-chat-left-text-fill text-danger me-2 fs-7"></i>
                            <b>Catatan Verifikator:</b> {{ doc.catatanPemeriksaan || 'Berkas tidak sesuai kriteria. Mohon unggah ulang berkas yang valid.' }}
                          </div>
                          <div v-else-if="(doc.isReplaced || doc.is_replaced) && doc.catatanPemeriksaan" class="mt-3 p-3 bg-white rounded border border-primary border-dashed text-primary fs-8">
                            <i class="bi bi-chat-left-text-fill text-primary me-2 fs-7"></i>
                            <b>Catatan Verifikator sebelumnya:</b> {{ doc.catatanPemeriksaan }}
                          </div>
                        </div>
                      </div>

                      <div class="d-flex align-items-center gap-2">
                        <button 
                          v-if="doc.ada" 
                          type="button" 
                          class="btn btn-xs btn-light-info d-flex align-items-center gap-1" 
                          @click="previewDoc(doc)"
                          title="Lihat / Pratinjau Berkas"
                        >
                          <i class="bi bi-eye fs-7"></i> Lihat Berkas
                        </button>

                        <div v-if="selectedClaim.status?.kode === 'draft' || selectedClaim.status?.kode === 'perbaikan'">
                          <input type="file" :id="`file-upload-${doc.id}`" class="d-none" @change="uploadDocument($event, doc.jenisDokumenId)" />
                          <label 
                            :for="`file-upload-${doc.id}`" 
                            :class="[
                              'btn btn-xs cursor-pointer fw-bold', 
                              doc.kesesuaian === 'tidak_sesuai' && doc.isReplaced 
                                ? 'btn-primary' 
                                : doc.kesesuaian === 'tidak_sesuai' 
                                  ? 'btn-danger' 
                                  : 'btn-primary'
                            ]"
                          >
                            <i :class="['bi me-1', doc.isReplaced ? 'bi-check-circle-fill' : 'bi-upload']"></i> 
                            {{ doc.isReplaced ? 'Ganti Lagi' : (doc.ada ? 'Ganti File' : 'Unggah File') }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Claim Action Button -->
                <div v-if="selectedClaim.status?.kode === 'draft' || selectedClaim.status?.kode === 'perbaikan'" class="p-5 rounded bg-light-primary border border-primary border-dashed d-flex align-items-center justify-content-between">
                  <div>
                    <span class="fw-bold text-gray-900 fs-7 d-block">Pengajuan Klaim ke Jamkrida</span>
                    <span class="text-muted fs-8">Pastikan 8 dokumen persyaratan telah diunggah sebelum menekan tombol ajukan.</span>
                  </div>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    @click="submitDraft(selectedClaim)"
                  >
                    <KTIcon icon-name="rocket" icon-class="fs-3 text-white" />
                    <span>Ajukan Klaim Sekarang</span>
                  </button>
                </div>
              </div>

              <!-- Tab Audit Trail -->
              <div class="tab-pane fade" id="kt_tab_history" role="tabpanel">
                <h5 class="fw-bold text-gray-800 mb-5">Riwayat Perjalanan Berkas (Audit Trail)</h5>
                
                <div class="timeline timeline-border-dashed">
                  <div class="timeline-item" v-for="log in selectedClaim.statusHistory" :key="log.id">
                    <div class="timeline-line"></div>
                    <div class="timeline-icon">
                      <span :class="`bullet bullet-dot bg-${log.actorPeran === 'mitra' ? 'info' : log.actorPeran === 'klaim' ? 'success' : log.actorPeran === 'komite' ? 'danger' : 'secondary'} h-10px w-10px`"></span>
                    </div>
                    <div class="timeline-content mb-6">
                      <div class="pe-3">
                        <span class="text-gray-900 fw-bold fs-7 d-block">{{ log.aksi }}</span>
                        <div class="d-flex align-items-center mt-1">
                          <span class="text-muted fs-8 me-3">{{ formatDate(log.waktu) }}</span>
                          <span :class="`badge badge-light-${log.actorPeran === 'mitra' ? 'info' : log.actorPeran === 'klaim' ? 'success' : log.actorPeran === 'komite' ? 'danger' : 'secondary'} py-0 px-2 fs-9`">
                            {{ log.actorNama }} ({{ log.actorPeran.toUpperCase() }})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NATIVE BOOTSTRAP MODAL FOR PREVIEWING DOCUMENT (75VH HEIGHT) -->
    <!-- BANDING MODAL -->
    <div v-if="showBandingModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5); overflow-y:auto;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Ajukan Banding Klaim</h5>
            <button type="button" class="btn-close" @click="showBandingModal = false"></button>
          </div>
          <form @submit.prevent="submitBanding">
            <div class="modal-body">
              <div class="alert alert-warning fs-8 mb-4">
                Klaim akan dikembalikan untuk assessment ulang oleh Jamkrida. Proses pembayaran akan tertunda selama banding diproses.
              </div>
              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Alasan Banding</label>
                <textarea class="form-control form-control-solid" rows="4" v-model="bandingAlasan" placeholder="Jelaskan alasan Anda tidak sependapat dengan keputusan klaim ini, sertakan data/bukti pendukung jika ada..." required></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light btn-sm" @click="showBandingModal = false">Batal</button>
              <button type="submit" class="btn btn-danger btn-sm" :disabled="submittingBanding">Ajukan Banding</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDocModal && activeDoc" class="modal fade show d-block" style="background: rgba(0, 0, 0, 0.65); z-index: 1055;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header py-3 bg-light">
            <div class="d-flex align-items-center gap-3">
              <i class="bi bi-file-earmark-pdf fs-2 text-primary"></i>
              <div>
                <h5 class="modal-title fw-bold text-gray-900 mb-0">{{ activeDoc.jenisDokumen?.nama || 'Pratinjau Dokumen' }}</h5>
                <span class="text-muted fs-8">Status: Terunggah & Valid • {{ formatDate(activeDoc.uploadedAt) }}</span>
              </div>
            </div>
            <button type="button" class="btn-close" @click="showDocModal = false"></button>
          </div>

          <div class="modal-body p-2" style="height: 75vh; min-height: 550px;">
            <img 
              v-if="activeDoc.fileType?.startsWith('image/') || activeDoc.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)" 
              :src="activeDoc.filePath" 
              class="w-100 h-100 rounded" 
              style="object-fit: contain; background: #1e1e2d;"
            />
            <iframe 
              v-else 
              :src="activeDoc.filePath || '/documents/uploaded_sample.pdf'" 
              class="w-100 h-100 rounded border-0"
              style="background: #fff;"
            ></iframe>
          </div>

          <div class="modal-footer py-2 bg-light justify-content-between">
            <span class="text-muted fs-8">Mode Pratinjau Dokumen 1 Halaman Utuh</span>
            <div>
              <a :href="activeDoc.filePath || '/documents/uploaded_sample.pdf'" target="_blank" class="btn btn-sm btn-primary me-2">
                <i class="bi bi-download me-1"></i> Buka / Unduh Berkas
              </a>
              <button type="button" class="btn btn-sm btn-light" @click="showDocModal = false">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "pengajuan-klaim",
  setup() {
    const viewMode = ref<"list" | "create" | "edit" | "detail">("list");
    const editId = ref<number | null>(null);
    const loading = ref(false);
    const saving = ref(false);
    
    const searchQuery = ref("");
    const activeGroup = ref("semua");

    const claims = ref<any[]>([]);
    const availableSps = ref<any[]>([]);
    const penyebabList = ref<any[]>([]);
    
    const selectedSp = ref<any>(null);
    const selectedClaim = ref<any>(null);

    const form = ref({
      sertifikatPenjaminanId: "",
      bakiDebetKlaim: 0,
      nilaiKlaim: 0,
      penyebabKlaimId: "",
      tanggalMacet: "",
      draftOnly: false
    });

    const filterGroups = [
      { id: "semua", label: "Semua Berkas" },
      { id: "baru", label: "Draft & Diajukan" },
      { id: "proses", label: "Sedang Diproses" },
      { id: "setuju", label: "Disetujui / Memo" },
      { id: "final", label: "Selesai / Ditolak" }
    ];

    const toggleGroupFilter = (groupId: string) => {
      if (activeGroup.value === groupId) {
        activeGroup.value = "semua";
      } else {
        activeGroup.value = groupId;
      }
    };

    // Compute status stats dynamically
    const claimStats = ref([
      { title: "Draft & Diajukan", group: "baru", count: 0, pct: 0, color: "info" },
      { title: "Sedang Diproses", group: "proses", count: 0, pct: 0, color: "primary" },
      { title: "Disetujui / Memo", group: "setuju", count: 0, pct: 0, color: "success" },
      { title: "Selesai / Ditolak", group: "final", count: 0, pct: 0, color: "danger" }
    ]);

    const fetchClaims = async () => {
      loading.value = true;
      try {
        const res = await ApiService.get(`klaims?statusGroup=${activeGroup.value}&search=${searchQuery.value}`);
        claims.value = res.data.data;
        
        // Fetch counts for all groups to update header stats
        const [stat1, stat2, stat3, stat4] = await Promise.all([
          ApiService.get("klaims?statusGroup=baru&perPage=1"),
          ApiService.get("klaims?statusGroup=proses&perPage=1"),
          ApiService.get("klaims?statusGroup=setuju&perPage=1"),
          ApiService.get("klaims?statusGroup=final&perPage=1")
        ]);
        
        const counts = [
          stat1.data.meta.total,
          stat2.data.meta.total,
          stat3.data.meta.total,
          stat4.data.meta.total
        ];
        
        const total = counts.reduce((a, b) => a + b, 0) || 1;
        
        claimStats.value[0].count = counts[0];
        claimStats.value[0].pct = Math.round((counts[0] / total) * 100);
        claimStats.value[1].count = counts[1];
        claimStats.value[1].pct = Math.round((counts[1] / total) * 100);
        claimStats.value[2].count = counts[2];
        claimStats.value[2].pct = Math.round((counts[2] / total) * 100);
        claimStats.value[3].count = counts[3];
        claimStats.value[3].pct = Math.round((counts[3] / total) * 100);

      } catch (err) {
        console.error("Gagal mengambil data klaim:", err);
      } finally {
        loading.value = false;
      }
    };

    const fetchSps = async () => {
      try {
        // Fetch only active sertifikat penjaminan
        const res = await ApiService.get("referensi/sertifikat-penjaminans?perPage=100");
        availableSps.value = res.data.data.filter((sp: any) => sp.active);
      } catch (err) {
        console.error("Gagal memuat SP:", err);
      }
    };

    const fetchPenyebabs = async () => {
      try {
        const res = await ApiService.get("referensi/penyebab-klaims?perPage=100");
        penyebabList.value = res.data.data.filter((p: any) => p.active);
      } catch (err) {
        console.error("Gagal memuat penyebab:", err);
      }
    };

    const onSearch = () => {
      fetchClaims();
    };

    const openCreateForm = () => {
      editId.value = null;
      selectedSp.value = null;
      form.value = {
        sertifikatPenjaminanId: "",
        bakiDebetKlaim: 0,
        nilaiKlaim: 0,
        penyebabKlaimId: "",
        tanggalMacet: "",
        draftOnly: false
      };
      viewMode.value = "create";
    };

    const editClaim = (claim: any) => {
      editId.value = claim.id;
      const spId = claim.sertifikatPenjaminanId || claim.sertifikatPenjaminan?.id;
      form.value = {
        sertifikatPenjaminanId: String(spId),
        bakiDebetKlaim: claim.bakiDebetKlaim,
        nilaiKlaim: claim.nilaiKlaim,
        penyebabKlaimId: claim.penyebabKlaimId ? String(claim.penyebabKlaimId) : "",
        tanggalMacet: claim.tanggalMacet || "",
        draftOnly: true
      };
      onSelectSp();
      viewMode.value = "edit";
    };

    const deleteClaim = (claim: any) => {
      Swal.fire({
        title: "Hapus Draft Klaim?",
        html: `Apakah Anda yakin ingin menghapus draft klaim <b class="text-danger">${claim.kodeKlaim}</b>?<br>Tindakan ini tidak dapat dibatalkan.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus Draft",
        cancelButtonText: "Batal",
        buttonsStyling: false,
        customClass: {
          confirmButton: "btn btn-danger fw-semibold px-6",
          cancelButton: "btn btn-light fw-semibold px-6"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ApiService.delete(`klaims/${claim.id}`);
            Swal.fire({
              title: "Terhapus!",
              text: "Draft klaim berhasil dihapus.",
              icon: "success",
              buttonsStyling: false,
              confirmButtonText: "Selesai",
              customClass: { confirmButton: "btn btn-primary" }
            });
            if (viewMode.value === "detail") viewMode.value = "list";
            fetchClaims();
          } catch (err: any) {
            Swal.fire({
              text: err.response?.data?.message || "Gagal menghapus draft klaim.",
              icon: "error",
              buttonsStyling: false,
              confirmButtonText: "Mengerti",
              customClass: { confirmButton: "btn btn-danger" }
            });
          }
        }
      });
    };

    const onSelectSp = () => {
      const sp = availableSps.value.find(s => s.id == form.value.sertifikatPenjaminanId);
      selectedSp.value = sp || null;
      if (sp) {
        form.value.bakiDebetKlaim = sp.bakiDebet;
        form.value.tanggalMacet = sp.tanggalMacet || "";
        recalculateClaimValue();
      }
    };

    const recalculateClaimValue = () => {
      if (selectedSp.value) {
        const cp = selectedSp.value.produk?.coverPercentage || 0.70;
        form.value.nilaiKlaim = form.value.bakiDebetKlaim * cp;
      } else {
        form.value.nilaiKlaim = 0;
      }
    };

    const coverPct = computed(() => {
      return selectedSp.value?.produk?.coverPercentage || 0.70;
    });

    const saveClaim = async () => {
      saving.value = true;
      try {
        if (!form.value.sertifikatPenjaminanId && availableSps.value.length > 0) {
          form.value.sertifikatPenjaminanId = String(availableSps.value[0].id);
          onSelectSp();
        }
        if (!form.value.penyebabKlaimId && penyebabList.value.length > 0) {
          form.value.penyebabKlaimId = String(penyebabList.value[0].id);
        }
        if (viewMode.value === "edit" && editId.value) {
          await ApiService.put(`klaims/${editId.value}`, form.value);
          Swal.fire({
            title: "Berhasil Diperbarui!",
            text: "Data rincian draft pengajuan klaim berhasil diperbarui.",
            icon: "success",
            confirmButtonText: "Selesai",
            customClass: { confirmButton: "btn btn-primary" }
          });
        } else {
          await ApiService.post("klaims", form.value);
          Swal.fire({
            title: "Draft Berhasil Disimpan!",
            text: "Draft pengajuan klaim baru berhasil disimpan. Silakan klik tombol Detail untuk mengunggah dokumen persyaratan.",
            icon: "success",
            confirmButtonText: "Selesai",
            customClass: { confirmButton: "btn btn-primary" }
          });
        }
        
        activeGroup.value = "baru";
        viewMode.value = "list";
        editId.value = null;
        selectedSp.value = null;
        await fetchClaims();
      } catch (err: any) {
        Swal.fire({
          text: err.response?.data?.message || "Terjadi kesalahan.",
          icon: "error",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-danger" }
        });
      } finally {
        saving.value = false;
      }
    };

    const viewDetail = async (claim: any) => {
      try {
        const res = await ApiService.get(`klaims/${claim.id}`);
        selectedClaim.value = res.data.data;
        viewMode.value = "detail";
      } catch (err) {
        console.error("Gagal memuat detail klaim:", err);
      }
    };

    const confirmingSurvey = ref(false);
    const konfirmasiJadwalSurvei = async () => {
      if (!selectedClaim.value) return;
      confirmingSurvey.value = true;
      try {
        const res = await ApiService.post(`klaims/${selectedClaim.value.id}/survei-konfirmasi`, {});
        selectedClaim.value = res.data.data;
        Swal.fire({
          text: "Jadwal survei berhasil dikonfirmasi. Tim Jamkrida akan datang sesuai jadwal.",
          icon: "success",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });
      } catch (err) {
        console.error("Gagal mengonfirmasi jadwal survei:", err);
      } finally {
        confirmingSurvey.value = false;
      }
    };

    const confirmingApproval = ref(false);
    const setujuiKeputusan = async () => {
      if (!selectedClaim.value) return;
      confirmingApproval.value = true;
      try {
        const res = await ApiService.post(`klaims/${selectedClaim.value.id}/setuju-keputusan`, {});
        selectedClaim.value = res.data.data;
        Swal.fire({
          text: "Keputusan klaim berhasil disetujui. Jamkrida akan melanjutkan proses penerbitan Memo Pembayaran.",
          icon: "success",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });
        fetchClaims();
      } catch (err) {
        console.error("Gagal menyetujui keputusan klaim:", err);
      } finally {
        confirmingApproval.value = false;
      }
    };

    const submitDraft = async (claim: any) => {
      const docs = claim?.documents || selectedClaim.value?.documents || [];
      const isPerbaikanStatus = claim.status?.kode === 'perbaikan' || selectedClaim.value?.status?.kode === 'perbaikan';

      // 1. Validasi khusus status Perbaikan: Cek jika ada dokumen tidak_sesuai yang belum diunggah ulang
      if (isPerbaikanStatus) {
        const unreplacedDocs = docs.filter((d: any) => d.kesesuaian === 'tidak_sesuai' && !d.isReplaced && !d.is_replaced);
        if (unreplacedDocs.length > 0) {
          const docNames = unreplacedDocs.map((d: any) => `• <b>${d.jenisDokumen?.nama || 'Dokumen'}</b>`).join('<br>');
          Swal.fire({
            title: "Dokumen Perbaikan Belum Diunggah Ulang!",
            html: `Terdapat <b class="text-danger">${unreplacedDocs.length} berkas</b> yang memerlukan perbaikan namun belum Anda unggah ulang:<br><br><div class="text-start bg-light-danger p-4 rounded border border-danger border-dashed mb-3">${docNames}</div>Silakan klik tombol <b>Ganti File</b> pada setiap berkas bertanda <b class="text-danger">⚠️ Belum Diganti</b> sebelum mengajukan ulang klaim.`,
            icon: "warning",
            buttonsStyling: false,
            confirmButtonText: "Unggah Berkas Perbaikan Sekarang",
            customClass: {
              confirmButton: "btn btn-danger fw-semibold px-6"
            }
          });
          return;
        }
      }

      // 2. Validasi kelengkapan awal 8 dokumen wajib
      const uploadedCount = docs.filter((d: any) => d.ada).length;
      const totalDocs = docs.length || 8;
      const missingCount = totalDocs - uploadedCount;

      if (missingCount > 0) {
        Swal.fire({
          title: "Dokumen Persyaratan Belum Lengkap!",
          html: `Masih terdapat <b class="text-danger">${missingCount} dari ${totalDocs} dokumen wajib</b> yang belum diunggah.<br><br>Silakan unggah seluruh dokumen persyaratan sebelum mengajukan berkas klaim ke Jamkrida.`,
          icon: "warning",
          confirmButtonText: "Unggah Dokumen Sekarang",
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-warning fw-semibold px-6"
          }
        });
        return;
      }

      // 3. Konfirmasi Pengajuan
      const confirmTitle = isPerbaikanStatus ? "Ajukan Ulang Berkas Perbaikan?" : "Ajukan Berkas Klaim?";
      const confirmText = isPerbaikanStatus
        ? "Seluruh dokumen perbaikan telah diperbarui. Berkas perbaikan akan dikirim kembali ke Verifikator Jamkrida."
        : "Seluruh 8 dokumen wajib telah terisi. Berkas yang diajukan akan segera diproses oleh Verifikator Jamkrida.";

      Swal.fire({
        title: confirmTitle,
        text: confirmText,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: isPerbaikanStatus ? "Ya, Ajukan Ulang!" : "Ya, Ajukan Sekarang!",
        cancelButtonText: "Batal",
        buttonsStyling: false,
        customClass: {
          confirmButton: "btn btn-primary fw-semibold px-6",
          cancelButton: "btn btn-light fw-semibold px-6"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ApiService.post(`klaims/${claim.id}/submit`);
            Swal.fire({
              title: isPerbaikanStatus ? "Perbaikan Berhasil Diajukan Ulang!" : "Pengajuan Berhasil!",
              text: isPerbaikanStatus 
                ? "Berkas perbaikan berhasil dikirim kembali dan masuk antrean verifikasi ulang."
                : "Berkas klaim lengkap berhasil diajukan dan masuk ke tahap verifikasi.",
              icon: "success",
              buttonsStyling: false,
              confirmButtonText: "Selesai",
              customClass: { confirmButton: "btn btn-primary" }
            });
            viewMode.value = "list";
            fetchClaims();
          } catch (err: any) {
            Swal.fire({
              text: err.response?.data?.message || "Gagal mengajukan berkas.",
              icon: "error",
              buttonsStyling: false,
              confirmButtonText: "Mengerti",
              customClass: { confirmButton: "btn btn-danger" }
            });
          }
        }
      });
    };

    const uploadDocument = async (event: any, docTypeId: number) => {
      const file = event.target.files[0];
      if (!file || !selectedClaim.value) return;

      const objectUrl = URL.createObjectURL(file);

      // Immediately set local reactive state to blue replaced container
      const targetDoc = selectedClaim.value.documents?.find(
        (d: any) => d.jenisDokumenId == docTypeId || d.id == docTypeId || d.jenisDokumen?.id == docTypeId
      );
      if (targetDoc) {
        // Only treat this as a "replace" if the document already had a file before this upload
        const wasAlreadyUploaded = targetDoc.ada === true || targetDoc.ada === 1;
        targetDoc.ada = true;
        targetDoc.fileName = file.name;
        targetDoc.fileType = file.type;
        targetDoc.isReplaced = wasAlreadyUploaded;
        targetDoc.is_replaced = wasAlreadyUploaded ? 1 : 0;
        targetDoc.replacedAt = wasAlreadyUploaded ? new Date().toISOString() : null;
      }

      const formData = new FormData();
      formData.append("jenisDokumenId", String(docTypeId));
      formData.append("documentId", String(docTypeId));
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("fileUrl", objectUrl);
      formData.append("document", file);
      formData.append("file", file);

      try {
        try {
          await ApiService.post(`klaims/${selectedClaim.value.id}/documents`, formData);
        } catch (e) {
          await ApiService.post(`klaims/${selectedClaim.value.id}/upload-document`, formData);
        }
        
        // Refresh detail and list - trust whatever the backend reports for isReplaced
        const res = await ApiService.get(`klaims/${selectedClaim.value.id}`);
        if (res.data && res.data.data) {
          selectedClaim.value = res.data.data;
        }
        await fetchClaims();
        
        Swal.fire({
          text: `Dokumen "${file.name}" berhasil diunggah!`,
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000
        });
      } catch (err) {
        console.error("Gagal upload dokumen:", err);
      }
    };

    const uploadedDocsCount = computed(() => {
      if (!selectedClaim.value || !selectedClaim.value.documents) return 0;
      return selectedClaim.value.documents.filter((d: any) => d.ada).length;
    });

    // Formatting utilities
    const formatCurrency = (val: any) => {
      if (val === undefined || val === null) return "Rp 0";
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (val: string) => {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    };

    const getStatusColor = (code: string) => {
      const colors: Record<string, string> = {
        draft: "secondary",
        diajukan: "info",
        verifikasi: "warning",
        perbaikan: "danger",
        assessment: "primary",
        survei: "info",
        komite: "danger",
        disetujui: "success",
        ditolak: "danger",
        banding: "warning",
        memo: "success",
        dibayar: "success",
        selesai: "success"
      };
      return colors[code] || "secondary";
    };

    const showDocModal = ref(false);
    const activeDoc = ref<any>(null);

    const previewDoc = (doc: any) => {
      activeDoc.value = doc;
      showDocModal.value = true;
    };

    const showBandingModal = ref(false);
    const bandingAlasan = ref("");
    const submittingBanding = ref(false);

    const openBandingModal = () => {
      bandingAlasan.value = "";
      showBandingModal.value = true;
    };

    const submitBanding = async () => {
      if (!selectedClaim.value || !bandingAlasan.value) return;
      submittingBanding.value = true;
      try {
        const res = await ApiService.post(`klaims/${selectedClaim.value.id}/ajukan-banding`, {
          alasan: bandingAlasan.value
        });
        selectedClaim.value = res.data.data;
        showBandingModal.value = false;
        Swal.fire({
          text: "Banding berhasil diajukan. Jamkrida akan melakukan assessment ulang.",
          icon: "success",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });
        fetchClaims();
      } catch (err) {
        console.error("Gagal mengajukan banding:", err);
      } finally {
        submittingBanding.value = false;
      }
    };

    onMounted(() => {
      fetchClaims();
      fetchSps();
      fetchPenyebabs();
    });

    // Watch active tab change to refetch
    watch(activeGroup, () => {
      fetchClaims();
    });

    return {
      viewMode,
      editId,
      loading,
      saving,
      searchQuery,
      activeGroup,
      claims,
      availableSps,
      penyebabList,
      selectedSp,
      selectedClaim,
      form,
      filterGroups,
      claimStats,
      coverPct,
      uploadedDocsCount,
      showDocModal,
      activeDoc,
      confirmingSurvey,
      konfirmasiJadwalSurvei,
      confirmingApproval,
      setujuiKeputusan,
      showBandingModal,
      bandingAlasan,
      submittingBanding,
      openBandingModal,
      submitBanding,
      toggleGroupFilter,
      onSearch,
      openCreateForm,
      editClaim,
      deleteClaim,
      onSelectSp,
      recalculateClaimValue,
      saveClaim,
      viewDetail,
      submitDraft,
      uploadDocument,
      previewDoc,
      formatCurrency,
      formatDate,
      getStatusColor
    };
  }
});
</script>

<style>
/* Force document content container to expand vertically inside SweetAlert2 modal */
.swal2-popup .swal2-htmlContainer {
  max-height: none !important;
  height: auto !important;
  overflow: visible !important;
  margin: 0.5rem 0 !important;
  padding: 0 !important;
}

.swal-iframe-container {
  height: 620px !important;
  min-height: 620px !important;
  max-height: 620px !important;
  width: 100% !important;
  display: block !important;
  overflow: hidden !important;
}

.swal-iframe-container iframe,
.swal-iframe-container img {
  height: 612px !important;
  min-height: 612px !important;
  width: 100% !important;
  display: block !important;
}
</style>
