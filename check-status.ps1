# Script para verificar el estado de los servidores
Write-Host "Verificando estado de los servidores..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Backend (puerto 3001)
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend: FUNCIONANDO (puerto 3001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: NO FUNCIONA (puerto 3001)" -ForegroundColor Red
    Write-Host "   Ejecuta: cd back && npm run dev" -ForegroundColor Yellow
}

# Verificar Frontend (puerto 5173)
try {
    $frontendConnection = Get-NetTCPConnection -LocalPort 5173 -ErrorAction Stop
    Write-Host "✅ Frontend: FUNCIONANDO (puerto 5173)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: NO FUNCIONA (puerto 5173)" -ForegroundColor Red
    Write-Host "   Ejecuta: cd front && npm run dev" -ForegroundColor Yellow
}

# Verificar Ngrok
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "✅ Ngrok: ACTIVO" -ForegroundColor Green
    Write-Host "   Interface web: http://127.0.0.1:4040" -ForegroundColor Blue
} else {
    Write-Host "❌ Ngrok: NO ACTIVO" -ForegroundColor Red
    Write-Host "   Ejecuta: .\start-ngrok.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 URLs de acceso:" -ForegroundColor Magenta
Write-Host "- Local: http://localhost:5173" -ForegroundColor White
Write-Host "- Publico: Revisa la interfaz de ngrok en http://127.0.0.1:4040" -ForegroundColor White

Read-Host "Presiona Enter para continuar"