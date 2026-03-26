package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.parking.PublicStatsResponse;
import com.parkingfinder.backend.dto.parking.SpotBookedWindowDto;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.service.ParkingService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class PublicParkingController {

    private final ParkingService parkingService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("All spots fetched", parkingService.getAllSpots()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PublicStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Public stats fetched", parkingService.getPublicStats()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.ok("Featured spots fetched", parkingService.getFeaturedSpots()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> search(
        @RequestParam(name = "query", required = false) String query,
        @RequestParam(name = "vehicleType", required = false) String vehicleType,
        @RequestParam(name = "maxPrice", required = false) String maxPrice,
        @RequestParam(name = "spotType", required = false) String spotType,
        @RequestParam(name = "minRating", required = false) String minRating,
        @RequestParam(name = "maxDistance", required = false) String maxDistance,
        @RequestParam(name = "sort", required = false) String sort,
        @RequestParam(name = "startTime", required = false) String startTime,
        @RequestParam(name = "endTime", required = false) String endTime,
        @RequestParam(name = "status", required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            "Spots fetched",
            parkingService.searchSpots(query, vehicleType, maxPrice, spotType, minRating, maxDistance, sort, startTime, endTime, status)
        ));
    }

    @GetMapping("/spots/{id}")
    public ResponseEntity<ApiResponse<SpotResponse>> getSpot(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Spot fetched", parkingService.getSpotById(id)));
    }

    @GetMapping("/spots/{id}/booked-windows")
    public ResponseEntity<ApiResponse<List<SpotBookedWindowDto>>> getSpotBookedWindows(
        @PathVariable("id") String id,
        @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(
            ApiResponse.ok("Spot booked windows fetched", parkingService.getSpotBookedWindows(id, date))
        );
    }

    @GetMapping("/spots/{id}/alternatives")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> getAlternativeSpots(
        @PathVariable("id") String id,
        @RequestParam(name = "startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
        @RequestParam(name = "endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime
    ) {
        return ResponseEntity.ok(
            ApiResponse.ok(
                "Alternative spots fetched",
                parkingService.findAlternativeSpots(id, startTime, endTime)
            )
        );
    }
}
