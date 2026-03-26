package com.parkingfinder.backend.dto.admin;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportsSummaryResponse {
    private Map<String, Long> byRole;
    private Map<String, Long> byBookingStatus;
    private Map<String, Long> byApproval;
    private List<MonthlyAmountResponse> monthlyRevenue;
}
