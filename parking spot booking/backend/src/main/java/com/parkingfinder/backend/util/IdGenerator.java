package com.parkingfinder.backend.util;

import java.util.UUID;

public final class IdGenerator {

    private IdGenerator() {
    }

    public static String generate(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
