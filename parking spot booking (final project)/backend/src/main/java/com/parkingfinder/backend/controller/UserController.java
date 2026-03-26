package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.user.UpdatePasswordRequest;
import com.parkingfinder.backend.dto.user.UpdateProfileRequest;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched", userService.getMyProfile()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", userService.updateMyProfile(request)));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<ApiResponse<String>> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        userService.updateMyPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated", "OK"));
    }
}
