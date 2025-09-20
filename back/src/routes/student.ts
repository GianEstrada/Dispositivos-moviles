import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware.requireAuth);
router.use(authMiddleware.requireStudent);

// Perfil del estudiante
router.get('/profile', studentController.getProfile);

// Escaneo de QR
router.post('/scan-qr', studentController.scanQR);

// Sesiones
router.post('/device-session', studentController.createDeviceSession);
router.delete('/device-session', studentController.endDeviceSession);
router.get('/active-classes', studentController.getActiveClasses);

export default router;