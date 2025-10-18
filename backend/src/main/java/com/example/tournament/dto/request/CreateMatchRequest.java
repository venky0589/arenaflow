package com.example.tournament.dto.request;

import com.example.tournament.domain.MatchStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a new match
 */
public record CreateMatchRequest(
        @NotNull(message = "Tournament ID is required")
        Long tournamentId,

        Long courtId,  // Optional

        Long player1Id,  // Optional

        Long player2Id,  // Optional

        @Min(value = 0, message = "Score must be non-negative")
        Integer score1,

        @Min(value = 0, message = "Score must be non-negative")
        Integer score2,

        MatchStatus status,  // Optional, defaults to SCHEDULED

        LocalDateTime scheduledAt  // Optional
) {
}
