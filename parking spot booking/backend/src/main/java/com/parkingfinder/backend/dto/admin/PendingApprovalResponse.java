package com.parkingfinder.backend.dto.admin;

import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotApprovalDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingApprovalResponse {
    private String approvalId;
    private SpotResponse spot;
    private UserResponse lender;
    private PricingRuleDto pricing;
    private String approvalStatus;
    private String rejectionReason;
    private String submittedAt;
    private String reviewedAt;
    private SpotApprovalDto approval;
}
