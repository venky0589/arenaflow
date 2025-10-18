package com.example.tournament.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Specialized request DTO for updating only match scores
 * Used by referees during match scoring
 */
public record UpdateMatchScoreRequest(
        @NotNull(message = "Score 1 is required")
        @Min(value = 0, message = "Score must be non-negative")
        Integer score1,

        @NotNull(message = "Score 2 is required")
        @Min(value = 0, message = "Score must be non-negative")
        Integer score2
) {
}
