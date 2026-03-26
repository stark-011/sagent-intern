package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum TransactionStatus {
    SUCCESS("success"),
    FAILED("failed"),
    PENDING("pending");

    private final String value;

    TransactionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TransactionStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid transaction status: " + value));
    }
}
