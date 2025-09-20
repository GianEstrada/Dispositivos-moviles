# Sistema de Asistencia con QR

Sistema completo de gestión de asistencias utilizando códigos QR, desarrollado con Node.js + Express en el backend y React + Vite en el frontend, usando PostgreSQL con Neon como base de datos.

## 🚀 Características

### Para Maestros
- ✅ Crear y gestionar clases con horarios específicos
- ✅ Generar códigos QR únicos para cada clase
- ✅ Configurar tiempo de validez del QR (personalizable)
- ✅ Subir listas de estudiantes desde PDF
- ✅ Agregar estudiantes manualmente
- ✅ Modificar asistencias registradas
- ✅ Exportar reportes de asistencia en Excel
- ✅ Dashboard completo de gestión

### Para Estudiantes
- ✅ Acceso restringido (solo 2 minutos antes de clase)
- ✅ Escáner QR integrado con cámara
- ✅ Registro automático de ubicación (GPS)
- ✅ Sesión ligada al dispositivo
- ✅ Interfaz simple y intuitiva
- ✅ Visualización de información personal

### Características de Seguridad
- ✅ Autenticación JWT
- ✅ Sesiones ligadas a dispositivo específico
- ✅ Validación de ubicación GPS
- ✅ QR con tiempo de expiración
- ✅ Middlewares de autorización por rol
- ✅ Rate limiting y validación de datos

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con Express y TypeScript
- **Prisma** ORM para PostgreSQL
- **PostgreSQL** en Neon (cloud)
- **JWT** para autenticación
- **Multer** para upload de archivos
- **pdf-parse** para procesamiento de PDFs
- **qrcode** para generación de QR
- **xlsx** para exportación de Excel

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **React Router** para navegación
- **React Query** para estado del servidor
- **Tailwind CSS** para estilos
- **react-qr-reader** para escáner QR
- **react-hook-form** para formularios
- **Axios** para HTTP requests

## 📁 Estructura del Proyecto

```
📦 Sistema QR Asistencia
├── 📁 back/                     # Backend API
│   ├── 📁 src/
│   │   ├── 📁 controllers/      # Controladores de rutas
│   │   ├── 📁 middleware/       # Middlewares (auth, validation, upload)
│   │   ├── 📁 routes/          # Definición de rutas
│   │   ├── 📁 types/           # Tipos TypeScript
│   │   ├── 📁 utils/           # Utilidades
│   │   └── 📄 index.ts         # Punto de entrada
│   ├── 📁 prisma/
│   │   └── 📄 schema.prisma    # Schema de base de datos
│   ├── 📁 uploads/             # Archivos subidos
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example
├── 📁 front/                   # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/      # Componentes React
│   │   ├── 📁 contexts/        # Context providers
│   │   ├── 📁 pages/          # Páginas principales
│   │   ├── 📁 services/       # API calls
│   │   ├── 📁 types/          # Tipos TypeScript
│   │   ├── 📁 hooks/          # Custom hooks
│   │   └── 📁 utils/          # Utilidades
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.js
│   └── 📄 tsconfig.json
└── 📄 README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en [Neon](https://neon.tech) para PostgreSQL

### 1. Configurar Backend

```bash
# Navegar al directorio backend
cd back

# Instalar dependencias
npm install

# Copiar archivo de environment
cp .env.example .env

# Editar .env con tus credenciales
```

### 2. Configurar Base de Datos

1. **Crear cuenta en Neon:**
   - Ve a [neon.tech](https://neon.tech)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener cadena de conexión:**
   ```
   postgresql://username:password@hostname:5432/database_name?sslmode=require
   ```

3. **Configurar .env:**
   ```env
   NODE_ENV=development
   PORT=3001
   
   # Database - Reemplaza con tu cadena de conexión de Neon
   DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"
   
   # JWT
   JWT_SECRET=tu_clave_secreta_muy_segura_aqui
   JWT_EXPIRES_IN=7d
   
   # File upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # QR settings
   QR_DEFAULT_DURATION=30
   
   # CORS
   FRONTEND_URL=http://localhost:5173
   ```

4. **Ejecutar migraciones:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 3. Configurar Frontend

```bash
# Navegar al directorio frontend
cd front

# Instalar dependencias
npm install

# Crear archivo de environment (opcional)
echo "VITE_API_BASE_URL=http://localhost:3001" > .env
```

### 4. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd back
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd front
npm run dev
```

**Acceder a la aplicación:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: `npx prisma studio` (opcional)

## 🎯 Uso del Sistema

### Para Maestros

1. **Iniciar sesión** con credenciales de maestro
2. **Crear clase:**
   - Nombre, materia, horario
   - Configurar duración del QR
3. **Agregar estudiantes:**
   - Subir PDF con lista de estudiantes
   - O agregar manualmente
4. **Durante la clase:**
   - Generar código QR
   - Mostrar QR a estudiantes
5. **Gestionar asistencias:**
   - Revisar quién asistió
   - Modificar asistencias manualmente
   - Exportar reportes en Excel

### Para Estudiantes

1. **Iniciar sesión** 2 minutos antes de clase
2. **Escanear QR** mostrado por el maestro
3. **Confirmar asistencia** automáticamente
4. **Cerrar sesión** cuando termine

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con recarga automática
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run db:migrate   # Ejecutar migraciones
npm run db:generate  # Generar cliente Prisma
npm run db:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

## 📊 Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema (maestros y estudiantes)
- **Teacher**: Información específica de maestros
- **Student**: Información específica de estudiantes
- **Subject**: Materias/asignaturas
- **Class**: Clases con horarios y configuración QR
- **Enrollment**: Inscripciones de estudiantes a clases
- **Attendance**: Registros de asistencia
- **StudentSession**: Sesiones ligadas a dispositivos

## 🔐 Seguridad

- **JWT**: Tokens con expiración configurable
- **bcryptjs**: Hash seguro de contraseñas
- **Rate Limiting**: Prevención de spam
- **CORS**: Configurado para dominio específico
- **Helmet**: Headers de seguridad
- **Validación**: Esquemas de validación en todas las rutas
- **Sanitización**: Limpieza de datos de entrada

## 🚀 Despliegue en Producción

### Backend (Render, Railway, etc.)
1. Conectar repositorio
2. Configurar variables de entorno
3. Comando de build: `npm run build`
4. Comando de start: `npm start`

### Frontend (Vercel, Netlify)
1. Conectar repositorio
2. Directorio de build: `front`
3. Comando de build: `npm run build`
4. Directorio de salida: `dist`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🏗️ Roadmap

### Próximas características
- [ ] Notificaciones push
- [ ] Reportes avanzados con gráficos
- [ ] Integración con Google Calendar
- [ ] App móvil nativa
- [ ] Sistema de calificaciones
- [ ] API para integraciones externas

---

**Desarrollado con ❤️ para facilitar la gestión de asistencias en el aula**