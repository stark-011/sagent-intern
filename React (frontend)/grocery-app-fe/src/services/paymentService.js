import api from './api';

const PAYMENTS_ENDPOINT = '/api/payments';

export const getAllPayments = () => api.get(PAYMENTS_ENDPOINT);
export const getPaymentById = (id) => api.get(`${PAYMENTS_ENDPOINT}/${id}`);
export const createPayment = (payload) => api.post(PAYMENTS_ENDPOINT, payload);
export const updatePayment = (id, payload) => api.put(`${PAYMENTS_ENDPOINT}/${id}`, payload);
export const deletePayment = (id) => api.delete(`${PAYMENTS_ENDPOINT}/${id}`);
