package com.parkingfinder.backend.dto.parking;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PricingRuleRequest {

    @NotBlank
    private String spotId;

    @NotBlank
    private String pricingType;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal baseHourlyRate;

    @DecimalMin(value = "0.0")
    private BigDecimal peakHourRate;

    private String peakStartTime;

    private String peakEndTime;

    @DecimalMin(value = "0.0")
    private BigDecimal specialDayRate;

    private LocalDate specialDayDate;

    @NotNull
    private LocalDate effectiveFrom;

    @NotNull
    private LocalDate effectiveTo;
}
