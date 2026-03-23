import axiosInstance from "./axiosConfig";

export const sendNotification = async (payload) => {
  const { data } = await axiosInstance.post("/api/notifications", payload);
  return data;
};

export const getAllNotifications = async () => {
  const { data } = await axiosInstance.get("/api/notifications");
  return data;
};

export const getUserNotifications = async (userId) => {
  const { data } = await axiosInstance.get(`/api/notifications/user/${userId}`);
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return data;
};
