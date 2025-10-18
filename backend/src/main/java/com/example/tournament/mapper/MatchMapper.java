package com.example.tournament.mapper;

import com.example.tournament.domain.*;
import com.example.tournament.dto.request.CreateMatchRequest;
import com.example.tournament.dto.request.UpdateMatchRequest;
import com.example.tournament.dto.response.MatchResponse;
import com.example.tournament.repo.CourtRepository;
import com.example.tournament.repo.PlayerRepository;
import com.example.tournament.repo.TournamentRepository;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Match entity and DTOs
 */
@Component
public class MatchMapper {

    private final TournamentRepository tournamentRepository;
    private final CourtRepository courtRepository;
    private final PlayerRepository playerRepository;

    public MatchMapper(TournamentRepository tournamentRepository,
                       CourtRepository courtRepository,
                       PlayerRepository playerRepository) {
        this.tournamentRepository = tournamentRepository;
        this.courtRepository = courtRepository;
        this.playerRepository = playerRepository;
    }

    /**
     * Convert CreateMatchRequest to Match entity
     * Fetches related entities from database
     */
    public Match toEntity(CreateMatchRequest request) {
        if (request == null) {
            return null;
        }

        Match match = new Match();

        // Set tournament (required)
        if (request.tournamentId() != null) {
            Tournament tournament = tournamentRepository.findById(request.tournamentId())
                    .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + request.tournamentId()));
            match.setTournament(tournament);
        }

        // Set court (optional)
        if (request.courtId() != null) {
            Court court = courtRepository.findById(request.courtId())
                    .orElseThrow(() -> new RuntimeException("Court not found with id: " + request.courtId()));
            match.setCourt(court);
        }

        // Set player1 (optional)
        if (request.player1Id() != null) {
            Player player1 = playerRepository.findById(request.player1Id())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.player1Id()));
            match.setPlayer1(player1);
        }

        // Set player2 (optional)
        if (request.player2Id() != null) {
            Player player2 = playerRepository.findById(request.player2Id())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.player2Id()));
            match.setPlayer2(player2);
        }

        match.setScore1(request.score1());
        match.setScore2(request.score2());
        match.setStatus(request.status() != null ? request.status() : MatchStatus.SCHEDULED);
        match.setScheduledAt(request.scheduledAt());

        return match;
    }

    /**
     * Convert UpdateMatchRequest to Match entity
     * Note: This creates a partial entity for update operations
     */
    public Match toEntity(UpdateMatchRequest request) {
        if (request == null) {
            return null;
        }

        Match match = new Match();

        // Set tournament if provided
        if (request.tournamentId() != null) {
            Tournament tournament = tournamentRepository.findById(request.tournamentId())
                    .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + request.tournamentId()));
            match.setTournament(tournament);
        }

        // Set court if provided
        if (request.courtId() != null) {
            Court court = courtRepository.findById(request.courtId())
                    .orElseThrow(() -> new RuntimeException("Court not found with id: " + request.courtId()));
            match.setCourt(court);
        }

        // Set player1 if provided
        if (request.player1Id() != null) {
            Player player1 = playerRepository.findById(request.player1Id())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.player1Id()));
            match.setPlayer1(player1);
        }

        // Set player2 if provided
        if (request.player2Id() != null) {
            Player player2 = playerRepository.findById(request.player2Id())
                    .orElseThrow(() -> new RuntimeException("Player not found with id: " + request.player2Id()));
            match.setPlayer2(player2);
        }

        match.setScore1(request.score1());
        match.setScore2(request.score2());
        match.setStatus(request.status());
        match.setScheduledAt(request.scheduledAt());

        return match;
    }

    /**
     * Convert Match entity to MatchResponse
     * Flattens relationships to avoid deep nesting
     */
    public MatchResponse toResponse(Match match) {
        if (match == null) {
            return null;
        }

        return new MatchResponse(
                match.getId(),
                match.getTournament() != null ? match.getTournament().getId() : null,
                match.getTournament() != null ? match.getTournament().getName() : null,
                match.getCourt() != null ? match.getCourt().getId() : null,
                match.getCourt() != null ? match.getCourt().getName() : null,
                match.getPlayer1() != null ? match.getPlayer1().getId() : null,
                match.getPlayer1() != null ? match.getPlayer1().getFirstName() + " " + match.getPlayer1().getLastName() : null,
                match.getPlayer2() != null ? match.getPlayer2().getId() : null,
                match.getPlayer2() != null ? match.getPlayer2().getFirstName() + " " + match.getPlayer2().getLastName() : null,
                match.getScore1(),
                match.getScore2(),
                match.getStatus(),
                match.getScheduledAt()
        );
    }
}
