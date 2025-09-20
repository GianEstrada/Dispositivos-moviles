import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateAuth } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rutas de autenticación
router.post('/register', validateAuth.register, authController.register);
router.post('/login', validateAuth.login, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware.requireAuth, authController.getProfile);

export default router;