/**
 * Mengonversi angka menjadi teks terbilang dalam Bahasa Indonesia
 * Mendukung desimal, nilai negatif, dan hingga satuan Kuadriliun
 * Tanpa menggunakan BigInt untuk kompatibilitas lingkungan lama
 * 
 * @param {number|string} n - Angka yang akan dikonversi
 * @returns {string} - Teks terbilang
 */
export const terbilang = (n) => {
    if (n === null || n === undefined || isNaN(n) || n === "") return "";

    let fValue = parseFloat(n);
    if (fValue === 0) return "Nol";

    let isNegative = fValue < 0;
    // Gunakan toFixed(2) untuk menstandarisasi desimal mata uang dan menghindari floating point noise
    let sValue = Math.abs(fValue).toFixed(2);
    sValue = sValue.replace(/\.00$/, ''); // Hapus .00 jika angka bulat

    // Split into integer and fractional parts
    let parts = sValue.split('.');
    let strInt = parts[0];
    let strDec = parts.length > 1 ? parts[1] : null;

    const unit = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

    /**
     * Konversi angka 0-999 ke kata
     */
    const konversiChunk = (num) => {
        let result = "";
        if (num < 12) {
            result = unit[num];
        } else if (num < 20) {
            result = unit[num - 10] + " Belas";
        } else if (num < 100) {
            result = unit[Math.floor(num / 10)] + " Puluh " + unit[num % 10];
        } else if (num < 200) {
            result = "Seratus " + konversiChunk(num - 100);
        } else {
            result = unit[Math.floor(num / 100)] + " Ratus " + konversiChunk(num % 100);
        }
        return result.trim();
    };

    /**
     * Konversi string angka berapapun panjangnya ke kata dengan membagi per 3 digit
     */
    const processAnyLength = (str) => {
        if (!str || parseInt(str) === 0) return "";
        let chunks = [];
        for (let i = str.length; i > 0; i -= 3) {
            chunks.push(parseInt(str.substring(Math.max(0, i - 3), i)));
        }

        const levels = ["", "Ribu", "Juta", "Miliar", "Triliun", "Kuadriliun"];
        let res = "";
        for (let i = 0; i < chunks.length; i++) {
            if (chunks[i] === 0) continue;

            let cWords = konversiChunk(chunks[i]);

            // Aturan khusus: "Seribu" bukan "Satu Ribu"
            if (i === 1 && chunks[i] === 1) {
                cWords = "Seribu";
            } else if (cWords !== "") {
                cWords += " " + levels[i];
            }

            res = cWords + " " + res;
        }
        return res.trim();
    };

    let result = (isNegative ? "Minus " : "") + processAnyLength(strInt);

    // Proses bagian desimal
    if (strDec && parseInt(strDec) > 0) {
        let zeros = "";
        let i = 0;
        // Tangani nol di depan koma (misal .05 -> Nol Lima)
        while (i < strDec.length && strDec[i] === '0') {
            zeros += " Nol";
            i++;
        }

        let restString = strDec.slice(i);
        let restWords = "";
        if (restString.length > 0) {
            restWords = processAnyLength(restString);
        }

        result += " Koma" + zeros + (restWords ? " " + restWords : "");
    }

    // Pembersihan spasi ganda dan kapitalisasi huruf pertama
    result = result.replace(/\s+/g, ' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Format angka ke format ribuan Indonesia dengan 2 digit desimal
 * @param {number|string} val 
 * @returns {string}
 */
export const formatNumber = (val) => {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val || 0);
};

import axios from '@/lib/axios';
import { fstring } from './fstring';

/**
 * Format angka ke format mata uang Rupiah
 * @param {number|string} val 
 * @returns {string}
 */
export const formatCurrency = (val) => fstring.ToCurrency(val);

/**
 * Format tanggal ke format standar DD MMM YYYY
 * @param {string|Date} val 
 * @returns {string}
 */
export const formatDate = (val) => fstring.formatDate(val);

/**
 * Format waktu ke format standar HH:mm
 * @param {string|Date} val 
 * @returns {string}
 */
export const formatTime = (val) => fstring.formatDateTime(val, 'HH:mm');

export const formatDateTime = (val, format = 'DD MMM YYYY HH:mm') => fstring.formatDateTime(val, format);

export const fromNow = (val) => fstring.fromNow(val);

/**
 * Mendapatkan URL Avatar (Original atau Thumbnail)
 * @param {string} avatar - Filename avatar
 * @param {boolean} isThumb - Apakah mengambil versi thumbnail
 * @returns {string|null}
 */
export const getAvatarUrl = (avatar, isThumb = true) => {
    if (!avatar) return null;
    const baseUrl = axios.defaults.baseURL.replace(/\/api$/, ''); // Remove /api to use web routes if needed, or keep it if proxied
    // Actually, based on web.php, it's /profile-avatar/
    return `${baseUrl}/profile-avatar/${avatar}${isThumb ? '?thumb=1' : ''}`;
};

export const SUBMISSION_STATUS = {
    'draft': 'DRAFT PERMOHONAN',
    'pending_v_doc': 'VERIFIKASI BERKAS',
    'analysing': 'ANALISA PERMOHONAN',
    'review_draft': 'REVIEW HASIL ANALISA',
    'cancel_requested': 'PERMOHONAN PEMBATALAN',
    'pending_payment': 'PEMBAYARAN TERTUNDA',
    'waiting_payment': 'MENUNGGU PEMBAYARAN',
    'payment_review': 'VALIDASI PEMBAYARAN',
    'paid': 'DIBAYAR',
    'verified': 'DISETUJUI',
    'revision': 'REVISI BERKAS',
    'issuing': 'PROSES PENERBITAN',
    'issued': 'TERBIT',
    'rejected': 'DITOLAK',
    'cancelled': 'DIBATALKAN'
};

/**
 * Mendapatkan label status dalam Bahasa Indonesia dari kunci status
 * @param {string} status 
 * @returns {string}
 */
export const getStatusLabel = (status) => {
    if (status === 1 || status === '1') return 'AKTIF';
    if (status === 0 || status === '0') return 'NON-AKTIF';
    const s = (status || '').toLowerCase();
    return SUBMISSION_STATUS[s] || (s ? s.replace(/_/g, ' ').toUpperCase() : '-');
};

/**
 * Mendapatkan kelas warna badge untuk status tertentu
 * @param {string} status 
 * @returns {string}
 */
export const getStatusClass = (status) => {
    if (status === 1 || status === '1') return 'badge-light-success text-success';
    if (status === 0 || status === '0') return 'badge-light-danger text-danger';
    const s = (status || '').toLowerCase();
    const map = {
        'pending_v_doc': 'badge-light-warning text-warning',
        'analysing': 'badge-light-primary text-primary',
        'review_draft': 'badge-light-info text-info',
        'cancel_requested': 'badge-light-danger text-danger border border-danger border-dotted',
        'pending_payment': 'badge-light-info text-info',
        'waiting_payment': 'badge-light-info text-info',
        'payment_review': 'badge-light-info text-info',
        'issuing': 'badge-light-primary text-primary',
        'issued': 'badge-light-success text-success',
        'rejected': 'badge-light-danger text-danger',
        'cancelled': 'badge-light-secondary text-gray-500',
        'revision': 'badge-light-primary text-primary'
    };
    return map[s] || 'badge-light-secondary';
};

/**
 * Get unified status icon
 * @param {string|number} status 
 * @returns {string} bi icon class
 */
export const getStatusIcon = (status) => {
    if (status === 1 || status === '1') return 'bi-eye text-success';
    if (status === 0 || status === '0') return 'bi-eye-slash text-danger';
    const s = (status || '').toLowerCase();
    const map = {
        'pending_v_doc': 'bi-file-earmark-check text-warning',
        'analysing': 'bi-search text-primary',
        'review_draft': 'bi-pencil-square text-info',
        'cancel_requested': 'bi-x-circle-fill text-danger',
        'pending_payment': 'bi-clock-history text-info',
        'waiting_payment': 'bi-currency-dollar text-info',
        'payment_review': 'bi-shield-check text-info',
        'issued': 'bi-patch-check-fill text-success',
        'rejected': 'bi-exclamation-triangle-fill text-danger',
        'cancelled': 'bi-trash text-gray-500',
        'revision': 'bi-arrow-repeat text-primary'
    };
    return map[s] || 'bi-info-circle';
};

/**
 * Mendapatkan konfigurasi alert/notice berdasarkan status
 * @param {string} status 
 * @returns {object}
 */
export const getNoticeConfig = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'revision') return { class: 'bg-light-warning border-warning', border: 'border-warning', icon: 'bi-pencil-square text-warning', title: 'Informasi Perbaikan / Revisi' };
    if (['rejected', 'cancelled', 'cancel_requested'].includes(s)) return { class: 'bg-light-danger border-danger', border: 'border-danger', icon: 'bi-exclamation-octagon-fill text-danger', title: 'Informasi Pembatalan / Reject' };
    return { class: 'bg-light-info border-info', border: 'border-info', icon: 'bi-info-circle-fill text-info', title: 'Catatan Tambahan' };
};

