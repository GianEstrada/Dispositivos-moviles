import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Calendar, Clock, Users, QrCode } from 'lucide-react';
import { teacherAPI } from '../../services/api';
import { Class } from '../../types';

const ClassList: React.FC = () => {
  const { data: classesData, isLoading, error } = useQuery(
    'teacher-classes',
    teacherAPI.getClasses,
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar las clases</p>
      </div>
    );
  }

  const classes = classesData?.classes || [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
          <p className="text-gray-600">Gestiona tus clases y asistencias</p>
        </div>
        <Link
          to="/teacher/classes/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Clase</span>
        </Link>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes clases creadas
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primera clase para comenzar a gestionar asistencias
          </p>
          <Link
            to="/teacher/classes/new"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Primera Clase</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem: Class) => (
            <div
              key={classItem.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      classItem.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {classItem.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(classItem.startTime).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(classItem.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(classItem.endTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {classItem.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📍</span>
                      <span>{classItem.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>0 estudiantes</span>
                  </div>
                  <Link
                    to={`/teacher/classes/${classItem.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList;