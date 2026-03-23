package com.parkingfinder.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectSpotRequest {

    @NotBlank
    private String reason;
}
