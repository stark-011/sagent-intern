import axiosInstance from "./axiosConfig";

export const createIssue = async (payload) => {
  const { data } = await axiosInstance.post("/api/issues", payload);
  return data;
};

export const getAllIssues = async () => {
  const { data } = await axiosInstance.get("/api/issues");
  return data;
};

export const patchIssue = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/api/issues/${id}`, payload);
  return data;
};
