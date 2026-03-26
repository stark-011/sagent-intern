package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.admin.LenderDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.LenderEarningsSummaryResponse;
import com.parkingfinder.backend.dto.admin.MonthlyAmountResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.Payment;
import com.parkingfinder.backend.mapper.BookingResponseBuilder;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.service.LenderService;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LenderServiceImpl implements LenderService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ParkingServiceImpl parkingService;
    private final BookingResponseBuilder bookingResponseBuilder;

    /** Lender dashboard: spot counts, earnings total, and latest 5 bookings. */
    @Override
    public LenderDashboardSummaryResponse getDashboardSummary() {
        String lenderId = SecurityUtils.getCurrentUserId();
        List<SpotResponse> spots = parkingService.getMyLenderSpots();
        List<Booking> bookings = bookingRepository.findByLenderUserIdOrderByCreatedAtDesc(lenderId);

        BigDecimal totalEarnings = bookings.stream()
            .map(booking -> paymentRepository.findByBookingBookingId(booking.getBookingId()).orElse(null))
            .filter(java.util.Objects::nonNull)
            .map(Payment::getAmountPaid)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingApprovals = spots.stream().filter(s -> "pending".equals(s.getApprovalStatus())).count();
        long activeSpots = spots.stream().filter(s -> "active".equals(s.getSpotStatus())).count();

        List<BookingResponse> latest = bookings.stream()
            .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
            .limit(5)
            .map(bookingResponseBuilder::build)
            .toList();

        return LenderDashboardSummaryResponse.builder()
            .totalSpots(spots.size())
            .activeSpots(activeSpots)
            .pendingApprovals(pendingApprovals)
            .totalBookings(bookings.size())
            .totalEarnings(totalEarnings)
            .latestBookings(latest)
            .build();
    }

    @Override
    public List<SpotResponse> getMySpots() {
        return parkingService.getMyLenderSpots();
    }

    /** All bookings for the lender's spots, optionally filtered by status, date, or spot. */
    @Override
    public List<BookingResponse> getMySpotBookings(String status, String date, String spotId) {
        String lenderId = SecurityUtils.getCurrentUserId();
        return bookingRepository.findByLenderUserIdOrderByCreatedAtDesc(lenderId)
            .stream()
            .filter(booking -> status == null || status.isBlank() || booking.getBookingStatus().getValue().equals(status))
            .filter(booking -> spotId == null || spotId.isBlank() || booking.getSpot().getSpotId().equals(spotId))
            .filter(booking -> {
                if (date == null || date.isBlank()) {
                    return true;
                }
                return booking.getBookingDate().equals(LocalDate.parse(date));
            })
            .map(bookingResponseBuilder::build)
            .toList();
    }

    @Override
    public LenderEarningsSummaryResponse getEarningsSummary() {
        String lenderId = SecurityUtils.getCurrentUserId();
        List<Booking> bookings = bookingRepository.findByLenderUserIdOrderByCreatedAtDesc(lenderId);

        BigDecimal totalRevenue = bookings.stream()
            .map(booking -> paymentRepository.findByBookingBookingId(booking.getBookingId()).orElse(null))
            .filter(java.util.Objects::nonNull)
            .map(Payment::getAmountPaid)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal completedRevenue = bookings.stream()
            .filter(booking -> {
                String status = booking.getBookingStatus().getValue();
                return "completed".equals(status) || "overstay".equals(status);
            })
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingPayout = totalRevenue.subtract(completedRevenue.multiply(BigDecimal.valueOf(0.85)));
        if (pendingPayout.compareTo(BigDecimal.ZERO) < 0) {
            pendingPayout = BigDecimal.ZERO;
        }

        return LenderEarningsSummaryResponse.builder()
            .totalRevenue(totalRevenue)
            .completedRevenue(completedRevenue)
            .pendingPayout(pendingPayout)
            .payouts(List.of(
                new MonthlyAmountResponse("Jan", BigDecimal.valueOf(12400)),
                new MonthlyAmountResponse("Feb", BigDecimal.valueOf(15300)),
                new MonthlyAmountResponse("Mar", BigDecimal.valueOf(18200))
            ))
            .build();
    }

}
