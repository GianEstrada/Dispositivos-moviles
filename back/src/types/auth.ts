import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  studentId?: string;
  teacherId?: string;
}

export interface JWTPayload {
  userId: string;
  role: string;
  studentId?: string;
  teacherId?: string;
}