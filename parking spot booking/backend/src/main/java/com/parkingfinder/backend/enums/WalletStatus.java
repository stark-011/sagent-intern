package com.parkingfinder.backend.enums;

import java.util.Arrays;

public enum WalletStatus {
    ACTIVE("active"),
    INACTIVE("inactive");

    private final String value;

    WalletStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static WalletStatus fromValue(String value) {
        return Arrays.stream(values())
            .filter(item -> item.value.equalsIgnoreCase(value) || item.name().equalsIgnoreCase(value))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid wallet status: " + value));
    }
}
