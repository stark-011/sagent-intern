import api from "./axiosConfig";

export const registerDoctor = async (doctorPayload) => {
  const { data } = await api.post("/api/doctors", doctorPayload);
  return data;
};

export const getAllDoctors = async () => {
  const { data } = await api.get("/api/doctors");
  return data;
};

export const getDoctorById = async (id) => {
  const { data } = await api.get(`/api/doctors/${id}`);
  return data;
};
