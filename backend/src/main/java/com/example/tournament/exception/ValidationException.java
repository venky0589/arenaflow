package com.example.tournament.exception;

/**
 * Exception thrown when business validation fails.
 * This will be mapped to HTTP 400 Bad Request.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
