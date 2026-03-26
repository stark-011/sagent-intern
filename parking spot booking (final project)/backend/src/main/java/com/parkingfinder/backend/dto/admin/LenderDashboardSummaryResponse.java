package com.parkingfinder.backend.dto.admin;

import com.parkingfinder.backend.dto.booking.BookingResponse;
import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LenderDashboardSummaryResponse {
    private long totalSpots;
    private long activeSpots;
    private long pendingApprovals;
    private long totalBookings;
    private BigDecimal totalEarnings;
    private List<BookingResponse> latestBookings;
}
