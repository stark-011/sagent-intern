import api from './api';
import { getId, normalizeRole, toBackendRole } from '../components/appUtils';

const USERS_ENDPOINT = '/api/users';

export const getAllUsers = () => api.get(USERS_ENDPOINT);
export const getUserById = (id) => api.get(`${USERS_ENDPOINT}/${id}`);
export const createUser = (payload) => api.post(USERS_ENDPOINT, payload);
export const updateUser = (id, payload) => api.put(`${USERS_ENDPOINT}/${id}`, payload);
export const deleteUser = (id) => api.delete(`${USERS_ENDPOINT}/${id}`);

export const registerUser = async (payload) => {
  const body = {
    name: payload.name,
    address: payload.address,
    contact: payload.contact,
    role: toBackendRole(payload.role),
    password: payload.password,
  };

  const response = await createUser(body);
  return response.data;
};

export const loginUser = async ({ contact, password }) => {
  try {
    const response = await api.post(`${USERS_ENDPOINT}/login`, { contact, password });
    return response.data;
  } catch (error) {
    if (!error?.response || ![404, 405].includes(error.response.status)) {
      throw error;
    }

    const response = await getAllUsers();
    const users = Array.isArray(response.data) ? response.data : [];

    const normalizedContact = String(contact || '').trim().toLowerCase();
    const user = users.find((item) => {
      const values = [item.contact, item.phone, item.email]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());

      return values.includes(normalizedContact);
    });

    if (!user) {
      throw new Error('Invalid contact or password.');
    }

    if (user.password && password && user.password !== password) {
      throw new Error('Invalid contact or password.');
    }

    return user;
  }
};

export const getUsersByRole = async (role) => {
  const response = await getAllUsers();
  const users = Array.isArray(response.data) ? response.data : [];
  const normalized = normalizeRole(role);

  return users.filter((user) => normalizeRole(user.role) === normalized);
};

export const getUserId = (user) => getId(user?.id);
