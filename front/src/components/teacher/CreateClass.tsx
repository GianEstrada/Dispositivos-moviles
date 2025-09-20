import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Book, Users } from 'lucide-react';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateClassFormData {
  name: string;
  startTime: string;
  endTime: string;
  location: string;
  subjectId: string;
  qrDurationMinutes: number;
}

const CreateClass: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateClassFormData>();

  const createClassMutation = useMutation(
    teacherAPI.createClass,
    {
      onSuccess: () => {
        toast.success('Clase creada exitosamente');
        queryClient.invalidateQueries('teacher-classes');
        navigate('/teacher/classes');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Error al crear la clase');
      }
    }
  );

  const onSubmit = (data: CreateClassFormData) => {
    const classData = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };
    
    console.log('Enviando datos de clase:', classData);
    createClassMutation.mutate(classData);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Clase</h1>
        <p className="text-gray-600">Crea una nueva clase para gestionar asistencias</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nombre de la clase */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la clase *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Book className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('name', {
                  required: 'El nombre de la clase es requerido',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres'
                  }
                })}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Matemáticas Avanzadas"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Fechas y horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora de inicio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('startTime', {
                    required: 'La fecha de inicio es requerida'
                  })}
                  type="datetime-local"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora de fin *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('endTime', {
                    required: 'La fecha de fin es requerida'
                  })}
                  type="datetime-local"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('location')}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Aula 201, Edificio A"
              />
            </div>
          </div>

          {/* Materia */}
          <div>
            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
              Materia *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Book className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('subjectId', {
                  required: 'La materia es requerida'
                })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona una materia</option>
                <option value="fe526513-9cc0-4b30-92b4-6314c59fb34f">Programación Web</option>
                <option value="84b98834-f6e3-414e-929f-d69a59c5fad7">Base de Datos</option>
                <option value="466ce6c6-36a5-4913-9727-8a14eed8df96">Desarrollo Móvil</option>
                <option value="9de94dc6-da25-4320-a152-3537a9f24119">Redes de Computadoras</option>
              </select>
            </div>
            {errors.subjectId && (
              <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
            )}
          </div>

          {/* Duración del QR */}
          <div>
            <label htmlFor="qrDurationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
              Duración del código QR (minutos)
            </label>
            <select
              {...register('qrDurationMinutes', {
                valueAsNumber: true
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/teacher/classes')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createClassMutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createClassMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Crear Clase</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;