package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.vehicle.VehicleRequest;
import com.parkingfinder.backend.dto.vehicle.VehicleResponse;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.Vehicle;
import com.parkingfinder.backend.enums.VehicleType;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.VehicleMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.VehicleRepository;
import com.parkingfinder.backend.service.VehicleService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AppUserRepository appUserRepository;
    private final VehicleMapper vehicleMapper;

    @Override
    public List<VehicleResponse> getMyVehicles() {
        String userId = SecurityUtils.getCurrentUserId();
        return vehicleRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(vehicleMapper::toDto)
            .toList();
    }

    @Override
    public VehicleResponse getMyVehicleById(String vehicleId) {
        String userId = SecurityUtils.getCurrentUserId();
        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUserUserId(vehicleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (makeDefault) {
            clearDefaultVehicles(userId);
        }

        Vehicle vehicle = Vehicle.builder()
            .vehicleId(IdGenerator.generate("veh"))
            .user(user)
            .vehicleName(request.getVehicleName())
            .vehicleNumber(request.getVehicleNumber())
            .vehicleType(VehicleType.fromValue(request.getVehicleType()))
            .brand(request.getBrand())
            .model(request.getModel())
            .color(request.getColor())
            .isDefault(makeDefault)
            .createdAt(LocalDateTime.now())
            .build();

        vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(String vehicleId, VehicleRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUserUserId(vehicleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultVehicles(userId);
            vehicle.setDefault(true);
        } else if (request.getIsDefault() != null) {
            vehicle.setDefault(false);
        }

        if (request.getVehicleName() != null) {
            vehicle.setVehicleName(request.getVehicleName());
        }
        if (request.getVehicleNumber() != null) {
            vehicle.setVehicleNumber(request.getVehicleNumber());
        }
        if (request.getVehicleType() != null) {
            vehicle.setVehicleType(VehicleType.fromValue(request.getVehicleType()));
        }
        if (request.getBrand() != null) {
            vehicle.setBrand(request.getBrand());
        }
        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        if (request.getColor() != null) {
            vehicle.setColor(request.getColor());
        }

        vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(String vehicleId) {
        String userId = SecurityUtils.getCurrentUserId();
        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUserUserId(vehicleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    private void clearDefaultVehicles(String userId) {
        List<Vehicle> vehicles = vehicleRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        vehicles.forEach(v -> v.setDefault(false));
        vehicleRepository.saveAll(vehicles);
    }
}
