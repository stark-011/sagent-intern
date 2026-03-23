import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, normalizeRole, ROLES } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { getAllDeliveries } from '../services/deliveryService';
import { getAllNotifications } from '../services/notificationService';
import { getAllOrders } from '../services/orderService';

function DashboardPage() {
  const { currentUser } = useAuth();
  const role = normalizeRole(currentUser?.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    orders: 0,
    deliveries: 0,
    notifications: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const [ordersResponse, deliveriesResponse, notificationsResponse] = await Promise.all([
          getAllOrders(),
          getAllDeliveries(),
          getAllNotifications(),
        ]);

        const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        const deliveries = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : [];
        const notifications = Array.isArray(notificationsResponse.data)
          ? notificationsResponse.data
          : [];

        setStats({
          orders: orders.length,
          deliveries: deliveries.length,
          notifications: notifications.length,
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Failed to load dashboard stats.'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const customerLinks = [
    { to: '/products', label: 'Browse Products' },
    { to: '/cart', label: 'Cart / Checkout / Payment' },
    { to: '/orders', label: 'Track Orders' },
  ];

  const storeLinks = [{ to: '/store', label: 'Store Dashboard' }];
  const deliveryLinks = [{ to: '/delivery', label: 'Delivery Dashboard' }];

  const linksByRole =
    role === ROLES.STORE_ADMIN
      ? storeLinks
      : role === ROLES.DELIVERY_PERSON
        ? deliveryLinks
        : customerLinks;

  return (
    <section className="card">
      <h2>Dashboard</h2>
      <p>Welcome back, {currentUser?.name || 'User'}.</p>

      <ErrorState message={error} />
      {loading ? (
        <LoadingState message="Loading dashboard..." />
      ) : (
        <div className="summary-grid">
          <article className="summary-item">
            <h3>Total Orders</h3>
            <p>{stats.orders}</p>
          </article>
          <article className="summary-item">
            <h3>Total Deliveries</h3>
            <p>{stats.deliveries}</p>
          </article>
          <article className="summary-item">
            <h3>Total Notifications</h3>
            <p>{stats.notifications}</p>
          </article>
        </div>
      )}

      <h3>Quick Actions</h3>
      <div className="quick-links">
        {linksByRole.map((item) => (
          <Link key={item.to} to={item.to} className="button-link">
            {item.label}
          </Link>
        ))}
        <Link to="/notifications" className="button-link button-secondary">
          Notifications
        </Link>
      </div>
    </section>
  );
}

export default DashboardPage;
