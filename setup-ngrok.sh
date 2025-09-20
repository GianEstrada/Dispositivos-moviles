#!/bin/bash
# Script de configuración rápida de ngrok

echo "🔧 Configuración rápida de Ngrok"
echo "================================"
echo ""

read -p "📝 Ingresa tu authtoken de ngrok: " authtoken

if [ -z "$authtoken" ]; then
    echo "❌ Error: Authtoken no puede estar vacío"
    exit 1
fi

echo "⚙️ Configurando authtoken..."
ngrok config add-authtoken $authtoken

if [ $? -eq 0 ]; then
    echo "✅ Authtoken configurado correctamente!"
    echo ""
    echo "🚀 Ahora puedes ejecutar:"
    echo "   ./start-ngrok.ps1"
    echo ""
else
    echo "❌ Error al configurar authtoken"
    exit 1
fi