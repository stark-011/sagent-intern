package com.parkingfinder.backend.dto.parking;

import com.parkingfinder.backend.dto.user.UserResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SpotResponse {
    private String spotId;
    private String lenderId;
    private String spotTitle;
    private String description;
    private String addressLine;
    private String locality;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> vehicleTypeAllowed;
    private Integer totalSlots;
    private String spotType;
    private String spotStatus;
    private LocalDateTime createdAt;
    private BigDecimal distanceKm;
    private Double rating;
    private Integer reviewCount;
    private List<SpotImageDto> images;
    private String primaryImage;
    private List<SpotAvailabilityDto> availability;
    private SpotApprovalDto approvalDetails;
    private String approvalStatus;
    private PricingRuleDto pricing;
    private BigDecimal pricePerHour;
    private BigDecimal suggestedPricePerHour;
    private boolean finalPriceSet;
    private List<SpotSlotDto> slots;
    private Integer availableSlots;
    private UserResponse lender;
}
