import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import AppLayout from "./components/layout/AppLayout";
import AppLoader from "./components/common/AppLoader";
import { roleHomePath, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import PatientRegisterPage from "./pages/auth/PatientRegisterPage";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage";
import PatientHealthLogsPage from "./pages/patient/PatientHealthLogsPage";
import PatientPastRecordsPage from "./pages/patient/PatientPastRecordsPage";
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

const patientNavItems = [
  {
    label: "Dashboard",
    path: "/patient/dashboard",
    icon: <DashboardRoundedIcon fontSize="small" />
  },
  {
    label: "Health Logs",
    path: "/patient/health-logs",
    icon: <MonitorHeartRoundedIcon fontSize="small" />
  },
  {
    label: "Past Records",
    path: "/patient/past-records",
    icon: <DescriptionRoundedIcon fontSize="small" />
  },
  {
    label: "Appointments",
    path: "/patient/appointments",
    icon: <EventNoteRoundedIcon fontSize="small" />
  }
];

const doctorNavItems = [
  {
    label: "Doctor Dashboard",
    path: "/doctor/dashboard",
    icon: <LocalHospitalRoundedIcon fontSize="small" />
  }
];

const HomeRedirect = () => {
  const { isAuthenticated, authLoading, user } = useAuth();

  if (authLoading) {
    return <AppLoader text="Loading..." minHeight={360} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(user?.role)} replace />;
};

const AuthenticatedLayout = () => {
  const { user } = useAuth();
  const navItems = user?.role === "DOCTOR" ? doctorNavItems : patientNavItems;

  return (
    <AppLayout navItems={navItems}>
      <Outlet />
    </AppLayout>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/patient" element={<PatientRegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route element={<RoleRoute allowedRoles={["PATIENT"]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/health-logs" element={<PatientHealthLogsPage />} />
            <Route path="/patient/past-records" element={<PatientPastRecordsPage />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
