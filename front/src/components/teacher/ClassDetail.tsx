import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  QrCode, 
  Users, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  Clock,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Class, Attendance, Student } from '../../types';

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [qrCode, setQrCode] = useState<string>('');
  const [qrActiveUntil, setQrActiveUntil] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'students' | 'attendance' | 'reports'>('details');

  // Queries
  const { data: classData, isLoading: classLoading } = useQuery(
    ['class', id],
    () => teacherAPI.getClass(id!),
    { enabled: !!id }
  );

  const { data: attendancesData, isLoading: attendancesLoading } = useQuery(
    ['attendances', id],
    () => teacherAPI.getAttendances(id!),
    { enabled: !!id && activeTab === 'attendance' }
  );

  // Mutations
  const generateQRMutation = useMutation(
    () => teacherAPI.generateQR(id!),
    {
      onSuccess: (data) => {
        setQrCode(data.qrCode);
        setQrActiveUntil(data.qrActiveUntil);
        setShowQR(true);
        toast.success('Código QR generado exitosamente');
      },
      onError: () => {
        toast.error('Error al generar código QR');
      }
    }
  );

  const updateAttendanceMutation = useMutation(
    ({ attendanceId, data }: { attendanceId: string; data: any }) =>
      teacherAPI.updateAttendance(attendanceId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['attendances', id]);
        toast.success('Asistencia actualizada');
      },
      onError: () => {
        toast.error('Error al actualizar asistencia');
      }
    }
  );

  if (classLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Clase no encontrada</p>
      </div>
    );
  }

  const { class: classInfo } = classData;

  const handleGenerateQR = () => {
    generateQRMutation.mutate();
  };

  const handleUpdateAttendance = (attendanceId: string, status: string) => {
    updateAttendanceMutation.mutate({
      attendanceId,
      data: { status }
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isQRActive = () => {
    if (!qrActiveUntil) return false;
    return new Date(qrActiveUntil) > new Date();
  };

  const getAttendanceStats = () => {
    if (!attendancesData?.attendances) return { present: 0, absent: 0, late: 0, total: 0 };
    
    const attendances = attendancesData.attendances;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;
    
    return { present, absent, late, total: attendances.length };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {classInfo.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {classInfo.subject?.name}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(classInfo.startTime)}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(classInfo.endTime).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {classInfo.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {classInfo.location}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 lg:mt-0">
            <button
              onClick={handleGenerateQR}
              disabled={generateQRMutation.isLoading}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {generateQRMutation.isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Generar QR
            </button>
            
            <button
              onClick={() => navigate(`/teacher/classes/${id}/edit`)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Código QR de Asistencia</h3>
              
              {qrCode && (
                <div className="mb-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="mx-auto border rounded-lg"
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-600 mb-4">
                <p className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  {isQRActive() ? (
                    <span className="text-green-600">
                      Activo hasta: {new Date(qrActiveUntil).toLocaleTimeString('es-ES')}
                    </span>
                  ) : (
                    <span className="text-red-600">QR Expirado</span>
                  )}
                </p>
                <p className="text-xs">
                  Los estudiantes pueden escanear este código para registrar su asistencia
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleGenerateQR}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Regenerar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'details', label: 'Detalles', icon: FileText },
            { key: 'students', label: 'Estudiantes', icon: Users },
            { key: 'attendance', label: 'Asistencias', icon: CheckCircle },
            { key: 'reports', label: 'Reportes', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === 'details' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información de la Clase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Clase
                </label>
                <p className="text-gray-900">{classInfo.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia
                </label>
                <p className="text-gray-900">{classInfo.subject?.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio
                </label>
                <p className="text-gray-900">{formatDate(classInfo.startTime)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin
                </label>
                <p className="text-gray-900">{formatDate(classInfo.endTime)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <p className="text-gray-900">{classInfo.location || 'No especificada'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración del QR (minutos)
                </label>
                <p className="text-gray-900">{classInfo.qrDurationMinutes}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Estado de la Clase</h4>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  classInfo.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {classInfo.isActive ? 'Activa' : 'Inactiva'}
                </span>
                
                {isQRActive() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    QR Activo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Estudiantes Inscritos</h3>
              <div className="flex gap-2">
                <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </button>
                <button className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  Subir Lista
                </button>
              </div>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Gestión de estudiantes en desarrollo</p>
              <p className="text-sm">Aquí podrás ver y gestionar los estudiantes inscritos en la clase</p>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registro de Asistencias</h3>
              <button 
                onClick={() => queryClient.invalidateQueries(['attendances', id])}
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Actualizar
              </button>
            </div>
            
            {attendancesData?.attendances?.length ? (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const stats = getAttendanceStats();
                    return (
                      <>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                          <div className="text-sm text-green-600">Presentes</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                          <div className="text-sm text-red-600">Ausentes</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                          <div className="text-sm text-yellow-600">Tardanzas</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                          <div className="text-sm text-blue-600">Total</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                {/* Attendance List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hora de Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendancesData.attendances.map((attendance: any) => (
                        <tr key={attendance.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {attendance.student?.user?.firstName} {attendance.student?.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.student?.matricula}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              attendance.status === 'PRESENT' 
                                ? 'bg-green-100 text-green-800'
                                : attendance.status === 'LATE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attendance.status === 'PRESENT' ? 'Presente' : 
                               attendance.status === 'LATE' ? 'Tarde' : 'Ausente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendance.scannedAt ? 
                              new Date(attendance.scannedAt).toLocaleString('es-ES') : 
                              '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateAttendance(attendance.id, 'PRESENT')}
                                className="text-green-600 hover:text-green-900"
                                title="Marcar presente"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateAttendance(attendance.id, 'ABSENT')}
                                className="text-red-600 hover:text-red-900"
                                title="Marcar ausente"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No hay registros de asistencia</p>
                <p className="text-sm">Los estudiantes aparecerán aquí cuando escaneen el código QR</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reportes y Exportación</h3>
              <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <Download className="w-4 h-4 mr-1" />
                Exportar a Excel
              </button>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Reportes en desarrollo</p>
              <p className="text-sm">Aquí podrás ver estadísticas detalladas y exportar datos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;