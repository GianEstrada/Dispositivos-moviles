@echo off
:: Script avanzado para detener servicios del QR Attendance System
setlocal enabledelayedexpansion
title QR Attendance - Stop Services (Advanced)
color 0E

echo =====================================
echo     QR Attendance System - STOP
echo =====================================
echo.

:: Funcion para mostrar estado
set "stopped=0"

echo [INFO] Iniciando detencion de servicios...
echo.

:: 1. Detener ngrok
echo [1/5] Deteniendo ngrok...
tasklist | findstr /I "ngrok.exe" >nul 2>&1
if !errorlevel!==0 (
    taskkill /F /IM ngrok.exe >nul 2>&1
    echo       [OK] Ngrok detenido exitosamente
    set /a stopped+=1
) else (
    echo       [OK] Ngrok ya estaba detenido
)

:: 2. Detener Node.js
echo [2/5] Deteniendo servidores Node.js...
tasklist | findstr /I "node.exe" >nul 2>&1
if !errorlevel!==0 (
    taskkill /F /IM node.exe >nul 2>&1
    echo       [OK] Node.js detenido exitosamente
    set /a stopped+=1
) else (
    echo       [OK] Node.js ya estaba detenido
)

:: 3. Verificar y detener por puertos especificos
echo [3/5] Liberando puertos especificos...

:: Backend puerto 3001
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 "') do (
    taskkill /F /PID %%a >nul 2>&1
    echo       [OK] Proceso en puerto 3001 (PID: %%a) detenido
    set /a stopped+=1
)

:: Frontend puerto 5173
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /F /PID %%a >nul 2>&1
    echo       [OK] Proceso en puerto 5173 (PID: %%a) detenido
    set /a stopped+=1
)

:: 4. Limpiar ventanas de PowerShell relacionadas
echo [4/5] Limpiando ventanas de PowerShell...
set "ps_killed=0"

:: Buscar ventanas de PowerShell con titulos relacionados
for /f "tokens=2" %%a in ('tasklist /V 2^>nul ^| findstr /I "powershell" ^| findstr /I "Backend\|Frontend\|QR Attendance\|Ngrok"') do (
    taskkill /F /PID %%a >nul 2>&1
    set /a ps_killed+=1
)

if !ps_killed! gtr 0 (
    echo       [OK] !ps_killed! ventanas de PowerShell cerradas
    set /a stopped+=!ps_killed!
) else (
    echo       [OK] No hay ventanas de PowerShell relacionadas abiertas
)

:: 5. Verificacion final
echo [5/5] Verificacion final...
timeout /t 2 /nobreak >nul

:: Verificar que los puertos esten libres
netstat -ano | findstr ":3001\|:5173" >nul 2>&1
if !errorlevel!==1 (
    echo       [OK] Puertos 3001 y 5173 liberados
) else (
    echo       [WARNING] Algunos puertos pueden seguir ocupados
)

:: Verificar procesos
set "remaining=0"
tasklist | findstr /I "node.exe ngrok.exe" >nul 2>&1
if !errorlevel!==0 (
    set /a remaining+=1
    echo       [WARNING] Algunos procesos pueden seguir activos
) else (
    echo       [OK] No hay procesos relacionados activos
)

echo.
echo =====================================
echo           RESUMEN DE DETENCION
echo =====================================
echo  Procesos detenidos: !stopped!
echo  Puertos liberados:  3001, 5173
echo  Estado:             %~nx0 completado
echo =====================================
echo.

if !remaining! gtr 0 (
    echo [INFO] Si persisten problemas, reinicia el sistema
    echo.
)

echo [INFO] Configuracion de proxy mantenida
echo.
pause