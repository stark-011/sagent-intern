import apiClient from "./apiClient";
import { unwrap, toLocalDateTime } from "./apiHelpers";

export const bookingService = {
  async getBookingsByUser() {
    const res = await apiClient.get("/bookings/me");
    return unwrap(res) || [];
  },

  async getBookingById(bookingId) {
    const res = await apiClient.get(`/bookings/${bookingId}`);
    return unwrap(res);
  },

  async getBookingHistory(bookingId) {
    const res = await apiClient.get(`/bookings/${bookingId}/history`);
    return unwrap(res) || [];
  },

  async createReservationHold(payload) {
    const res = await apiClient.post("/bookings/holds", payload);
    return unwrap(res);
  },

  async confirmBooking(payload) {
    const body = {
      ...payload,
      booked_start_time: toLocalDateTime(payload.booked_start_time),
      booked_end_time: toLocalDateTime(payload.booked_end_time),
    };
    const res = await apiClient.post("/bookings/confirm", body);
    return unwrap(res);
  },

  async cancelBooking(bookingId) {
    const res = await apiClient.post(`/bookings/${bookingId}/cancel`);
    return unwrap(res);
  },

  async checkoutBooking(bookingId, actualCheckoutTime = new Date()) {
    const res = await apiClient.post(`/bookings/${bookingId}/checkout`, {
      actual_checkout_time: toLocalDateTime(actualCheckoutTime),
    });
    return unwrap(res);
  },

  async submitReview(payload) {
    const res = await apiClient.post("/reviews", payload);
    return unwrap(res);
  },

  async getReviewsByUser() {
    const res = await apiClient.get("/reviews/me");
    return unwrap(res) || [];
  },
};
