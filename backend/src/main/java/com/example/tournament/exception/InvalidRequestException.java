package com.example.tournament.exception;

/**
 * Exception thrown when a request is malformed or contains invalid data.
 * This will be mapped to HTTP 400 Bad Request.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
