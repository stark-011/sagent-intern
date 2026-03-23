import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const ID_KEYS = [
  'id',
  'userId',
  'productId',
  'cartId',
  'cartItemId',
  'orderId',
  'storeId',
  'paymentId',
  'deliveryId',
  'notifyId',
  'notificationId',
  'discountId',
];

const normalizeIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeIds);
  }

  if (value && typeof value === 'object') {
    const normalized = {};

    Object.entries(value).forEach(([key, item]) => {
      normalized[key] = normalizeIds(item);
    });

    if (normalized.id === undefined || normalized.id === null) {
      const idKey = ID_KEYS.find((key) => normalized[key] !== undefined && normalized[key] !== null);
      if (idKey) {
        normalized.id = normalized[idKey];
      }
    }

    return normalized;
  }

  return value;
};

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.response.use((response) => {
  response.data = normalizeIds(response.data);
  return response;
});

export default api;
