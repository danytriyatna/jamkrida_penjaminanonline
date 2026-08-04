@echo off
cd /d "%~dp0backend"
echo Menjalankan migrasi database ^(tabel Berita Acara ^& E-sign^)...
echo.

where php >nul 2>nul
if %errorlevel%==0 (
    php artisan migrate
    goto :done
)

for /d %%d in (C:\laragon\bin\php\php-*) do (
    if exist "%%d\php.exe" (
        "%%d\php.exe" artisan migrate
        goto :done
    )
)

echo PHP tidak ditemukan di PATH maupun di lokasi default Laragon.
echo.
echo Cara jalankan manual lewat Laragon:
echo 1. Buka Laragon, klik kanan icon Laragon di system tray
echo 2. Pilih menu "Terminal"
echo 3. Ketik: cd "%~dp0backend"
echo 4. Ketik: php artisan migrate

:done
echo.
echo Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
