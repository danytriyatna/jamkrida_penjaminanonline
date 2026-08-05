//import moment from 'moment';
import moment from 'moment/min/moment-with-locales';
import 'moment/locale/id'; // Penting agar locale id dikenali

export const fstring = {
    ifNULL: function (value) {
        let data = "";
        if (value != null) {
            data = value;
        } else {
            data = "";
        }
        return data;
    },
    ToCurrency: function (value) {
        let ret = 0;
        if (isNaN(value)) {
            value = 0;
        }
        let formatter = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 2,
            currencyDisplay: "code"
        });
        ret = formatter.format(value).replace("IDR", "").trim();
        return ret;
    },
    formatNumber: function (value, decimals = 2) {
        if (isNaN(value)) value = 0;
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },
    ToDate: function (value, format = 'DD/MM/YYYY', local = 'en') {
        return moment(value).locale(local).format(format);
    },
    ToWaktu: function (value, local = 'id') {
        return moment(value).locale(local).fromNow();
    },
    fromNow: function (value, local = 'id') {
        if (!value) return '-';
        return moment(value).locale(local).fromNow();
    },
    formatDateTime: function (value, format = 'DD MMM YYYY, HH:mm', local = 'id') {
        if (!value) return '-';
        return moment(value).locale(local).format(format);
    },
    ToDateRange(dates) {
        const start = moment(dates[0]).format('DD/MM/YYYY');
        const end = moment(dates[1]).format('DD/MM/YYYY');
        return `${start} - ${end}`;
    },
    formatDate: function (value, local = 'id') {
        if (!value) return '-';
        return moment(value).locale(local).format('DD MMM YYYY');
    },
    formatDateShort: function (value, local = 'id') {
        if (!value) return '-';
        return moment(value).locale(local).format('DD MMM');
    },
    formatTimeAgo: function (value, local = 'id') {
        if (!value) return '-';
        const now = moment();
        const past = moment(value);
        const diffDays = now.diff(past, 'days');

        if (diffDays < 1) {
            return past.locale(local).fromNow();
        } else if (diffDays === 1) {
            return local === 'id' ? 'Kemarin' : 'Yesterday';
        } else if (diffDays < 30) {
            return local === 'id' ? `${diffDays} hari yang lalu` : `${diffDays} days ago`;
        } else {
            return this.formatDate(value, local);
        }
    },
    getArrowICon: function (value1, value2) {
        let n1 = 0;
        let n2 = 0;

        if (isNaN(value1)) {
            n1 = 0;
        } else {
            n1 = Number(value1);
        }
        if (isNaN(value2)) {
            n2 = 0;
        } else {
            n2 = Number(value2);
        }

        let ret = "";

        if (n1 == 0 && n2 == 0) {
            ret = " text-info ki-solid ki-minus ";
        } else {
            ret = (n1 > n2 ? ' text-success ki-solid ki-arrow-up ' : ' text-danger ki-solid ki-arrow-down ')
        }
        return ret;
    },
    StatusTerbit: function (value) {
        switch (value) {
            case "0":
            case 0:
                return "SUBMIT";
            case "11":
            case 11:
                return "ACC KABAG";
            case "12":
            case 12:
                return "TOLAK KABAG";
            case "21":
            case 21:
                return "ACC KADIV";
            case "22":
            case 22:
                return "TOLAK KADIV";
            case "31":
            case 31:
                return "ACC KABAG2";
            case "32":
            case 32:
                return "TOLAK KABAG2";
            case "41":
            case 41:
                return "ACC KADIV2";
            case "42":
            case 42:
                return "TOLAK KADIV2";
            default:
                return "NA";

        }
    },
    StatusTerbitWarna: function (value, add = "") {
        switch (value) {
            case "0":
            case 0:
                return add + "info ki-medal-star";
            case "11":
            case 11:
                return add + "success ki-user";
            case "12":
            case 12:
                return add + "danger ki-user";
            case "21":
            case 21:
                return add + "success ki-profile-user";
            case "22":
            case 22:
                return add + "danger ki-profile-user";
            case "31":
            case 31:
                return add + "success ki-user-tick";
            case "32":
            case 32:
                return add + "danger ki-user-tick";
            case "41":
            case 41:
                return add + "success ki-people";
            case "42":
            case 42:
                return add + "danger ki-people";
            default:
                return add + "warning ki-information";

        }
    },
    StatusRealisasi: function (value) {
        switch (value) {
            case "21":
            case 21:
                return "SUBMIT";
            case "31":
            case 31:
                return "ACC KABAG";
            case "32":
            case 32:
                return "TOLAK KABAG";
            case "41":
            case 41:
                return "SELESAI";
            case "42":
            case 42:
                return "DITOLAK";
            default:
                return "NA";

        }
    },
    StatusRealisasiWarna: function (value, add = "") {
        switch (value) {
            case "21":
            case 21:
                return add + "warning ki-profile-user";
            case "22":
            case 22:
                return add + "danger ki-profile-user";
            case "31":
            case 31:
                return add + "primary ki-user-tick";
            case "32":
            case 32:
                return add + "danger ki-user-tick";
            case "41":
            case 41:
                return add + "success ki-people";
            case "42":
            case 42:
                return add + "danger ki-people";
            default:
                return add + "warning ki-information";

        }
    },

    TimeZone: function () {
        return { tz: 'Asia/Jakarta', offset: 7 };
    },
    GetLocalDate: (date) => {
        /*
        const day = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        const month = ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1));
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
        */
        return moment(date).format('DD/MM/YYYY');
    },
    GetLocalYearMonth: (date) => {
        return moment(date).format('MM/YYYY');
    },
    GetLocalYear: (date) => {
        return moment(date).format('YYYY');
    },
    isInArray(value, array) {
        return array.indexOf(value) > -1;
    },
    NamaBulan: function (value) {
        switch (value) {
            case 1:
            case "1":
            case "01":
                return "Januari";
            case 2:
            case "2":
            case "02":
                return "Februari";
            case 3:
            case "3":
            case "03":
                return "Maret";
            case 4:
            case "4":
            case "04":
                return "April";
            case 5:
            case "5":
            case "05":
                return "Mei";
            case 6:
            case "6":
            case "06":
                return "Juni";
            case 7:
            case "7":
            case "07":
                return "Juli";
            case 8:
            case "8":
            case "08":
                return "Agustus";
            case 9:
            case "9":
            case "09":
                return "September";
            case 10:
            case "10":
                return "Oktober";
            case 11:
            case "11":
                return "November";
            case 12:
            case "12":
                return "Desember";
        }
    },
    numberToTime: function (value) {
        // const hours = String(Math.floor((value / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        // const minutes = String(Math.floor(value / 6000)).padStart(2, "0");
        // const seconds = String(Math.floor((value % 6000) / 100)).padStart(2, "0");
        // const milliseconds = String(value % 100).padStart(2, "0");
        // return `${minutes}:${minutes}:${seconds}, ${milliseconds}`;
        const hours = String(Math.floor(value / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((value % 3600) / 60)).padStart(2, "0");
        const seconds = String(value % 60).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    },
    formatBytes: function (bytes, decimals = 0) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        const result = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${result} ${sizes[i]}`;
    },
    getExtentionIcon: function (fileName) {
        if (!fileName || typeof fileName !== 'string') return 'far fa-file';
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'far fa-file-pdf text-danger';
            case 'doc':
            case 'docx':
                return 'far fa-file-word text-primary';
            case 'xls':
            case 'xlsx':
                return 'far fa-file-excel text-success';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'far fa-file-image';
            case 'zip':
            case 'rar':
            case 'tar':
            case 'gz':
            case 'tar.gz':
                return 'far fa-file-archive';
            default:
                return 'far fa-file';
        }
    },

    getFileIcon: function (fileName) {
        if (!fileName) return { icon: 'bi-file-earmark', color: 'text-primary', bg: 'bg-light-primary' };
        const extension = fileName.split('.').pop().toLowerCase();
        const map = {
            pdf: { icon: 'bi-file-earmark-pdf', color: 'text-danger', bg: 'bg-light-danger' },
            doc: { icon: 'bi-file-earmark-word', color: 'text-primary', bg: 'bg-light-primary' },
            docx: { icon: 'bi-file-earmark-word', color: 'text-primary', bg: 'bg-light-primary' },
            xls: { icon: 'bi-file-earmark-excel', color: 'text-success', bg: 'bg-light-success' },
            xlsx: { icon: 'bi-file-earmark-excel', color: 'text-success', bg: 'bg-light-success' },
            jpg: { icon: 'bi-file-earmark-image', color: 'text-warning', bg: 'bg-light-warning' },
            jpeg: { icon: 'bi-file-earmark-image', color: 'text-warning', bg: 'bg-light-warning' },
            png: { icon: 'bi-file-earmark-image', color: 'text-warning', bg: 'bg-light-warning' },
            rar: { icon: 'bi-file-earmark-zip', color: 'text-info', bg: 'bg-light-info' },
            zip: { icon: 'bi-file-earmark-zip', color: 'text-info', bg: 'bg-light-info' }
        };
        return map[extension] || { icon: 'bi-file-earmark', color: 'text-primary', bg: 'bg-light-primary' };
    },

    getInitial: function (name) {
        if (!name || typeof name !== 'string') return '?';

        // Split by ' - ' in case of "ID - Name" format
        let parts = name.split(' - ');
        let target = parts.length > 1 ? parts[1] : name;

        // Remove typical Indonesian titles if they exist at the start
        const titles = ['H.', 'Dr.', 'Drs.', 'Dra.', 'Ir.', 'Hj.'];
        let words = target.trim().split(' ');

        if (words.length > 1 && titles.includes(words[0])) {
            target = words.slice(1).join(' ');
        }

        target = target.trim();

        // Find the first character that is a letter
        const firstLetterMatch = target.match(/[a-zA-Z]/);
        if (firstLetterMatch) {
            return firstLetterMatch[0].toUpperCase();
        }

        return target.charAt(0).toUpperCase() || '?';
    },

    cleanName: function (name) {
        if (!name || typeof name !== 'string') return name;
        let parts = name.split(' - ');
        return parts.length > 1 ? parts[1].trim() : name.trim();
    },
}

