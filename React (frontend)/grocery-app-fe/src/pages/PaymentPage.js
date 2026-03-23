import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { createNotification } from '../services/notificationService';
import { getAllOrders, updateOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';

const PAYMENT_METHODS = ['Card', 'UPI', 'Wallet', 'Cash on Delivery'];

function PaymentPage() {
  const location = useLocation();
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAllOrders();
        const allOrders = Array.isArray(response.data) ? response.data : [];

        const customerOrders = allOrders.filter(
          (order) => Number(getId(order.userId ?? order.user)) === Number(currentUser?.id),
        );

        setOrders(customerOrders);

        const stateOrderId = location.state?.orderId;
        if (stateOrderId) {
          setSelectedOrderId(String(stateOrderId));
        } else if (customerOrders[0]?.id) {
          setSelectedOrderId(String(customerOrders[0].id));
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Failed to load orders for payment.'));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUser?.id, location.state?.orderId]);

  const selectedOrder = useMemo(
    () => orders.find((order) => String(order.id) === String(selectedOrderId)) || null,
    [orders, selectedOrderId],
  );

  const handlePayNow = async () => {
    if (!selectedOrderId) {
      setError('Please select an order.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await createPayment({
        orderId: Number(selectedOrderId),
        userId: currentUser?.id,
        method,
      });

      if (selectedOrder) {
        await updateOrder(selectedOrder.id, {
          ...selectedOrder,
          status: selectedOrder.status || 'Order Confirmed',
        });

        await createNotification({
          userId: currentUser?.id,
          orderId: selectedOrder.id,
          message: `Payment successful via ${method}`,
        });
      }

      setReceipt(response.data);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Payment failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Payment</h2>
      <ErrorState message={error} />

      {loading ? (
        <LoadingState message="Loading payment details..." />
      ) : (
        <>
          <div className="form-grid">
            <label>
              Select Order
              <select
                value={selectedOrderId}
                onChange={(event) => setSelectedOrderId(event.target.value)}
              >
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Payment Method
              <select value={method} onChange={(event) => setMethod(event.target.value)}>
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handlePayNow} disabled={submitting}>
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {receipt && (
            <article className="receipt-box">
              <h3>Receipt</h3>
              <p>Payment ID: {receipt.id || '-'}</p>
              <p>Order ID: {getId(receipt.orderId ?? receipt.order) || selectedOrderId}</p>
              <p>Method: {receipt.method || method}</p>
              <p>Status: {receipt.status || 'Recorded'}</p>
            </article>
          )}
        </>
      )}
    </section>
  );
}

export default PaymentPage;
