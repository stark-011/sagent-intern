import axios from 'axios';

const enableCredentials = process.env.REACT_APP_WITH_CREDENTIALS === 'true';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  withCredentials: enableCredentials,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const authMode = localStorage.getItem('authMode');

    if (authMode === 'session') {
      config.withCredentials = true;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getErrorMessage = (error) => {
  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach backend. Check Spring Boot server, API proxy/base URL, and CORS settings.';
  }
  if (typeof error.response?.data === 'string' && /Cannot GET\s+/i.test(error.response.data)) {
    const match = error.response.data.match(/Cannot GET\s+([^<\s]+)/i);
    const path = match?.[1] || 'requested endpoint';
    return `Backend endpoint not found: ${path}. Verify Spring mapping for admin application list/status APIs.`;
  }
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (Array.isArray(error.response?.data?.errors) && error.response.data.errors.length > 0) {
    return error.response.data.errors.join(', ');
  }
  if (typeof error.response?.data === 'string') return error.response.data;
  if (error.response?.status) return `Request failed with status code ${error.response.status}`;
  if (error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

const execute = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const registerUser = (payload) => execute(() => api.post('/users/register', payload));

export const loginUser = async (payload) => {
  try {
    const response = await api.post('/users/login', payload);
    return {
      ...response.data,
      _meta: {
        headers: response.headers,
        status: response.status,
      },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCourses = () => execute(() => api.get('/courses'));

export const submitApplication = (payload) => execute(() => api.post('/applications', payload));

export const getApplications = () => execute(() => api.get('/applications'));

export const getAllApplications = () => execute(() => api.get('/applications'));

export const uploadDocument = (file, applicationId, docType = 'General') => {
  const payload = {
    fileUrl: file?.name || '',
    docType,
  };
  if (applicationId) {
    payload.application = { appId: Number(applicationId) };
  }
  return execute(() => api.post('/documents', payload));
};

export const makePayment = (payload) => execute(() => api.post('/payments', payload));

export const updateStatus = (id, status, currentApplication = {}) =>
  execute(() =>
    api.put(`/applications/${id}`, {
      status,
      address: currentApplication.address || '',
      percentage:
        currentApplication.percentage === undefined || currentApplication.percentage === null
          ? null
          : Number(currentApplication.percentage),
    })
  );

export const deleteApplication = (id) => execute(() => api.delete(`/applications/${id}`));

export default api;
