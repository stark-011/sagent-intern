import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import AppLayout from "../components/layout/AppLayout";
import AdminAllSpotsPage from "../pages/admin/AdminAllSpotsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import ApprovalDetailsPage from "../pages/admin/ApprovalDetailsPage";
import PendingApprovalsPage from "../pages/admin/PendingApprovalsPage";
import PricingRulesPage from "../pages/admin/PricingRulesPage";
import ReportsPage from "../pages/admin/ReportsPage";
import AddSpotPage from "../pages/lender/AddSpotPage";
import EditSpotPage from "../pages/lender/EditSpotPage";
import EarningsPage from "../pages/lender/EarningsPage";
import LenderDashboardPage from "../pages/lender/LenderDashboardPage";
import LenderProfilePage from "../pages/lender/LenderProfilePage";
import LenderSpotDetailsPage from "../pages/lender/LenderSpotDetailsPage";
import LenderSpotsPage from "../pages/lender/LenderSpotsPage";
import SpotBookingsPage from "../pages/lender/SpotBookingsPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import RegisterPage from "../pages/public/RegisterPage";
import SearchPage from "../pages/public/SearchPage";
import SpotDetailsPage from "../pages/public/SpotDetailsPage";
import BookingDetailsPage from "../pages/user/BookingDetailsPage";
import ReviewsPage from "../pages/user/ReviewsPage";
import UserBookingsPage from "../pages/user/UserBookingsPage";
import UserDashboardPage from "../pages/user/UserDashboardPage";
import UserProfilePage from "../pages/user/UserProfilePage";
import VehiclesPage from "../pages/user/VehiclesPage";
import WalletPage from "../pages/user/WalletPage";
import RoleProtectedRoute from "./RoleProtectedRoute";

const AppRouter = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/spots/:id" element={<SpotDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Route>

    <Route
      path="/user"
      element={
        <RoleProtectedRoute roles={["driver"]}>
          <DashboardLayout role="driver" />
        </RoleProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<UserDashboardPage />} />
      <Route path="bookings" element={<UserBookingsPage />} />
      <Route path="bookings/:id" element={<BookingDetailsPage />} />
      <Route path="wallet" element={<WalletPage />} />
      <Route path="vehicles" element={<VehiclesPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="profile" element={<UserProfilePage />} />
    </Route>

    <Route
      path="/lender"
      element={
        <RoleProtectedRoute roles={["lender"]}>
          <DashboardLayout role="lender" />
        </RoleProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<LenderDashboardPage />} />
      <Route path="spots" element={<LenderSpotsPage />} />
      <Route path="spots/new" element={<AddSpotPage />} />
      <Route path="spots/:id" element={<LenderSpotDetailsPage />} />
      <Route path="spots/:id/edit" element={<EditSpotPage />} />
      <Route path="bookings" element={<SpotBookingsPage />} />
      <Route path="earnings" element={<EarningsPage />} />
      <Route path="profile" element={<LenderProfilePage />} />
    </Route>

    <Route
      path="/admin"
      element={
        <RoleProtectedRoute roles={["admin"]}>
          <DashboardLayout role="admin" />
        </RoleProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="approvals" element={<PendingApprovalsPage />} />
      <Route path="approvals/:id" element={<ApprovalDetailsPage />} />
      <Route path="spots" element={<AdminAllSpotsPage />} />
      <Route path="pricing" element={<PricingRulesPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="profile" element={<AdminProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;
