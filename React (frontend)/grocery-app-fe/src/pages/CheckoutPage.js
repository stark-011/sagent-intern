import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, getProductPrice } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import { ensureCartForUser, getCartItemsByCartId } from '../services/cartService';
import { createNotification } from '../services/notificationService';
import { createOrder } from '../services/orderService';
import { getAllProducts } from '../services/productService';
import { getAllStores } from '../services/storeService';

const DISCOUNT_THRESHOLD = 200;
const FLAT_DISCOUNT = 25;

function CheckoutPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCheckoutData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const userCart = await ensureCartForUser(currentUser?.id);
      const [itemsData, productsResponse, storesResponse] = await Promise.all([
        getCartItemsByCartId(userCart.id),
        getAllProducts(),
        getAllStores(),
      ]);

      const loadedProducts = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      const loadedStores = Array.isArray(storesResponse.data) ? storesResponse.data : [];

      setCart(userCart);
      setItems(itemsData);
      setProducts(loadedProducts);
      setStores(loadedStores);

      if (loadedStores[0]?.id) {
        setStoreId(String(loadedStores[0].id));
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load checkout data.'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      map.set(Number(product.id), product);
    });
    return map;
  }, [products]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const productId = Number(getId(item.productId ?? item.product));
        const product = productMap.get(productId);
        const price = product ? getProductPrice(product) : Number(item.price || 0);

        return sum + price * Number(item.quantity || 0);
      }, 0),
    [items, productMap],
  );

  const discount = subtotal > DISCOUNT_THRESHOLD ? FLAT_DISCOUNT : 0;
  const total = subtotal - discount;

  const handlePlaceOrder = async () => {
    if (!cart?.id) {
      setError('Cart not found.');
      return;
    }

    if (!storeId) {
      setError('Please select a store.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await createOrder({
        userId: currentUser?.id,
        storeId: Number(storeId),
        cartId: cart.id,
        deliveryAddress,
      });

      const order = response.data;

      await createNotification({
        userId: currentUser?.id,
        orderId: order?.id,
        message: 'Order Confirmed',
      });

      navigate('/payment', {
        state: {
          orderId: order?.id,
          amount: total,
        },
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to place order.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Checkout</h2>
      <ErrorState message={error} />

      {loading ? (
        <LoadingState message="Preparing checkout..." />
      ) : items.length === 0 ? (
        <EmptyState message="Your cart is empty. Add products before checkout." />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const productId = Number(getId(item.productId ?? item.product));
                  const product = productMap.get(productId);
                  const price = product ? getProductPrice(product) : Number(item.price || 0);

                  return (
                    <tr key={item.id}>
                      <td>{product?.name || `Product #${productId}`}</td>
                      <td>{item.quantity}</td>
                      <td>?{(price * Number(item.quantity || 0)).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="totals-box">
            <p>Subtotal: ?{subtotal.toFixed(2)}</p>
            <p>Discount: ?{discount.toFixed(2)}</p>
            <p>
              <strong>Final: ?{total.toFixed(2)}</strong>
            </p>
          </div>

          <div className="form-grid">
            <label>
              Delivery Address
              <input
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
              />
            </label>

            <label>
              Store
              <select value={storeId} onChange={(event) => setStoreId(event.target.value)}>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name || `Store #${store.id}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handlePlaceOrder} disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default CheckoutPage;
