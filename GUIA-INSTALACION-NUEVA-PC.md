# 📋 Guía de Instalación - QR Attendance System
## Para nueva laptop/computadora

### 🎯 **Requisitos del Sistema**
- **SO:** Windows 10/11 (64-bit)
- **RAM:** Mínimo 8GB recomendado
- **Espacio:** Al menos 5GB libres
- **Internet:** Conexión estable

---

## 📦 **Software Requerido**

### **1. Node.js (v18 o superior)**
```bash
# Descargar desde: https://nodejs.org/
# Verificar instalación:
node --version
npm --version
```

### **2. Git**
```bash
# Descargar desde: https://git-scm.com/
# Verificar instalación:
git --version
```

### **3. PostgreSQL**
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# Durante instalación:
# - Usuario: postgres
# - Contraseña: [anota tu contraseña]
# - Puerto: 5432
```

### **4. Visual Studio Code (Opcional pero recomendado)**
```bash
# Descargar desde: https://code.visualstudio.com/
```

### **5. Ngrok**
```bash
# Opción 1: Descargar desde https://ngrok.com/download
# Opción 2: Usar chocolatey (si tienes):
choco install ngrok

# Verificar instalación:
ngrok version
```

---

## 🚀 **Pasos de Instalación**

### **Paso 1: Clonar el Proyecto**
```powershell
# Crear carpeta de trabajo
mkdir "C:\Proyectos"
cd "C:\Proyectos"

# Clonar desde tu repositorio o copiar archivos
# Si tienes Git configurado:
git clone [tu-repositorio-url] qr-attendance
cd qr-attendance

# Si no, copia toda la carpeta "Dispositivos moviles"
```

### **Paso 2: Configurar Base de Datos**
```sql
-- 1. Abrir pgAdmin o psql
-- 2. Crear base de datos:
CREATE DATABASE qr_attendance;

-- 3. Crear usuario (opcional):
CREATE USER qr_user WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE qr_attendance TO qr_user;
```

### **Paso 3: Instalar Dependencias del Backend**
```powershell
cd back
npm install

# Si hay errores, usar:
npm install --force
# o
npm install --legacy-peer-deps
```

### **Paso 4: Instalar Dependencias del Frontend**
```powershell
cd ../front
npm install --legacy-peer-deps
```

### **Paso 5: Configurar Variables de Entorno**

#### **Backend (.env en carpeta /back)**
```env
# Archivo: back/.env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/qr_attendance"
JWT_SECRET="tu_secreto_super_seguro_aqui_123456789"
PORT=3001
NODE_ENV=development
```

#### **Frontend (.env en carpeta /front)**
```env
# Archivo: front/.env
VITE_API_BASE_URL=
```

### **Paso 6: Configurar Prisma**
```powershell
cd back
npx prisma generate
npx prisma db push

# Verificar que las tablas se crearon:
npx prisma studio
```

### **Paso 7: Configurar Ngrok**
```powershell
# Registrarse en https://ngrok.com/ (gratis)
# Obtener tu authtoken desde el dashboard
# Configurar ngrok:
ngrok config add-authtoken tu_authtoken_aqui
```

---

## ⚙️ **Archivos de Configuración Adicionales**

### **package.json Scripts (Backend)**
Verificar que estén estos scripts en `back/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### **package.json Scripts (Frontend)**
Verificar que estén estos scripts en `front/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 🔧 **Configuración de PowerShell**

### **Habilitar Ejecución de Scripts**
```powershell
# Ejecutar como Administrador:
Set-ExecutionPolicy RemoteSigned

# Verificar:
Get-ExecutionPolicy
```

---

## 🏃‍♂️ **Primera Ejecución**

### **Paso 1: Crear Datos de Prueba**
```powershell
cd back
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestData() {
  // Crear materias
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Programación Web', code: 'PW001', description: 'Desarrollo web' },
      { name: 'Base de Datos', code: 'BD001', description: 'Gestión de BD' }
    ]
  });

  // Crear usuario profesor
  const hashedPassword = await bcrypt.hash('123456', 10);
  const teacher = await prisma.user.create({
    data: {
      email: 'profesor@test.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Profesor',
      role: 'TEACHER',
      teacher: { create: {} }
    }
  });

  console.log('Datos de prueba creados exitosamente');
  await prisma.$disconnect();
}

createTestData().catch(console.error);
"
```

### **Paso 2: Iniciar Sistema**
```powershell
# Opción 1: Usar script automatizado
.\start-ngrok.ps1

# Opción 2: Manual
# Terminal 1 - Backend:
cd back
npm run dev

# Terminal 2 - Frontend:
cd front
npm run dev

# Terminal 3 - Ngrok:
ngrok http 5173
```

---

## 🌐 **URLs de Acceso**

### **Desarrollo Local:**
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173
- **Ngrok (Público):** https://[codigo].ngrok-free.app

### **Credenciales de Prueba:**
- **Profesor:** profesor@test.com / 123456
- **Estudiante:** estudiante@test.com / 123456

---

## 🐛 **Solución de Problemas Comunes**

### **Error: Puerto ocupado**
```powershell
# Encontrar proceso en puerto:
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar proceso:
taskkill /F /PID [numero_pid]
```

### **Error: Base de datos no conecta**
```powershell
# Verificar PostgreSQL esté corriendo:
services.msc
# Buscar "postgresql" y asegurar que esté "Running"
```

### **Error: Ngrok no funciona**
```powershell
# Verificar configuración:
ngrok config check

# Re-configurar authtoken:
ngrok config add-authtoken tu_authtoken
```

### **Error: Dependencias**
```powershell
# Limpiar cache npm:
npm cache clean --force

# Reinstalar:
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 **Verificación Final**

### **Checklist de Instalación:**
- [ ] Node.js instalado y funcionando
- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Base de datos creada y migrada
- [ ] Variables de entorno configuradas
- [ ] Ngrok configurado con authtoken
- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Login funciona con credenciales de prueba
- [ ] Ngrok permite acceso desde móvil

---

## 🎉 **¡Listo para Usar!**

Una vez completados todos los pasos, el sistema debería estar funcionando completamente en la nueva laptop.

**URLs importantes:**
- **Desarrollo:** http://localhost:5173
- **Móviles:** https://[codigo].ngrok-free.app
- **Admin DB:** http://localhost:5555 (Prisma Studio)

**Comandos útiles:**
```powershell
# Iniciar sistema completo:
.\start-ngrok.ps1

# Detener sistema:
.\stop-services.ps1

# Ver base de datos:
cd back && npx prisma studio
```