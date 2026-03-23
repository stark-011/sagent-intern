package com.parkingfinder.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmBookingRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String spotId;

    @NotBlank
    private String slotId;

    @NotBlank
    private String vehicleId;

    private LocalDateTime bookedStartTime;

    private LocalDateTime bookedEndTime;
}
