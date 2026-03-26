package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum BookingStatus {
    ACTIVE("active"),
    UPCOMING("upcoming"),
    OVERSTAY("overstay"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    BookingStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static BookingStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid booking status: " + value));
    }
}
