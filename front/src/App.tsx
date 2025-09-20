import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            user ? (
              <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />
            ) : (
              <RegisterPage />
            )
          } 
        />
        
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={
            <Navigate 
              to={user ? (user.role === 'TEACHER' ? '/teacher' : '/student') : '/login'} 
              replace 
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App