<template>
  <div>
    <!-- UNIFIED VERIFICATION LIST CARD -->
    <div class="card card-flush shadow-sm" v-if="viewMode === 'list'">
      <!-- Table Header & Search -->
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <div class="d-flex align-items-center position-relative my-1 me-4">
            <KTIcon icon-name="magnifier" icon-class="fs-1 position-absolute ms-6" />
            <input
              type="text"
              v-model="searchQuery"
              @input="fetchClaims"
              class="form-control form-control-solid w-250px ps-15"
              placeholder="Cari Debitur / No. SP..."
            />
          </div>

          <!-- Status Filter Pills with Badge Counters -->
          <div class="nav-group nav-group-outline border-primary">
            <button
              v-for="st in filterOptions"
              :key="st.id"
              @click="statusFilter = st.id; filterClaimsList();"
              :class="['btn btn-sm btn-color-muted btn-active btn-active-primary px-3 fw-bold d-inline-flex align-items-center gap-2', statusFilter === st.id ? 'active' : '']"
            >
              <span>{{ st.label }}</span>
              <span :class="['badge badge-sm rounded-pill px-2 py-1', statusFilter === st.id ? 'badge-white text-primary fw-bolder' : `badge-light-${st.badgeColor}`]">
                {{ st.count }}
              </span>
            </button>
          </div>
        </div>

        <div class="card-toolbar">
          <span class="badge badge-light-primary fs-7 fw-bold">Total Antrean: {{ claims.length }} Berkas</span>
        </div>
      </div>

      <div class="card-body pt-2">
        <div v-if="loading" class="text-center py-15">
          <span class="spinner-border text-primary" role="status"></span>
          <span class="text-gray-500 d-block mt-2">Memuat antrean berkas klaim...</span>
        </div>

        <div v-else-if="claims.length === 0" class="text-center py-15 border border-dashed rounded bg-light">
          <KTIcon icon-name="folder-check" icon-class="fs-3x text-gray-400 mb-3" />
          <p class="text-gray-500 fs-6 fw-semibold">Tidak ada berkas klaim dalam antrean ini.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr class="fw-bold text-muted bg-light">
                <th class="ps-4 rounded-start">Kode Klaim</th>
                <th>Debitur / SP</th>
                <th>Mitra Bank</th>
                <th>Nilai Klaim</th>
                <th>Tgl Pengajuan</th>
                <th>Status Terakhir</th>
                <th class="text-end rounded-end pe-4">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in claims" :key="c.id">
                <td class="ps-4">
                  <span class="text-gray-900 fw-bold fs-6 d-block">{{ c.kodeKlaim }}</span>
                </td>
                <td>
                  <span class="text-gray-900 fw-bold fs-7 d-block">{{ c.sertifikatPenjaminan?.namaDebitur }}</span>
                  <span class="badge badge-light-secondary fs-8">{{ c.sertifikatPenjaminan?.nomorSp }}</span>
                </td>
                <td>
                  <span class="text-gray-700 fs-7 d-block">{{ c.mitra?.namaMitra ? c.mitra.namaMitra.split(' (')[0] : 'Bank BJB' }}</span>
                </td>
                <td>
                  <span class="text-primary fw-bold fs-6">{{ formatCurrency(c.nilaiKlaim) }}</span>
                </td>
                <td>
                  <span class="text-gray-600 fs-7">{{ formatDate(c.tanggalPengajuan) }}</span>
                </td>
                <td>
                  <span v-if="c.status?.kode === 'perbaikan'" class="badge py-2 px-3 fs-7 fw-bold badge-light-danger text-danger border border-danger border-dashed">
                    ⚠️ Dikembalikan ke Mitra
                  </span>
                  <span v-else-if="c.status?.kode === 'diajukan' && (c.isResubmitted || c.is_resubmitted)" class="badge py-2 px-3 fs-7 fw-bold badge-light-primary text-primary border border-primary shadow-xs">
                    🔄 Diajukan Ulang (dari Perbaikan)
                  </span>
                  <span v-else-if="c.status?.kode === 'disetujui' && c.disetujuiConfirmedByMitra" class="badge py-2 px-3 fs-7 fw-bold badge-light-success text-success border border-success">
                    ✅ Disetujui (Mitra Setuju)
                  </span>
                  <span v-else-if="c.status?.kode === 'disetujui'" class="badge py-2 px-3 fs-7 fw-bold badge-light-warning text-warning border border-warning border-dashed">
                    ⏳ Disetujui (Menunggu Respon Mitra)
                  </span>
                  <span v-else :class="`badge py-2 px-3 fs-7 fw-bold badge-light-${getStatusColor(c.status?.kode)}`">
                    {{ c.status?.nama }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <!-- Aksi Ambil / Analisa Berkas -->
                  <button 
                    v-if="c.status?.kode === 'diajukan'" 
                    @click="ambilVerifikasi(c)" 
                    class="btn btn-sm btn-primary fw-bold d-inline-flex align-items-center gap-1" 
                    title="Ambil dan Mulai Verifikasi Berkas"
                  >
                    <i class="bi bi-box-arrow-in-right fs-6"></i> Ambil & Verifikasi
                  </button>
                  <button 
                    v-else 
                    @click="viewDetail(c)" 
                    class="btn btn-sm btn-light-primary fw-bold d-inline-flex align-items-center gap-1" 
                    title="Proses Lembar Kerja Analisa"
                  >
                    <i class="bi bi-pencil-square fs-6"></i> Proses / Analisa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DETAIL / ANALYSIS WORKFLOW VIEW -->
    <div class="card card-flush shadow-sm" v-if="viewMode === 'detail' && selectedClaim">
      <div class="card-header border-0 pt-6">
        <div class="card-title">
          <button @click="viewMode = 'list'; fetchClaims();" class="btn btn-sm btn-icon btn-light me-4">
            <i class="bi bi-arrow-left fs-4"></i>
          </button>
          <div>
            <h3 class="fw-bold text-gray-900 m-0">Lembar Kerja Analisa: {{ selectedClaim.kodeKlaim }}</h3>
            <span class="text-muted fs-7">Debitur: {{ selectedClaim.sertifikatPenjaminan?.namaDebitur }} ({{ selectedClaim.sertifikatPenjaminan?.nomorSp }})</span>
          </div>
        </div>
        <div class="card-toolbar">
          <span v-if="selectedClaim.status?.kode === 'perbaikan'" class="badge py-3 px-4 fs-6 fw-bold badge-light-danger text-danger border border-danger border-dashed shadow-xs">
            ⚠️ Dikembalikan ke Mitra (Perlu Perbaikan)
          </span>
          <span v-else-if="selectedClaim.status?.kode === 'diajukan' && (selectedClaim.isResubmitted || selectedClaim.is_resubmitted)" class="badge py-3 px-4 fs-6 fw-bold badge-light-primary text-primary border border-primary shadow-xs">
            🔄 Diajukan Ulang oleh Mitra (dari Perbaikan)
          </span>
          <span v-else-if="selectedClaim.status?.kode === 'disetujui' && selectedClaim.disetujuiConfirmedByMitra" class="badge py-3 px-4 fs-6 fw-bold badge-light-success text-success border border-success">
            ✅ Disetujui (Mitra Setuju)
          </span>
          <span v-else-if="selectedClaim.status?.kode === 'disetujui'" class="badge py-3 px-4 fs-6 fw-bold badge-light-warning text-warning border border-warning border-dashed">
            ⏳ Disetujui (Menunggu Respon Mitra)
          </span>
          <span v-else :class="`badge py-3 px-4 fs-6 fw-bold badge-light-${getStatusColor(selectedClaim.status?.kode)}`">
            {{ selectedClaim.status?.nama }}
          </span>
        </div>
      </div>

      <div class="card-body py-10">
        <div class="row g-9">
          <!-- Left: Verification Actions & Info -->
          <div class="col-lg-7">
            <!-- 0. INFORMASI RINGKAS PENGAJUAN (Sama seperti Tampilan Mitra) -->
            <div class="card bg-light border-0 p-6 mb-8 shadow-xs">
              <h4 class="fw-bold text-gray-800 mb-6"><i class="bi bi-info-circle text-primary me-2"></i>Informasi Ringkas Pengajuan</h4>
              <div class="d-flex flex-column gap-3 fs-7">
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nomor SP</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.nomorSp }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nama Debitur</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.sertifikatPenjaminan?.namaDebitur }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Mitra Bank / BPR</span>
                  <span class="fw-bold text-gray-900">{{ selectedClaim.mitra?.namaMitra }}</span>
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
                  <span class="text-muted">Persentase Cover Jaminan</span>
                  <span class="fw-bold text-info">{{ (selectedClaim.coverPercentageSnapshot || 0.7) * 100 }}%</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2">
                  <span class="text-muted">Nominal Proyeksi / Hak Bayar Klaim</span>
                  <span class="fw-bold text-primary fs-6">{{ formatCurrency(selectedClaim.nilaiKlaim) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Penyebab Klaim</span>
                  <span class="fw-bold text-gray-800">{{ selectedClaim.penyebabKlaim?.namaPenyebab || 'Debitur Wanprestasi / Macet Kredit' }}</span>
                </div>
              </div>
            </div>

            <!-- Tabs Nav: samakan konsep dengan tampilan Mitra (Dokumen Berkas / Audit Trail / Jejak) -->
            <ul class="nav nav-tabs nav-line-tabs mb-5 fs-6">
              <li class="nav-item">
                <a class="nav-link text-active-primary cursor-pointer active" data-bs-toggle="tab" href="#kt_tab_aksi">Analisa & Aksi</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-active-primary cursor-pointer" data-bs-toggle="tab" href="#kt_tab_history">Audit Trail / Jejak</a>
              </li>
            </ul>

            <div class="tab-content">
              <!-- Tab: Analisa & Aksi -->
              <div class="tab-pane fade show active" id="kt_tab_aksi" role="tabpanel">

            <!-- 1. TAHAP VERIFIKASI DOKUMEN & CATATAN VERIFIKASI -->
            <div v-if="['verifikasi', 'perbaikan', 'diajukan'].includes(selectedClaim.status?.kode)" class="card border p-6 bg-light-warning border-warning border-dashed mb-8">
              <h4 class="fw-bold text-warning mb-4"><i class="bi bi-shield-check text-warning me-2"></i>Evaluasi Dokumen & Catatan Verifikasi</h4>
              <p class="fs-7 text-gray-700 mb-6">
                Periksa kelengkapan 8 dokumen wajib di samping. Jika semua dokumen valid, teruskan ke tahap Analisa/Assessment. Jika kurang lengkap, kirim permintaan perbaikan berkas ke Mitra.
              </p>

              <!-- Warning Box if previous Catatan Perbaikan exists -->
              <div v-if="selectedClaim.catatanPerbaikan" class="alert alert-danger bg-light-danger border-danger border-dashed p-4 mb-6">
                <span class="fw-bold text-danger d-block mb-1"><i class="bi bi-exclamation-triangle-fill text-danger me-1"></i> Catatan Verifikasi / Catatan Perbaikan Terakhir:</span>
                <span class="text-gray-900 fs-7 fw-semibold">{{ selectedClaim.catatanPerbaikan }}</span>
              </div>

              <!-- Info Box: Hasil Survei Lapangan (jika sudah pernah disurvei) -->
              <div v-if="selectedClaim.survey && selectedClaim.survey.dokumenLaporanPath" class="alert alert-info bg-light-info border-info border-dashed p-4 mb-6">
                <span class="fw-bold text-info d-block mb-2"><i class="bi bi-geo-alt-fill text-info me-1"></i> Hasil Survei Lapangan:</span>
                <div class="row g-3 fs-7">
                  <div class="col-6">
                    <span class="text-muted d-block">Nomor Survei</span>
                    <span class="fw-bold text-gray-900">{{ selectedClaim.survey.nomorPermohonan }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Tanggal Survei</span>
                    <span class="fw-bold text-gray-900">{{ formatDate(selectedClaim.survey.tanggalSurvey) }}</span>
                  </div>
                  <div class="col-12 border-top pt-2 mt-1">
                    <span class="text-muted d-block">Catatan</span>
                    <span class="fw-semibold text-gray-800">{{ selectedClaim.survey.catatan || '-' }}</span>
                  </div>
                </div>
                <a :href="selectedClaim.survey.dokumenLaporanPath" target="_blank" class="btn btn-sm btn-light-info mt-3">
                  <i class="bi bi-file-earmark-text me-1"></i> Lihat Dokumen Laporan Survei
                </a>
              </div>

              <div class="fv-row mb-6">
                <label class="fs-6 fw-semibold mb-2">Catatan Verifikator (Terlihat oleh Mitra jika berkas dikembalikan)</label>
                <textarea class="form-control" rows="3" v-model="verificationNotes" placeholder="Masukkan detail dokumen yang kurang lengkap atau catatan kesesuaian..."></textarea>
              </div>

              <div class="d-flex flex-wrap gap-2 justify-content-end">
                <button @click="submitVerifikasi('perbaikan')" class="btn btn-sm btn-danger fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="cross-circle" icon-class="fs-4 me-1" />
                  Minta Perbaikan Dokumen (Mitra)
                </button>
                <button @click="openSurveyModal" class="btn btn-sm btn-info fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="geolocation" icon-class="fs-4 me-1" />
                  Jadwalkan Survei Lapangan
                </button>
                <button @click="submitVerifikasi('assessment')" class="btn btn-sm btn-success fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="check-circle" icon-class="fs-4 me-1" />
                  Dokumen Lengkap & Teruskan ke Assessment
                </button>
              </div>
            </div>

            <!-- 2. TAHAP ASSESSMENT / ANALISA -->
            <div v-if="selectedClaim.status?.kode === 'assessment'" class="card border p-6 bg-light-primary border-primary border-dashed mb-8">
              <h4 class="fw-bold text-primary mb-4"><i class="bi bi-file-earmark-bar-graph text-primary me-2"></i>Analisa & Assessment</h4>
              <p class="fs-7 text-gray-700 mb-6">
                Lakukan perhitungan risiko dan kesesuaian pasal penjaminan. Jika hasil analisa siap, ajukan berkas ke Sidang Komite Klaim untuk proses E-sign BA dan SK.
              </p>

              <!-- Info Box: Hasil Survei Lapangan (jika sudah pernah disurvei) -->
              <div v-if="selectedClaim.survey && selectedClaim.survey.dokumenLaporanPath" class="alert alert-info bg-light-info border-info border-dashed p-4 mb-6">
                <span class="fw-bold text-info d-block mb-2"><i class="bi bi-geo-alt-fill text-info me-1"></i> Hasil Survei Lapangan:</span>
                <div class="row g-3 fs-7">
                  <div class="col-6">
                    <span class="text-muted d-block">Nomor Survei</span>
                    <span class="fw-bold text-gray-900">{{ selectedClaim.survey.nomorPermohonan }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Tanggal Survei</span>
                    <span class="fw-bold text-gray-900">{{ formatDate(selectedClaim.survey.tanggalSurvey) }}</span>
                  </div>
                  <div class="col-12 border-top pt-2 mt-1">
                    <span class="text-muted d-block">Catatan</span>
                    <span class="fw-semibold text-gray-800">{{ selectedClaim.survey.catatan || '-' }}</span>
                  </div>
                </div>
                <a :href="selectedClaim.survey.dokumenLaporanPath" target="_blank" class="btn btn-sm btn-light-info mt-3">
                  <i class="bi bi-file-earmark-text me-1"></i> Lihat Dokumen Laporan Survei
                </a>
              </div>

              <div class="fv-row mb-6">
                <label class="fs-6 fw-semibold mb-2">Opini / Catatan Hasil Analisa Klaim</label>
                <textarea class="form-control" rows="4" v-model="assessmentNotes" placeholder="Tuliskan ringkasan kasus, hasil wawancara (jika ada), dan justifikasi kelayakan klaim untuk Komite..."></textarea>
              </div>

              <div class="d-flex flex-wrap gap-2 justify-content-end">
                <button @click="openSurveyModal" class="btn btn-sm btn-info fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="geolocation" icon-class="fs-4 me-1" />
                  Jadwalkan Survei Lapangan
                </button>
                <button @click="submitToKomite" class="btn btn-sm btn-danger fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="fingerprint" icon-class="fs-4 me-1" />
                  Kirim ke Sidang Komite (BA & SK)
                </button>
              </div>
            </div>

            <!-- 3. TAHAP SURVEI LAPANGAN -->
            <div v-if="selectedClaim.status?.kode === 'survei'" class="card border p-6 bg-light-info border-info border-dashed mb-8">
              <h4 class="fw-bold text-info mb-4"><i class="bi bi-geo-alt text-info me-2"></i>Agenda Survei Lapangan</h4>
              
              <div class="bg-white p-5 rounded border mb-6" v-if="selectedClaim.survey">
                <div class="row g-4 fs-7">
                  <div class="col-6">
                    <span class="text-muted d-block">Nomor Permohonan</span>
                    <span class="fw-bold text-gray-900">{{ selectedClaim.survey.nomorPermohonan }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Tanggal Rencana Survei</span>
                    <span class="fw-bold text-gray-900">{{ formatDate(selectedClaim.survey.tanggalSurvey) }}</span>
                  </div>
                  <div class="col-12 border-top pt-2">
                    <span class="text-muted d-block">Catatan / Instruksi</span>
                    <span class="fw-semibold text-gray-800">{{ selectedClaim.survey.catatan || '-' }}</span>
                  </div>
                  <div class="col-12 border-top pt-2">
                    <span class="text-muted d-block">Jenis Survei</span>
                    <span v-if="selectedClaim.survey.denganMitra" :class="['badge fs-8 fw-semibold', selectedClaim.survey.konfirmasiMitra ? 'badge-light-success' : 'badge-light-warning']">
                      Bersama Mitra — {{ selectedClaim.survey.konfirmasiMitra ? 'Jadwal Terkonfirmasi Mitra' : 'Menunggu Konfirmasi Mitra' }}
                    </span>
                    <span v-else class="badge badge-light-secondary fs-8 fw-semibold">Survei Internal</span>
                  </div>
                </div>
              </div>

              <!-- Blokir laporan survei selama menunggu konfirmasi jadwal dari Mitra -->
              <div v-if="selectedClaim.survey && selectedClaim.survey.denganMitra && !selectedClaim.survey.konfirmasiMitra" class="alert alert-warning bg-light-warning border-warning border-dashed p-4 mb-6">
                <span class="fw-bold text-warning d-block mb-1"><i class="bi bi-hourglass-split text-warning me-1"></i> Menunggu Konfirmasi Jadwal dari Mitra</span>
                <span class="fs-7 text-gray-700">Mitra belum mengonfirmasi jadwal survei ini. Laporan hasil survei baru bisa diunggah setelah Mitra mengonfirmasi tanggal survei.</span>
              </div>

              <template v-else>
                <div class="fv-row mb-6">
                  <label class="required fs-6 fw-semibold mb-2">Upload Dokumen Laporan Hasil Survei (PDF/Gambar)</label>
                  <div class="d-flex align-items-center gap-3">
                    <input type="file" @change="onUploadSurveyReport" class="form-control form-control-solid" required />
                    <span class="badge badge-light-success fs-7" v-if="surveyReportUploaded">Tersimpan</span>
                  </div>
                </div>

                <div class="fv-row mb-6">
                  <div class="form-check form-check-custom form-check-solid">
                    <input class="form-check-input" type="checkbox" v-model="surveyApprovedByMitra" id="survey_approved_mitra" />
                    <label class="form-check-label fw-bold text-gray-800" for="survey_approved_mitra">
                      Survei Dihadiri & Disetujui oleh Mitra Penerima Jaminan (Tanda Tangan Lapangan)
                    </label>
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button @click="completeSurvey" class="btn btn-sm btn-info fw-semibold" :disabled="!surveyReportUploaded || submitting">
                    <KTIcon icon-name="rocket" icon-class="fs-4 me-1" />
                    Laporan Lengkap & Teruskan ke Assessment
                  </button>
                </div>
              </template>
            </div>

            <!-- 4. TAHAP PROSES BANDING -->
            <div v-if="selectedClaim.status?.kode === 'banding'" class="card border p-6 bg-light-danger border-danger border-dashed mb-8">
              <h4 class="fw-bold text-danger mb-4"><i class="bi bi-arrow-left-right text-danger me-2"></i>Assessment Banding Klaim</h4>
              
              <div class="bg-white p-5 rounded border mb-6" v-if="selectedClaim.banding">
                <span class="text-muted d-block fs-8">Alasan Banding dari Mitra:</span>
                <p class="fw-bold text-gray-900 fs-7 mt-1">{{ selectedClaim.banding.alasan }}</p>
                <span class="text-muted fs-9 d-block">Tanggal Diajukan: {{ formatDate(selectedClaim.banding.tanggalPengajuan) }}</span>
              </div>

              <div class="fv-row mb-6">
                <label class="fs-6 fw-semibold mb-2">Opini / Catatan Hasil Assessment Banding</label>
                <textarea class="form-control" rows="4" v-model="bandingNotes" placeholder="Tuliskan justifikasi pembelaan atau data bukti baru yang diajukan oleh mitra untuk meyakinkan komite..."></textarea>
              </div>

              <div class="d-flex justify-content-end">
                <button @click="submitBandingToKomite" class="btn btn-sm btn-danger fw-semibold" :disabled="submitting">
                  <KTIcon icon-name="fingerprint" icon-class="fs-4 me-1" />
                  Assessment Selesai & Kirim Ulang ke Komite
                </button>
              </div>
            </div>

              </div>
              <!-- /Tab: Analisa & Aksi -->

              <!-- Tab: Audit Trail / Jejak (samakan konsep dengan tampilan Mitra) -->
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
            <!-- /tab-content -->
          </div>

          <!-- Right: Document Review with Sesuai / Tidak Sesuai Inspection -->
          <div class="col-lg-5">
            <div class="card border p-6 bg-white mb-8 shadow-sm">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold text-gray-800 m-0">Pemeriksaan Kesesuaian Berkas</h5>
                <span class="badge badge-light-primary fs-8">8 Dokumen Wajib</span>
              </div>

              <!-- Summary Indicators -->
              <div class="row g-2 mb-6">
                <div class="col-4">
                  <div class="bg-light-success p-2 rounded text-center border border-success border-dashed">
                    <span class="fs-8 text-success fw-semibold d-block">Sesuai</span>
                    <span class="fs-6 fw-bold text-success">{{ getDocCountByStatus('sesuai') }}</span>
                  </div>
                </div>
                <div class="col-4">
                  <div class="bg-light-danger p-2 rounded text-center border border-danger border-dashed">
                    <span class="fs-8 text-danger fw-semibold d-block">Tidak Sesuai</span>
                    <span class="fs-6 fw-bold text-danger">{{ getDocCountByStatus('tidak_sesuai') }}</span>
                  </div>
                </div>
                <div class="col-4">
                  <div class="bg-light-secondary p-2 rounded text-center border border-dashed">
                    <span class="fs-8 text-muted fw-semibold d-block">Belum Diperiksa</span>
                    <span class="fs-6 fw-bold text-gray-700">{{ getDocCountByStatus('belum_diperiksa') }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-column gap-3">
                <div 
                  v-for="doc in selectedClaim.documents" 
                  :key="doc.id" 
                  :class="[
                    'p-4 rounded border transition-all',
                    doc.kesesuaian === 'tidak_sesuai' ? 'border-danger border-2 border-dashed bg-light-danger shadow-xs border-start border-start-4 border-start-danger' : 
                    doc.kesesuaian === 'sesuai' ? 'border-success border-2 bg-light-success shadow-xs border-start border-start-4 border-start-success' : 
                    'border-gray-300 bg-white'
                  ]"
                >
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                      <KTIcon :icon-name="doc.ada ? 'file-sheet' : 'file-down'" :icon-class="`fs-2x text-${doc.ada ? (doc.kesesuaian === 'tidak_sesuai' ? 'danger' : doc.kesesuaian === 'sesuai' ? 'success' : 'primary') : 'gray-400'} me-3`" />
                      <div>
                        <span class="fw-bold text-gray-900 fs-7 d-block">{{ doc.jenisDokumen?.nama }}</span>
                        <div class="d-flex align-items-center gap-1 mt-1">
                          <span v-if="doc.kesesuaian === 'sesuai'" class="badge badge-success px-3 py-1 fs-9 fw-bold text-white shadow-xs">
                            <i class="bi bi-check-circle-fill me-1 text-white"></i> ✓ Disetujui (Sesuai)
                          </span>
                          <span v-else-if="doc.kesesuaian === 'tidak_sesuai'" class="badge badge-danger px-3 py-1 fs-9 fw-bold text-white shadow-xs">
                            <i class="bi bi-x-circle-fill me-1 text-white"></i> ✗ Tidak Sesuai
                          </span>
                          <span v-else-if="doc.ada" class="badge badge-light-warning px-2 py-1 fs-9 fw-bold border border-warning border-dashed">
                            ⏳ Belum Diperiksa
                          </span>
                          <span v-else class="badge badge-light-secondary py-1 px-2 fs-9">Tidak Ada</span>
                        </div>
                      </div>
                    </div>

                    <button v-if="doc.ada" type="button" @click="previewDoc(doc)" class="btn btn-xs btn-light-info d-flex align-items-center gap-1">
                      <i class="bi bi-eye fs-8"></i> Periksa
                    </button>
                  </div>

                  <!-- Verification Controls: Sesuai / Tidak Sesuai Toggle -->
                  <div v-if="doc.ada" class="mt-3 pt-3 border-top">
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <span class="fs-9 text-muted fw-semibold">Hasil Pemeriksaan:</span>
                      <div class="btn-group btn-group-sm" role="group">
                        <button 
                          type="button" 
                          :class="['btn btn-xs px-3 fw-bold', doc.kesesuaian === 'sesuai' ? 'btn-success shadow-xs' : 'btn-light-success text-success']"
                          @click.stop.prevent="markDocStatus(doc, 'sesuai')"
                        >
                          ✓ Sesuai
                        </button>
                        <button 
                          type="button" 
                          :class="['btn btn-xs px-3 fw-bold', doc.kesesuaian === 'tidak_sesuai' ? 'btn-danger shadow-xs' : 'btn-light-danger text-danger']"
                          @click.stop.prevent="markDocStatus(doc, 'tidak_sesuai')"
                        >
                          ✗ Tidak Sesuai
                        </button>
                      </div>
                    </div>

                    <!-- Note input if marked Tidak Sesuai -->
                    <div v-if="doc.kesesuaian === 'tidak_sesuai'" class="mt-2">
                      <input 
                        type="text" 
                        class="form-control form-control-sm form-control-solid border-danger fs-8" 
                        v-model="doc.catatanPemeriksaan"
                        @blur="saveDocNote(doc)"
                        placeholder="Catatan alasan tidak sesuai (mis: scan buram)..." 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SURVEY SCHEDULER MODAL -->
    <div v-if="showSurveyModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5); overflow-y:auto;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Jadwalkan Survei Lapangan</h5>
            <button type="button" class="btn-close" @click="showSurveyModal = false"></button>
          </div>
          <form @submit.prevent="submitSurveySchedule">
            <div class="modal-body">
              <div class="fv-row mb-6">
                <label class="required fs-6 fw-semibold mb-2">Tanggal Survei</label>
                <input type="date" class="form-control form-control-solid" v-model="surveyForm.tanggalSurvey" required />
              </div>
              <div class="fv-row mb-6">
                <label class="fs-6 fw-semibold mb-2">Catatan / Instruksi Tim Survei</label>
                <textarea class="form-control form-control-solid" rows="3" v-model="surveyForm.catatan" placeholder="Masukkan lokasi detail wirausaha, rute, atau berkas tambahan yang harus disurvei..."></textarea>
              </div>
              <div class="fv-row mb-2">
                <label class="fs-6 fw-semibold mb-2">Jenis Survei</label>
                <div class="form-check form-check-custom form-check-solid mb-2">
                  <input class="form-check-input" type="radio" v-model="surveyForm.denganMitra" :value="true" id="survey_dengan_mitra" />
                  <label class="form-check-label fw-semibold text-gray-800" for="survey_dengan_mitra">
                    Survei Bersama Mitra <span class="text-muted fw-normal">(perlu konfirmasi jadwal dari Mitra terlebih dahulu)</span>
                  </label>
                </div>
                <div class="form-check form-check-custom form-check-solid">
                  <input class="form-check-input" type="radio" v-model="surveyForm.denganMitra" :value="false" id="survey_internal" />
                  <label class="form-check-label fw-semibold text-gray-800" for="survey_internal">
                    Survei Internal <span class="text-muted fw-normal">(langsung dijadwalkan tanpa perlu konfirmasi Mitra)</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light btn-sm" @click="showSurveyModal = false">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm">Jadwalkan & Kirim Tugas</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DOCUMENT PREVIEW MODAL FOR VERIFIKATOR (75VH HEIGHT) -->
    <div v-if="showDocModal && activeDoc" class="modal fade show d-block" style="background: rgba(0, 0, 0, 0.65); z-index: 1055;" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header py-3 bg-light">
            <div class="d-flex align-items-center gap-3">
              <i class="bi bi-file-earmark-pdf fs-2 text-primary"></i>
              <div>
                <h5 class="modal-title fw-bold text-gray-900 mb-0">{{ activeDoc.jenisDokumen?.nama || 'Pratinjau Berkas' }}</h5>
                <span class="text-muted fs-8">Status Berkas: {{ activeDoc.kesesuaian === 'tidak_sesuai' ? 'Tidak Sesuai' : activeDoc.kesesuaian === 'sesuai' ? 'Sesuai' : 'Tersedia' }}</span>
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
            <div class="d-flex align-items-center gap-2">
              <span class="fs-8 fw-semibold text-gray-700">Tandai Hasil Pemeriksaan:</span>
              <button 
                type="button" 
                :class="['btn btn-xs px-3', activeDoc.kesesuaian === 'sesuai' ? 'btn-success' : 'btn-outline btn-outline-success']"
                @click="markDocStatus(activeDoc, 'sesuai')"
              >
                ✓ Sesuai
              </button>
              <button 
                type="button" 
                :class="['btn btn-xs px-3', activeDoc.kesesuaian === 'tidak_sesuai' ? 'btn-danger' : 'btn-outline btn-outline-danger']"
                @click="markDocStatus(activeDoc, 'tidak_sesuai')"
              >
                ✗ Tidak Sesuai
              </button>
            </div>

            <div>
              <a :href="activeDoc.filePath || '/documents/uploaded_sample.pdf'" target="_blank" class="btn btn-sm btn-primary me-2">
                <i class="bi bi-download me-1"></i> Unduh Berkas
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
import { useRoute } from "vue-router";
import ApiService from "@/core/services/ApiService";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default defineComponent({
  name: "verifikasi-klaim",
  setup() {
    const route = useRoute();
    const activeTab = ref<"baru" | "proses">("baru");
    const viewMode = ref<"list" | "detail">("list");
    
    const loading = ref(false);
    const submitting = ref(false);
    
    const claims = ref<any[]>([]);
    const newClaimsCount = ref(0);
    const selectedClaim = ref<any>(null);

    // Form states
    const verificationNotes = ref("");
    const assessmentNotes = ref("");
    const bandingNotes = ref("");
    
    const showSurveyModal = ref(false);
    const surveyForm = ref({
      tanggalSurvey: "",
      catatan: "",
      denganMitra: true
    });

    const surveyReportUploaded = ref(false);
    const surveyApprovedByMitra = ref(false);

    const searchQuery = ref("");
    const statusFilter = ref("semua");
    const allClaims = ref<any[]>([]);

    const statusCounts = computed(() => {
      const list = allClaims.value;
      return {
        semua: list.length,
        diajukan: list.filter((k: any) => k.status?.kode === 'diajukan').length,
        verifikasi: list.filter((k: any) => k.status?.kode === 'verifikasi').length,
        perbaikan: list.filter((k: any) => k.status?.kode === 'perbaikan').length,
        survei: list.filter((k: any) => k.status?.kode === 'survei').length,
        assessment: list.filter((k: any) => k.status?.kode === 'assessment').length,
        komite: list.filter((k: any) => k.status?.kode === 'komite' || k.status?.kode === 'banding').length
      };
    });

    const filterOptions = computed(() => [
      { id: "semua", label: "Semua Berkas", count: statusCounts.value.semua, badgeColor: "primary" },
      { id: "diajukan", label: "Diajukan (Baru)", count: statusCounts.value.diajukan, badgeColor: "info" },
      { id: "perbaikan", label: "Perbaikan", count: statusCounts.value.perbaikan, badgeColor: "danger" },
      { id: "verifikasi", label: "Verifikasi", count: statusCounts.value.verifikasi, badgeColor: "warning" },
      { id: "survei", label: "Proses Survei", count: statusCounts.value.survei, badgeColor: "info" },
      { id: "assessment", label: "Analisa / Assessment", count: statusCounts.value.assessment, badgeColor: "primary" },
      { id: "komite", label: "Komite", count: statusCounts.value.komite, badgeColor: "dark" }
    ]);

    const fetchClaims = async () => {
      loading.value = true;
      try {
        const res = await ApiService.get(`klaims?perPage=100&search=${searchQuery.value}`);
        allClaims.value = res.data.data.filter((k: any) => k.status?.kode !== "draft");
        filterClaimsList();
      } catch (err) {
        console.error("Gagal memuat antrean verifikasi:", err);
      } finally {
        loading.value = false;
      }
    };

    const filterClaimsList = () => {
      if (statusFilter.value === "semua") {
        claims.value = [...allClaims.value];
      } else if (statusFilter.value === "komite") {
        claims.value = allClaims.value.filter((k: any) => ['komite', 'banding'].includes(k.status?.kode));
      } else {
        claims.value = allClaims.value.filter((k: any) => k.status?.kode === statusFilter.value);
      }
    };

    const ambilVerifikasi = (claim: any) => {
      Swal.fire({
        title: "Proses Berkas Ini?",
        text: `Anda akan bertindak sebagai Verifikator Jamkrida untuk klaim ${claim.kodeKlaim}.`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Ya, Ambil!",
        cancelButtonText: "Batal",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-light"
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await ApiService.post(`klaims/${claim.id}/ambil-verifikasi`);
            Swal.fire({
              text: "Berkas klaim berhasil masuk antrean Anda!",
              icon: "success",
              confirmButtonText: "Buka Berkas",
              customClass: { confirmButton: "btn btn-primary" }
            }).then(() => {
              activeTab.value = "proses";
              viewDetail(claim);
            });
          } catch (err: any) {
            Swal.fire({
              text: err.response?.data?.message || "Gagal mengambil berkas.",
              icon: "error"
            });
          }
        }
      });
    };

    const viewDetail = async (claim: any) => {
      try {
        const res = await ApiService.get(`klaims/${claim.id}`);
        selectedClaim.value = res.data.data;
        
        // Reset inputs
        verificationNotes.value = selectedClaim.value.catatanPerbaikan || "";
        assessmentNotes.value = "";
        bandingNotes.value = "";
        surveyReportUploaded.value = !!selectedClaim.value.survey?.dokumenLaporanPath;
        surveyApprovedByMitra.value = !!selectedClaim.value.survey?.approvedByMitra;

        viewMode.value = "detail";
      } catch (err) {
        console.error("Gagal mengambil detail berkas:", err);
      }
    };

    const submitVerifikasi = async (actionType: "assessment" | "perbaikan") => {
      submitting.value = true;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/verifikasi-dokumen`, {
          action: actionType,
          catatan: verificationNotes.value
        });
        
        Swal.fire({
          text: actionType === "assessment" 
            ? "Berkas berhasil lolos verifikasi dan dilanjutkan ke tahap Analisa!"
            : "Berkas berhasil dikembalikan ke Mitra untuk perbaikan!",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: { confirmButton: "btn btn-primary" }
        });
        
        viewMode.value = "list";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        submitting.value = false;
      }
    };

    // Open scheduler modal
    const openSurveyModal = () => {
      surveyForm.value = {
        tanggalSurvey: new Date().toISOString().split("T")[0],
        catatan: "",
        denganMitra: true
      };
      showSurveyModal.value = true;
    };

    const submitSurveySchedule = async () => {
      showSurveyModal.value = false;
      submitting.value = true;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/verifikasi-dokumen`, {
          action: "survei",
          catatan: surveyForm.value.catatan,
          tanggalSurvey: surveyForm.value.tanggalSurvey,
          denganMitra: surveyForm.value.denganMitra
        });

        Swal.fire({
          text: surveyForm.value.denganMitra
            ? "Permohonan survei terkirim ke Mitra, menunggu konfirmasi jadwal."
            : "Agenda Survei Lapangan Internal berhasil didaftarkan!",
          icon: "success",
          confirmButtonText: "Mengerti",
          customClass: { confirmButton: "btn btn-primary" }
        });

        viewMode.value = "list";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        submitting.value = false;
      }
    };

    const onUploadSurveyReport = async () => {
      // Mock report file upload
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/survei-laporan`);
        surveyReportUploaded.value = true;
        Swal.fire({
          text: "Laporan survei berhasil diunggah!",
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000
        });
      } catch (err) {
        console.error(err);
      }
    };

    const completeSurvey = async () => {
      submitting.value = true;
      try {
        // Save the approvedByMitra checkbox state first
        await ApiService.post(`klaims/${selectedClaim.value.id}/survei-laporan`, {
          approvedByMitra: surveyApprovedByMitra.value
        });

        // Trigger finish survey
        await ApiService.post(`klaims/${selectedClaim.value.id}/survei-selesai`);
        
        Swal.fire({
          text: "Survei selesai! Berkas kembali ke meja Analisa/Assessment.",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: { confirmButton: "btn btn-primary" }
        });

        viewMode.value = "list";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        submitting.value = false;
      }
    };

    const submitToKomite = async () => {
      submitting.value = true;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/ajukan-komite`, {
          catatan: assessmentNotes.value
        });
        
        Swal.fire({
          text: "Berkas berhasil diajukan ke Sidang Komite Klaim! Berkas BA otomatis diterbitkan.",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: { confirmButton: "btn btn-primary" }
        });

        viewMode.value = "list";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        submitting.value = false;
      }
    };

    const submitBandingToKomite = async () => {
      submitting.value = true;
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/selesai-banding`, {
          catatan: bandingNotes.value
        });

        Swal.fire({
          text: "Assessment Banding selesai! Berkas dikirim kembali ke Sidang Komite (BA baru diterbitkan).",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: { confirmButton: "btn btn-primary" }
        });

        viewMode.value = "list";
        fetchClaims();
      } catch (err) {
        console.error(err);
      } finally {
        submitting.value = false;
      }
    };

    // Document inspection handlers
    const showDocModal = ref(false);
    const activeDoc = ref<any>(null);

    const previewDoc = (doc: any) => {
      activeDoc.value = doc;
      showDocModal.value = true;
    };

    const markDocStatus = async (doc: any, status: 'sesuai' | 'tidak_sesuai') => {
      doc.kesesuaian = status;
      if (status === 'sesuai') {
        doc.catatanPemeriksaan = "";
      }
      try {
        await ApiService.post(`klaims/${selectedClaim.value.id}/verify-document`, {
          documentId: doc.id,
          jenisDokumenId: doc.jenisDokumenId || doc.id,
          status,
          catatan: doc.catatanPemeriksaan || ""
        });

        // Auto-compose verification notes for Mitra if any document is marked 'tidak_sesuai'
        const invalidDocs = selectedClaim.value.documents.filter((d: any) => d.kesesuaian === 'tidak_sesuai');
        if (invalidDocs.length > 0) {
          verificationNotes.value = invalidDocs.map((d: any) => 
            `- ${d.jenisDokumen?.nama}: ${d.catatanPemeriksaan || 'Berkas tidak sesuai / perlu diperbarui.'}`
          ).join('\n');
        } else {
          verificationNotes.value = "";
        }

        Swal.fire({
          text: `Dokumen "${doc.jenisDokumen?.nama || 'Berkas'}" berhasil ditandai ${status === 'sesuai' ? 'Sesuai' : 'Tidak Sesuai'}!`,
          icon: status === 'sesuai' ? "success" : "warning",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000
        });
      } catch (err) {
        console.error("Gagal menyimpan hasil verifikasi dokumen:", err);
      }
    };

    const saveDocNote = async (doc: any) => {
      await markDocStatus(doc, doc.kesesuaian);
    };

    const getDocCountByStatus = (status: string) => {
      if (!selectedClaim.value || !selectedClaim.value.documents) return 0;
      if (status === 'belum_diperiksa') {
        return selectedClaim.value.documents.filter((d: any) => d.ada && (!d.kesesuaian || d.kesesuaian === 'belum_diperiksa')).length;
      }
      return selectedClaim.value.documents.filter((d: any) => d.kesesuaian === status).length;
    };

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

    onMounted(async () => {
      await fetchClaims();
      const targetId = route.query.claimId || route.query.id;
      if (targetId) {
        const targetIdNum = parseInt(String(targetId));
        let found = allClaims.value.find((c: any) => c.id === targetIdNum || c.kodeKlaim === targetId);
        if (!found) {
          try {
            const res = await ApiService.get(`klaims/${targetId}`);
            found = res.data.data;
          } catch (e) {
            console.error("Gagal membuka klaim spesifik:", e);
          }
        }
        if (found) {
          await viewDetail(found);
        }
      }
    });

    // Watch tab change to refetch
    watch(activeTab, () => {
      fetchClaims();
    });

    return {
      activeTab,
      viewMode,
      loading,
      submitting,
      searchQuery,
      statusFilter,
      filterOptions,
      statusCounts,
      filterClaimsList,
      claims,
      newClaimsCount,
      selectedClaim,
      verificationNotes,
      assessmentNotes,
      bandingNotes,
      showSurveyModal,
      surveyForm,
      surveyReportUploaded,
      surveyApprovedByMitra,
      showDocModal,
      activeDoc,
      previewDoc,
      markDocStatus,
      saveDocNote,
      getDocCountByStatus,
      ambilVerifikasi,
      viewDetail,
      submitVerifikasi,
      openSurveyModal,
      submitSurveySchedule,
      onUploadSurveyReport,
      completeSurvey,
      submitToKomite,
      submitBandingToKomite,
      formatCurrency,
      formatDate,
      getStatusColor,
      fetchClaims
    };
  }
});
</script>
