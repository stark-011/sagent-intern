import axios from "axios";

export const AUTH_TOKEN_STORAGE_KEY = "finance_tracker_token";
export const AUTH_USER_STORAGE_KEY = "finance_tracker_user";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
