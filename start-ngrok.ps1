# Script para iniciar backend local + frontend con ngrok
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   QR Attendance System - Startup" -ForegroundColor Cyan  
Write-Host "   Backend Local + Frontend Ngrok" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Actualizar PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Verificar si ngrok esta instalado
try {
    $ngrokVersion = & ngrok version
    Write-Host "Ngrok encontrado: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: ngrok no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Instala ngrok desde: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Yellow

# 1. Iniciar Backend Local SOLAMENTE
Write-Host "1. Iniciando Backend LOCAL (puerto 3001)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'I:\Dispositivos moviles\back'; Write-Host 'Backend Server - QR Attendance (LOCAL)' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 5

# 2. Iniciar Frontend Local  
Write-Host "2. Iniciando Frontend (puerto 5173)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'I:\Dispositivos moviles\front'; Write-Host 'Frontend Server - QR Attendance' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 8

# 3. Verificar que los servidores esten corriendo
Write-Host "3. Verificando servidores..." -ForegroundColor Blue

$backendCheck = $false
$frontendCheck = $false

for ($i = 1; $i -le 10; $i++) {
    try {
        $backendTest = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
        $backendCheck = $true
        Write-Host "   Checkmark Backend LOCAL: FUNCIONANDO" -ForegroundColor Green
        break
    } catch {
        Write-Host "   Hourglass Backend: Esperando... ($i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

for ($i = 1; $i -le 10; $i++) {
    try {
        $frontendConnection = Get-NetTCPConnection -LocalPort 5173 -ErrorAction Stop
        $frontendCheck = $true
        Write-Host "   Checkmark Frontend: FUNCIONANDO" -ForegroundColor Green
        break
    } catch {
        Write-Host "   Hourglass Frontend: Esperando... ($i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $backendCheck) {
    Write-Host "   X Error: Backend no pudo iniciarse" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar de todas formas"
}

if (-not $frontendCheck) {
    Write-Host "   X Error: Frontend no pudo iniciarse" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar de todas formas"
}

# 4. Iniciar tunel ngrok SOLO para frontend
Write-Host ""
Write-Host "4. Iniciando tunel ngrok SOLO para Frontend..." -ForegroundColor Blue
Write-Host "   El backend permanece LOCAL para mayor seguridad" -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); Write-Host 'Frontend Ngrok Tunnel - QR Attendance' -ForegroundColor Green; Write-Host 'Accede desde moviles usando la URL HTTPS que aparece abajo' -ForegroundColor Yellow; Write-Host 'Backend permanece LOCAL en localhost:3001' -ForegroundColor White; Write-Host ''; ngrok http 5173"

Start-Sleep -Seconds 5

# 5. Obtener URL del Frontend desde ngrok API
Write-Host "5. Obteniendo URL del Frontend..." -ForegroundColor Blue

$frontendURL = $null
for ($i = 1; $i -le 15; $i++) {
    try {
        $ngrokAPI = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
        $frontendTunnel = $ngrokAPI.tunnels | Where-Object { $_.config.addr -eq "http://localhost:5173" }
        if ($frontendTunnel) {
            $frontendURL = $frontendTunnel.public_url
            Write-Host "   Checkmark Frontend URL: $frontendURL" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   Hourglass Esperando frontend ngrok... ($i/15)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "Checkmark Configuracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Estado de servicios:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:3001 (SOLO LOCAL - SEGURO)" -ForegroundColor Green
Write-Host "- Frontend Local: http://localhost:5173" -ForegroundColor White  
Write-Host "- Frontend Publico: $frontendURL" -ForegroundColor Green
Write-Host ""
Write-Host "Para acceso movil:" -ForegroundColor Magenta
Write-Host "1. URL Principal: $frontendURL" -ForegroundColor Green
Write-Host "2. Esta URL funciona desde cualquier dispositivo movil" -ForegroundColor White
Write-Host "3. El backend permanece LOCAL (mas seguro)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Interface de ngrok: http://127.0.0.1:4040" -ForegroundColor Blue

Read-Host "Presiona Enter para continuar"