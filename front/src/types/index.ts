export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'TEACHER' | 'STUDENT';
  student?: Student;
  teacher?: Teacher;
}

export interface Student {
  id: string;
  matricula: string;
}

export interface Teacher {
  id: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Class {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  qrDurationMinutes: number;
  qrCode?: string;
  qrActiveUntil?: string;
  isActive: boolean;
  subject: Subject;
  teacher: Teacher & { user: User };
}

export interface Attendance {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  timestamp: string;
  location?: string;
  isManual: boolean;
  notes?: string;
  student: Student & { user: User };
  class: Class;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'TEACHER' | 'STUDENT';
  studentId?: string;
  dateOfBirth?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface QRScanRequest {
  qrData: string;
  location?: string;
}

export interface DeviceSessionRequest {
  deviceId: string;
}