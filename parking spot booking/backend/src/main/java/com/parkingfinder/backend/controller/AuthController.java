package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.auth.AuthResponse;
import com.parkingfinder.backend.dto.auth.ForgotPasswordRequest;
import com.parkingfinder.backend.dto.auth.ForgotPasswordResponse;
import com.parkingfinder.backend.dto.auth.LoginRequest;
import com.parkingfinder.backend.dto.auth.RegisterRequest;
import com.parkingfinder.backend.dto.auth.ResetPasswordRequest;
import com.parkingfinder.backend.dto.auth.VerifyOtpRequest;
import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok("Current user fetched", authService.me()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Reset flow accepted",
            authService.forgotPassword(request.getEmail())));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("OTP verification",
            authService.verifyOtp(request)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Password reset",
            authService.resetPassword(request)));
    }
}
