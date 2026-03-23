import axios from "axios";
import { getSession } from "./storage.js";

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const details = error?.response?.data?.details;
    const message =
      (Array.isArray(details) && details.length ? details[0] : null) ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";
    const enrichedError = new Error(message);
    enrichedError.status = error?.response?.status;
    enrichedError.errorCode = error?.response?.data?.errorCode;
    enrichedError.details = details;
    return Promise.reject(enrichedError);
  }
);

export default apiClient;
