package com.parkingfinder.backend.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotBlank
    private String bookingId;

    @NotBlank
    private String paymentMethod;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private String transactionRef;
}
