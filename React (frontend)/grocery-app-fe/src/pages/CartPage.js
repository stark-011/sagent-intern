import { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getErrorMessage, getId, getProductPrice, toNumber } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';
import {
  deleteCartItem,
  ensureCartForUser,
  getCartItemsByCartId,
  refreshCart,
  updateCartItem,
} from '../services/cartService';
import { createNotification } from '../services/notificationService';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';
import { getAllProducts } from '../services/productService';
import { getAllStores } from '../services/storeService';

const DISCOUNT_THRESHOLD = 200;
const FLAT_DISCOUNT = 25;
const PAYMENT_METHODS = ['Card', 'UPI', 'Wallet', 'Cash on Delivery'];

function CartPage() {
  const { currentUser } = useAuth();

  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [draftQty, setDraftQty] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [storeId, setStoreId] = useState('');
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCartData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const userId = currentUser?.id;
      const [userCart, productsResponse, storesResponse] = await Promise.all([
        ensureCartForUser(userId),
        getAllProducts(),
        getAllStores(),
      ]);

      const itemsData = await getCartItemsByCartId(userCart.id);
      const productList = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      const storeList = Array.isArray(storesResponse.data) ? storesResponse.data : [];

      setCart(userCart);
      setItems(itemsData);
      setProducts(productList);
      setStores(storeList);
      setDeliveryAddress((prev) => prev || currentUser?.address || '');
      setStoreId((prev) => prev || String(storeList[0]?.id || ''));

      if (itemsData.length === 0) {
        setOrder(null);
        setReceipt(null);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load cart.'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.address, currentUser?.id]);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

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
        const quantity = Number(item.quantity || 0);

        return sum + price * quantity;
      }, 0),
    [items, productMap],
  );

  const discount = subtotal > DISCOUNT_THRESHOLD ? FLAT_DISCOUNT : 0;
  const finalTotal = subtotal - discount;

  const refreshCurrentCart = async () => {
    if (!cart?.id) {
      return;
    }

    const [itemsData] = await Promise.all([
      getCartItemsByCartId(cart.id),
      refreshCart(cart.id),
    ]);

    setItems(itemsData);
  };

  const handleQtyChange = (itemId, value) => {
    setDraftQty((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleUpdateQuantity = async (item) => {
    const nextQuantity = toNumber(draftQty[item.id] ?? item.quantity);

    if (!nextQuantity || nextQuantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateCartItem(item.id, nextQuantity);
      await refreshCurrentCart();
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update quantity.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await deleteCartItem(itemId);
      await refreshCurrentCart();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to remove cart item.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!cart?.id) {
      setError('Cart not found.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Delivery address is required.');
      return;
    }

    if (!storeId) {
      setError('Please select a store.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await createOrder({
        userId: currentUser?.id,
        storeId: Number(storeId),
        cartId: cart.id,
        deliveryAddress: deliveryAddress.trim(),
      });

      const createdOrder = response.data;
      setOrder(createdOrder);
      setReceipt(null);
      setSuccess(`Order #${createdOrder?.id || ''} confirmed. Continue with payment below.`);

      await createNotification({
        userId: currentUser?.id,
        orderId: createdOrder?.id,
        message: 'Order Confirmed',
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to create order.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!order?.id) {
      setError('Please confirm your order first.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await createPayment({
        orderId: Number(order.id),
        userId: currentUser?.id,
        method: paymentMethod,
      });

      setReceipt(response.data);
      setSuccess('Payment completed successfully.');

      await createNotification({
        userId: currentUser?.id,
        orderId: order.id,
        message: `Payment successful via ${paymentMethod}`,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Payment failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Cart</h2>

      <ErrorState message={error} />
      {success && <p className="status success">{success}</p>}

      {loading ? (
        <LoadingState message="Loading cart..." />
      ) : items.length === 0 ? (
        <EmptyState message="Your cart is empty." />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const productId = Number(getId(item.productId ?? item.product));
                  const product = productMap.get(productId);
                  const price = product ? getProductPrice(product) : Number(item.price || 0);
                  const quantity = Number(item.quantity || 0);

                  return (
                    <tr key={item.id}>
                      <td>{product?.name || item.productName || `Product #${productId}`}</td>
                      <td>{price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={draftQty[item.id] ?? item.quantity}
                          onChange={(event) => handleQtyChange(item.id, event.target.value)}
                        />
                      </td>
                      <td>{(price * quantity).toFixed(2)}</td>
                      <td className="actions">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item)}
                          disabled={submitting}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={submitting}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="totals-box">
            <p>
              <strong>Subtotal:</strong> Rs. {subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Discount:</strong> Rs. {discount.toFixed(2)}
            </p>
            <p>
              <strong>Final Total:</strong> Rs. {finalTotal.toFixed(2)}
            </p>
            {discount > 0 && (
              <p className="muted-text">Rs. 25 discount applied (cart total over Rs. 200).</p>
            )}
          </div>

          <div className="receipt-box">
            <h3>Checkout</h3>
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
                  {stores.length === 0 && <option value="">No stores available</option>}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="button" disabled={submitting} onClick={handleConfirmOrder}>
                {submitting ? 'Confirming...' : 'Confirm Order'}
              </button>
            </div>

            {order?.id && (
              <div className="totals-box">
                <h3>Payment (inside Checkout)</h3>
                <p>
                  <strong>Order ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Amount:</strong> Rs. {finalTotal.toFixed(2)}
                </p>
                <div className="form-grid">
                  <label>
                    Payment Method
                    <select
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" disabled={submitting} onClick={handlePayNow}>
                    {submitting ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>

                {receipt && (
                  <article className="receipt-box">
                    <h3>Receipt</h3>
                    <p>Payment ID: {receipt.id || '-'}</p>
                    <p>Order ID: {getId(receipt.orderId ?? receipt.order) || order.id}</p>
                    <p>Method: {receipt.method || paymentMethod}</p>
                    <p>Status: {receipt.status || 'Recorded'}</p>
                  </article>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default CartPage;
