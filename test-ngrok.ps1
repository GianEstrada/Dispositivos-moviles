# Script simple para probar ngrok
Write-Host "Probando configuracion de ngrok..." -ForegroundColor Yellow

# Verificar authtoken
try {
    $configPath = "$env:USERPROFILE\.ngrok2\ngrok.yml"
    if (Test-Path $configPath) {
        Write-Host "Archivo de configuracion encontrado" -ForegroundColor Green
        
        # Probar conexion simple
        Write-Host "Iniciando tunel de prueba..." -ForegroundColor Blue
        Start-Process cmd -ArgumentList "/c", "ngrok http 3001"
        
    } else {
        Write-Host "No se encontro configuracion de ngrok" -ForegroundColor Red
        Write-Host "Ejecuta: ngrok config add-authtoken TU_AUTHTOKEN" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error al verificar ngrok: $_" -ForegroundColor Red
}

Read-Host "Presiona Enter para continuar"