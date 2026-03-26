package com.parkingfinder.backend.dto.parking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotCreateRequest {

    @NotBlank
    private String spotTitle;

    @NotBlank
    private String description;

    @NotBlank
    private String addressLine;

    @NotBlank
    private String locality;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;

    @NotNull
    private List<String> vehicleTypeAllowed;

    @Positive
    private Integer totalSlots;

    @NotBlank
    private String spotType;

    private String imageUrl;

    private String dayOfWeek;

    private String startTime;

    private String endTime;

    private String pricingType;

    @PositiveOrZero
    private BigDecimal baseHourlyRate;

    @PositiveOrZero
    private BigDecimal peakHourRate;

    @PositiveOrZero
    private BigDecimal specialDayRate;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}
