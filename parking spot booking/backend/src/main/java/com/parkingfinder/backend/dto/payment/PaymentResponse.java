package com.parkingfinder.backend.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
    private String paymentId;
    private String bookingId;
    private String paymentMethod;
    private BigDecimal amount;
    private String paymentStatus;
    private String transactionRef;
    private LocalDateTime paidAt;
}
