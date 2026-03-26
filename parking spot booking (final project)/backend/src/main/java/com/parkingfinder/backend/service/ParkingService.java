package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.parking.SpotAvailabilityRequest;
import com.parkingfinder.backend.dto.parking.SpotBookedWindowDto;
import com.parkingfinder.backend.dto.parking.SpotCreateRequest;
import com.parkingfinder.backend.dto.parking.SpotImageRequest;
import com.parkingfinder.backend.dto.parking.PublicStatsResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotUpdateRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

/**
 * Parking-spot lifecycle and discovery: CRUD, search, availability,
 * pricing lookup, booked-window queries, and alternative-spot suggestions.
 */
public interface ParkingService {

    /** All approved spots (public listing). */
    List<SpotResponse> getAllSpots();

    /** Platform-wide public counters (spots, drivers, lenders, cities). */
    PublicStatsResponse getPublicStats();

    /** Top-rated, approved spots highlighted on the home page. */
    List<SpotResponse> getFeaturedSpots();

    /**
     * Full-text + filter search across parking spots.
     *
     * @param query       free-text search (city, locality, address)
     * @param vehicleType vehicle type filter (car, bike, etc.)
     * @param maxPrice    maximum hourly price
     * @param spotType    indoor / outdoor / covered
     * @param minRating   minimum average rating
     * @param maxDistance  maximum distance in km
     * @param sort        sort order: nearest, lowest_price, highest_rated, newest
     * @param startTime   optional availability window start
     * @param endTime     optional availability window end
     * @param status      spot status filter
     */
    List<SpotResponse> searchSpots(
        String query,
        String vehicleType,
        String maxPrice,
        String spotType,
        String minRating,
        String maxDistance,
        String sort,
        String startTime,
        String endTime,
        String status
    );

    /** Full spot details by ID (public). */
    SpotResponse getSpotById(String spotId);

    /** Active booked time-windows for a spot on a given date (used for slot-picker UI). */
    List<SpotBookedWindowDto> getSpotBookedWindows(String spotId, LocalDate date);

    /** Nearby alternative spots when the requested spot/time is unavailable. */
    List<SpotResponse> findAlternativeSpots(String spotId, LocalDateTime startTime, LocalDateTime endTime);

    /** All spots belonging to the currently-authenticated lender. */
    List<SpotResponse> getMyLenderSpots();

    /** Single spot detail for the current lender. */
    SpotResponse getMyLenderSpotById(String spotId);

    /** Create a new parking spot (requires lender role). */
    SpotResponse createSpot(SpotCreateRequest request);

    /** Update an existing spot's details. */
    SpotResponse updateSpot(String spotId, SpotUpdateRequest request);

    /** Delete a spot (only if no bookings exist). */
    void deleteSpot(String spotId);

    /** Set or update the weekly availability schedule for a spot. */
    void updateSpotAvailability(String spotId, SpotAvailabilityRequest request);

    /** Attach a new image to a spot. */
    void addSpotImage(String spotId, SpotImageRequest request);
}
