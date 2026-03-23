package com.parkingfinder.backend.dto.review;

import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {
    private String reviewId;
    private String bookingId;
    private String spotId;
    private String userId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private UserResponse user;
    private SpotResponse spot;
    private BookingResponse booking;
}
