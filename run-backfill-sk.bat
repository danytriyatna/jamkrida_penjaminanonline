@echo off
cd /d "%~dp0backend"
echo Membuat Surat Keputusan untuk klaim yang sudah full-signed sebelumnya...
echo.

where php >nul 2>nul
if %errorlevel%==0 (
    php backfill-sk.php
    goto :done
)

for /d %%d in (C:\laragon\bin\php\php-*) do (
    if exist "%%d\php.exe" (
        "%%d\php.exe" backfill-sk.php
        goto :done
    )
)

echo PHP tidak ditemukan di PATH maupun di lokasi default Laragon.
echo Jalankan manual lewat Terminal Laragon: cd ke folder backend, lalu ketik "php backfill-sk.php"

:done
echo.
echo Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
