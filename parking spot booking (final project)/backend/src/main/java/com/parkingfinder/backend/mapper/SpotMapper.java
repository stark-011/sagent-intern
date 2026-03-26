package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotApprovalDto;
import com.parkingfinder.backend.dto.parking.SpotAvailabilityDto;
import com.parkingfinder.backend.dto.parking.SpotImageDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotSlotDto;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.ParkingSpot;
import com.parkingfinder.backend.entity.PricingRule;
import com.parkingfinder.backend.entity.SpotApproval;
import com.parkingfinder.backend.entity.SpotAvailability;
import com.parkingfinder.backend.entity.SpotImage;
import com.parkingfinder.backend.enums.SlotStatus;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SpotMapper {

    public SpotImageDto toImageDto(SpotImage image) {
        return SpotImageDto.builder()
            .imageId(image.getImageId())
            .spotId(image.getSpot().getSpotId())
            .imageUrl(image.getImageUrl())
            .imageCaption(image.getImageCaption())
            .isPrimary(image.isPrimary())
            .uploadedAt(image.getUploadedAt())
            .build();
    }

    public SpotAvailabilityDto toAvailabilityDto(SpotAvailability availability) {
        return SpotAvailabilityDto.builder()
            .availabilityId(availability.getAvailabilityId())
            .spotId(availability.getSpot().getSpotId())
            .dayOfWeek(availability.getDayOfWeek())
            .startTime(availability.getStartTime())
            .endTime(availability.getEndTime())
            .effectiveFrom(availability.getEffectiveFrom())
            .effectiveTo(availability.getEffectiveTo())
            .isAvailable(availability.isAvailable())
            .build();
    }

    public SpotSlotDto toSlotDto(ParkingSpot spot) {
        String slotId = spot.getSlotId() != null && !spot.getSlotId().isBlank() ? spot.getSlotId() : spot.getSpotId();
        String slotCode = spot.getSlotCode() != null && !spot.getSlotCode().isBlank() ? spot.getSlotCode() : "S-01";
        String slotLabel = spot.getSlotLabel() != null && !spot.getSlotLabel().isBlank() ? spot.getSlotLabel() : "Primary Slot";
        String slotStatus = (spot.getSlotStatus() != null ? spot.getSlotStatus() : SlotStatus.AVAILABLE).getValue();
        return SpotSlotDto.builder()
            .slotId(slotId)
            .spotId(spot.getSpotId())
            .slotCode(slotCode)
            .slotLabel(slotLabel)
            .slotStatus(slotStatus)
            .deviceOpen(spot.isDeviceOpen())
            .build();
    }

    public PricingRuleDto toPricingDto(PricingRule rule) {
        if (rule == null) {
            return null;
        }
        return PricingRuleDto.builder()
            .pricingRuleId(rule.getPricingRuleId())
            .spotId(rule.getSpot().getSpotId())
            .pricingType(rule.getPricingType().getValue())
            .baseHourlyRate(rule.getBaseHourlyRate())
            .peakHourRate(rule.getPeakHourRate())
            .peakStartTime(rule.getPeakStartTime())
            .peakEndTime(rule.getPeakEndTime())
            .specialDayRate(rule.getSpecialDayRate())
            .specialDayDate(rule.getSpecialDayDate())
            .suggestedBaseHourlyRate(rule.getSuggestedBaseHourlyRate())
            .suggestedPeakHourRate(rule.getSuggestedPeakHourRate())
            .suggestedSpecialDayRate(rule.getSuggestedSpecialDayRate())
            .effectiveFrom(rule.getEffectiveFrom())
            .effectiveTo(rule.getEffectiveTo())
            .ruleStatus(rule.getRuleStatus().getValue())
            .createdBy(rule.getCreatedBy())
            .createdAt(rule.getCreatedAt())
            .build();
    }

    public SpotApprovalDto toApprovalDto(SpotApproval approval) {
        if (approval == null) {
            return null;
        }
        return SpotApprovalDto.builder()
            .approvalId(approval.getApprovalId())
            .spotId(approval.getSpot().getSpotId())
            .adminId(approval.getAdmin() != null ? approval.getAdmin().getUserId() : null)
            .approvalStatus(approval.getApprovalStatus().getValue())
            .rejectionReason(approval.getRejectionReason())
            .submittedAt(approval.getSubmittedAt())
            .reviewedAt(approval.getReviewedAt())
            .build();
    }

    public SpotResponse toSpotResponse(
        ParkingSpot spot,
        List<SpotImageDto> images,
        List<SpotAvailabilityDto> availability,
        SpotApprovalDto approval,
        PricingRuleDto pricing,
        List<SpotSlotDto> slots,
        UserResponse lender,
        Double rating,
        Integer reviewCount
    ) {
        List<SpotImageDto> safeImages = images == null ? Collections.emptyList() : images;
        List<SpotAvailabilityDto> safeAvailability = availability == null ? Collections.emptyList() : availability;
        List<SpotSlotDto> safeSlots = slots == null ? Collections.emptyList() : slots;

        String primaryImage = safeImages.stream()
            .filter(SpotImageDto::isPrimary)
            .map(SpotImageDto::getImageUrl)
            .findFirst()
            .orElse(safeImages.stream().findFirst().map(SpotImageDto::getImageUrl).orElse(null));

        int availableSlots = "active".equalsIgnoreCase(spot.getSpotStatus().getValue())
            ? (int) safeSlots.stream()
                .filter(slot -> "available".equals(slot.getSlotStatus()))
                .count()
            : 0;

        BigDecimal finalPrice = pricing != null && pricing.getBaseHourlyRate() != null
            ? pricing.getBaseHourlyRate()
            : BigDecimal.ZERO;

        BigDecimal suggestedPrice = pricing != null && pricing.getSuggestedBaseHourlyRate() != null
            ? pricing.getSuggestedBaseHourlyRate()
            : finalPrice;

        return SpotResponse.builder()
            .spotId(spot.getSpotId())
            .lenderId(spot.getLender().getUserId())
            .spotTitle(spot.getSpotTitle())
            .description(spot.getDescription())
            .addressLine(spot.getAddressLine())
            .locality(spot.getLocality())
            .city(spot.getCity())
            .state(spot.getState())
            .pincode(spot.getPincode())
            .latitude(spot.getLatitude())
            .longitude(spot.getLongitude())
            .vehicleTypeAllowed(spot.getVehicleTypeAllowed().stream().map(v -> v.getValue()).toList())
            .totalSlots(spot.getTotalSlots())
            .spotType(spot.getSpotType().getValue())
            .spotStatus(spot.getSpotStatus().getValue())
            .createdAt(spot.getCreatedAt())
            .distanceKm(spot.getDistanceKm())
            .images(safeImages)
            .primaryImage(primaryImage)
            .availability(safeAvailability)
            .approvalDetails(approval)
            .approvalStatus(approval != null ? approval.getApprovalStatus() : "pending")
            .pricing(pricing)
            .pricePerHour(finalPrice)
            .suggestedPricePerHour(suggestedPrice)
            .finalPriceSet(finalPrice.compareTo(BigDecimal.ZERO) > 0)
            .slots(safeSlots)
            .availableSlots(availableSlots)
            .lender(lender)
            .rating(rating)
            .reviewCount(reviewCount)
            .build();
    }
}
