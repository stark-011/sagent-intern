package com.parkingfinder.backend.dto.parking;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicStatsResponse {
    private long totalSpots;
    private long activeDrivers;
    private long totalLenders;
    private long totalCities;
}
