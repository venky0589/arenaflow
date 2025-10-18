package com.example.tournament.dto.response;

/**
 * Response DTO for court data
 */
public record CourtResponse(
        Long id,
        String name,
        String locationNote
) {
}
