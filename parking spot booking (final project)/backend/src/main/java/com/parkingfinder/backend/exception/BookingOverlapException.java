package com.parkingfinder.backend.exception;

import org.springframework.http.HttpStatus;

public class BookingOverlapException extends ApiException {
    public BookingOverlapException(String message) {
        super(HttpStatus.CONFLICT, "BOOKING_OVERLAP", message);
    }
}
