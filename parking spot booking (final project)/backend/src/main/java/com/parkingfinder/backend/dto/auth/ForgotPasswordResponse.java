package com.parkingfinder.backend.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ForgotPasswordResponse {
    private boolean success;
    private String message;
}
