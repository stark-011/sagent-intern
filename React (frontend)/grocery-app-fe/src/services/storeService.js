import api from './api';

const STORES_ENDPOINT = '/api/stores';

export const getAllStores = () => api.get(STORES_ENDPOINT);
export const getStoreById = (id) => api.get(`${STORES_ENDPOINT}/${id}`);
export const createStore = (payload) => api.post(STORES_ENDPOINT, payload);
export const updateStore = (id, payload) => api.put(`${STORES_ENDPOINT}/${id}`, payload);
export const deleteStore = (id) => api.delete(`${STORES_ENDPOINT}/${id}`);
