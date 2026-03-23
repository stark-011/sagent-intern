package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.admin.LenderDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.LenderEarningsSummaryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.parking.SpotAvailabilityRequest;
import com.parkingfinder.backend.dto.parking.SpotCreateRequest;
import com.parkingfinder.backend.dto.parking.SpotImageRequest;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotUpdateRequest;
import com.parkingfinder.backend.exception.ForbiddenException;
import com.parkingfinder.backend.service.LenderService;
import com.parkingfinder.backend.service.ParkingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lender")
@RequiredArgsConstructor
public class LenderController {

    private final LenderService lenderService;
    private final ParkingService parkingService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<LenderDashboardSummaryResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Lender dashboard fetched", lenderService.getDashboardSummary()));
    }

    @GetMapping("/spots")
    public ResponseEntity<ApiResponse<List<SpotResponse>>> mySpots() {
        return ResponseEntity.ok(ApiResponse.ok("Lender spots fetched", lenderService.getMySpots()));
    }

    @GetMapping("/spots/{id}")
    public ResponseEntity<ApiResponse<SpotResponse>> mySpotDetail(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Lender spot fetched", parkingService.getMyLenderSpotById(id)));
    }

    @PostMapping("/spots")
    public ResponseEntity<ApiResponse<SpotResponse>> createSpot(@Valid @RequestBody SpotCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Spot created", parkingService.createSpot(request)));
    }

    @PutMapping("/spots/{id}")
    public ResponseEntity<ApiResponse<SpotResponse>> updateSpot(@PathVariable("id") String id, @RequestBody SpotUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Spot updated", parkingService.updateSpot(id, request)));
    }

    @DeleteMapping("/spots/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSpot(@PathVariable("id") String id) {
        parkingService.deleteSpot(id);
        return ResponseEntity.ok(ApiResponse.ok("Spot deleted", "OK"));
    }

    @PostMapping("/spots/{id}/slots")
    public ResponseEntity<ApiResponse<String>> addSlotBlocked(
        @PathVariable("id") String id,
        @RequestBody(required = false) Object request
    ) {
        throw new ForbiddenException("Slot and device management is automated by admin");
    }

    @PutMapping("/spots/{id}/slots/{slotId}")
    public ResponseEntity<ApiResponse<String>> updateSlotBlocked(
        @PathVariable("id") String id,
        @PathVariable("slotId") String slotId,
        @RequestBody(required = false) Object request
    ) {
        throw new ForbiddenException("Slot and device management is automated by admin");
    }

    @DeleteMapping("/spots/{id}/slots/{slotId}")
    public ResponseEntity<ApiResponse<String>> deleteSlotBlocked(
        @PathVariable("id") String id,
        @PathVariable("slotId") String slotId
    ) {
        throw new ForbiddenException("Slot and device management is automated by admin");
    }

    @PutMapping("/spots/{id}/slots/{slotId}/device")
    public ResponseEntity<ApiResponse<String>> updateSlotDeviceBlocked(
        @PathVariable("id") String id,
        @PathVariable("slotId") String slotId,
        @RequestBody(required = false) Object request
    ) {
        throw new ForbiddenException("Slot and device management is automated by admin");
    }

    @PutMapping("/spots/{id}/availability")
    public ResponseEntity<ApiResponse<String>> updateAvailability(
        @PathVariable("id") String id,
        @RequestBody SpotAvailabilityRequest request
    ) {
        parkingService.updateSpotAvailability(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Availability updated", "OK"));
    }

    @PostMapping("/spots/{id}/images")
    public ResponseEntity<ApiResponse<String>> addImage(@PathVariable("id") String id, @Valid @RequestBody SpotImageRequest request) {
        parkingService.addSpotImage(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Image metadata added", "OK"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> bookings(
        @RequestParam(name = "status", required = false) String status,
        @RequestParam(name = "date", required = false) String date,
        @RequestParam(name = "spotId", required = false) String spotId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Lender bookings fetched", lenderService.getMySpotBookings(status, date, spotId)));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<LenderEarningsSummaryResponse>> earnings() {
        return ResponseEntity.ok(ApiResponse.ok("Lender earnings fetched", lenderService.getEarningsSummary()));
    }
}
