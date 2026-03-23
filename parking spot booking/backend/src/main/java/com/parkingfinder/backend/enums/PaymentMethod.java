package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum PaymentMethod {
    WALLET("wallet"),
    UPI("upi"),
    CARD("card"),
    CASH("cash");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentMethod fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid payment method: " + value));
    }
}
