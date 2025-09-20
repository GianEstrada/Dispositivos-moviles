import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  LoginRequest, 
  RegisterRequest,
  LoginResponse, 
  User, 
  Class, 
  QRScanRequest, 
  DeviceSessionRequest,
  Attendance
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para incluir token en las requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.post('/api/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    Cookies.remove('auth_token');
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response: AxiosResponse<{ user: User }> = await api.get('/api/auth/me');
    return response.data;
  },

  refreshToken: async (token: string): Promise<{ token: string }> => {
    const response: AxiosResponse<{ token: string }> = await api.post('/api/auth/refresh-token', { token });
    return response.data;
  }
};

// Teacher API
export const teacherAPI = {
  getClasses: async (): Promise<{ classes: Class[] }> => {
    const response: AxiosResponse<{ classes: Class[] }> = await api.get('/api/teacher/classes');
    return response.data;
  },

  getClass: async (classId: string): Promise<{ class: Class }> => {
    const response: AxiosResponse<{ class: Class }> = await api.get(`/api/teacher/classes/${classId}`);
    return response.data;
  },

  createClass: async (classData: Partial<Class>): Promise<{ class: Class }> => {
    const response: AxiosResponse<{ class: Class }> = await api.post('/api/teacher/classes', classData);
    return response.data;
  },

  generateQR: async (classId: string): Promise<{ qrCode: string; qrActiveUntil: string; durationMinutes: number }> => {
    const response = await api.post(`/api/teacher/classes/${classId}/generate-qr`);
    return response.data;
  },

  uploadStudentList: async (classId: string, file: File): Promise<{ message: string; students: any[] }> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post(`/api/teacher/classes/${classId}/upload-students`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAttendances: async (classId: string): Promise<{ attendances: Attendance[] }> => {
    const response: AxiosResponse<{ attendances: Attendance[] }> = await api.get(`/api/teacher/classes/${classId}/attendances`);
    return response.data;
  },

  updateAttendance: async (attendanceId: string, data: Partial<Attendance>): Promise<{ attendance: Attendance }> => {
    const response: AxiosResponse<{ attendance: Attendance }> = await api.put(`/api/teacher/attendances/${attendanceId}`, data);
    return response.data;
  },

  exportAttendances: async (classId: string): Promise<Blob> => {
    const response = await api.get(`/api/teacher/classes/${classId}/export-attendances`, {
      responseType: 'blob',
    });
    return response.data;
  }
};

// Student API
export const studentAPI = {
  getProfile: async (): Promise<{ student: any }> => {
    const response = await api.get('/api/student/profile');
    return response.data;
  },

  scanQR: async (qrData: QRScanRequest): Promise<{ message: string; attendance: any }> => {
    const response = await api.post('/api/student/scan-qr', qrData);
    return response.data;
  },

  createDeviceSession: async (deviceData: DeviceSessionRequest): Promise<{ message: string; sessionId: string }> => {
    const response = await api.post('/api/student/device-session', deviceData);
    return response.data;
  },

  endDeviceSession: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/student/device-session');
    return response.data;
  },

  getActiveClasses: async (): Promise<{ classes: Class[] }> => {
    const response: AxiosResponse<{ classes: Class[] }> = await api.get('/api/student/active-classes');
    return response.data;
  }
};

export default api;