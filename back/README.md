# Sistema de Asistencia QR - Backend

API REST para el sistema de gestión de asistencias con códigos QR.

## Estructura de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener perfil del usuario
- `POST /api/auth/refresh-token` - Renovar token

### Maestros
- `GET /api/teacher/classes` - Obtener clases del maestro
- `POST /api/teacher/classes` - Crear nueva clase
- `PUT /api/teacher/classes/:id` - Actualizar clase
- `DELETE /api/teacher/classes/:id` - Eliminar clase
- `POST /api/teacher/classes/:id/generate-qr` - Generar código QR
- `PUT /api/teacher/classes/:id/qr-duration` - Actualizar duración del QR
- `POST /api/teacher/classes/:id/upload-students` - Subir lista de estudiantes (PDF)
- `POST /api/teacher/classes/:id/students` - Agregar estudiante manualmente
- `DELETE /api/teacher/classes/:classId/students/:studentId` - Remover estudiante
- `GET /api/teacher/classes/:id/attendances` - Obtener asistencias
- `PUT /api/teacher/attendances/:id` - Actualizar asistencia
- `GET /api/teacher/classes/:id/export-attendances` - Exportar asistencias (Excel)

### Estudiantes
- `GET /api/student/profile` - Obtener perfil del estudiante
- `POST /api/student/scan-qr` - Escanear código QR
- `POST /api/student/device-session` - Crear sesión de dispositivo
- `DELETE /api/student/device-session` - Terminar sesión de dispositivo
- `GET /api/student/active-classes` - Obtener clases activas

## Variables de Entorno

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
QR_DEFAULT_DURATION=30
FRONTEND_URL=http://localhost:5173
```

## Instalación

```bash
npm install
cp .env.example .env
# Configurar .env con tus credenciales
npx prisma generate
npx prisma db push
npm run dev
```