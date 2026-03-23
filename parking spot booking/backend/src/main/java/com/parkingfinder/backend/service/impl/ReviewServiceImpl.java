package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.review.CreateReviewRequest;
import com.parkingfinder.backend.dto.review.ReviewResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.Review;
import com.parkingfinder.backend.enums.BookingStatus;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.ConflictException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.ReviewMapper;
import com.parkingfinder.backend.mapper.UserMapper;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.ReviewRepository;
import com.parkingfinder.backend.service.ReviewService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ReviewMapper reviewMapper;
    private final UserMapper userMapper;
    private final BookingServiceImpl bookingService;
    private final ParkingServiceImpl parkingService;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        if (request.getUserId() != null && !request.getUserId().isBlank() && !request.getUserId().equals(userId)) {
            throw new BadRequestException("User mismatch in review request");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        if (booking.getBookingStatus() != BookingStatus.COMPLETED
            && booking.getBookingStatus() != BookingStatus.OVERSTAY) {
            throw new BadRequestException("Review can only be submitted for completed or overstay bookings");
        }

        if (reviewRepository.existsByBookingBookingId(request.getBookingId())) {
            throw new ConflictException("Review already submitted for this booking");
        }

        Review review = Review.builder()
            .reviewId(IdGenerator.generate("rev"))
            .booking(booking)
            .spot(booking.getSpot())
            .user(booking.getUser())
            .rating(request.getRating())
            .reviewText(request.getComment())
            .createdAt(LocalDateTime.now())
            .build();
        reviewRepository.save(review);

        UserResponse user = userMapper.toDto(review.getUser());
        SpotResponse spot = parkingService.toFullSpot(review.getSpot());
        BookingResponse bookingResponse = bookingService.getBookingById(booking.getBookingId());
        return reviewMapper.toDto(review, user, spot, bookingResponse);
    }

    @Override
    public List<ReviewResponse> getReviewsBySpot(String spotId) {
        return reviewRepository.findBySpotSpotIdOrderByCreatedAtDesc(spotId)
            .stream()
            .map(review -> reviewMapper.toDto(
                review,
                userMapper.toDto(review.getUser()),
                parkingService.toFullSpot(review.getSpot()),
                null
            ))
            .toList();
    }

    @Override
    public List<ReviewResponse> getMyReviews() {
        String userId = SecurityUtils.getCurrentUserId();
        return reviewRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(review -> {
                BookingResponse booking = bookingService.getBookingById(review.getBooking().getBookingId());
                SpotResponse spot = parkingService.toFullSpot(review.getSpot());
                return reviewMapper.toDto(review, userMapper.toDto(review.getUser()), spot, booking);
            })
            .toList();
    }
}
