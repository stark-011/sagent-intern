package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.ParkingSpot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, String> {

    List<ParkingSpot> findByLenderUserIdOrderByCreatedAtDesc(String lenderId);

    Optional<ParkingSpot> findBySpotIdAndLenderUserId(String spotId, String lenderId);

    boolean existsByLenderUserId(String lenderId);

    @Query("""
        select count(distinct lower(trim(ps.city)))
        from ParkingSpot ps
        where ps.city is not null and trim(ps.city) <> ''
        """)
    long countDistinctCities();
}
