package com.example.tournament.dto.response;

/**
 * Response DTO for player data
 */
public record PlayerResponse(
        Long id,
        String firstName,
        String lastName,
        String fullName,  // Computed field: firstName + lastName
        String gender,
        String phone
) {
    public PlayerResponse(Long id, String firstName, String lastName, String gender, String phone) {
        this(id, firstName, lastName, firstName + " " + lastName, gender, phone);
    }
}
