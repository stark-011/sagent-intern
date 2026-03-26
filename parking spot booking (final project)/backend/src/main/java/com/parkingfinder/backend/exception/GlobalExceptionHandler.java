package com.parkingfinder.backend.exception;

import com.parkingfinder.backend.dto.common.ErrorResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralised exception handler that maps known exceptions to structured
 * {@link ErrorResponse} payloads.  Every handler delegates to the private
 * {@code errorBody} helper to keep response construction DRY.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Application-defined exceptions ─────────────────────────────────

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(errorBody(ex.getErrorCode(), ex.getMessage()));
    }

    // ── Validation & payload errors ────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(this::fieldErrorMessage)
            .collect(Collectors.toList());

        return ResponseEntity.badRequest()
            .body(errorBody("VALIDATION_ERROR", "Validation failed", details));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadablePayload(HttpMessageNotReadableException ex) {
        String detail = ex.getMostSpecificCause() != null
            ? ex.getMostSpecificCause().getMessage()
            : ex.getMessage();

        return ResponseEntity.badRequest()
            .body(errorBody("BAD_REQUEST", "Invalid request payload", List.of(detail)));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(errorBody("BAD_REQUEST", ex.getMessage()));
    }

    // ── Security exceptions ────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(errorBody("INVALID_CREDENTIALS", "Invalid email or password"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(errorBody("FORBIDDEN", "You do not have permission to access this resource"));
    }

    // ── Catch-all ──────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnhandled(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(errorBody("INTERNAL_ERROR", "Unexpected error occurred", List.of(ex.getMessage())));
    }

    // ── Private helpers ────────────────────────────────────────────────

    /** Build an {@link ErrorResponse} without field-level details. */
    private ErrorResponse errorBody(String errorCode, String message) {
        return ErrorResponse.builder()
            .success(false)
            .errorCode(errorCode)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /** Build an {@link ErrorResponse} with field-level details (e.g. validation). */
    private ErrorResponse errorBody(String errorCode, String message, List<String> details) {
        return ErrorResponse.builder()
            .success(false)
            .errorCode(errorCode)
            .message(message)
            .details(details)
            .timestamp(LocalDateTime.now())
            .build();
    }

    private String fieldErrorMessage(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }
}
