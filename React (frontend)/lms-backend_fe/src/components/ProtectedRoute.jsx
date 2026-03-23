import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/fieldUtils";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { authReady, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <Loader text="Preparing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const currentRole = normalizeRole(user?.role || user?.userRole);
    const validRoles = allowedRoles.map(normalizeRole);
    if (!validRoles.includes(currentRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
