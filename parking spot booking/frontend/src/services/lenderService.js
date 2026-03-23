import apiClient from "./apiClient";
import { unwrap } from "./apiHelpers";


const normalizeDashboardSummary = (summary) => {
  const source = summary || {};
  return {
    totalSpots: source.totalSpots ?? source.total_spots ?? 0,
    activeSpots: source.activeSpots ?? source.active_spots ?? 0,
    pendingApprovals: source.pendingApprovals ?? source.pending_approvals ?? 0,
    totalBookings: source.totalBookings ?? source.total_bookings ?? 0,
    totalEarnings: source.totalEarnings ?? source.total_earnings ?? 0,
    latestBookings: source.latestBookings ?? source.latest_bookings ?? [],
  };
};

export const lenderService = {
  async getDashboardSummary() {
    const res = await apiClient.get("/lender/dashboard");
    return normalizeDashboardSummary(unwrap(res));
  },

  async getSpots() {
    const res = await apiClient.get("/lender/spots");
    return unwrap(res) || [];
  },

  async getBookings(_lenderId, filters = {}) {
    const res = await apiClient.get("/lender/bookings", {
      params: {
        status: filters.status || undefined,
        date: filters.date || undefined,
        spotId: filters.spotId || undefined,
      },
    });
    return unwrap(res) || [];
  },

  async getEarningsSummary() {
    const res = await apiClient.get("/lender/earnings");
    return unwrap(res);
  },
};
