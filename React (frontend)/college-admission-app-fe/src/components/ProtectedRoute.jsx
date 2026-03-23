import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const normalizeRole = (role) => {
  const normalized = (role || '').toString().toUpperCase().replace(/^ROLE_/, '');
  if (normalized === 'OFFICER' || normalized === 'ADMISSION_OFFICER') return 'ADMIN';
  return normalized;
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const authMode = localStorage.getItem('authMode');
  const sessionAuth = localStorage.getItem('isAuthenticated') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();
  const isAuthenticated = Boolean(token) || (authMode === 'session' && sessionAuth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && normalizeRole(user?.role) !== normalizeRole(requiredRole)) {
    const fallbackPath = normalizeRole(user?.role) === 'ADMIN' ? '/officer' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
