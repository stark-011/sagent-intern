import apiClient from "./apiClient";
import { unwrap } from "./apiHelpers";


const toVehiclePayload = (payload = {}) => ({
  vehicle_name: payload.vehicle_name,
  vehicle_number: payload.vehicle_number,
  vehicle_type: payload.vehicle_type,
  brand: payload.brand,
  model: payload.model,
  color: payload.color,
  is_default: payload.is_default,
});

export const vehicleService = {
  async getVehiclesByUser() {
    const res = await apiClient.get("/vehicles");
    return unwrap(res) || [];
  },

  async addVehicle(_userId, payload) {
    const res = await apiClient.post("/vehicles", toVehiclePayload(payload));
    return unwrap(res);
  },

  async updateVehicle(vehicleId, payload) {
    const existing = payload.vehicle_name
      ? toVehiclePayload(payload)
      : {
          is_default: payload.is_default,
        };
    const res = await apiClient.put(`/vehicles/${vehicleId}`, existing);
    return unwrap(res);
  },

  async deleteVehicle(vehicleId) {
    const res = await apiClient.delete(`/vehicles/${vehicleId}`);
    return unwrap(res);
  },
};
