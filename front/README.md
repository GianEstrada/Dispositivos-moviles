# Sistema de Asistencia QR - Frontend

Interfaz de usuario para el sistema de gestión de asistencias con códigos QR, desarrollada con React, TypeScript y Tailwind CSS.

## Características

- ✅ Autenticación JWT
- ✅ Dashboard para maestros
- ✅ Escáner QR para estudiantes
- ✅ Responsive design
- ✅ Manejo de estado con React Query
- ✅ Formularios con validación
- ✅ Toast notifications
- ✅ Routing protegido por roles

## Estructura de Componentes

### Páginas
- `LoginPage` - Página de inicio de sesión
- `TeacherDashboard` - Dashboard del maestro
- `StudentDashboard` - Dashboard del estudiante

### Componentes
- `ProtectedRoute` - Rutas protegidas por autenticación
- `TeacherLayout` - Layout para páginas de maestro
- QR Scanner integrado para estudiantes

### Servicios
- `authAPI` - Servicios de autenticación
- `teacherAPI` - Servicios para funcionalidades de maestro
- `studentAPI` - Servicios para funcionalidades de estudiante

## Instalación

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Ejecutar linter

## Configuración

Crear archivo `.env` (opcional):
```env
VITE_API_BASE_URL=http://localhost:3001
```