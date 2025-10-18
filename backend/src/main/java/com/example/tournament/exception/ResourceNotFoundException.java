package com.example.tournament.exception;

/**
 * Exception thrown when a requested resource is not found.
 * This will be mapped to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s not found with id: %d", resourceName, id));
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
