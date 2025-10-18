package com.example.tournament.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing player
 * All fields are optional to support partial updates
 */
public record UpdatePlayerRequest(
        @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
        String firstName,

        @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
        String lastName,

        @Pattern(regexp = "^[MF]$", message = "Gender must be M or F")
        String gender,

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
        String phone
) {
}
