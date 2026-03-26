package com.parkingfinder.backend.dto.user;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private LocalDateTime createdAt;
}
