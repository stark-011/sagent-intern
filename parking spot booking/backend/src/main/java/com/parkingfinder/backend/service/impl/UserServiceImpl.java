package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.user.UpdatePasswordRequest;
import com.parkingfinder.backend.dto.user.UpdateProfileRequest;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.UserMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.service.UserService;
import com.parkingfinder.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository appUserRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getMyProfile() {
        String userId = SecurityUtils.getCurrentUserId();
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        appUserRepository.findByEmailIgnoreCase(request.getEmail())
            .filter(other -> !other.getUserId().equals(userId))
            .ifPresent(existing -> {
                throw new BadRequestException("Email already in use by another account");
            });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPhone(request.getPhone());
        appUserRepository.save(user);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void updateMyPassword(UpdatePasswordRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);
    }
}
