import api from './api';

const PRODUCTS_ENDPOINT = '/api/products';

export const getAllProducts = () => api.get(PRODUCTS_ENDPOINT);
export const getProductById = (id) => api.get(`${PRODUCTS_ENDPOINT}/${id}`);
export const createProduct = (payload) => api.post(PRODUCTS_ENDPOINT, payload);
export const updateProduct = (id, payload) => api.put(`${PRODUCTS_ENDPOINT}/${id}`, payload);
export const deleteProduct = (id) => api.delete(`${PRODUCTS_ENDPOINT}/${id}`);
