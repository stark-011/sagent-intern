import axiosInstance from "./axiosConfig";

export const getAllUsers = async () => {
  const { data } = await axiosInstance.get("/api/users");
  return data;
};

export const getUserById = async (id) => {
  const { data } = await axiosInstance.get(`/api/users/${id}`);
  return data;
};

export const createUser = async (payload) => {
  const { data } = await axiosInstance.post("/api/users", payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await axiosInstance.put(`/api/users/${id}`, payload);
  return data;
};

export const patchUser = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/api/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/api/users/${id}`);
  return data;
};
