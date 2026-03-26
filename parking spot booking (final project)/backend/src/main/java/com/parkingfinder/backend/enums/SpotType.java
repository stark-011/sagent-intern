package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum SpotType {
    COVERED("covered"),
    OPEN("open"),
    MULTILEVEL("multilevel"),
    RESIDENTIAL("residential");

    private final String value;

    SpotType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SpotType fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid spot type: " + value));
    }
}
