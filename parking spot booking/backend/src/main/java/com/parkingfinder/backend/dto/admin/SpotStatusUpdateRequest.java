package com.parkingfinder.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotStatusUpdateRequest {

    @NotBlank
    private String spotStatus;
}
