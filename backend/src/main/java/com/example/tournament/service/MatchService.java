package com.example.tournament.service;

import com.example.tournament.domain.Match;
import com.example.tournament.domain.MatchStatus;
import com.example.tournament.dto.request.CreateMatchRequest;
import com.example.tournament.dto.request.UpdateMatchRequest;
import com.example.tournament.dto.request.UpdateMatchScoreRequest;
import com.example.tournament.mapper.MatchMapper;
import com.example.tournament.repo.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MatchService {

    private final MatchRepository repository;
    private final MatchMapper mapper;

    public MatchService(MatchRepository repository, MatchMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    /**
     * Get all matches
     */
    public List<Match> findAll() {
        return repository.findAll();
    }

    /**
     * Find match by ID
     */
    public Optional<Match> findById(Long id) {
        return repository.findById(id);
    }

    /**
     * Create a new match with business validations
     */
    public Match create(CreateMatchRequest request) {
        Match match = mapper.toEntity(request);

        // Business validation: ensure tournament is set
        if (match.getTournament() == null) {
            throw new RuntimeException("Match must be associated with a tournament");
        }

        // Business validation: ensure players are different
        if (match.getPlayer1() != null && match.getPlayer2() != null) {
            if (match.getPlayer1().getId().equals(match.getPlayer2().getId())) {
                throw new RuntimeException("A player cannot play against themselves");
            }
        }

        // Business validation: validate scores if provided
        if (match.getScore1() != null || match.getScore2() != null) {
            validateScores(match.getScore1(), match.getScore2());
        }

        // Set default status if not provided
        if (match.getStatus() == null) {
            match.setStatus(MatchStatus.SCHEDULED);
        }

        return repository.save(match);
    }

    /**
     * Update existing match with proper field updates (no reflection hack!)
     */
    public Match update(Long id, UpdateMatchRequest request) {
        Match existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + id));

        Match updates = mapper.toEntity(request);

        // Business validation: ensure players are different if both being updated
        if (updates.getPlayer1() != null && updates.getPlayer2() != null) {
            if (updates.getPlayer1().getId().equals(updates.getPlayer2().getId())) {
                throw new RuntimeException("A player cannot play against themselves");
            }
        }

        // Business validation: validate scores if being updated
        if (updates.getScore1() != null || updates.getScore2() != null) {
            Integer score1 = updates.getScore1() != null ? updates.getScore1() : existing.getScore1();
            Integer score2 = updates.getScore2() != null ? updates.getScore2() : existing.getScore2();
            validateScores(score1, score2);
        }

        // Proper field updates (no reflection!)
        if (updates.getTournament() != null) {
            existing.setTournament(updates.getTournament());
        }
        if (updates.getCourt() != null) {
            existing.setCourt(updates.getCourt());
        }
        if (updates.getPlayer1() != null) {
            existing.setPlayer1(updates.getPlayer1());
        }
        if (updates.getPlayer2() != null) {
            existing.setPlayer2(updates.getPlayer2());
        }
        if (updates.getScore1() != null) {
            existing.setScore1(updates.getScore1());
        }
        if (updates.getScore2() != null) {
            existing.setScore2(updates.getScore2());
        }
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        if (updates.getScheduledAt() != null) {
            existing.setScheduledAt(updates.getScheduledAt());
        }

        return repository.save(existing);
    }

    /**
     * Update match score - specific method for score updates
     */
    public Match updateScore(Long id, UpdateMatchScoreRequest request) {
        Match existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + id));

        validateScores(request.score1(), request.score2());

        existing.setScore1(request.score1());
        existing.setScore2(request.score2());

        // Auto-update status to COMPLETED if both scores are provided
        if (request.score1() != null && request.score2() != null && existing.getStatus() == MatchStatus.SCHEDULED) {
            existing.setStatus(MatchStatus.COMPLETED);
        }

        return repository.save(existing);
    }

    /**
     * Update match status
     */
    public Match updateStatus(Long id, MatchStatus status) {
        Match existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + id));

        existing.setStatus(status);

        return repository.save(existing);
    }

    /**
     * Delete match by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Match not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Check if match exists
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    // Private validation methods

    private void validateScores(Integer score1, Integer score2) {
        if (score1 != null && score1 < 0) {
            throw new RuntimeException("Score cannot be negative");
        }
        if (score2 != null && score2 < 0) {
            throw new RuntimeException("Score cannot be negative");
        }
    }
}
