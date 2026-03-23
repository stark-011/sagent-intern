import axiosClient from "../api/axiosClient";

export const getAllUsers = async () => {
  const response = await axiosClient.get("/api/users");
  return response.data || [];
};

export const createUser = async (userPayload) => {
  const response = await axiosClient.post("/api/users", userPayload);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosClient.get(`/api/users/${id}`);
  return response.data;
};
