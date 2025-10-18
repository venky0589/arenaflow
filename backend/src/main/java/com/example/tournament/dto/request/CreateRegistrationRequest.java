package com.example.tournament.dto.request;

import com.example.tournament.domain.CategoryType;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating a new tournament registration
 */
public record CreateRegistrationRequest(
        @NotNull(message = "Tournament ID is required")
        Long tournamentId,

        @NotNull(message = "Player ID is required")
        Long playerId,

        @NotNull(message = "Category type is required")
        CategoryType categoryType
) {
}
