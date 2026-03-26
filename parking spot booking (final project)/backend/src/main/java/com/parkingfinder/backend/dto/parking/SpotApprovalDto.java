package com.parkingfinder.backend.dto.parking;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotApprovalDto {
    private String approvalId;
    private String spotId;
    private String adminId;
    private String approvalStatus;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
