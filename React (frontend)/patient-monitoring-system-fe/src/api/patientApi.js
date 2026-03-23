import api from "./axiosConfig";

export const registerPatient = async (patientPayload, primaryDoctorId) => {
  const params = primaryDoctorId ? { primaryDoctorId } : undefined;
  const { data } = await api.post("/api/patients", patientPayload, { params });
  return data;
};

export const getAllPatients = async () => {
  const { data } = await api.get("/api/patients");
  return data;
};

export const getPatientById = async (id) => {
  const { data } = await api.get(`/api/patients/${id}`);
  return data;
};
