# Script para detener todos los servicios
Write-Host "Deteniendo servicios de QR Attendance..." -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Detener procesos de ngrok
Write-Host "Deteniendo ngrok..." -ForegroundColor Blue
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Checkmark Ngrok detenido" -ForegroundColor Green

# Detener procesos de Node.js (npm run dev)
Write-Host "Deteniendo servidores Node.js..." -ForegroundColor Blue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*QR Attendance*" -or $_.CommandLine -like "*npm run dev*" } | Stop-Process -Force

# Metodo alternativo para detener por puerto
try {
    $backend = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
    if ($backend) {
        $backendPID = $backend.OwningProcess
        Stop-Process -Id $backendPID -Force -ErrorAction SilentlyContinue
        Write-Host "Checkmark Backend (puerto 3001) detenido" -ForegroundColor Green
    } else {
        Write-Host "Checkmark Backend ya estaba detenido" -ForegroundColor Green
    }
} catch {
    Write-Host "Checkmark Backend ya estaba detenido" -ForegroundColor Green
}

try {
    $frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue  
    if ($frontend) {
        $frontendPID = $frontend.OwningProcess
        Stop-Process -Id $frontendPID -Force -ErrorAction SilentlyContinue
        Write-Host "Checkmark Frontend (puerto 5173) detenido" -ForegroundColor Green
    } else {
        Write-Host "Checkmark Frontend ya estaba detenido" -ForegroundColor Green
    }
} catch {
    Write-Host "Checkmark Frontend ya estaba detenido" -ForegroundColor Green
}

# Limpiar archivo .env (mantener configuracion de proxy)
Write-Host "Manteniendo configuracion de proxy..." -ForegroundColor Blue
Write-Host "Checkmark Configuracion mantenida (usa proxy de Vite)" -ForegroundColor Green

Write-Host ""
Write-Host "Stop Todos los servicios han sido detenidos" -ForegroundColor Red
Write-Host ""

Read-Host "Presiona Enter para continuar"