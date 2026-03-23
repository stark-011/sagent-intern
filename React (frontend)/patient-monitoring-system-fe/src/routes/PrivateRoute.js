import { Navigate, Outlet, useLocation } from "react-router-dom";
import AppLoader from "../components/common/AppLoader";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <AppLoader text="Checking session..." minHeight={360} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
