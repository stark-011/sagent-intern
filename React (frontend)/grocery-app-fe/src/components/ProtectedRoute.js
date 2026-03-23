import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from './appUtils';
import LoadingState from './LoadingState';

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { currentUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const role = normalizeRole(currentUser?.role);

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
