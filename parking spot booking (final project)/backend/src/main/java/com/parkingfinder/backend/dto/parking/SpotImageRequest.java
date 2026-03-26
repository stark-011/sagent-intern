package com.parkingfinder.backend.dto.parking;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpotImageRequest {

    @NotBlank
    private String imageUrl;

    private String imageCaption;

    private boolean isPrimary;
}
