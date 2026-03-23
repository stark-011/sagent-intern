export const ROLES = {
  CUSTOMER: 'customer',
  STORE_ADMIN: 'store_admin',
  DELIVERY_PERSON: 'delivery_person',
};

export const ROLE_OPTIONS = [
  { label: 'Customer', value: ROLES.CUSTOMER },
  { label: 'Store Admin', value: ROLES.STORE_ADMIN },
  { label: 'Delivery Person', value: ROLES.DELIVERY_PERSON },
];

export const normalizeRole = (value) => {
  if (!value) {
    return ROLES.CUSTOMER;
  }

  const role = String(value).trim().toLowerCase();

  if (role.includes('store') || role === 'admin' || role === 'storeadmin') {
    return ROLES.STORE_ADMIN;
  }

  if (role.includes('delivery') || role === 'rider') {
    return ROLES.DELIVERY_PERSON;
  }

  return ROLES.CUSTOMER;
};

export const toBackendRole = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === ROLES.STORE_ADMIN) {
    return 'STORE_ADMIN';
  }

  if (normalized === ROLES.DELIVERY_PERSON) {
    return 'DELIVERY_PERSON';
  }

  return 'CUSTOMER';
};

export const getId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'object') {
    return (
      value.id ??
      value.userId ??
      value.productId ??
      value.cartId ??
      value.cartItemId ??
      value.orderId ??
      value.storeId ??
      value.paymentId ??
      value.deliveryId ??
      value.notifyId ??
      value.notificationId ??
      value.discountId ??
      null
    );
  }

  return value;
};

export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  const responseMessage = error?.response?.data?.message;
  if (typeof responseMessage === 'string' && responseMessage.trim() !== '') {
    return responseMessage;
  }

  if (typeof error?.message === 'string' && error.message.trim() !== '') {
    return error.message;
  }

  return fallback;
};

export const getProductPrice = (product) => {
  const price = Number(product?.price ?? product?.unitPrice ?? 0);
  return Number.isNaN(price) ? 0 : price;
};

export const getProductStock = (product) => {
  const rawStock =
    product?.stock ??
    product?.quantity ??
    product?.availableStock ??
    product?.inventory ??
    product?.inventoryCount;

  const stock = Number(rawStock ?? 0);
  return Number.isNaN(stock) ? 0 : stock;
};

export const isProductAvailable = (product) => {
  const status = String(
    product?.availability ?? product?.availabilityStatus ?? product?.stockStatus ?? '',
  )
    .trim()
    .toLowerCase();

  if (status) {
    if (['out', 'unavailable', 'sold', 'no stock'].some((value) => status.includes(value))) {
      return false;
    }

    if (['in', 'available', 'instock'].some((value) => status.includes(value))) {
      return true;
    }
  }

  const hasStockField = ['stock', 'quantity', 'availableStock', 'inventory', 'inventoryCount'].some(
    (key) => product?.[key] !== undefined && product?.[key] !== null && product?.[key] !== '',
  );

  if (hasStockField) {
    return getProductStock(product) > 0;
  }

  // If backend doesn't expose stock fields, treat item as available by default.
  return true;
};

export const getOrderStatus = (order) => {
  if (typeof order?.status === 'string' && order.status.trim() !== '') {
    return order.status;
  }

  return 'Order Confirmed';
};
