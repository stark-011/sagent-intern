package com.parkingfinder.backend.dto.booking;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingHistoryResponse {
    private String historyId;
    private String bookingId;
    private String status;
    private String oldStatus;
    private String newStatus;
    private String changedBy;
    private String note;
    private LocalDateTime changedAt;
}
