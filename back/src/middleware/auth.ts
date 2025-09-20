import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

export const authMiddleware = {
  requireAuth: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      req.studentId = decoded.studentId;
      req.teacherId = decoded.teacherId;
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  },

  requireTeacher: (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== 'TEACHER') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de maestro.' });
    }
    next();
  },

  requireStudent: async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== 'STUDENT') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de estudiante.' });
    }

    // Verificar si el estudiante puede acceder (2 minutos antes de clase)
    const studentId = req.studentId;
    const now = new Date();
    
    try {
      const activeClasses = await prisma.class.findMany({
        where: {
          enrollments: {
            some: { studentId }
          },
          startTime: {
            lte: new Date(now.getTime() + 2 * 60 * 1000) // 2 minutos antes
          },
          endTime: {
            gte: now // Clase no ha terminado
          },
          isActive: true
        }
      });

      if (activeClasses.length === 0) {
        return res.status(403).json({ 
          error: 'No puedes acceder en este momento. Solo puedes iniciar sesión 2 minutos antes de una clase activa.' 
        });
      }

      next();
    } catch (error) {
      console.error('Error checking student access:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};