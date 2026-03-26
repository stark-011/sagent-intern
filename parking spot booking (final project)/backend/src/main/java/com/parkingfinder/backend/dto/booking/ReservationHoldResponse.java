package com.parkingfinder.backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReservationHoldResponse {
    private String holdId;
    private String userId;
    private String slotId;
    private LocalDateTime holdStartTime;
    private LocalDateTime holdExpiryTime;
    private String holdStatus;
    private BigDecimal reservedAmount;
}
