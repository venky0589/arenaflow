package com.example.tournament.dto.request;

import com.example.tournament.domain.MatchStatus;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

/**
 * Request DTO for updating an existing match
 * All fields are optional to support partial updates
 */
public record UpdateMatchRequest(
        Long tournamentId,

        Long courtId,

        Long player1Id,

        Long player2Id,

        @Min(value = 0, message = "Score must be non-negative")
        Integer score1,

        @Min(value = 0, message = "Score must be non-negative")
        Integer score2,

        MatchStatus status,

        LocalDateTime scheduledAt
) {
}
