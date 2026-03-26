package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toDto(Payment payment) {
        if (payment == null) {
            return null;
        }
        return PaymentResponse.builder()
            .paymentId(payment.getPaymentId())
            .bookingId(payment.getBooking().getBookingId())
            .paymentMethod(payment.getPaymentMethod().getValue())
            .amount(payment.getAmountPaid())
            .paymentStatus(payment.getPaymentStatus().getValue())
            .transactionRef(payment.getTransactionRef())
            .paidAt(payment.getPaidAt())
            .build();
    }
}
