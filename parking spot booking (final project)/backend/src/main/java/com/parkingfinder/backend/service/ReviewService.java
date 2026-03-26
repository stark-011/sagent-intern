package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.review.CreateReviewRequest;
import com.parkingfinder.backend.dto.review.ReviewResponse;
import java.util.List;

/** Reviews submitted by drivers after completed bookings. */
public interface ReviewService {

    /** Submit a review for a completed or overstay booking. */
    ReviewResponse createReview(CreateReviewRequest request);

    /** All reviews for a specific spot (public, newest first). */
    List<ReviewResponse> getReviewsBySpot(String spotId);

    /** All reviews written by the current user. */
    List<ReviewResponse> getMyReviews();
}
