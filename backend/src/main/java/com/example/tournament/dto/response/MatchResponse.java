package com.example.tournament.dto.response;

import com.example.tournament.domain.MatchStatus;

import java.time.LocalDateTime;

/**
 * Response DTO for match data
 * Uses IDs and basic info for related entities to avoid deep nesting
 */
public record MatchResponse(
        Long id,
        Long tournamentId,
        String tournamentName,
        Long courtId,
        String courtName,
        Long player1Id,
        String player1Name,
        Long player2Id,
        String player2Name,
        Integer score1,
        Integer score2,
        MatchStatus status,
        LocalDateTime scheduledAt
) {
}
