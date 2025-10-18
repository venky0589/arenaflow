package com.example.tournament.dto.response;

import java.time.LocalDate;

/**
 * Response DTO for tournament data
 */
public record TournamentResponse(
        Long id,
        String name,
        String location,
        LocalDate startDate,
        LocalDate endDate
) {
}
