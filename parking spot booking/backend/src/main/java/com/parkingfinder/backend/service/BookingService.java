package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.booking.BookingHistoryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.booking.CheckoutRequest;
import com.parkingfinder.backend.dto.booking.ConfirmBookingRequest;
import com.parkingfinder.backend.dto.booking.CreateReservationHoldRequest;
import com.parkingfinder.backend.dto.booking.ReservationHoldResponse;
import java.util.List;

/**
 * Booking lifecycle management: reservation holds, confirmation, cancellation,
 * checkout, and audit history.
 */
public interface BookingService {

    /** Create a short-lived reservation hold on a slot (10-minute expiry). */
    ReservationHoldResponse createReservationHold(CreateReservationHoldRequest request);

    /** Confirm and pay for a booking (wallet debit + payment record). */
    BookingResponse confirmBooking(ConfirmBookingRequest request);

    /** List all bookings for the currently-authenticated driver. */
    List<BookingResponse> getMyBookings();

    /** Get a single booking by ID (must belong to current user). */
    BookingResponse getBookingById(String bookingId);

    /** Cancel an upcoming or active booking and refund the wallet. */
    BookingResponse cancelBooking(String bookingId);

    /** Check out from a booking; calculates late fees if applicable. */
    BookingResponse checkoutBooking(String bookingId, CheckoutRequest request);

    /** Full status-change audit trail for a booking. */
    List<BookingHistoryResponse> getBookingHistory(String bookingId);
}
