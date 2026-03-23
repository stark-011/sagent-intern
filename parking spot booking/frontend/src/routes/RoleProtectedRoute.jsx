import { Navigate } from "react-router-dom";
import { roleLandingRoutes } from "../constants/roleRoutes";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

const RoleProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {roles.includes(user?.role) ? children : <Navigate to={roleLandingRoutes[user?.role] || "/"} replace />}
    </ProtectedRoute>
  );
};

export default RoleProtectedRoute;
