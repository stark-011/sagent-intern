package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.vehicle.VehicleRequest;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import com.parkingfinder.backend.service.VehicleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok("Vehicles fetched", vehicleService.getMyVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.ok("Vehicle fetched", vehicleService.getMyVehicleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> create(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Vehicle created", vehicleService.createVehicle(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> update(@PathVariable("id") String id, @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated", vehicleService.updateVehicle(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable("id") String id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deleted", "OK"));
    }
}
