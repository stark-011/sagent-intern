package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.SpotImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotImageRepository extends JpaRepository<SpotImage, String> {

    List<SpotImage> findBySpotSpotId(String spotId);

    void deleteBySpotSpotId(String spotId);
}
