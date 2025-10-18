package com.example.tournament.exception;

/**
 * Exception thrown when attempting to create a resource that already exists.
 * This will be mapped to HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, String value) {
        super(String.format("%s with %s '%s' already exists", resourceName, fieldName, value));
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
