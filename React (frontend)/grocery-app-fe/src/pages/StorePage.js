import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, getOrderStatus, getProductStock } from '../components/appUtils';
import { createDelivery, getAllDeliveries } from '../services/deliveryService';
import { createNotification } from '../services/notificationService';
import { getAllOrders, updateOrder } from '../services/orderService';
import { getAllProducts, updateProduct } from '../services/productService';
import { getUsersByRole } from '../services/userService';

function StorePage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryPeople, setDeliveryPeople] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [stockDrafts, setStockDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStoreData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersResponse, productsResponse, deliveriesResponse, users] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
        getAllDeliveries(),
        getUsersByRole('delivery_person'),
      ]);

      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      setDeliveries(Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : []);
      setDeliveryPeople(users);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load store dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const incomingOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = String(getOrderStatus(order)).toLowerCase();
        return status !== 'delivered' && status !== 'cancelled';
      }),
    [orders],
  );

  const autoPickDeliveryPerson = () => {
    if (deliveryPeople.length === 0) {
      return null;
    }

    const assignmentCount = {};

    deliveries.forEach((delivery) => {
      const key = String(delivery.personName || '').trim().toLowerCase();
      if (key) {
        assignmentCount[key] = (assignmentCount[key] || 0) + 1;
      }
    });

    let selected = deliveryPeople[0];
    let min = Number.POSITIVE_INFINITY;

    deliveryPeople.forEach((person) => {
      const key = String(person.name || person.contact || '').trim().toLowerCase();
      const count = assignmentCount[key] || 0;

      if (count < min) {
        min = count;
        selected = person;
      }
    });

    return selected;
  };

  const handleUpdateOrderStatus = async (order) => {
    const status = statusDrafts[order.id] || getOrderStatus(order);

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateOrder(order.id, {
        ...order,
        status,
      });

      await createNotification({
        userId: getId(order.userId ?? order.user),
        orderId: order.id,
        message: `Order #${order.id} status updated to ${status}`,
      });

      setSuccess('Order status updated.');
      await loadStoreData();
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update order status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDelivery = async (order) => {
    const person = autoPickDeliveryPerson();

    if (!person) {
      setError('No delivery person available.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createDelivery({
        orderId: order.id,
        personName: person.name || person.contact,
        trackingUrl: `https://tracking.local/order-${order.id}`,
      });

      await updateOrder(order.id, {
        ...order,
        status: 'Ready',
      });

      await createNotification({
        userId: getId(order.userId ?? order.user),
        orderId: order.id,
        message: `Order #${order.id} is ready and assigned to ${person.name || person.contact}.`,
      });

      setSuccess(`Assigned ${person.name || person.contact} to order #${order.id}.`);
      await loadStoreData();
    } catch (assignError) {
      setError(getErrorMessage(assignError, 'Failed to assign delivery person.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (product) => {
    const nextStock = Number(stockDrafts[product.id] ?? getProductStock(product));

    if (Number.isNaN(nextStock) || nextStock < 0) {
      setError('Stock must be zero or greater.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateProduct(product.id, {
        ...product,
        stock: nextStock,
        available: nextStock > 0,
      });

      setSuccess(`Updated stock for ${product.name || `Product #${product.id}`}.`);
      await loadStoreData();
    } catch (stockError) {
      setError(getErrorMessage(stockError, 'Failed to update product stock.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Store Admin Dashboard</h2>
      <ErrorState message={error} />
      {success && <p className="status success">{success}</p>}

      {loading ? (
        <LoadingState message="Loading store dashboard..." />
      ) : (
        <>
          <h3>Incoming Orders</h3>
          {incomingOrders.length === 0 ? (
            <EmptyState message="No incoming orders." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Next Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{getOrderStatus(order)}</td>
                      <td>
                        <select
                          value={statusDrafts[order.id] || getOrderStatus(order)}
                          onChange={(event) =>
                            setStatusDrafts((prev) => ({
                              ...prev,
                              [order.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                        </select>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order)}
                          disabled={submitting}
                        >
                          Update Status
                        </button>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => handleAssignDelivery(order)}
                          disabled={submitting}
                        >
                          Auto Assign Delivery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3>Manage Inventory</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>New Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name || '-'}</td>
                    <td>{getProductStock(product)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={stockDrafts[product.id] ?? getProductStock(product)}
                        onChange={(event) =>
                          setStockDrafts((prev) => ({
                            ...prev,
                            [product.id]: event.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleUpdateStock(product)}
                        disabled={submitting}
                      >
                        Save Stock
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4}>No products available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default StorePage;
