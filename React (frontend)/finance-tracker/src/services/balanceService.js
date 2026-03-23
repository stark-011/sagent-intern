import axiosClient from "../api/axiosClient";

export const getAllBalances = async () => {
  const response = await axiosClient.get("/api/balances");
  return response.data || [];
};

export const createBalance = async (balancePayload) => {
  const response = await axiosClient.post("/api/balances", balancePayload);
  return response.data;
};

export const updateBalanceById = async (balanceId, balancePayload) => {
  const response = await axiosClient.put(`/api/balances/${balanceId}`, balancePayload);
  return response.data;
};

export const deleteBalanceById = async (balanceId) => {
  await axiosClient.delete(`/api/balances/${balanceId}`);
};
