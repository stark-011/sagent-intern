package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.BookingStatus;
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
import java.time.LocalDate;
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
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_user", columnList = "user_id"),
    @Index(name = "idx_bookings_spot_time", columnList = "spot_id,booked_start_time,booked_end_time"),
    @Index(name = "idx_bookings_status", columnList = "booking_status")
})
public class Booking {

    @Id
    @Column(name = "booking_id", length = 50)
    private String bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @Column(name = "slot_id", nullable = false, length = 50)
    private String slotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_rule_id")
    private PricingRule pricingRule;

    @Column(name = "booking_code", nullable = false, length = 40, unique = true)
    private String bookingCode;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booked_start_time", nullable = false)
    private LocalDateTime bookedStartTime;

    @Column(name = "booked_end_time", nullable = false)
    private LocalDateTime bookedEndTime;

    @Column(name = "buffer_minutes", nullable = false)
    private Integer bufferMinutes;

    @Column(name = "buffer_end_time", nullable = false)
    private LocalDateTime bufferEndTime;

    @Column(name = "actual_checkout_time")
    private LocalDateTime actualCheckoutTime;

    @Column(name = "booked_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal bookedAmount;

    @Column(name = "late_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal lateFee;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 32)
    private BookingStatus bookingStatus;

    @Column(name = "location_tag", length = 120)
    private String locationTag;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
