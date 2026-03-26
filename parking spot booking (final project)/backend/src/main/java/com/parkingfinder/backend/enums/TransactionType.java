package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum TransactionType {
    CREDIT("credit"),
    DEBIT("debit");

    private final String value;

    TransactionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TransactionType fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid transaction type: " + value));
    }
}
