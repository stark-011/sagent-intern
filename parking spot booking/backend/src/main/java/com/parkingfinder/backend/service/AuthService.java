package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.auth.AuthResponse;
import com.parkingfinder.backend.dto.auth.ForgotPasswordResponse;
import com.parkingfinder.backend.dto.auth.LoginRequest;
import com.parkingfinder.backend.dto.auth.RegisterRequest;
import com.parkingfinder.backend.dto.auth.ResetPasswordRequest;
import com.parkingfinder.backend.dto.auth.VerifyOtpRequest;

/**
 * Authentication and identity operations: registration, login, session
 * retrieval, and password recovery.
 */
public interface AuthService {

    /** Register a new user and return a JWT session. */
    AuthResponse register(RegisterRequest request);

    /** Authenticate an existing user and return a JWT session. */
    AuthResponse login(LoginRequest request);

    /** Return the currently-authenticated user's profile. */
    AuthResponse me();

    /** Initiate the password-reset flow for the given email (sends OTP). */
    ForgotPasswordResponse forgotPassword(String email);

    /** Verify the 6-digit OTP sent to the user's email. */
    ForgotPasswordResponse verifyOtp(VerifyOtpRequest request);

    /** Reset the password after successful OTP verification. */
    ForgotPasswordResponse resetPassword(ResetPasswordRequest request);
}
