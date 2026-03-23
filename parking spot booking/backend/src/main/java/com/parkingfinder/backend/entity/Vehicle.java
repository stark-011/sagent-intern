package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.VehicleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicles_user", columnList = "user_id"),
    @Index(name = "idx_vehicles_number", columnList = "vehicle_number")
})
public class Vehicle {

    @Id
    @Column(name = "vehicle_id", length = 50)
    private String vehicleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "vehicle_name", nullable = false, length = 120)
    private String vehicleName;

    @Column(name = "vehicle_number", nullable = false, length = 40)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 32)
    private VehicleType vehicleType;

    @Column(name = "brand", length = 80)
    private String brand;

    @Column(name = "model", length = 80)
    private String model;

    @Column(name = "color", length = 60)
    private String color;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
