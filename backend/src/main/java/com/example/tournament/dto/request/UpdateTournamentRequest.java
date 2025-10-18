package com.example.tournament.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for updating an existing tournament
 * All fields are optional to support partial updates
 */
public record UpdateTournamentRequest(
        @Size(min = 3, max = 255, message = "Tournament name must be between 3 and 255 characters")
        String name,

        @Size(max = 255, message = "Location must not exceed 255 characters")
        String location,

        LocalDate startDate,

        LocalDate endDate
) {
}
