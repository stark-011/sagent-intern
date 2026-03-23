package com.parkingfinder.backend.dto.parking;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotBookedWindowDto {
    private String bookingId;
    private String slotId;
    private LocalDateTime bookedStartTime;
    private LocalDateTime bookedEndTime;
    private Integer bufferMinutes;
    private LocalDateTime bufferEndTime;
    private LocalDateTime blockedUntilTime;
    private String bookingStatus;
}
