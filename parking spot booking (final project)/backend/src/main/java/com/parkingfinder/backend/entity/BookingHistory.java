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
@Table(name = "booking_history", indexes = {
    @Index(name = "idx_booking_history_booking", columnList = "booking_id")
})
public class BookingHistory {

    @Id
    @Column(name = "history_id", length = 50)
    private String historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 32)
    private BookingStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 32)
    private BookingStatus newStatus;

    @Column(name = "changed_by", length = 50)
    private String changedBy;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
}
