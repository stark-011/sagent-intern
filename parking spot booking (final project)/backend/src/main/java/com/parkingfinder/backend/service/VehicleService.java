package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.vehicle.VehicleRequest;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import java.util.List;

/** CRUD operations for the current driver's vehicles. */
public interface VehicleService {

    /** All vehicles for the current user (newest first). */
    List<VehicleResponse> getMyVehicles();

    /** Single vehicle by ID (must belong to current user). */
    VehicleResponse getMyVehicleById(String vehicleId);

    /** Register a new vehicle under the current user. */
    VehicleResponse createVehicle(VehicleRequest request);

    /** Update vehicle details; handles default-vehicle toggling. */
    VehicleResponse updateVehicle(String vehicleId, VehicleRequest request);

    /** Permanently delete a vehicle. */
    void deleteVehicle(String vehicleId);
}
