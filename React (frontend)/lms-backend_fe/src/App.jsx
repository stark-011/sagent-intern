import { useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { normalizeRole } from "./utils/fieldUtils";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookSearch from "./pages/Member/BookSearch";
import MyRequests from "./pages/Member/MyRequests";
import MyIssuedBooks from "./pages/Member/MyIssuedBooks";
import Notifications from "./pages/Member/Notifications";
import ManageBooks from "./pages/Librarian/ManageBooks";
import ManageRequests from "./pages/Librarian/ManageRequests";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-screen-2xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RoleRedirect = () => {
  const { role } = useAuth();
  const normalized = normalizeRole(role);
  if (normalized === "LIBRARIAN") {
    return <Navigate to="/librarian/manage-books" replace />;
  }
  return <Navigate to="/member/book-search" replace />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route element={<ProtectedRoute allowedRoles={["MEMBER"]} />}>
          <Route path="/member/book-search" element={<BookSearch />} />
          <Route path="/member/my-requests" element={<MyRequests />} />
          <Route path="/member/my-issued-books" element={<MyIssuedBooks />} />
          <Route path="/member/notifications" element={<Notifications />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["LIBRARIAN"]} />}>
          <Route path="/librarian/manage-books" element={<ManageBooks />} />
          <Route path="/librarian/manage-requests" element={<ManageRequests />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
