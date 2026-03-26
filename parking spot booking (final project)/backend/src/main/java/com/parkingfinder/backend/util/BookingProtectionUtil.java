package com.parkingfinder.backend.util;

import java.time.LocalDateTime;

public final class BookingProtectionUtil {

    public static final int DEFAULT_BUFFER_MINUTES = 60;

    private BookingProtectionUtil() {
    }

    public static int resolveBufferMinutes(Integer bufferMinutes) {
        return bufferMinutes != null && bufferMinutes > 0 ? bufferMinutes : DEFAULT_BUFFER_MINUTES;
    }

    public static LocalDateTime resolveBufferEndTime(LocalDateTime bookedEndTime, Integer bufferMinutes) {
        if (bookedEndTime == null) {
            return null;
        }
        return bookedEndTime.plusMinutes(resolveBufferMinutes(bufferMinutes));
    }

    public static LocalDateTime resolveBlockedUntil(
        LocalDateTime bookedEndTime,
        Integer bufferMinutes,
        LocalDateTime actualCheckoutTime
    ) {
        LocalDateTime bufferEndTime = resolveBufferEndTime(bookedEndTime, bufferMinutes);
        if (actualCheckoutTime != null && bufferEndTime != null && actualCheckoutTime.isAfter(bufferEndTime)) {
            return actualCheckoutTime;
        }
        return bufferEndTime != null ? bufferEndTime : bookedEndTime;
    }
}
