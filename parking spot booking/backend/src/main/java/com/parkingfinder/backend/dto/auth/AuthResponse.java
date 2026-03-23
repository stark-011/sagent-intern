package com.parkingfinder.backend.dto.auth;

import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.dto.wallet.WalletResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String token;
    private UserResponse user;
    private String role;
    private String redirectTo;
    private WalletResponse wallet;
}
