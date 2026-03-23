package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.admin.LenderDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.LenderEarningsSummaryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import java.util.List;

/**
 * Lender-facing operations: dashboard overview, spot listings,
 * booking management, and earnings reports.
 */
public interface LenderService {

    /** Lender dashboard metrics: spot counts, earnings, and latest bookings. */
    LenderDashboardSummaryResponse getDashboardSummary();

    /** All spots owned by the currently-authenticated lender. */
    List<SpotResponse> getMySpots();

    /** Bookings on the lender's spots, optionally filtered by status, date, or spot. */
    List<BookingResponse> getMySpotBookings(String status, String date, String spotId);

    /** Revenue and payout summary for the current lender. */
    LenderEarningsSummaryResponse getEarningsSummary();
}
