import { Navigate, Outlet } from "react-router-dom";
import { roleHomePath, useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/formatters";

const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);

  const hasAccess = allowedRoles.map(normalizeRole).includes(userRole);

  if (!hasAccess) {
    return <Navigate to={roleHomePath(userRole)} replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;
