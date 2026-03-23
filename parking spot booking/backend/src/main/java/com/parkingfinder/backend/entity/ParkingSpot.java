package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.converter.VehicleTypeSetConverter;
import com.parkingfinder.backend.enums.SlotStatus;
import com.parkingfinder.backend.enums.SpotStatus;
import com.parkingfinder.backend.enums.SpotType;
import com.parkingfinder.backend.enums.VehicleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Convert;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
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
@Table(name = "parking_spots", indexes = {
    @Index(name = "idx_spots_lender", columnList = "lender_id"),
    @Index(name = "idx_spots_city", columnList = "city"),
    @Index(name = "idx_spots_locality", columnList = "locality"),
    @Index(name = "idx_spots_status", columnList = "spot_status"),
    @Index(name = "idx_spots_slot_id", columnList = "slot_id")
})
public class ParkingSpot {

    @Id
    @Column(name = "spot_id", length = 50)
    private String spotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lender_id", nullable = false)
    private AppUser lender;

    @Column(name = "spot_title", nullable = false, length = 180)
    private String spotTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    @Column(name = "locality", nullable = false, length = 120)
    private String locality;

    @Column(name = "city", nullable = false, length = 120)
    private String city;

    @Column(name = "state", nullable = false, length = 120)
    private String state;

    @Column(name = "pincode", nullable = false, length = 20)
    private String pincode;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 6)
    private BigDecimal longitude;

    @Convert(converter = VehicleTypeSetConverter.class)
    @Column(name = "vehicle_types", length = 255)
    @Builder.Default
    private Set<VehicleType> vehicleTypeAllowed = new HashSet<>();

    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;

    @Column(name = "slot_id", nullable = false, length = 50, unique = true)
    private String slotId;

    @Column(name = "slot_code", nullable = false, length = 40)
    private String slotCode;

    @Column(name = "slot_label", length = 80)
    private String slotLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false, length = 32)
    private SlotStatus slotStatus;

    @Column(name = "is_device_open", nullable = false)
    private boolean deviceOpen;

    @Enumerated(EnumType.STRING)
    @Column(name = "spot_type", nullable = false, length = 32)
    private SpotType spotType;

    @Enumerated(EnumType.STRING)
    @Column(name = "spot_status", nullable = false, length = 32)
    private SpotStatus spotStatus;

    @Column(name = "distance_km", precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
