package com.parkingfinder.backend.converter;

import com.parkingfinder.backend.enums.VehicleType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Converter
public class VehicleTypeSetConverter implements AttributeConverter<Set<VehicleType>, String> {

    @Override
    public String convertToDatabaseColumn(Set<VehicleType> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "";
        }

        return attribute.stream()
            .map(VehicleType::getValue)
            .distinct()
            .collect(Collectors.joining(","));
    }

    @Override
    public Set<VehicleType> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new LinkedHashSet<>();
        }

        return Arrays.stream(dbData.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(VehicleType::fromValue)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
