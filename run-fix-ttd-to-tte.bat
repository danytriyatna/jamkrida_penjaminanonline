@echo off
cd /d "%~dp0backend"
echo Memperbaiki istilah TTD menjadi TTE pada data yang sudah tersimpan...
echo.

where php >nul 2>nul
if %errorlevel%==0 (
    php fix-ttd-to-tte.php
    goto :done
)

for /d %%d in (C:\laragon\bin\php\php-*) do (
    if exist "%%d\php.exe" (
        "%%d\php.exe" fix-ttd-to-tte.php
        goto :done
    )
)

echo PHP tidak ditemukan di PATH maupun di lokasi default Laragon.
echo Jalankan manual lewat Terminal Laragon: cd ke folder backend, lalu ketik "php fix-ttd-to-tte.php"

:done
echo.
echo Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
