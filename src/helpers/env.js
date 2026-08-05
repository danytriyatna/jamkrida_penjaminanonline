export const getEnv = (name) => {
    /* eslint-disable no-undef */
    const clean = (val) => {
        if (typeof val !== 'string') return val;
        return val.trim().replace(/^["']|["']$/g, '');
    };

    // PENTING: Di Vite (Production), import.meta.env[namaVariable] (dinamis) sering gagal.
    // Kita harus mapping secara eksplisit (direct property access) agar bundler bisa mengisi nilainya.
    const directVals = {
        'VUE_APP_DEV_MODE': import.meta.env.VITE_VUE_APP_DEV_MODE,
        'VUE_APP_TITLE': import.meta.env.VITE_VUE_APP_TITLE,
        'VUE_APP_SERVICE_API': import.meta.env.VITE_VUE_APP_SERVICE_API,
        'VUE_APP_VERSION': import.meta.env.VITE_VUE_APP_VERSION,
        'VUE_APP_ONLYOFFICE_SERVER_URL': import.meta.env.VITE_VUE_APP_ONLYOFFICE_SERVER_URL,
        'VUE_APP_MODULE_TIKETING': import.meta.env.VITE_VUE_APP_MODULE_TIKETING,
        'VUE_APP_MODULE_TIKETING_ADMIN': import.meta.env.VITE_VUE_APP_MODULE_TIKETING_ADMIN,
        'VUE_APP_MODULE_PKS': import.meta.env.VITE_VUE_APP_MODULE_PKS,
    };

    // Jika nama variable ada di mapping, kembalikan nilainya
    if (directVals[name] !== undefined) return clean(directVals[name]);

    // Fallback untuk variabel lain secara dinamis (Hanya bekerja di mode Development)
    const value = import.meta.env[name] ||
        (typeof process !== 'undefined' && process.env ? process.env[name] : undefined) ||
        import.meta.env[`VITE_${name}`] ||
        (typeof process !== 'undefined' && process.env ? process.env[`VITE_${name}`] : undefined);

    return clean(value);
};
