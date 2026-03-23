package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.payment.CreatePaymentRequest;
import com.parkingfinder.backend.dto.payment.PaymentResponse;

/** Payment recording and retrieval for bookings. */
public interface PaymentService {

    /** Record a payment against a booking. */
    PaymentResponse createPayment(CreatePaymentRequest request);

    /** Retrieve the payment record for a booking (current user only). */
    PaymentResponse getByBookingId(String bookingId);
}
