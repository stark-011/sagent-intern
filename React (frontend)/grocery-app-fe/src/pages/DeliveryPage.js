import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, getOrderStatus } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { getAllDeliveries, updateDelivery } from '../services/deliveryService';
import { createNotification } from '../services/notificationService';
import { getAllOrders, updateOrder } from '../services/orderService';

function DeliveryPage() {
  const { currentUser } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDeliveryData = async () => {
    setLoading(true);
    setError('');

    try {
      const [deliveriesResponse, ordersResponse] = await Promise.all([
        getAllDeliveries(),
        getAllOrders(),
      ]);

      setDeliveries(Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : []);
      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load delivery dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const assignedDeliveries = useMemo(() => {
    const userName = String(currentUser?.name || '').trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const personName = String(delivery.personName || '').trim().toLowerCase();

      if (personName && userName) {
        return personName === userName;
      }

      return Number(getId(delivery.userId ?? delivery.user)) === Number(currentUser?.id);
    });
  }, [deliveries, currentUser?.id, currentUser?.name]);

  const orderMap = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      map.set(Number(order.id), order);
    });

    return map;
  }, [orders]);

  const handleStatusUpdate = async (delivery, nextStatus) => {
    const orderId = Number(getId(delivery.orderId ?? delivery.order));
    const order = orderMap.get(orderId);

    if (!order) {
      setError('Order for this delivery was not found.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await Promise.all([
        updateDelivery(delivery.id, {
          ...delivery,
          status: nextStatus,
        }),
        updateOrder(order.id, {
          ...order,
          status: nextStatus,
        }),
      ]);

      await createNotification({
        userId: getId(order.userId ?? order.user),
        orderId: order.id,
        message: nextStatus,
      });

      setSuccess(`Order #${order.id} updated to ${nextStatus}.`);
      await loadDeliveryData();
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update delivery status.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Delivery Dashboard</h2>
      <ErrorState message={error} />
      {success && <p className="status success">{success}</p>}

      {loading ? (
        <LoadingState message="Loading assigned orders..." />
      ) : assignedDeliveries.length === 0 ? (
        <EmptyState message="No assigned deliveries." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order ID</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedDeliveries.map((delivery) => {
                const orderId = Number(getId(delivery.orderId ?? delivery.order));
                const order = orderMap.get(orderId);

                return (
                  <tr key={delivery.id}>
                    <td>{delivery.id}</td>
                    <td>{orderId}</td>
                    <td>{order ? getOrderStatus(order) : delivery.status || '-'}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={submitting}
                        onClick={() => handleStatusUpdate(delivery, 'Out for Delivery')}
                      >
                        Out for Delivery
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleStatusUpdate(delivery, 'Delivered')}
                      >
                        Delivered
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DeliveryPage;
