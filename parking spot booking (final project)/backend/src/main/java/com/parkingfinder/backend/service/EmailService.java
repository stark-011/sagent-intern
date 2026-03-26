package com.parkingfinder.backend.service;

/**
 * Service for sending transactional emails.
 */
public interface EmailService {

    /** Send a password-reset OTP email to the given address. */
    void sendOtpEmail(String toEmail, String otp);
}
