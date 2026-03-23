package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum PaymentStatus {
    PENDING("pending"),
    PAID("paid"),
    RESERVED("reserved"),
    FAILED("failed"),
    REFUNDED("refunded");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid payment status: " + value));
    }
}
