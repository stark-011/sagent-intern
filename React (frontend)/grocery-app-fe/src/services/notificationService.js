import api from './api';

const NOTIFICATIONS_ENDPOINT = '/api/notifications';

export const getAllNotifications = () => api.get(NOTIFICATIONS_ENDPOINT);
export const getNotificationById = (id) => api.get(`${NOTIFICATIONS_ENDPOINT}/${id}`);
export const createNotification = (payload) => api.post(NOTIFICATIONS_ENDPOINT, payload);
export const updateNotification = (id, payload) =>
  api.put(`${NOTIFICATIONS_ENDPOINT}/${id}`, payload);
export const deleteNotification = (id) => api.delete(`${NOTIFICATIONS_ENDPOINT}/${id}`);
