import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Scan, User, Hash, LogOut } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<string>('');
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar permisos de cámara
    const checkCameraPermission = async () => {
      try {
        // Verificar si estamos en HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          setCameraPermission('⚠️ Se requiere HTTPS para usar la cámara. Asegúrate de usar la URL HTTPS de ngrok.');
          return;
        }

        // Verificar soporte de getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraPermission('❌ Tu navegador no soporta el acceso a la cámara.');
          return;
        }

        // Verificar permisos
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'denied') {
            setCameraPermission('🚫 Acceso a la cámara denegado. Ve a configuración del navegador y permite el acceso.');
          } else {
            setCameraPermission('✅ Cámara disponible');
          }
        } catch (permError) {
          setCameraPermission('ℹ️ Verifica los permisos de cámara en tu navegador.');
        }
      } catch (error) {
        console.error('Error verificando permisos:', error);
        setCameraPermission('⚠️ Error verificando permisos de cámara.');
      }
    };

    checkCameraPermission();

    // Obtener ubicación del estudiante
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Crear sesión de dispositivo
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
    
    studentAPI.createDeviceSession({ deviceId })
      .catch((error) => {
        console.error('Error creating device session:', error);
      });

    // Cleanup al desmontar
    return () => {
      studentAPI.endDeviceSession().catch(console.error);
    };
  }, []);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning && scannerRef.current) {
      // Verificar permisos antes de iniciar el escáner
      if (cameraPermission.includes('❌') || cameraPermission.includes('🚫') || cameraPermission.includes('⚠️')) {
        toast.error('No se puede acceder a la cámara: ' + cameraPermission);
        setScanning(false);
        return;
      }

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          supportedScanTypes: [1] // Solo QR codes
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScanSuccess(decodedText);
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          setScanning(false);
        },
        (error) => {
          // Solo mostrar errores importantes, no todos los errores de escaneo
          if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
            toast.error('Acceso a la cámara denegado. Permite el acceso en tu navegador.');
            setScanning(false);
          }
        }
      );

      return () => {
        if (scanner) {
          scanner.clear().catch(console.error);
        }
      };
    }
  }, [scanning, cameraPermission]);

  const generateDeviceId = () => {
    return 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const startScanner = async () => {
    // Verificar HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error('⚠️ Se requiere HTTPS para usar la cámara. Usa la URL HTTPS de ngrok.');
      return;
    }

    // Verificar soporte de cámara
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('❌ Tu navegador no soporta el acceso a la cámara.');
      return;
    }

    // Solicitar permisos explícitamente
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setScanning(true);
      toast.success('📷 Cámara activada. Enfoca el código QR.');
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.error('🚫 Acceso a la cámara denegado. Ve a configuración del navegador y permite el acceso.');
      } else if (error.name === 'NotFoundError') {
        toast.error('📱 No se encontró ninguna cámara en tu dispositivo.');
      } else {
        toast.error('❌ Error al acceder a la cámara: ' + error.message);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      const response = await studentAPI.scanQR({
        qrData: decodedText,
        location
      });
      
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al escanear código QR');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Hash className="w-4 h-4 mr-1" />
                  {user?.student?.matricula}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-full mb-4">
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Escáner de Asistencia
          </h2>
          <p className="text-gray-600">
            Escanea el código QR mostrado por tu maestro para registrar tu asistencia
          </p>
        </div>

        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {scanning ? (
            <div className="relative">
              <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-center">
                  <p className="text-sm">Apunta la cámara al código QR</p>
                </div>
              </div>
              <button
                onClick={() => setScanning(false)}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              {/* Estado de la cámara */}
              {cameraPermission && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  cameraPermission.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {cameraPermission}
                </div>
              )}
              
              <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <Scan className="w-12 h-12 text-gray-400" />
              </div>
              
              <button
                onClick={startScanner}
                disabled={cameraPermission.includes('❌') || cameraPermission.includes('🚫')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  cameraPermission.includes('❌') || cameraPermission.includes('🚫')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {cameraPermission.includes('❌') || cameraPermission.includes('🚫') 
                  ? 'Cámara no disponible' 
                  : 'Iniciar Escáner'
                }
              </button>
              
              {/* Ayuda para HTTPS */}
              {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>💡 Consejo:</strong> Para usar la cámara, asegúrate de usar la URL <strong>HTTPS</strong> de ngrok, no la HTTP.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            ¿Cómo funciona?
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Solo puedes acceder 2 minutos antes de clase</li>
            <li>• El código QR tiene tiempo limitado</li>
            <li>• Debes estar físicamente en el aula</li>
            <li>• Una vez registrada, no puedes cambiar tu asistencia</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;