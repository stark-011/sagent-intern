package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.PricingType;
import com.parkingfinder.backend.enums.RuleStatus;
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
import java.time.LocalTime;
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
@Table(name = "pricing_rules", indexes = {
    @Index(name = "idx_pricing_spot", columnList = "spot_id"),
    @Index(name = "idx_pricing_status", columnList = "rule_status")
})
public class PricingRule {

    @Id
    @Column(name = "pricing_rule_id", length = 50)
    private String pricingRuleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot spot;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false, length = 32)
    private PricingType pricingType;

    @Column(name = "base_hourly_rate", precision = 12, scale = 2)
    private BigDecimal baseHourlyRate;

    @Column(name = "peak_hour_rate", precision = 12, scale = 2)
    private BigDecimal peakHourRate;

    @Column(name = "peak_start_time")
    private LocalTime peakStartTime;

    @Column(name = "peak_end_time")
    private LocalTime peakEndTime;

    @Column(name = "special_day_rate", precision = 12, scale = 2)
    private BigDecimal specialDayRate;

    @Column(name = "special_day_date")
    private LocalDate specialDayDate;

    @Column(name = "suggested_base_hourly_rate", precision = 12, scale = 2)
    private BigDecimal suggestedBaseHourlyRate;

    @Column(name = "suggested_peak_hour_rate", precision = 12, scale = 2)
    private BigDecimal suggestedPeakHourRate;

    @Column(name = "suggested_special_day_rate", precision = 12, scale = 2)
    private BigDecimal suggestedSpecialDayRate;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to", nullable = false)
    private LocalDate effectiveTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_status", nullable = false, length = 40)
    private RuleStatus ruleStatus;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
