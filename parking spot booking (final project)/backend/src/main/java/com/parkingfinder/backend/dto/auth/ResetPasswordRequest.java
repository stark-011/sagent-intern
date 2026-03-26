package com.parkingfinder.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "OTP must be exactly 6 digits")
    private String otp;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
