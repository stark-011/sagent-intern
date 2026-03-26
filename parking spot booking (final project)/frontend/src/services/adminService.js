import apiClient from "./apiClient";
import { unwrap, toOptionalNumber } from "./apiHelpers";

const normalizeDashboardSummary = (summary) => {
  const source = summary || {};
  return {
    totalUsers: source.totalUsers ?? source.total_users ?? 0,
    totalLenders: source.totalLenders ?? source.total_lenders ?? 0,
    totalSpots: source.totalSpots ?? source.total_spots ?? 0,
    pendingApprovals: source.pendingApprovals ?? source.pending_approvals ?? 0,
    activeBookings: source.activeBookings ?? source.active_bookings ?? 0,
    totalPayments: source.totalPayments ?? source.total_payments ?? 0,
  };
};

const normalizeSpot = (spot) => {
  if (!spot) return spot;
  return {
    ...spot,
    approval: spot.approval || spot.approval_details,
  };
};

const normalizeReportsSummary = (summary = {}) => ({
  by_role: summary.by_role ?? summary.byRole ?? {},
  by_booking_status: summary.by_booking_status ?? summary.byBookingStatus ?? {},
  by_approval: summary.by_approval ?? summary.byApproval ?? {},
  monthly_revenue: summary.monthly_revenue ?? summary.monthlyRevenue ?? [],
});

export const adminService = {
  async getDashboardSummary() {
    const res = await apiClient.get("/admin/dashboard");
    return normalizeDashboardSummary(unwrap(res));
  },

  async getPendingApprovals() {
    const res = await apiClient.get("/admin/approvals/pending");
    const rows = unwrap(res) || [];
    return rows.map((row) => ({
      ...row,
      spot: normalizeSpot(row.spot),
    }));
  },

  async getApprovalBySpotId(spotId) {
    const res = await apiClient.get(`/admin/approvals/${spotId}`);
    return normalizeSpot(unwrap(res));
  },

  async approveSpot(spotId, _adminId, pricingPayload = {}) {
    const body = {
      base_hourly_rate: Number(pricingPayload.base_hourly_rate || 0),
      peak_hour_rate: Number(pricingPayload.peak_hour_rate || pricingPayload.base_hourly_rate || 0),
      special_day_rate: Number(pricingPayload.special_day_rate || pricingPayload.base_hourly_rate || 0),
      effective_from: pricingPayload.effective_from,
      effective_to: pricingPayload.effective_to,
    };
    const res = await apiClient.post(`/admin/approvals/${spotId}/approve`, body);
    return unwrap(res);
  },

  async rejectSpot(spotId, _adminId, reason) {
    const res = await apiClient.post(`/admin/approvals/${spotId}/reject`, { reason });
    return unwrap(res);
  },

  async getAllSpots(filters = {}) {
    const res = await apiClient.get("/admin/spots", {
      params: {
        city: filters.city || undefined,
        status: filters.status || undefined,
        approval_status: filters.approval_status || undefined,
      },
    });
    return (unwrap(res) || []).map(normalizeSpot);
  },

  async updateSpotStatus(spotId, spotStatus) {
    const res = await apiClient.patch(`/admin/spots/${spotId}/status`, {
      spot_status: spotStatus,
    });
    return normalizeSpot(unwrap(res));
  },

  async updateSpotDevice(spotId, deviceOpen) {
    const res = await apiClient.patch(`/admin/spots/${spotId}/device`, {
      device_open: Boolean(deviceOpen),
    });
    return normalizeSpot(unwrap(res));
  },

  async getUsers(filters = {}) {
    const res = await apiClient.get("/admin/users", {
      params: {
        role: filters.role || undefined,
        status: filters.status || undefined,
      },
    });
    return unwrap(res) || [];
  },

  async updateUserStatus(userId, accountStatus) {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, {
      account_status: accountStatus,
    });
    return unwrap(res);
  },

  async getPricingRules() {
    const res = await apiClient.get("/admin/pricing-rules");
    return unwrap(res) || [];
  },

  async createPricingRule(payload) {
    const body = {
      spot_id: payload.spot_id,
      pricing_type: payload.pricing_type || "hourly",
      base_hourly_rate: Number(payload.base_hourly_rate || 0),
      peak_hour_rate: toOptionalNumber(payload.peak_hour_rate),
      peak_start_time: payload.peak_start_time || null,
      peak_end_time: payload.peak_end_time || null,
      special_day_rate: toOptionalNumber(payload.special_day_rate),
      special_day_date: payload.special_day_date || null,
      effective_from: payload.effective_from,
      effective_to: payload.effective_to,
    };
    const res = await apiClient.post("/admin/pricing-rules", body);
    return unwrap(res);
  },

  async togglePricingRule(ruleId) {
    const res = await apiClient.patch(`/admin/pricing-rules/${ruleId}/toggle`);
    return unwrap(res);
  },

  async getReportsSummary() {
    const res = await apiClient.get("/admin/reports");
    return normalizeReportsSummary(unwrap(res) || {});
  },
};
