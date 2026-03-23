package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.review.CreateReviewRequest;
import com.parkingfinder.backend.dto.review.ReviewResponse;
import com.parkingfinder.backend.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Review submitted", reviewService.createReview(request)));
    }

    @GetMapping("/spot/{spotId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> bySpot(@PathVariable String spotId) {
        return ResponseEntity.ok(ApiResponse.ok("Spot reviews fetched", reviewService.getReviewsBySpot(spotId)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> myReviews() {
        return ResponseEntity.ok(ApiResponse.ok("My reviews fetched", reviewService.getMyReviews()));
    }
}
