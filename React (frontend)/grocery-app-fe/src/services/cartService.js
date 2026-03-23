import api from './api';
import { getId } from '../components/appUtils';

const CARTS_ENDPOINT = '/api/carts';
const CART_ITEMS_ENDPOINT = '/api/cart-items';

const cartStorageKey = (userId) => `grocery_active_cart_${userId}`;

const readStoredCartId = (userId) => {
  if (typeof window === 'undefined' || !userId) {
    return null;
  }

  const raw = window.localStorage.getItem(cartStorageKey(userId));
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

const writeStoredCartId = (userId, cartId) => {
  if (typeof window === 'undefined' || !userId || !cartId) {
    return;
  }

  window.localStorage.setItem(cartStorageKey(userId), String(cartId));
};

export const getAllCarts = () => api.get(CARTS_ENDPOINT);
export const getCartById = (id) => api.get(`${CARTS_ENDPOINT}/${id}`);
export const createCart = (payload) => api.post(CARTS_ENDPOINT, payload);
export const updateCart = (id, payload) => api.put(`${CARTS_ENDPOINT}/${id}`, payload);
export const deleteCart = (id) => api.delete(`${CARTS_ENDPOINT}/${id}`);
export const refreshCart = (id) => api.put(`${CARTS_ENDPOINT}/${id}/refresh`);

export const getAllCartItems = () => api.get(CART_ITEMS_ENDPOINT);
export const getCartItemById = (id) => api.get(`${CART_ITEMS_ENDPOINT}/${id}`);

export const createCartItem = ({ cartId, productId, quantity }) => {
  if (cartId === null || cartId === undefined || cartId === '') {
    throw new Error('Cart id is missing. Please refresh and try again.');
  }

  if (productId === null || productId === undefined || productId === '') {
    throw new Error('Product id is missing. Please refresh products and try again.');
  }

  const parsedQuantity = Number(quantity);
  const safeQuantity = Number.isNaN(parsedQuantity) || parsedQuantity < 1 ? 1 : parsedQuantity;

  return api.post(CART_ITEMS_ENDPOINT, {
    cartId: Number(cartId),
    productId: Number(productId),
    quantity: safeQuantity,
  });
};

export const updateCartItem = (id, quantity) =>
  api.put(`${CART_ITEMS_ENDPOINT}/${id}`, { quantity });
export const deleteCartItem = (id) => api.delete(`${CART_ITEMS_ENDPOINT}/${id}`);

export const findCartByUserId = async (userId) => {
  if (!userId) {
    return null;
  }

  const response = await getAllCarts();
  const carts = Array.isArray(response.data) ? response.data : [];

  // Preferred: proper user-cart relationship.
  const linkedCart = carts.find(
    (cart) => Number(getId(cart.userId ?? cart.user)) === Number(userId),
  );

  if (linkedCart) {
    writeStoredCartId(userId, getId(linkedCart));
    return linkedCart;
  }

  // Fallback: use previously stored cart id for this user.
  const storedCartId = readStoredCartId(userId);
  if (storedCartId) {
    const stored = carts.find((cart) => Number(getId(cart)) === Number(storedCartId));
    if (stored) {
      return stored;
    }
  }

  // Last fallback for this backend: latest cart with items.
  const withItems = [...carts]
    .filter((cart) => Array.isArray(cart.cartItems) && cart.cartItems.length > 0)
    .sort((a, b) => Number(getId(b)) - Number(getId(a)));

  if (withItems[0]) {
    writeStoredCartId(userId, getId(withItems[0]));
    return withItems[0];
  }

  return null;
};

export const getCartItemsByCartId = async (cartId) => {
  if (!cartId) {
    return [];
  }

  // Primary source for this backend shape: cart items are nested in cart.
  try {
    const cartResponse = await getCartById(cartId);
    const cart = cartResponse.data || {};
    const nestedItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

    if (nestedItems.length > 0 || cart.cartItems !== undefined) {
      return nestedItems.map((item) => ({
        ...item,
        cartId,
      }));
    }
  } catch {
    // Fall back to /api/cart-items.
  }

  const response = await getAllCartItems();
  const items = Array.isArray(response.data) ? response.data : [];

  return items.filter((item) => Number(getId(item.cartId ?? item.cart)) === Number(cartId));
};

export const ensureCartForUser = async (userId) => {
  if (userId === null || userId === undefined || userId === '') {
    throw new Error('Unable to find logged-in user id. Please login again.');
  }

  const existing = await findCartByUserId(userId);
  if (existing) {
    writeStoredCartId(userId, getId(existing));
    return existing;
  }

  const response = await createCart({
    userId: Number(userId),
    user: {
      userId: Number(userId),
      id: Number(userId),
    },
  });

  const created = response.data;
  writeStoredCartId(userId, getId(created));

  return created;
};
