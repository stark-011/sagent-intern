package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.HoldStatus;
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
import java.math.BigDecimal;
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
@Table(name = "reservation_holds", indexes = {
    @Index(name = "idx_holds_spot_status", columnList = "spot_id,hold_status"),
    @Index(name = "idx_holds_expiry", columnList = "hold_expiry_time")
})
public class ReservationHold {

    @Id
    @Column(name = "hold_id", length = 50)
    private String holdId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @Column(name = "slot_id", nullable = false, length = 50)
    private String slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "hold_start_time", nullable = false)
    private LocalDateTime holdStartTime;

    @Column(name = "hold_expiry_time", nullable = false)
    private LocalDateTime holdExpiryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "hold_status", nullable = false, length = 32)
    private HoldStatus holdStatus;

    @Column(name = "reserved_amount", precision = 12, scale = 2)
    private BigDecimal reservedAmount;
}
