package com.parkingfinder.backend.dto.admin;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyAmountResponse {
    private String month;
    private BigDecimal amount;
}
