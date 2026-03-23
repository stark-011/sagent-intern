package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum ApprovalStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    ApprovalStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ApprovalStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid approval status: " + value));
    }
}
