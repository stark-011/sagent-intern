import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 20000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const extractApiError = (error) => {
  if (!error?.response?.data) {
    return error?.message || "Network error. Please try again.";
  }

  const responseData = error.response.data;

  if (responseData.fieldErrors) {
    const firstFieldError = Object.values(responseData.fieldErrors)[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return responseData.message || responseData.error || "Something went wrong.";
};

export default api;
