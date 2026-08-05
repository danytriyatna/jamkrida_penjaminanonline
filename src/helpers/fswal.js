import Swal from 'sweetalert2'

export const fswal = {
    fire: function (params, text, icon) {
        let options = {};

        // Handle shorthand: fswal.fire('Title', 'Text', 'icon')
        if (typeof params === 'string') {
            const hasHtml = (str) => /<[a-z][\s\S]*>/i.test(str);
            options = {
                title: params,
                icon: icon
            };
            if (hasHtml(text)) {
                options.html = text;
            } else {
                options.text = text;
            }
        } else {
            options = { ...params };
            // Auto-detect HTML in text if text is provided but html is not
            if (options.text && !options.html && /<[a-z][\s\S]*>/i.test(options.text)) {
                options.html = options.text;
                delete options.text;
            }
        }

        const path = window.location.pathname;
        const isAuthPage = path === '/login' || path.includes('/login') || path.includes('/register') || path.includes('/activate') || path.includes('/forgot-password');

        if (isAuthPage) {
            options["background"] = 'rgba(15, 23, 42, 0.95)';
            options["color"] = '#ffffff';
            options["backdrop"] = `rgba(2, 6, 23, 0.75)`;
        }

        options["customClass"] = {
            "popup": isAuthPage ? "border border-white border-opacity-10 shadow-lg rounded-4 overflow-hidden" : "rounded-4 overflow-hidden shadow-sm",
            "confirmButton": options.customClass?.confirmButton || (isAuthPage ? "btn btn-success px-10 rounded-pill fw-boldest" : "btn btn-success px-10 rounded-pill fw-boldest"),
            "denyButton": options.customClass?.denyButton || "btn btn-danger px-10 rounded-pill fw-boldest",
            "cancelButton": options.customClass?.cancelButton || (isAuthPage ? "btn btn-outline-light text-white px-10 rounded-pill fw-boldest" : "btn btn-light px-10 rounded-pill fw-boldest"),
            "closeButton": "btn btn-icon btn-sm btn-active-light-primary rounded-circle",
            "icon": "icon-class",
            "title": isAuthPage ? "text-white fw-boldest fs-3" : "fw-boldest text-gray-800",
            "htmlContainer": isAuthPage ? "text-white opacity-75" : "text-gray-600 fw-bold",
            ...options.customClass,
        };
        options["buttonsStyling"] = false;
        options["footer"] = isAuthPage ? "<span class='opacity-50 text-white fs-9 ls-2'>JAMKRIDA JABAR (Perseroda) RECOVERY PORTAL</span>" : "PT Jamkrida Jabar (Perseroda) - Suretybond";

        return Swal.fire(options);
    },
    showLoading: function () {
        return Swal.showLoading();
    },
    update: function (options) {
        return Swal.update(options);
    },
    close: function () {
        return Swal.close();
    },
    DismissReason: function () {
        return Swal.DismissReason;
    },
    ErrorResponse: function (error, defaultMessage = "Terjadi kesalahan pada server atau jaringan Anda.") {
        let message = defaultMessage;
        let statusCode = "";

        // Parse Error from Backend
        if (error.response) {
            statusCode = error.response.status ? ` (Kode: ${error.response.status})` : "";

            if (error.response.data) {
                const data = error.response.data;

                // 1. Prioritaskan detailed 'errors' object (Laravel Validation)
                if (typeof data.errors === 'object' && data.errors !== null) {
                    const errors = data.errors;
                    const firstField = Object.keys(errors)[0];
                    if (firstField && Array.isArray(errors[firstField])) {
                        message = errors[firstField][0];
                    } else if (typeof errors === 'string') {
                        message = errors;
                    } else {
                        message = JSON.stringify(errors);
                    }
                }
                // 2. Hub/General message pattern { message: "..." }
                else if (typeof data.message === 'string' && data.message !== "") {
                    message = data.message;
                }
                // 3. Content message pattern { content: { message: "..." } }
                else if (data.content && typeof data.content.message === 'string') {
                    message = data.content.message;
                }
                // 4. Single error pattern { error: "..." }
                else if (typeof data.error === 'string') {
                    message = data.error;
                }
                // 5. Plain text response
                else if (typeof data === 'string' && data !== "") {
                    if (data.includes('<!DOCTYPE') || data.includes('<html')) {
                        message = "Terjadi kegagalan sistem internal. Tim teknis telah dinotifikasi.";
                    } else {
                        message = data;
                    }
                }
            }
        } else if (error.request) {
            message = "Tidak ada respon dari server. Pastikan koneksi internet Anda stabil.";
        } else if (error.message) {
            message = error.message;
        }

        const path = window.location.pathname;
        const isAuthPage = path === '/login' || path.includes('/login') || path.includes('/register') || path.includes('/activate') || path.includes('/forgot-password');

        // Tampilkan menggunakan fswal.fire agar styling seragam
        return this.fire({
            icon: "error",
            title: "Peringatan Sistem!" + statusCode,
            html: `
                <div class="alert ${isAuthPage ? 'bg-danger bg-opacity-10 border-danger border-opacity-25' : 'alert-danger'} d-flex align-items-center p-4 mb-0 mt-2">
                    <i class="ki-solid ki-shield-cross fs-2hx text-danger me-4"></i>
                    <div class="d-flex flex-column text-start">
                        <span class="${isAuthPage ? 'text-danger' : 'text-dark'} fw-bold">Detail Error:</span>
                        <span class="${isAuthPage ? 'text-white' : ''}">${message}</span>
                    </div>
                </div>
            `,
            showCloseButton: true,
            confirmButtonText: "Tutup",
            customClass: {
                confirmButton: "btn btn-danger btn-sm px-6 rounded-pill"
            }
        });
    },
    Loading: function (title = "Mohon Tunggu...", text = "Sedang memproses data...") {
        return this.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },
    success: function (message = "Operasi Berhasil!", title = "Berhasil") {
        return this.fire({
            icon: 'success',
            title: title,
            text: message,
            timer: 2500,
            showConfirmButton: true,
            confirmButtonText: 'Selesai'
        });
    },
    Success: function (message = "Operasi Berhasil!", title = "Berhasil") {
        return this.success(message, title);
    },
    error: function (message = "Terjadi kesalahan!", title = "Ups!") {
        return this.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'Tutup'
        });
    },
    Error: function (message = "Terjadi kesalahan!", title = "Ups!") {
        return this.error(message, title);
    },
    info: function (message = "Informasi Sistem", title = "Informasi") {
        return this.fire({
            icon: 'info',
            title: title,
            text: message,
            confirmButtonText: 'Selesai'
        });
    },
    Info: function (message, title) {
        return this.info(message, title);
    },
    Close: function () {
        return this.close();
    },
    confirm: function (title, text, callbackOrIcon = 'question') {
        let icon = 'question';
        let callback = null;

        if (typeof callbackOrIcon === 'function') {
            callback = callbackOrIcon;
        } else if (typeof callbackOrIcon === 'string') {
            icon = callbackOrIcon;
        }

        const promise = this.fire({
            title: title,
            text: text,
            icon: icon,
            showCancelButton: true,
            confirmButtonText: "Ya, Lanjutkan",
            cancelButtonText: "Batal"
        });

        if (callback) {
            promise.then((res) => {
                callback(res.isConfirmed);
            });
        }
        return promise;
    },
    Confirm: function (title, text, callbackOrIcon) {
        return this.confirm(title, text, callbackOrIcon);
    },
    toast: function (title, icon = 'success') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
        return Toast.fire({
            icon: icon,
            title: title
        });
    }
}
