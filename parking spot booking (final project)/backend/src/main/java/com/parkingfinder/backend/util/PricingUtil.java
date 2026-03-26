package com.parkingfinder.backend.util;

import com.parkingfinder.backend.entity.PricingRule;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class PricingUtil {

    private PricingUtil() {
    }

    public static BigDecimal calculateBookingAmount(LocalDateTime start, LocalDateTime end, BigDecimal hourlyRate) {
        long minutes = Math.max(1, Duration.between(start, end).toMinutes());
        long billableHours = Math.max(1, (long) Math.ceil(minutes / 60.0));
        return hourlyRate.multiply(BigDecimal.valueOf(billableHours)).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal resolveHourlyRate(LocalDateTime bookingStartTime, PricingRule pricingRule) {
        BigDecimal baseRate = firstPositive(
            pricingRule != null ? pricingRule.getBaseHourlyRate() : null,
            pricingRule != null ? pricingRule.getPeakHourRate() : null,
            pricingRule != null ? pricingRule.getSpecialDayRate() : null
        );
        if (baseRate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if (pricingRule == null) {
            return baseRate;
        }

        LocalDate bookingDate = bookingStartTime.toLocalDate();
        if (pricingRule.getSpecialDayDate() != null
            && bookingDate.equals(pricingRule.getSpecialDayDate())
            && isPositive(pricingRule.getSpecialDayRate())) {
            return pricingRule.getSpecialDayRate();
        }

        if (isWithinPeakWindow(
            bookingStartTime.toLocalTime(),
            pricingRule.getPeakStartTime(),
            pricingRule.getPeakEndTime()
        ) && isPositive(pricingRule.getPeakHourRate())) {
            return pricingRule.getPeakHourRate();
        }

        return baseRate;
    }

    public static BigDecimal calculateLateFee(LocalDateTime bookedEndTime, LocalDateTime actualCheckout, BigDecimal feePerHour) {
        if (actualCheckout == null || !actualCheckout.isAfter(bookedEndTime)) {
            return BigDecimal.ZERO.setScale(0, RoundingMode.HALF_UP);
        }
        long minutes = Math.max(1, Duration.between(bookedEndTime, actualCheckout).toMinutes());
        long overtimeHours = Math.max(1, (long) Math.ceil(minutes / 60.0));
        BigDecimal multiplier = BigDecimal.valueOf(overtimeHours).add(BigDecimal.valueOf(0.5));
        return feePerHour.multiply(multiplier).setScale(0, RoundingMode.HALF_UP);
    }

    private static boolean isWithinPeakWindow(LocalTime value, LocalTime start, LocalTime end) {
        if (value == null || start == null || end == null || !end.isAfter(start)) {
            return false;
        }
        return !value.isBefore(start) && value.isBefore(end);
    }

    private static boolean isPositive(BigDecimal value) {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }

    private static BigDecimal firstPositive(BigDecimal... values) {
        for (BigDecimal value : values) {
            if (isPositive(value)) {
                return value;
            }
        }
        return BigDecimal.ZERO;
    }
}
