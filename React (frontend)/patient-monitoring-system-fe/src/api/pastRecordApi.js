import api from "./axiosConfig";

export const createPastRecord = async (recordPayload, patientId) => {
  const { data } = await api.post("/api/past-records", recordPayload, {
    params: { patientId }
  });
  return data;
};

export const getPastRecordsByPatientId = async (patientId) => {
  const { data } = await api.get(`/api/past-records/patient/${patientId}`);
  return data;
};

export const getPastRecordById = async (recordId) => {
  const { data } = await api.get(`/api/past-records/${recordId}`);
  return data;
};

export const updatePastRecord = async (recordId, payload) => {
  const { data } = await api.put(`/api/past-records/${recordId}`, payload);
  return data;
};

export const deletePastRecord = async (recordId) => {
  const { data } = await api.delete(`/api/past-records/${recordId}`);
  return data;
};
