package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum HoldStatus {
    ACTIVE("active"),
    CONSUMED("consumed"),
    EXPIRED("expired"),
    CANCELLED("cancelled");

    private final String value;

    HoldStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static HoldStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid hold status: " + value));
    }
}
