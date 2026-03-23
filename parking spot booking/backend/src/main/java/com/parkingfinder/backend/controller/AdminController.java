package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.admin.AdminDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.AdminUserRowResponse;
import com.parkingfinder.backend.dto.admin.ApproveSpotRequest;
import com.parkingfinder.backend.dto.admin.PendingApprovalResponse;
import com.parkingfinder.backend.dto.admin.RejectSpotRequest;
import com.parkingfinder.backend.dto.admin.ReportsSummaryResponse;
import com.parkingfinder.backend.dto.admin.SpotDeviceUpdateRequest;
import com.parkingfinder.backend.dto.admin.SpotStatusUpdateRequest;
import com.parkingfinder.backend.dto.admin.UserStatusUpdateRequest;
import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.PricingRuleRequest;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard fetched", adminService.getDashboardSummary()));
    }

    @GetMapping("/approvals/pending")
    public ResponseEntity<ApiResponse<List<PendingApprovalResponse>>> pendingApprovals() {
        return ResponseEntity.ok(ApiResponse.ok("Pending approvals fetched", adminService.getPendingApprovals()));
    }

    @GetMapping("/approvals/{spotId}")
    public ResponseEntity<ApiResponse<SpotResponse>> approvalDetail(@PathVariable String spotId) {
        return ResponseEntity.ok(ApiResponse.ok("Approval detail fetched", adminService.getApprovalBySpotId(spotId)));
    }

    @PostMapping("/approvals/{spotId}/approve")
    public ResponseEntity<ApiResponse<String>> approveSpot(@PathVariable String spotId, @Valid @RequestBody ApproveSpotRequest request) {
        adminService.approveSpot(spotId, request);
        return ResponseEntity.ok(ApiResponse.ok("Spot approved", "OK"));
    }

    @PostMapping("/approvals/{spotId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectSpot(@PathVariable String spotId, @Valid @RequestBody RejectSpotRequest request) {
        adminService.rejectSpot(spotId, request);
        return ResponseEntity.ok(ApiResponse.ok("Spot rejected", "OK"));
    }

    @GetMapping("/spots")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> allSpots(
        @RequestParam(name = "city", required = false) String city,
        @RequestParam(name = "status", required = false) String status,
        @RequestParam(name = "approval_status", required = false) String approvalStatus
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Spots fetched", adminService.getAllSpots(city, status, approvalStatus)));
    }

    @PatchMapping("/spots/{spotId}/status")
    public ResponseEntity<ApiResponse<SpotResponse>> updateSpotStatus(
        @PathVariable String spotId,
        @Valid @RequestBody SpotStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            "Spot status updated",
            adminService.updateSpotStatus(spotId, request.getSpotStatus())
        ));
    }

    @PatchMapping("/spots/{spotId}/device")
    public ResponseEntity<ApiResponse<SpotResponse>> updateSpotDevice(
        @PathVariable String spotId,
        @Valid @RequestBody SpotDeviceUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            "Spot device updated",
            adminService.updateSpotDevice(spotId, request.getDeviceOpen())
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserRowResponse>>> users(
        @RequestParam(name = "role", required = false) String role,
        @RequestParam(name = "status", required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", adminService.getUsers(role, status)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<AdminUserRowResponse>> updateUserStatus(
        @PathVariable String userId,
        @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            "User status updated",
            adminService.updateUserStatus(userId, request.getAccountStatus())
        ));
    }

    @GetMapping("/pricing-rules")
    public ResponseEntity<ApiResponse<List<PricingRuleDto>>> pricingRules() {
        return ResponseEntity.ok(ApiResponse.ok("Pricing rules fetched", adminService.getPricingRules()));
    }

    @PostMapping("/pricing-rules")
    public ResponseEntity<ApiResponse<PricingRuleDto>> createPricingRule(@Valid @RequestBody PricingRuleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Pricing rule created", adminService.createPricingRule(request)));
    }

    @PatchMapping("/pricing-rules/{ruleId}/toggle")
    public ResponseEntity<ApiResponse<PricingRuleDto>> togglePricingRule(@PathVariable String ruleId) {
        return ResponseEntity.ok(ApiResponse.ok("Pricing rule status updated", adminService.togglePricingRule(ruleId)));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<ReportsSummaryResponse>> reports() {
        return ResponseEntity.ok(ApiResponse.ok("Reports summary fetched", adminService.getReportsSummary()));
    }
}
