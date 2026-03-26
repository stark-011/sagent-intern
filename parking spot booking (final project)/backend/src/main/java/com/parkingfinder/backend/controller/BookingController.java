package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.booking.BookingHistoryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.booking.CheckoutRequest;
import com.parkingfinder.backend.dto.booking.ConfirmBookingRequest;
import com.parkingfinder.backend.dto.booking.CreateReservationHoldRequest;
import com.parkingfinder.backend.dto.booking.ReservationHoldResponse;
import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/holds")
    public ResponseEntity<ApiResponse<ReservationHoldResponse>> createHold(
        @Valid @RequestBody CreateReservationHoldRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Reservation hold created", bookingService.createReservationHold(request)));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(@Valid @RequestBody ConfirmBookingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Booking confirmed", bookingService.confirmBooking(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> myBookings() {
        return ResponseEntity.ok(ApiResponse.ok("Bookings fetched", bookingService.getMyBookings()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking fetched", bookingService.getBookingById(id)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled", bookingService.cancelBooking(id)));
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<BookingResponse>> checkoutBooking(
        @PathVariable("id") String id,
        @RequestBody(required = false) CheckoutRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Booking checked out", bookingService.checkoutBooking(id, request)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<BookingHistoryResponse>>> history(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking history fetched", bookingService.getBookingHistory(id)));
    }
}
