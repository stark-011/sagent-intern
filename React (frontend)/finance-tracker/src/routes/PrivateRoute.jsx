import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";

const PrivateRoute = () => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  if (isAuthenticated && token) {
    return <Outlet />;
  }

  if (token === undefined) {
    return <LoadingState fullScreen label="Checking session..." />;
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export default PrivateRoute;