/**
 * Mendapatkan warna grade (Bootstrap Class)
 * @param {object|string} val - submission object or grade char
 * @returns {string}
 */
export const getGradeColor = (val) => {
    if (!val) return 'secondary';

    // If object (submission)
    if (typeof val === 'object') {
        if (val.grade_info?.grade_warna) return val.grade_info.grade_warna;
        const grade = val.scoring_grade;
        if (grade === 'A') return 'success';
        if (grade === 'B') return 'warning';
        if (grade === 'C') return 'danger';
        return 'gray-500';
    }

    // If string/char
    const g = String(val).toUpperCase();
    if (g === 'A') return 'success';
    if (g === 'B') return 'warning';
    if (g === 'C') return 'danger';
    return 'gray-500';
};

/**
 * Mendapatkan label grade dalam Bahasa Indonesia
 * @param {string|object} val - grade char ('A', 'B', 'C') or submission object
 * @returns {string}
 */
export const getGradeLabel = (val) => {
    if (!val) return '-';

    // If object (submission)
    if (typeof val === 'object') {
        if (val.grade_info?.grade_label) return val.grade_info.grade_label;
        const grade = val.scoring_grade;
        if (grade === 'A') return 'Disetujui Tanpa Syarat';
        if (grade === 'B') return 'Disetujui dengan Syarat';
        if (grade === 'C') return 'Ditolak';
        return grade || '-';
    }

    // If string/char
    const g = String(val).toUpperCase();
    if (g === 'A') return 'LULUS MUTLAK';
    if (g === 'B') return 'LULUS BERSYARAT';
    if (g === 'C') return 'DITOLAK';
    return g;
};

