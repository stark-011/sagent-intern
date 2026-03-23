package com.parkingfinder.backend.dto.admin;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LenderEarningsSummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal completedRevenue;
    private BigDecimal pendingPayout;
    private List<MonthlyAmountResponse> payouts;
}
