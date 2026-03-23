package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import com.parkingfinder.backend.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public VehicleResponse toDto(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        return VehicleResponse.builder()
            .vehicleId(vehicle.getVehicleId())
            .userId(vehicle.getUser().getUserId())
            .vehicleName(vehicle.getVehicleName())
            .vehicleNumber(vehicle.getVehicleNumber())
            .vehicleType(vehicle.getVehicleType().getValue())
            .brand(vehicle.getBrand())
            .model(vehicle.getModel())
            .color(vehicle.getColor())
            .isDefault(vehicle.isDefault())
            .createdAt(vehicle.getCreatedAt())
            .build();
    }
}
