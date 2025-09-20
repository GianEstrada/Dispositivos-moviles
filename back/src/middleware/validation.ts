import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

export const validateAuth = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email válido requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    handleValidationErrors
  ],

  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email válido requerido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('El nombre debe tener al menos 2 caracteres'),
    body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('El apellido debe tener al menos 2 caracteres'),
    body('role')
      .isIn(['TEACHER', 'STUDENT'])
      .withMessage('El rol debe ser TEACHER o STUDENT'),
    handleValidationErrors
  ]
};

export const validateClass = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('El nombre de la clase debe tener al menos 3 caracteres'),
    body('startTime')
      .isISO8601()
      .withMessage('Fecha y hora de inicio válida requerida'),
    body('endTime')
      .isISO8601()
      .withMessage('Fecha y hora de fin válida requerida'),
    body('subjectId')
      .isUUID()
      .withMessage('ID de materia válido requerido'),
    handleValidationErrors
  ]
};

export const validateStudent = {
  add: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email válido requerido'),
    body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('El nombre debe tener al menos 2 caracteres'),
    body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('El apellido debe tener al menos 2 caracteres'),
    body('matricula')
      .trim()
      .isLength({ min: 3 })
      .withMessage('La matrícula debe tener al menos 3 caracteres'),
    handleValidationErrors
  ]
};