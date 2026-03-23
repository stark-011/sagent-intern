import axiosClient from "../api/axiosClient";
import { requestWithPayloadFallback } from "../utils/httpFallback";

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const getAllCategories = async () => {
  const response = await axiosClient.get("/api/categories");
  return response.data || [];
};

export const createCategory = async (categoryInput) => {
  const payloads = [
    cleanPayload({ name: categoryInput.name }),
    cleanPayload({ categoryName: categoryInput.name }),
    cleanPayload({ title: categoryInput.name }),
  ];

  const response = await requestWithPayloadFallback((payload) => axiosClient.post("/api/categories", payload), payloads);
  return response.data;
};

export const deleteCategoryById = async (categoryId) => {
  await axiosClient.delete(`/api/categories/${categoryId}`);
};