/**
 * Generate pagination array with dots for long lists
 * @param {number} current 
 * @param {number} last 
 * @param {number} delta 
 * @returns {Array}
 */
export const getPaginationPages = (current, last, delta = 1) => {
    const range = [];
    const rangeWithDots = [];

    // Always include pages 1, 2, 3 if they exist
    [1, 2, 3].forEach(p => { if (p <= last) range.push(p); });

    // Include pages around current
    for (let i = current - delta; i <= current + delta; i++) {
        if (i > 0 && i <= last && !range.includes(i)) {
            range.push(i);
        }
    }

    // Always include last 3 pages if they exist
    [last - 2, last - 1, last].forEach(p => { if (p > 0 && !range.includes(p)) range.push(p); });

    range.sort((a, b) => a - b);

    let l;
    for (const i of range) {
        if (l) {
            if (i - l === 2) rangeWithDots.push(l + 1);
            else if (i - l !== 1) rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
};

/**
 * Standard page size options for the project
 */
export const perPageOptions = [
    { value: 5, text: '5' },
    { value: 10, text: '10' },
    { value: 12, text: '12' },
    { value: 20, text: '20' },
    { value: 25, text: '25' },
    { value: 50, text: '50' },
    { value: 100, text: '100' },
    { value: 500, text: '500' }
];

/**
 * Common Shared Options
 */
export const STATUS_OPTIONS = [
    { value: '1', text: 'AKTIF' },
    { value: '0', text: 'NON-AKTIF' }
];

export const YES_NO_OPTIONS = [
    { value: '1', text: 'YA' },
    { value: '0', text: 'TIDAK' }
];

export const JENIS_DOKUMEN_OPTIONS = [
    { value: '1', text: 'ASLI' },
    { value: '0', text: 'SALINAN' }
];

export const SYARAT_OPTIONS = [
    { value: '1', text: 'UMUM' },
    { value: '2', text: 'KHUSUS' }
];

/**
 * Sequential number generator for paginated tables
 */
export const getNo = (page, perPage, index) => {
    return (page - 1) * perPage + index + 1;
};
