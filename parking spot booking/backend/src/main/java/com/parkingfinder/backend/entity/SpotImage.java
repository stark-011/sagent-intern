package com.parkingfinder.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "spot_images", indexes = {
    @Index(name = "idx_spot_images_spot", columnList = "spot_id")
})
public class SpotImage {

    @Id
    @Column(name = "image_id", length = 50)
    private String imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @Column(name = "image_url", nullable = false, length = 400)
    private String imageUrl;

    @Column(name = "image_caption", length = 180)
    private String imageCaption;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}
