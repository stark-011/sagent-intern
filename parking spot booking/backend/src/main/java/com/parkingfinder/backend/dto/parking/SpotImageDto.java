package com.parkingfinder.backend.dto.parking;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotImageDto {
    private String imageId;
    private String spotId;
    private String imageUrl;
    private String imageCaption;
    private boolean isPrimary;
    private LocalDateTime uploadedAt;
}
