import api from "./axiosConfig";

export const scheduleAppointment = async (appointmentPayload, doctorId, patientId) => {
  const { data } = await api.post("/api/appointments", appointmentPayload, {
    params: { doctorId, patientId }
  });
  return data;
};

export const getAppointmentsByPatientId = async (patientId) => {
  const { data } = await api.get(`/api/appointments/patient/${patientId}`);
  return data;
};

export const getAppointmentsByDoctorId = async (doctorId) => {
  const { data } = await api.get(`/api/appointments/doctor/${doctorId}`);
  return data;
};

export const getAppointmentById = async (id) => {
  const { data } = await api.get(`/api/appointments/${id}`);
  return data;
};
