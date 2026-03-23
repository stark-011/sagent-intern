package com.parkingfinder.backend.dto.parking;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotAvailabilityDto {
    private String availabilityId;
    private String spotId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private boolean isAvailable;
}
