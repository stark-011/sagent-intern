package com.parkingfinder.backend.dto.parking;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotAvailabilityRequest {
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private boolean isAvailable;
}
