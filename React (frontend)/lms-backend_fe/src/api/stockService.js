import axiosInstance from "./axiosConfig";

export const createStock = async (payload) => {
  const { data } = await axiosInstance.post("/api/stock", payload);
  return data;
};

export const getAllStock = async () => {
  const { data } = await axiosInstance.get("/api/stock");
  return data;
};

export const getStockById = async (id) => {
  const { data } = await axiosInstance.get(`/api/stock/${id}`);
  return data;
};

export const patchStock = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/api/stock/${id}`, payload);
  return data;
};

export const deleteStock = async (id) => {
  await axiosInstance.delete(`/api/stock/${id}`);
};
