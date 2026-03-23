package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotSlotDto;
import com.parkingfinder.backend.dto.payment.PaymentResponse;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.service.impl.ParkingServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Shared helper that converts a {@link Booking} entity into a fully-populated
 * {@link BookingResponse} DTO. Used by both BookingServiceImpl and
 * LenderServiceImpl so the mapping logic lives in one place.
 */
@Component
@RequiredArgsConstructor
public class BookingResponseBuilder {

    private final BookingMapper bookingMapper;
    private final SpotMapper spotMapper;
    private final VehicleMapper vehicleMapper;
    private final PaymentMapper paymentMapper;
    private final PaymentRepository paymentRepository;
    private final ParkingServiceImpl parkingService;

    /**
     * Build a complete {@link BookingResponse} from a booking entity.
     * Fetches the related spot, vehicle, payment and pricing data automatically.
     *
     * @param booking the booking entity to convert
     * @return fully-populated BookingResponse DTO
     */
    public BookingResponse build(Booking booking) {
        SpotSlotDto slotDto = spotMapper.toSlotDto(booking.getSpot());
        SpotResponse spotDto = parkingService.toFullSpot(booking.getSpot());
        VehicleResponse vehicleDto = vehicleMapper.toDto(booking.getVehicle());

        PaymentResponse paymentDto = paymentRepository
            .findByBookingBookingId(booking.getBookingId())
            .map(paymentMapper::toDto)
            .orElse(null);

        PricingRuleDto pricingDto = booking.getPricingRule() != null
            ? spotMapper.toPricingDto(booking.getPricingRule())
            : null;

        return bookingMapper.toDto(booking, slotDto, spotDto, vehicleDto, paymentDto, pricingDto);
    }
}
