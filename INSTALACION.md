# Instrucciones de Instalación Rápida

## Paso a Paso

### 1. Prerrequisitos
Asegúrate de tener instalado:
- Node.js 18+
- npm
- Git

### 2. Clonar y configurar
```bash
# Si clonaste desde repositorio
git clone [tu-repo-url]
cd sistema-asistencia-qr

# O si ya tienes los archivos
cd "I:\Dispositivos moviles"
```

### 3. Configurar Backend
```bash
cd back
npm install
cp .env.example .env
```

**Editar `.env` con tus credenciales de Neon:**
1. Ve a [neon.tech](https://neon.tech)
2. Crea proyecto gratuito
3. Copia la cadena de conexión
4. Reemplaza en `DATABASE_URL`

```bash
npx prisma generate
npx prisma db push
```

### 4. Configurar Frontend
```bash
cd ../front
npm install
```

### 5. Ejecutar
**Terminal 1:**
```bash
cd back
npm run dev
```

**Terminal 2:**
```bash
cd front  
npm run dev
```

### 6. Acceder
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Crear Usuarios de Prueba

Puedes usar Prisma Studio para crear usuarios:
```bash
cd back
npx prisma studio
```

O crear directamente en la base de datos:

**Maestro:**
- Email: maestro@test.com
- Password: 123456
- Role: TEACHER

**Estudiante:**
- Email: estudiante@test.com  
- Password: 123456
- Role: STUDENT
- Matricula: 2024001

## Problemas Comunes

### Error de dependencias
```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error de Prisma
```bash
npx prisma generate
npx prisma db push --force-reset
```

### Error de permisos
```bash
# Windows (ejecutar como administrador)
Set-ExecutionPolicy RemoteSigned
```

## ¡Listo! 🎉

Tu sistema de asistencia QR está funcionando.