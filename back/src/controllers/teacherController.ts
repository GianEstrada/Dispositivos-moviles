import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import fs from 'fs';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
  teacherId?: string;
}

export const teacherController = {
  createClass: async (req: AuthRequest, res: Response) => {
    try {
      const { name, startTime, endTime, location, subjectId, qrDurationMinutes } = req.body;
      const teacherId = req.teacherId!;

      console.log('Creating class with data:', {
        name,
        startTime,
        endTime,
        location,
        subjectId,
        qrDurationMinutes,
        teacherId
      });

      // Validar datos requeridos
      if (!name || !startTime || !endTime || !subjectId) {
        return res.status(400).json({ 
          error: 'Campos requeridos: name, startTime, endTime, subjectId' 
        });
      }

      // Verificar que la materia existe
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      });

      if (!subject) {
        return res.status(400).json({ 
          error: 'La materia especificada no existe' 
        });
      }

      // Verificar que el profesor existe
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId }
      });

      if (!teacher) {
        return res.status(400).json({ 
          error: 'Profesor no encontrado' 
        });
      }

      const newClass = await prisma.class.create({
        data: {
          name,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location,
          qrDurationMinutes: qrDurationMinutes || 30,
          teacherId,
          subjectId
        },
        include: {
          subject: true,
          teacher: {
            include: { user: true }
          }
        }
      });

      console.log('Class created successfully:', newClass.id);
      res.status(201).json({ class: newClass });
    } catch (error: any) {
      console.error('Create class error:', error);
      
      // Manejo específico de errores de Prisma
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Ya existe una clase con estos datos' 
        });
      }
      
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          error: 'Error de referencia: profesor o materia no válidos' 
        });
      }

      res.status(500).json({ 
        error: 'Error interno del servidor al crear la clase',
        details: error.message
      });
    }
  },

  getClasses: async (req: AuthRequest, res: Response) => {
    try {
      const teacherId = req.teacherId!;

      const classes = await prisma.class.findMany({
        where: { teacherId },
        include: {
          subject: true,
          enrollments: {
            include: {
              student: {
                include: { user: true }
              }
            }
          },
          attendances: true
        },
        orderBy: { startTime: 'desc' }
      });

      res.json({ classes });
    } catch (error) {
      console.error('Get classes error:', error);
      res.status(500).json({ error: 'Error al obtener las clases' });
    }
  },

  getClass: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const teacherId = req.teacherId!;

      const classData = await prisma.class.findFirst({
        where: { 
          id,
          teacherId 
        },
        include: {
          subject: true,
          teacher: {
            include: { user: true }
          },
          enrollments: {
            include: {
              student: {
                include: { user: true }
              }
            }
          },
          attendances: {
            include: {
              student: {
                include: { user: true }
              }
            }
          }
        }
      });

      if (!classData) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      res.json({ class: classData });
    } catch (error) {
      console.error('Get class error:', error);
      res.status(500).json({ error: 'Error al obtener la clase' });
    }
  },

  generateQR: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const classData = await prisma.class.findUnique({
        where: { id },
        include: { teacher: true }
      });

      if (!classData || classData.teacherId !== req.teacherId) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      const qrCode = uuidv4();
      const now = new Date();
      const qrActiveUntil = new Date(now.getTime() + classData.qrDurationMinutes * 60 * 1000);

      // Generar QR Code
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
        classId: id,
        qrCode,
        timestamp: now.toISOString()
      }));

      // Actualizar clase con nuevo QR
      await prisma.class.update({
        where: { id },
        data: {
          qrCode,
          qrActiveUntil
        }
      });

      res.json({
        qrCode: qrDataUrl,
        qrActiveUntil,
        durationMinutes: classData.qrDurationMinutes
      });
    } catch (error) {
      console.error('Generate QR error:', error);
      res.status(500).json({ error: 'Error al generar código QR' });
    }
  },

  uploadStudentList: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Archivo PDF requerido' });
      }

      // Verificar que la clase pertenece al maestro
      const classData = await prisma.class.findUnique({
        where: { id },
        include: { teacher: true }
      });

      if (!classData || classData.teacherId !== req.teacherId) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      // Leer y parsear PDF
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      
      // Aquí deberías implementar la lógica para extraer datos del PDF
      // Por simplicidad, asumo que el PDF tiene un formato específico
      const lines = pdfData.text.split('\n');
      const students = [];

      for (const line of lines) {
        // Regex para extraer matrícula, nombre y apellido
        // Esto debe ajustarse según el formato real del PDF
        const match = line.match(/(\w+)\s+([A-Za-z\s]+)\s+([A-Za-z\s]+)/);
        if (match) {
          const [, matricula, firstName, lastName] = match;
          students.push({
            matricula: matricula.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim()
          });
        }
      }

      // Crear estudiantes y enrollments
      const createdStudents = [];
      for (const studentData of students) {
        try {
          // Crear usuario y estudiante
          const user = await prisma.user.create({
            data: {
              email: `${studentData.matricula}@student.edu`,
              password: '$2a$10$defaulthash', // Password temporal
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              role: 'STUDENT'
            }
          });

          const student = await prisma.student.create({
            data: {
              matricula: studentData.matricula,
              user: { connect: { id: user.id } }
            }
          });

          // Crear enrollment
          await prisma.enrollment.create({
            data: {
              studentId: student.id,
              classId: id
            }
          });

          createdStudents.push(student);
        } catch (error) {
          console.error(`Error creating student ${studentData.matricula}:`, error);
        }
      }

      // Limpiar archivo temporal
      fs.unlinkSync(file.path);

      res.json({
        message: `Se importaron ${createdStudents.length} estudiantes`,
        students: createdStudents
      });
    } catch (error) {
      console.error('Upload student list error:', error);
      res.status(500).json({ error: 'Error al procesar la lista de estudiantes' });
    }
  },

  exportAttendances: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const classData = await prisma.class.findUnique({
        where: { id },
        include: {
          subject: true,
          attendances: {
            include: {
              student: {
                include: { user: true }
              }
            }
          },
          enrollments: {
            include: {
              student: {
                include: { user: true }
              }
            }
          }
        }
      });

      if (!classData || classData.teacherId !== req.teacherId) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }

      // Preparar datos para Excel
      const excelData = classData.enrollments.map(enrollment => {
        const attendance = classData.attendances.find(a => a.studentId === enrollment.studentId);
        return {
          'Matrícula': enrollment.student.matricula,
          'Nombre': enrollment.student.user?.firstName || '',
          'Apellido': enrollment.student.user?.lastName || '',
          'Estado': attendance?.status || 'ABSENT',
          'Hora de Registro': attendance?.timestamp ? attendance.timestamp.toISOString() : '',
          'Ubicación': attendance?.location || ''
        };
      });

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');

      // Generar buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="asistencias-${classData.name}.xlsx"`);
      res.send(buffer);
    } catch (error) {
      console.error('Export attendances error:', error);
      res.status(500).json({ error: 'Error al exportar asistencias' });
    }
  },

  updateClass: async (req: AuthRequest, res: Response) => {
    // Implementación para actualizar clase
    res.json({ message: 'Update class endpoint' });
  },

  deleteClass: async (req: AuthRequest, res: Response) => {
    // Implementación para eliminar clase
    res.json({ message: 'Delete class endpoint' });
  },

  updateQRDuration: async (req: AuthRequest, res: Response) => {
    // Implementación para actualizar duración del QR
    res.json({ message: 'Update QR duration endpoint' });
  },

  addStudentManually: async (req: AuthRequest, res: Response) => {
    // Implementación para agregar estudiante manualmente
    res.json({ message: 'Add student manually endpoint' });
  },

  removeStudent: async (req: AuthRequest, res: Response) => {
    // Implementación para remover estudiante
    res.json({ message: 'Remove student endpoint' });
  },

  getAttendances: async (req: AuthRequest, res: Response) => {
    // Implementación para obtener asistencias
    res.json({ message: 'Get attendances endpoint' });
  },

  updateAttendance: async (req: AuthRequest, res: Response) => {
    // Implementación para actualizar asistencia
    res.json({ message: 'Update attendance endpoint' });
  }
};