package com.parkingfinder.backend.dto.admin;

import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.dto.wallet.WalletResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserRowResponse {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private long spots;
    private long bookings;
    private WalletResponse wallet;
    private UserResponse user;
    private SpotResponse sampleSpot;
}
