package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.user.UpdatePasswordRequest;
import com.parkingfinder.backend.dto.user.UpdateProfileRequest;
import com.parkingfinder.backend.dto.user.UserResponse;

/** User profile management: view and update personal info and password. */
public interface UserService {

    /** Fetch the current user's profile. */
    UserResponse getMyProfile();

    /** Update the current user's name, email, and phone. */
    UserResponse updateMyProfile(UpdateProfileRequest request);

    /** Change the current user's password (requires current password verification). */
    void updateMyPassword(UpdatePasswordRequest request);
}
