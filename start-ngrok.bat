@echo off
echo ===================================
echo    QR Attendance System - Ngrok
echo ===================================
echo.

echo Iniciando tuneles ngrok...
echo.

echo 1. Backend (Puerto 3001)
start cmd /k "title Backend Ngrok && ngrok http 3001"

timeout /t 3

echo 2. Frontend (Puerto 5174)  
start cmd /k "title Frontend Ngrok && ngrok http 5174"

echo.
echo Tuneles iniciados!
echo.
echo Abra las ventanas de ngrok para obtener las URLs publicas
echo Luego actualice el archivo .env del frontend con la URL del backend
echo.
echo Ejemplo:
echo VITE_API_BASE_URL=https://abc123.ngrok.io
echo.
pause