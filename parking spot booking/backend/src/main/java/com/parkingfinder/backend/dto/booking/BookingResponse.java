package com.parkingfinder.backend.dto.booking;

import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotSlotDto;
import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {
    private String bookingId;
    private String userId;
    private String slotId;
    private String vehicleId;
    private String pricingRuleId;
    private String bookingCode;
    private LocalDate bookingDate;
    private LocalDateTime bookedStartTime;
    private LocalDateTime bookedEndTime;
    private Integer bufferMinutes;
    private LocalDateTime bufferEndTime;
    private LocalDateTime blockedUntilTime;
    private LocalDateTime actualCheckoutTime;
    private BigDecimal bookedAmount;
    private BigDecimal lateFee;
    private BigDecimal totalAmount;
    private String bookingStatus;
    private String locationTag;
    private LocalDateTime createdAt;
    private SpotSlotDto slot;
    private SpotResponse spot;
    private VehicleResponse vehicle;
    private PaymentResponse payment;
    private PricingRuleDto pricing;
}
