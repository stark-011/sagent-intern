package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum SlotStatus {
    AVAILABLE("available"),
    OCCUPIED("occupied"),
    BLOCKED("blocked");

    private final String value;

    SlotStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SlotStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid slot status: " + value));
    }
}
