import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './components/appUtils';
import DashboardPage from './pages/DashboardPage';
import DeliveryPage from './pages/DeliveryPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import RegisterPage from './pages/RegisterPage';
import StorePage from './pages/StorePage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Navigate to="/cart" replace />} />
          <Route path="/payment" element={<Navigate to="/cart" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.STORE_ADMIN]} />}>
          <Route path="/store" element={<StorePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY_PERSON]} />}>
          <Route path="/delivery" element={<DeliveryPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
