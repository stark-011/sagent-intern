import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, normalizeRole, ROLES } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import {
  getAllNotifications,
  updateNotification,
} from '../services/notificationService';

function NotificationsPage() {
  const { currentUser } = useAuth();
  const role = normalizeRole(currentUser?.role);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllNotifications();
      const values = Array.isArray(response.data) ? response.data : [];
      setNotifications(values);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to fetch notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (role === ROLES.STORE_ADMIN) {
      return notifications;
    }

    return notifications.filter(
      (item) => Number(getId(item.userId ?? item.user)) === Number(currentUser?.id),
    );
  }, [notifications, currentUser?.id, role]);

  const handleMarkAsRead = async (notification) => {
    setSubmitting(true);
    setError('');

    try {
      await updateNotification(notification.id, {
        ...notification,
        read: true,
      });
      await loadNotifications();
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update notification.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Notifications</h2>
      <ErrorState message={error} />

      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState message="No notifications available." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Message</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.message || '-'}</td>
                  <td>{getId(item.orderId ?? item.order) || '-'}</td>
                  <td>{item.read ? 'Read' : 'Unread'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(item)}
                      disabled={item.read || submitting}
                    >
                      Mark as Read
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default NotificationsPage;
