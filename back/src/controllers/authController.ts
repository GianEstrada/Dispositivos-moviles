import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      console.log('Login attempt:', { email, hasPassword: !!password });

      // Validar datos de entrada
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          teacher: true
        }
      });

      console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'No user found');

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({ error: 'Error de configuración del servidor' });
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          studentId: user.student?.id,
          teacherId: user.teacher?.id
        },
        process.env.JWT_SECRET as string
      );

      console.log('Login successful for user:', user.email);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          student: user.student,
          teacher: user.teacher
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, phone, role, studentId, dateOfBirth } = req.body;

      // Validar que el email no exista
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Validar role
      if (!['TEACHER', 'STUDENT'].includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // Si es estudiante, validar que la matrícula no exista
      if (role === 'STUDENT' && studentId) {
        const existingStudent = await prisma.student.findUnique({
          where: { matricula: studentId }
        });

        if (existingStudent) {
          return res.status(400).json({ error: 'La matrícula ya está registrada' });
        }
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario en una transacción
      const result = await prisma.$transaction(async (tx: any) => {
        // Crear usuario
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role: role as 'TEACHER' | 'STUDENT'
          }
        });

        // Crear registro específico según el rol
        if (role === 'TEACHER') {
          const teacher = await tx.teacher.create({
            data: {}
          });
          
          // Actualizar usuario con referencia al teacher
          await tx.user.update({
            where: { id: user.id },
            data: { teacherId: teacher.id }
          });
        } else if (role === 'STUDENT') {
          const student = await tx.student.create({
            data: {
              matricula: studentId || `${Date.now()}`, // Matrícula por defecto si no se proporciona
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
            }
          });
          
          // Actualizar usuario con referencia al student
          await tx.user.update({
            where: { id: user.id },
            data: { studentId: student.id }
          });
        }

        return user;
      });

      res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        userId: result.id 
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  logout: async (req: Request, res: Response) => {
    // Para logout podemos invalidar tokens del lado del cliente
    // o mantener una blacklist de tokens en Redis/BD
    res.json({ message: 'Logout exitoso' });
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      // Generar nuevo token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          role: decoded.role,
          studentId: decoded.studentId,
          teacherId: decoded.teacherId
        },
        process.env.JWT_SECRET as string
      );

      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          student: true,
          teacher: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          student: user.student,
          teacher: user.teacher
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};