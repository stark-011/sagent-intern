import api from './api';

const DELIVERIES_ENDPOINT = '/api/deliveries';

export const getAllDeliveries = () => api.get(DELIVERIES_ENDPOINT);
export const getDeliveryById = (id) => api.get(`${DELIVERIES_ENDPOINT}/${id}`);
export const createDelivery = (payload) => api.post(DELIVERIES_ENDPOINT, payload);
export const updateDelivery = (id, payload) => api.put(`${DELIVERIES_ENDPOINT}/${id}`, payload);
export const deleteDelivery = (id) => api.delete(`${DELIVERIES_ENDPOINT}/${id}`);
