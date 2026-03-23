import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell";
import PrivateRoute from "./PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import IncomePage from "../pages/IncomePage";
import ExpensePage from "../pages/ExpensePage";
import BudgetPage from "../pages/BudgetPage";
import SavingsPage from "../pages/SavingsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<PrivateRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/budgets" element={<BudgetPage />} />
        <Route path="/savings" element={<SavingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
