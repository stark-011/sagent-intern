package com.parkingfinder.backend.dto.admin;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardSummaryResponse {
    private long totalUsers;
    private long totalLenders;
    private long totalSpots;
    private long pendingApprovals;
    private long activeBookings;
    private BigDecimal totalPayments;
}
