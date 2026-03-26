package com.parkingfinder.backend.enums;

import java.util.Arrays;
import java.util.Locale;

public enum VehicleType {
    HATCHBACK("hatchback"),
    SEDAN("sedan"),
    MUV_SUV("muv_suv"),
    CONVERTIBLE("convertible"),
    COUPE("coupe"),
    WAGON("wagon"),
    JEEP("jeep"),
    VAN("van");

    private final String value;

    VehicleType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static VehicleType fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Vehicle type is required");
        }

        String normalized = normalize(value);

        // Legacy compatibility mapping for existing clients/data during migration.
        if ("car".equals(normalized)) {
            return SEDAN;
        }
        if ("suv".equals(normalized)) {
            return MUV_SUV;
        }
        if ("bike".equals(normalized)) {
            return HATCHBACK;
        }
        if ("ev".equals(normalized)) {
            return SEDAN;
        }

        return Arrays.stream(values())
            .filter(item -> normalize(item.value).equals(normalized) || normalize(item.name()).equals(normalized))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid vehicle type: " + value));
    }

    private static String normalize(String value) {
        return value.trim()
            .toLowerCase(Locale.ROOT)
            .replace(" ", "_")
            .replace("-", "_")
            .replace("/", "_");
    }
}
