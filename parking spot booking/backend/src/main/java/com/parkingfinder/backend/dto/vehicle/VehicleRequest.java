package com.parkingfinder.backend.dto.vehicle;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleRequest {

    @NotBlank(message = "Vehicle name is required")
    private String vehicleName;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    private String brand;

    private String model;

    private String color;

    private Boolean isDefault;
}
