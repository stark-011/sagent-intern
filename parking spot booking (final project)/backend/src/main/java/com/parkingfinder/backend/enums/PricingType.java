package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum PricingType {
    HOURLY("hourly");

    private final String value;

    PricingType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PricingType fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid pricing type: " + value));
    }
}
