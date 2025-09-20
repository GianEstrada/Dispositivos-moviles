# 🌐 Guía de Configuración de Ngrok para QR Attendance System
## (Solo Frontend - Backend Local)

## ¿Qué es Ngrok?
Ngrok crea túneles seguros desde tu aplicación local hacia internet, permitiendo acceder a tu app desde cualquier dispositivo con una URL pública.

## 🏗️ Arquitectura Recomendada
- **Backend**: Permanece local (`http://localhost:3001`) - Más seguro y rápido
- **Frontend**: Expuesto públicamente via ngrok - Accesible desde móviles

## 🚀 Configuración Inicial (Solo una vez)

### 1. Crear cuenta gratuita en Ngrok
- Ve a: https://dashboard.ngrok.com/signup
- Regístrate con tu email
- Verifica tu cuenta por email

### 2. Obtener Authtoken
- Inicia sesión en: https://dashboard.ngrok.com
- Ve a: "Your Authtoken" en el dashboard
- Copia tu authtoken personal

### 3. Configurar Ngrok en tu máquina
```powershell
# Ejecuta este comando con TU authtoken
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

## 📱 Uso Diario

### 1. Iniciar servidores locales
```powershell
# Terminal 1 - Backend (mantener local)
cd back
npm run dev

# Terminal 2 - Frontend (exponer con ngrok)
cd front
npm run dev
```

### 2. Exponer Frontend con Ngrok
```powershell
# Ejecuta desde la carpeta del proyecto
.\start-ngrok.ps1
```

### 3. Verificar estado
```powershell
.\check-status.ps1
```

## ⚙️ Configuración

El frontend ya está configurado para:

1. **Usar backend local**:
```env
# front/.env
VITE_API_BASE_URL=http://localhost:3001
```

2. **Permitir conexiones desde ngrok**:
```typescript
// front/vite.config.ts
server: {
  port: 5173,
  host: true, // Permitir conexiones externas
  allowedHosts: [
    'localhost',
    '.ngrok.io', 
    '.ngrok-free.app'
  ]
}
```

## 📋 URLs de Acceso

- **Desarrollo local**: `http://localhost:5173`
- **Acceso móvil**: `https://tu-url.ngrok-free.app` (cambia cada vez)
- **Interface de ngrok**: `http://127.0.0.1:4040` (para ver la URL actual)

## 🔒 Ventajas de esta Configuración

✅ **Seguridad**: Backend no expuesto a internet  
✅ **Simplicidad**: Solo un túnel ngrok  
✅ **Performance**: Backend local más rápido  
✅ **Desarrollo**: Debug fácil del backend  
✅ **Móvil**: Frontend accesible desde cualquier dispositivo  

## ⚠️ Troubleshooting

### Frontend no carga desde móvil
- Verifica que ambos servidores estén corriendo
- Revisa la URL actual en http://127.0.0.1:4040

### Error "This host is not allowed"
- Ya está configurado en `vite.config.ts` para permitir ngrok
- Si persiste, reinicia el frontend: `npm run dev`

### Error de CORS
- El backend ya está configurado para localhost
- No necesitas cambiar configuraciones

### Ngrok dice "authentication failed"
- Verifica tu authtoken: `ngrok config check`

## 🎯 Flujo de Trabajo Completo

1. ✅ **Configurar ngrok** (solo una vez)
2. ✅ **Iniciar backend**: `cd back && npm run dev`
3. ✅ **Iniciar frontend**: `cd front && npm run dev`  
4. ✅ **Exponer frontend**: `.\start-ngrok.ps1`
5. ✅ **Obtener URL pública**: Revisar http://127.0.0.1:4040
6. ✅ **Probar en móvil**: Acceder a la URL de ngrok

---

**¡Listo! Ahora puedes probar tu sistema QR desde cualquier dispositivo móvil de forma segura.**