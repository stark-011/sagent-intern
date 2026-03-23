package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum RuleStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    PENDING("pending"),
    PENDING_ADMIN_PRICING("pending_admin_pricing"),
    REJECTED("rejected");

    private final String value;

    RuleStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RuleStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid rule status: " + value));
    }
}
