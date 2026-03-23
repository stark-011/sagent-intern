package com.parkingfinder.backend.dto.vehicle;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VehicleResponse {
    private String vehicleId;
    private String userId;
    private String vehicleName;
    private String vehicleNumber;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;
    private boolean isDefault;
    private LocalDateTime createdAt;
}
