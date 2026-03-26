package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.booking.BookingHistoryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotSlotDto;
import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.BookingHistory;
import com.parkingfinder.backend.util.BookingProtectionUtil;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toDto(
        Booking booking,
        SpotSlotDto slot,
        SpotResponse spot,
        VehicleResponse vehicle,
        PaymentResponse payment,
        PricingRuleDto pricing
    ) {
        return BookingResponse.builder()
            .bookingId(booking.getBookingId())
            .userId(booking.getUser().getUserId())
            .slotId(booking.getSlotId())
            .vehicleId(booking.getVehicle().getVehicleId())
            .pricingRuleId(booking.getPricingRule() != null ? booking.getPricingRule().getPricingRuleId() : null)
            .bookingCode(booking.getBookingCode())
            .bookingDate(booking.getBookingDate())
            .bookedStartTime(booking.getBookedStartTime())
            .bookedEndTime(booking.getBookedEndTime())
            .bufferMinutes(booking.getBufferMinutes())
            .bufferEndTime(booking.getBufferEndTime())
            .blockedUntilTime(BookingProtectionUtil.resolveBlockedUntil(
                booking.getBookedEndTime(),
                booking.getBufferMinutes(),
                booking.getActualCheckoutTime()
            ))
            .actualCheckoutTime(booking.getActualCheckoutTime())
            .bookedAmount(booking.getBookedAmount())
            .lateFee(booking.getLateFee())
            .totalAmount(booking.getTotalAmount())
            .bookingStatus(booking.getBookingStatus().getValue())
            .locationTag(booking.getLocationTag())
            .createdAt(booking.getCreatedAt())
            .slot(slot)
            .spot(spot)
            .vehicle(vehicle)
            .payment(payment)
            .pricing(pricing)
            .build();
    }

    public BookingHistoryResponse toHistoryDto(BookingHistory history) {
        return BookingHistoryResponse.builder()
            .historyId(history.getHistoryId())
            .bookingId(history.getBooking().getBookingId())
            .status(history.getNewStatus().getValue())
            .oldStatus(history.getOldStatus() != null ? history.getOldStatus().getValue() : null)
            .newStatus(history.getNewStatus().getValue())
            .changedBy(history.getChangedBy())
            .note(history.getRemarks())
            .changedAt(history.getChangedAt())
            .build();
    }
}
