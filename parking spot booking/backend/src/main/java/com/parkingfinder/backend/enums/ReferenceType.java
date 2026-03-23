package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum ReferenceType {
    BOOKING("booking"),
    TOPUP("topup"),
    REFUND("refund"),
    LATE_FEE("late_fee"),
    MANUAL("manual");

    private final String value;

    ReferenceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ReferenceType fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid reference type: " + value));
    }
}
