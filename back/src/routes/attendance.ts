import { Router } from 'express';

const router = Router();

// Rutas públicas para asistencias
router.get('/:id', (req, res) => {
  res.json({ message: 'Attendance info endpoint' });
});

export default router;