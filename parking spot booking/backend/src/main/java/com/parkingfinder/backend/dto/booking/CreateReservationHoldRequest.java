package com.parkingfinder.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReservationHoldRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String spotId;

    @NotBlank
    private String slotId;
}
