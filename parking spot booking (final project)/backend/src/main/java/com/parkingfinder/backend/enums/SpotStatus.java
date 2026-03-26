package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum SpotStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    BLOCKED("blocked");

    private final String value;

    SpotStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SpotStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid spot status: " + value));
    }
}
