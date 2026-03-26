package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.SpotAvailability;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotAvailabilityRepository extends JpaRepository<SpotAvailability, String> {

    List<SpotAvailability> findBySpotSpotId(String spotId);

    void deleteBySpotSpotId(String spotId);
}
