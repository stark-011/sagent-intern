package com.parkingfinder.backend.dto.parking;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotSlotDto {
    private String slotId;
    private String spotId;
    private String slotCode;
    private String slotLabel;
    private String slotStatus;
    private boolean deviceOpen;
}
