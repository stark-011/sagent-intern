package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.payment.CreatePaymentRequest;
import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.Payment;
import com.parkingfinder.backend.enums.PaymentMethod;
import com.parkingfinder.backend.enums.PaymentStatus;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.PaymentMapper;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.service.PaymentService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        Payment payment = paymentRepository.findByBookingBookingId(request.getBookingId())
            .orElseGet(() -> Payment.builder()
                .paymentId(IdGenerator.generate("pay"))
                .booking(booking)
                .build());

        payment.setPaymentMethod(PaymentMethod.fromValue(request.getPaymentMethod()));
        payment.setAmountPaid(request.getAmount());
        payment.setTransactionRef(request.getTransactionRef());
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        return paymentMapper.toDto(payment);
    }

    @Override
    public PaymentResponse getByBookingId(String bookingId) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        Payment payment = paymentRepository.findByBookingBookingId(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return paymentMapper.toDto(payment);
    }
}
