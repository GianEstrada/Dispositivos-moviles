import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
  studentId?: string;
}

export const studentController = {
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.studentId!;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      res.json({ 
        student: {
          matricula: student.matricula,
          firstName: student.user?.firstName,
          lastName: student.user?.lastName,
          email: student.user?.email
        }
      });
    } catch (error) {
      console.error('Get student profile error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  scanQR: async (req: AuthRequest, res: Response) => {
    try {
      const { qrData, location } = req.body;
      const studentId = req.studentId!;

      // Parsear datos del QR
      let parsedQRData;
      try {
        parsedQRData = JSON.parse(qrData);
      } catch {
        return res.status(400).json({ error: 'Código QR inválido' });
      }

      const { classId, qrCode } = parsedQRData;

      // Verificar que la clase existe y el QR está activo
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          enrollments: {
            where: { studentId }
          }
        }
      });

      if (!classData) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      if (classData.qrCode !== qrCode) {
        return res.status(400).json({ error: 'Código QR inválido o expirado' });
      }

      if (!classData.qrActiveUntil || new Date() > classData.qrActiveUntil) {
        return res.status(400).json({ error: 'Código QR expirado' });
      }

      // Verificar que el estudiante está inscrito en la clase
      if (classData.enrollments.length === 0) {
        return res.status(403).json({ error: 'No estás inscrito en esta clase' });
      }

      // Verificar si ya registró asistencia
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          studentId_classId: {
            studentId,
            classId
          }
        }
      });

      if (existingAttendance) {
        return res.status(400).json({ error: 'Ya registraste tu asistencia para esta clase' });
      }

      // Registrar asistencia
      const attendance = await prisma.attendance.create({
        data: {
          studentId,
          classId,
          status: 'PRESENT',
          location: location || '',
          timestamp: new Date()
        }
      });

      res.json({
        message: 'Asistencia registrada exitosamente',
        attendance: {
          status: attendance.status,
          timestamp: attendance.timestamp
        }
      });
    } catch (error) {
      console.error('Scan QR error:', error);
      res.status(500).json({ error: 'Error al registrar asistencia' });
    }
  },

  createDeviceSession: async (req: AuthRequest, res: Response) => {
    try {
      const { deviceId } = req.body;
      const studentId = req.studentId!;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Cerrar sesiones anteriores del dispositivo
      await prisma.studentSession.updateMany({
        where: {
          deviceId,
          isActive: true
        },
        data: {
          isActive: false,
          logoutTime: new Date()
        }
      });

      // Crear nueva sesión
      const session = await prisma.studentSession.create({
        data: {
          studentId,
          deviceId,
          isActive: true,
          ipAddress,
          userAgent
        }
      });

      res.json({
        message: 'Sesión de dispositivo creada',
        sessionId: session.id
      });
    } catch (error) {
      console.error('Create device session error:', error);
      res.status(500).json({ error: 'Error al crear sesión de dispositivo' });
    }
  },

  endDeviceSession: async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.studentId!;

      await prisma.studentSession.updateMany({
        where: {
          studentId,
          isActive: true
        },
        data: {
          isActive: false,
          logoutTime: new Date()
        }
      });

      res.json({ message: 'Sesión finalizada' });
    } catch (error) {
      console.error('End device session error:', error);
      res.status(500).json({ error: 'Error al finalizar sesión' });
    }
  },

  getActiveClasses: async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.studentId!;
      const now = new Date();

      const activeClasses = await prisma.class.findMany({
        where: {
          enrollments: {
            some: { studentId }
          },
          startTime: {
            lte: new Date(now.getTime() + 2 * 60 * 1000) // 2 minutos antes
          },
          endTime: {
            gte: now
          },
          isActive: true
        },
        include: {
          subject: true,
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      res.json({ classes: activeClasses });
    } catch (error) {
      console.error('Get active classes error:', error);
      res.status(500).json({ error: 'Error al obtener clases activas' });
    }
  }
};