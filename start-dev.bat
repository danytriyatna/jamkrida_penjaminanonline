@echo off
set "PATH=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;C:\laragon\bin\nodejs\node-v22;%PATH%"
start "Vite Dev Server - Klaim Online" cmd /k "cd /d C:\Users\DTProject\Documents\GitHub\klaim-online && set PATH=C:\laragon\bin\nodejs\node-v22;%PATH% && npm run dev"
timeout /t 2 /nobreak >nul
start "Laravel API Server - Klaim Online" cmd /k "cd /d C:\Users\DTProject\Documents\GitHub\klaim-online\backend && set PATH=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;%PATH% && php artisan serve"