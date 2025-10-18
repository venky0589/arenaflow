package com.example.tournament.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing court
 * All fields are optional to support partial updates
 */
public record UpdateCourtRequest(
        @Size(min = 1, max = 100, message = "Court name must be between 1 and 100 characters")
        String name,

        @Size(max = 255, message = "Location note must not exceed 255 characters")
        String locationNote
) {
}
