package com.example.tournament.mapper;

import com.example.tournament.domain.Player;
import com.example.tournament.domain.Registration;
import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateRegistrationRequest;
import com.example.tournament.dto.request.UpdateRegistrationRequest;
import com.example.tournament.dto.response.RegistrationResponse;
import com.example.tournament.repo.PlayerRepository;
import com.example.tournament.repo.TournamentRepository;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Registration entity and DTOs
 */
@Component
public class RegistrationMapper {

    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;

    public RegistrationMapper(TournamentRepository tournamentRepository,
                              PlayerRepository playerRepository) {
        this.tournamentRepository = tournamentRepository;
        this.playerRepository = playerRepository;
    }

    /**
     * Convert CreateRegistrationRequest to Registration entity
     * Fetches related entities from database
     */
    public Registration toEntity(CreateRegistrationRequest request) {
        if (request == null) {
            return null;
        }

        Registration registration = new Registration();

        // Set tournament (required)
        if (request.tournamentId() != null) {
            Tournament tournament = tournamentRepository.findById(request.tournamentId())
                    .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + request.tournamentId()));
            registration.setTournament(tournament);
        }

        // Set player (required)
        if (request.playerId() != null) {
            Player player = playerRepository.findById(request.playerId())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.playerId()));
            registration.setPlayer(player);
        }

        registration.setCategoryType(request.categoryType());

        return registration;
    }

    /**
     * Convert UpdateRegistrationRequest to Registration entity
     * Note: This creates a partial entity for update operations
     */
    public Registration toEntity(UpdateRegistrationRequest request) {
        if (request == null) {
            return null;
        }

        Registration registration = new Registration();

        // Set tournament if provided
        if (request.tournamentId() != null) {
            Tournament tournament = tournamentRepository.findById(request.tournamentId())
                    .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + request.tournamentId()));
            registration.setTournament(tournament);
        }

        // Set player if provided
        if (request.playerId() != null) {
            Player player = playerRepository.findById(request.playerId())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.playerId()));
            registration.setPlayer(player);
        }

        registration.setCategoryType(request.categoryType());

        return registration;
    }

    /**
     * Convert Registration entity to RegistrationResponse
     * Flattens relationships to avoid deep nesting
     */
    public RegistrationResponse toResponse(Registration registration) {
        if (registration == null) {
            return null;
        }

        return new RegistrationResponse(
                registration.getId(),
                registration.getTournament() != null ? registration.getTournament().getId() : null,
                registration.getTournament() != null ? registration.getTournament().getName() : null,
                registration.getPlayer() != null ? registration.getPlayer().getId() : null,
                registration.getPlayer() != null ? registration.getPlayer().getFirstName() + " " + registration.getPlayer().getLastName() : null,
                registration.getCategoryType()
        );
    }
}
