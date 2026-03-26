package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.review.ReviewResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toDto(Review review, UserResponse user, SpotResponse spot, BookingResponse booking) {
        return ReviewResponse.builder()
            .reviewId(review.getReviewId())
            .bookingId(review.getBooking().getBookingId())
            .spotId(review.getSpot().getSpotId())
            .userId(review.getUser().getUserId())
            .rating(review.getRating())
            .comment(review.getReviewText())
            .createdAt(review.getCreatedAt())
            .user(user)
            .spot(spot)
            .booking(booking)
            .build();
    }
}
