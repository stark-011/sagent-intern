package com.parkingfinder.backend.dto.common;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponse {
    private boolean success;
    private String errorCode;
    private String message;
    private List<String> details;
    private LocalDateTime timestamp;
}
