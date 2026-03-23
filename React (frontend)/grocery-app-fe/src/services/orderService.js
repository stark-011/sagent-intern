import api from './api';

const ORDERS_ENDPOINT = '/api/orders';

export const getAllOrders = () => api.get(ORDERS_ENDPOINT);
export const getOrderById = (id) => api.get(`${ORDERS_ENDPOINT}/${id}`);
export const createOrder = (payload) => api.post(ORDERS_ENDPOINT, payload);
export const updateOrder = (id, payload) => api.put(`${ORDERS_ENDPOINT}/${id}`, payload);
export const deleteOrder = (id) => api.delete(`${ORDERS_ENDPOINT}/${id}`);
