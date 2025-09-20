import { Router } from 'express';

const router = Router();

// Rutas públicas para información de clases
router.get('/:id', (req, res) => {
  res.json({ message: 'Class info endpoint' });
});

export default router;