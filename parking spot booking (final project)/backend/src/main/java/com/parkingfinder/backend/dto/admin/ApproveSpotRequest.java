package com.parkingfinder.backend.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApproveSpotRequest {

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal baseHourlyRate;

    @DecimalMin(value = "0.0")
    private BigDecimal peakHourRate;

    @DecimalMin(value = "0.0")
    private BigDecimal specialDayRate;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}
