package com.example.tournament.dto.response;

import com.example.tournament.domain.CategoryType;

/**
 * Response DTO for registration data
 * Uses IDs and basic info for related entities to avoid deep nesting
 */
public record RegistrationResponse(
        Long id,
        Long tournamentId,
        String tournamentName,
        Long playerId,
        String playerName,
        CategoryType categoryType
) {
}
