package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.admin.AdminDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.AdminUserRowResponse;
import com.parkingfinder.backend.dto.admin.ApproveSpotRequest;
import com.parkingfinder.backend.dto.admin.PendingApprovalResponse;
import com.parkingfinder.backend.dto.admin.RejectSpotRequest;
import com.parkingfinder.backend.dto.admin.ReportsSummaryResponse;
import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.PricingRuleRequest;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import java.util.List;

/**
 * Administrative operations: dashboard metrics, user management,
 * spot approvals, pricing rules, and platform reports.
 */
public interface AdminService {

    /** Platform-wide dashboard summary (user counts, active bookings, total payments). */
    AdminDashboardSummaryResponse getDashboardSummary();

    /** All spot-approval requests that are still pending review. */
    List<PendingApprovalResponse> getPendingApprovals();

    /** Full spot details for a specific approval review. */
    SpotResponse getApprovalBySpotId(String spotId);

    /** Approve a spot and optionally set admin-defined pricing. */
    void approveSpot(String spotId, ApproveSpotRequest request);

    /** Reject a spot with a reason visible to the lender. */
    void rejectSpot(String spotId, RejectSpotRequest request);

    /** List all spots, optionally filtered by city, status, or approval status. */
    List<SpotResponse> getAllSpots(String city, String status, String approvalStatus);

    /** Toggle a spot's operational status (e.g. active ↔ inactive). */
    SpotResponse updateSpotStatus(String spotId, String spotStatus);

    /** Remotely open/close the device gate associated with a spot. */
    SpotResponse updateSpotDevice(String spotId, boolean deviceOpen);

    /** List all users, optionally filtered by role and/or account status. */
    List<AdminUserRowResponse> getUsers(String role, String status);

    /** Activate, suspend, or block a user account. */
    AdminUserRowResponse updateUserStatus(String userId, String accountStatus);

    /** All pricing rules across every spot. */
    List<PricingRuleDto> getPricingRules();

    /** Create a new pricing rule for a specific spot. */
    PricingRuleDto createPricingRule(PricingRuleRequest request);

    /** Enable or disable an existing pricing rule. */
    PricingRuleDto togglePricingRule(String ruleId);

    /** Aggregated reports: users by role, bookings by status, monthly revenue. */
    ReportsSummaryResponse getReportsSummary();
}
