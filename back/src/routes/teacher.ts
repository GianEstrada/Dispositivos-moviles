import { Router } from 'express';
import { teacherController } from '../controllers/teacherController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware.requireAuth);
router.use(authMiddleware.requireTeacher);

// Gestión de clases
router.post('/classes', teacherController.createClass);
router.get('/classes', teacherController.getClasses);
router.get('/classes/:id', teacherController.getClass);
router.put('/classes/:id', teacherController.updateClass);
router.delete('/classes/:id', teacherController.deleteClass);

// Gestión de QR
router.post('/classes/:id/generate-qr', teacherController.generateQR);
router.put('/classes/:id/qr-duration', teacherController.updateQRDuration);

// Gestión de estudiantes
router.post('/classes/:id/upload-students', upload.single('pdf'), teacherController.uploadStudentList);
router.post('/classes/:id/students', teacherController.addStudentManually);
router.delete('/classes/:classId/students/:studentId', teacherController.removeStudent);

// Gestión de asistencias
router.get('/classes/:id/attendances', teacherController.getAttendances);
router.put('/attendances/:id', teacherController.updateAttendance);
router.get('/classes/:id/export-attendances', teacherController.exportAttendances);

export default router;