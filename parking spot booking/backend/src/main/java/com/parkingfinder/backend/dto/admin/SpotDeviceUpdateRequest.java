package com.parkingfinder.backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotDeviceUpdateRequest {

    @NotNull
    private Boolean deviceOpen;
}
