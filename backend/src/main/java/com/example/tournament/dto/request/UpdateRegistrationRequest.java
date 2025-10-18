package com.example.tournament.dto.request;

import com.example.tournament.domain.CategoryType;

/**
 * Request DTO for updating an existing registration
 * All fields are optional to support partial updates
 */
public record UpdateRegistrationRequest(
        Long tournamentId,

        Long playerId,

        CategoryType categoryType
) {
}
