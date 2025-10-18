package com.example.tournament.mapper;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.TournamentResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Tournament entity and DTOs
 */
@Component
public class TournamentMapper {

    /**
     * Convert CreateTournamentRequest to Tournament entity
     */
    public Tournament toEntity(CreateTournamentRequest request) {
        if (request == null) {
            return null;
        }

        Tournament tournament = new Tournament();
        tournament.setName(request.name());
        tournament.setLocation(request.location());
        tournament.setStartDate(request.startDate());
        tournament.setEndDate(request.endDate());

        return tournament;
    }

    /**
     * Convert UpdateTournamentRequest to Tournament entity
     * Note: This creates a partial entity for update operations
     */
    public Tournament toEntity(UpdateTournamentRequest request) {
        if (request == null) {
            return null;
        }

        Tournament tournament = new Tournament();
        tournament.setName(request.name());
        tournament.setLocation(request.location());
        tournament.setStartDate(request.startDate());
        tournament.setEndDate(request.endDate());

        return tournament;
    }

    /**
     * Convert Tournament entity to TournamentResponse
     */
    public TournamentResponse toResponse(Tournament tournament) {
        if (tournament == null) {
            return null;
        }

        return new TournamentResponse(
                tournament.getId(),
                tournament.getName(),
                tournament.getLocation(),
                tournament.getStartDate(),
                tournament.getEndDate()
        );
    }
}
