package com.parkingfinder.backend.dto.parking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PricingRuleDto {
    private String pricingRuleId;
    private String spotId;
    private String pricingType;
    private BigDecimal baseHourlyRate;
    private BigDecimal peakHourRate;
    private LocalTime peakStartTime;
    private LocalTime peakEndTime;
    private BigDecimal specialDayRate;
    private LocalDate specialDayDate;
    private BigDecimal suggestedBaseHourlyRate;
    private BigDecimal suggestedPeakHourRate;
    private BigDecimal suggestedSpecialDayRate;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String ruleStatus;
    private String createdBy;
    private LocalDateTime createdAt;
}
