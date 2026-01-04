// src/router/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuth, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to='/login' replace />;
  }

  if (user?.debeCambiarPassword && location.pathname !== '/app/cambiar-password') {
    return <Navigate to='/app/cambiar-password' replace />;
  }

  return children;
}
