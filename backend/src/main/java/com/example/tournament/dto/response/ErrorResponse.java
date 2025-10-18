package com.example.tournament.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response DTO for all API errors.
 * Provides consistent error structure across all endpoints.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors
) {
    /**
     * Constructor for simple errors without validation details
     */
    public ErrorResponse(int status, String error, String message, String path) {
        this(LocalDateTime.now(), status, error, message, path, null);
    }

    /**
     * Constructor for validation errors with field-level details
     */
    public ErrorResponse(int status, String error, String message, String path, Map<String, String> validationErrors) {
        this(LocalDateTime.now(), status, error, message, path, validationErrors);
    }
}
