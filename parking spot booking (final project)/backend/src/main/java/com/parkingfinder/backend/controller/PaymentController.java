package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.payment.CreatePaymentRequest;
import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded", paymentService.createPayment(request)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(ApiResponse.ok("Payment fetched", paymentService.getByBookingId(bookingId)));
    }
}
