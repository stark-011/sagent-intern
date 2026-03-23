import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, getOrderStatus } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { createNotification } from '../services/notificationService';
import { getAllOrders, updateOrder } from '../services/orderService';

function OrdersPage() {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllOrders();
      const data = Array.isArray(response.data) ? response.data : [];
      const ownOrders = data.filter(
        (order) => Number(getId(order.userId ?? order.user)) === Number(currentUser?.id),
      );
      setOrders(ownOrders);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to fetch orders.'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => Number(b.id) - Number(a.id)),
    [orders],
  );

  const handleCancelOrder = async (order) => {
    const status = String(getOrderStatus(order)).toLowerCase();

    if (status === 'delivered') {
      setError('Delivered orders cannot be cancelled.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await updateOrder(order.id, {
        ...order,
        status: 'Cancelled',
      });

      await createNotification({
        userId: currentUser?.id,
        orderId: order.id,
        message: `Order #${order.id} has been cancelled.`,
      });

      await loadOrders();
    } catch (cancelError) {
      setError(getErrorMessage(cancelError, 'Failed to cancel order.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Order Tracking</h2>
      <ErrorState message={error} />

      {loading ? (
        <LoadingState message="Loading orders..." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const status = getOrderStatus(order);
                const isDelivered = String(status).toLowerCase() === 'delivered';

                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{status}</td>
                    <td>{order.deliveryAddress || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="button-danger"
                        disabled={isDelivered || submitting}
                        onClick={() => handleCancelOrder(order)}
                      >
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sortedOrders.length === 0 && (
                <tr>
                  <td colSpan={4}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
