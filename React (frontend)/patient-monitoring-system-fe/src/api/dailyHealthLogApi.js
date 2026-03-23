import api from "./axiosConfig";

export const addHealthLog = async (logPayload, patientId) => {
  const { data } = await api.post("/api/health-logs", logPayload, {
    params: { patientId }
  });
  return data;
};

export const getHealthLogsByPatientId = async (patientId) => {
  const { data } = await api.get(`/api/health-logs/patient/${patientId}`);
  return data;
};

export const getHealthLogById = async (logId) => {
  const { data } = await api.get(`/api/health-logs/${logId}`);
  return data;
};
