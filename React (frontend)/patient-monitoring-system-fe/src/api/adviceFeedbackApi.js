import api from "./axiosConfig";

export const createAdviceFeedback = async (
  feedbackPayload,
  doctorId,
  patientId,
  relatedLogId
) => {
  const params = { doctorId, patientId };
  if (relatedLogId) {
    params.relatedLogId = relatedLogId;
  }

  const { data } = await api.post("/api/advice-feedback", feedbackPayload, {
    params
  });
  return data;
};

export const getFeedbackById = async (feedbackId) => {
  const { data } = await api.get(`/api/advice-feedback/${feedbackId}`);
  return data;
};

export const getFeedbackByPatientId = async (patientId) => {
  const { data } = await api.get(`/api/advice-feedback/patient/${patientId}`);
  return data;
};

export const getFeedbackByDoctorId = async (doctorId) => {
  const { data } = await api.get(`/api/advice-feedback/doctor/${doctorId}`);
  return data;
};

export const getUnreadFeedbackByPatientId = async (patientId) => {
  const { data } = await api.get(`/api/advice-feedback/patient/${patientId}/unread`);
  return data;
};

export const markFeedbackAsRead = async (feedbackId) => {
  const { data } = await api.patch(`/api/advice-feedback/${feedbackId}/read`);
  return data;
};

export const markAllFeedbackAsRead = async (patientId) => {
  const { data } = await api.patch(`/api/advice-feedback/patient/${patientId}/read-all`);
  return data;
};
