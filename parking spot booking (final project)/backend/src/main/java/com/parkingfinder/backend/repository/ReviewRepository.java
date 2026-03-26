package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findBySpotSpotIdOrderByCreatedAtDesc(String spotId);

    List<Review> findByUserUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByBookingBookingId(String bookingId);

    void deleteBySpotSpotId(String spotId);
}
