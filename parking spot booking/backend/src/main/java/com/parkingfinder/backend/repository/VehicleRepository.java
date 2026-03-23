package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.Vehicle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {

    List<Vehicle> findByUserUserIdOrderByCreatedAtDesc(String userId);

    Optional<Vehicle> findByVehicleIdAndUserUserId(String vehicleId, String userId);
}
