package com.parkingfinder.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusUpdateRequest {

    @NotBlank
    private String accountStatus;
}
