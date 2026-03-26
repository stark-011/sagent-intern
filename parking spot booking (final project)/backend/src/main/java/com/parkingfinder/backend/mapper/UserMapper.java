package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.AppUser;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toDto(AppUser user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
            .userId(user.getUserId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole().getValue())
            .accountStatus(user.getAccountStatus().getValue())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
