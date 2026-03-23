package com.parkingfinder.backend.dto.parking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotUpdateRequest {
    private String spotTitle;
    private String description;
    private String addressLine;
    private String locality;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> vehicleTypeAllowed;
    private Integer totalSlots;
    private String spotType;
    private String imageUrl;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private Boolean isAvailable;
    private BigDecimal baseHourlyRate;
    private BigDecimal peakHourRate;
    private BigDecimal specialDayRate;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String pricingType;
}
