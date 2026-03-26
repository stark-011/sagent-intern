package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum UserRole {
    DRIVER("driver", "ROLE_USER", "/user/dashboard"),
    LENDER("lender", "ROLE_LENDER", "/lender/dashboard"),
    ADMIN("admin", "ROLE_ADMIN", "/admin/dashboard");

    private final String value;
    private final String authority;
    private final String redirectRoute;

    UserRole(String value, String authority, String redirectRoute) {
        this.value = value;
        this.authority = authority;
        this.redirectRoute = redirectRoute;
    }

    public String getValue() {
        return value;
    }

    public String getAuthority() {
        return authority;
    }

    public String getRedirectRoute() {
        return redirectRoute;
    }

    public static UserRole fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Role is required");
        }
        return Arrays.stream(values())
            .filter(role -> role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + value));
    }
}
