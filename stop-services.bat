@echo off
:: Script para detener todos los servicios del QR Attendance System
title QR Attendance - Stop Services
color 0E

echo ====================================
echo    QR Attendance System - Stop
echo ====================================
echo.

echo [INFO] Deteniendo servicios de QR Attendance...
echo.

:: Detener procesos de ngrok
echo [STOP] Deteniendo ngrok...
taskkill /F /IM ngrok.exe 2>nul
if %errorlevel%==0 (
    echo [OK] Ngrok detenido
) else (
    echo [OK] Ngrok ya estaba detenido
)

:: Detener procesos de Node.js
echo [STOP] Deteniendo servidores Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo [OK] Node.js detenido
) else (
    echo [OK] Node.js ya estaba detenido
)

:: Detener procesos por puerto usando netstat y taskkill
echo [STOP] Verificando puertos...

:: Backend (puerto 3001)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)
echo [OK] Backend (puerto 3001) verificado

:: Frontend (puerto 5173)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)
echo [OK] Frontend (puerto 5173) verificado

:: Matar todos los procesos de PowerShell que puedan estar ejecutando los servicios
echo [STOP] Limpiando procesos de PowerShell...
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Backend*" 2>nul
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Frontend*" 2>nul
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq *QR Attendance*" 2>nul

echo.
echo [INFO] Manteniendo configuracion de proxy...
echo [OK] Configuracion mantenida (usa proxy de Vite)

echo.
echo [STOP] Todos los servicios han sido detenidos
echo.

:: Opcional: Mostrar procesos activos relacionados
echo [INFO] Verificacion final - Procesos activos:
tasklist | findstr /I "node ngrok" 2>nul
if %errorlevel%==1 (
    echo [OK] No hay procesos activos relacionados
)

echo.
pause