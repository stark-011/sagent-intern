import apiClient from "./apiClient";
import { unwrap, toTrimmed, toNumber, toLocalDateTime, toIsoDate } from "./apiHelpers";

const normalizePublicStats = (stats = {}) => ({
  totalSpots: stats.totalSpots ?? stats.total_spots ?? 0,
  activeDrivers: stats.activeDrivers ?? stats.active_drivers ?? 0,
  totalLenders: stats.totalLenders ?? stats.total_lenders ?? 0,
  totalCities: stats.totalCities ?? stats.total_cities ?? 0,
});

const toSpotPayload = (payload = {}) => {
  const normalized = {
    spot_title: toTrimmed(payload.spot_title),
    description: toTrimmed(payload.description),
    address_line: toTrimmed(payload.address_line),
    locality: toTrimmed(payload.locality),
    city: toTrimmed(payload.city),
    state: toTrimmed(payload.state),
    pincode: toTrimmed(payload.pincode),
    latitude: toNumber(payload.latitude),
    longitude: toNumber(payload.longitude),
    vehicle_type_allowed: Array.isArray(payload.vehicle_type_allowed)
      ? payload.vehicle_type_allowed
      : undefined,
    total_slots: 1,
    spot_type: toTrimmed(payload.spot_type),
    image_url: toTrimmed(payload.image_url),
    day_of_week: toTrimmed(payload.day_of_week),
    start_time: toTrimmed(payload.start_time),
    end_time: toTrimmed(payload.end_time),
    pricing_type: toTrimmed(payload.pricing_type),
    base_hourly_rate: toNumber(payload.base_hourly_rate),
    peak_hour_rate: toNumber(payload.peak_hour_rate),
    special_day_rate: toNumber(payload.special_day_rate),
    effective_from: toIsoDate(payload.effective_from),
    effective_to: toIsoDate(payload.effective_to),
  };

  if (payload.available !== undefined || payload.is_available !== undefined) {
    normalized.available = Boolean(
      payload.available !== undefined ? payload.available : payload.is_available
    );
  }

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
};

export const parkingService = {
  async getAllSpots() {
    const res = await apiClient.get("/parking/all");
    return unwrap(res) || [];
  },

  async getPublicStats() {
    const res = await apiClient.get("/parking/stats");
    return normalizePublicStats(unwrap(res) || {});
  },

  async getFeaturedSpots() {
    const res = await apiClient.get("/parking/featured");
    return unwrap(res) || [];
  },

  async searchSpots(filters = {}) {
    const params = {
      query: filters.query || undefined,
      vehicleType: filters.vehicleType || undefined,
      maxPrice: filters.maxPrice || undefined,
      spotType: filters.spotType || undefined,
      minRating: filters.minRating || undefined,
      maxDistance: filters.maxDistance || undefined,
      sort: filters.sort || "nearest",
      startTime: filters.timeRange?.start || undefined,
      endTime: filters.timeRange?.end || undefined,
      status: filters.status || undefined,
    };
    const res = await apiClient.get("/parking/search", { params });
    return unwrap(res) || [];
  },

  async getSpotById(spotId) {
    const res = await apiClient.get(`/parking/spots/${spotId}`);
    return unwrap(res);
  },

  async getSpotBookedWindows(spotId, date) {
    const res = await apiClient.get(`/parking/spots/${spotId}/booked-windows`, {
      params: { date: toIsoDate(date) },
    });
    return unwrap(res) || [];
  },

  async getAlternativeSpots(spotId, startTime, endTime) {
    const res = await apiClient.get(`/parking/spots/${spotId}/alternatives`, {
      params: {
        startTime: toLocalDateTime(startTime),
        endTime: toLocalDateTime(endTime),
      },
    });
    return unwrap(res) || [];
  },

  async getReviewsBySpot(spotId) {
    const res = await apiClient.get(`/reviews/spot/${spotId}`);
    return unwrap(res) || [];
  },

  async getLenderSpots() {
    const res = await apiClient.get("/lender/spots");
    return unwrap(res) || [];
  },

  async getLenderSpotById(spotId) {
    const res = await apiClient.get(`/lender/spots/${spotId}`);
    return unwrap(res);
  },

  async addSpot(_lenderId, payload) {
    const res = await apiClient.post("/lender/spots", toSpotPayload(payload));
    return unwrap(res);
  },

  async updateSpot(spotId, payload) {
    const res = await apiClient.put(`/lender/spots/${spotId}`, toSpotPayload(payload));
    return unwrap(res);
  },

  async deleteSpot(spotId) {
    const res = await apiClient.delete(`/lender/spots/${spotId}`);
    return unwrap(res);
  },

  async updateSpotAvailability(spotId, payload = {}) {
    const body = {
      day_of_week: toTrimmed(payload.day_of_week) || "all",
      start_time: toTrimmed(payload.start_time) || "06:00",
      end_time: toTrimmed(payload.end_time) || "23:00",
      effective_from: toIsoDate(payload.effective_from),
      effective_to: toIsoDate(payload.effective_to),
      available: Boolean(
        payload.available !== undefined ? payload.available : payload.is_available
      ),
    };
    const res = await apiClient.put(`/lender/spots/${spotId}/availability`, body);
    return unwrap(res);
  },
};
