package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.ApprovalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
@Table(name = "spot_approvals", indexes = {
    @Index(name = "idx_spot_approvals_status", columnList = "approval_status"),
    @Index(name = "idx_spot_approvals_spot", columnList = "spot_id", unique = true)
})
public class SpotApproval {

    @Id
    @Column(name = "approval_id", length = 50)
    private String approvalId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false, unique = true)
    private ParkingSpot spot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private AppUser admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 32)
    private ApprovalStatus approvalStatus;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
