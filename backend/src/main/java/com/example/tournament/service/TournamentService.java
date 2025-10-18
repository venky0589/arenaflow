package com.example.tournament.service;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.exception.DuplicateResourceException;
import com.example.tournament.exception.ResourceNotFoundException;
import com.example.tournament.exception.ValidationException;
import com.example.tournament.mapper.TournamentMapper;
import com.example.tournament.repo.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TournamentService {

    private final TournamentRepository repository;
    private final TournamentMapper mapper;

    public TournamentService(TournamentRepository repository, TournamentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    /**
     * Get all tournaments
     */
    public List<Tournament> findAll() {
        return repository.findAll();
    }

    /**
     * Find tournament by ID
     */
    public Optional<Tournament> findById(Long id) {
        return repository.findById(id);
    }

    /**
     * Create a new tournament with business validations
     */
    public Tournament create(CreateTournamentRequest request) {
        Tournament tournament = mapper.toEntity(request);

        // Business validation: end date must be after start date
        validateTournamentDates(tournament);

        // Business validation: check for duplicate tournament names
        validateUniqueName(tournament.getName(), null);

        return repository.save(tournament);
    }

    /**
     * Update existing tournament with proper field updates (no reflection hack!)
     */
    public Tournament update(Long id, UpdateTournamentRequest request) {
        Tournament existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", id));

        // Business validation for dates
        if (request.startDate() != null && request.endDate() != null) {
            validateDates(request.startDate(), request.endDate());
        }

        // Business validation: check for duplicate names (excluding current tournament)
        if (request.name() != null && !request.name().equals(existing.getName())) {
            validateUniqueName(request.name(), id);
        }

        // Proper field updates (no reflection!)
        if (request.name() != null) {
            existing.setName(request.name());
        }
        if (request.location() != null) {
            existing.setLocation(request.location());
        }
        if (request.startDate() != null) {
            existing.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            existing.setEndDate(request.endDate());
        }

        return repository.save(existing);
    }

    /**
     * Delete tournament by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Tournament", id);
        }
        repository.deleteById(id);
    }

    /**
     * Check if tournament exists
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    // Private validation methods

    private void validateTournamentDates(Tournament tournament) {
        if (tournament.getStartDate() != null && tournament.getEndDate() != null) {
            validateDates(tournament.getStartDate(), tournament.getEndDate());
        }

        // Validate start date is not in the past
        if (tournament.getStartDate() != null && tournament.getStartDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Tournament start date cannot be in the past");
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new ValidationException("Tournament end date must be after start date");
        }
    }

    private void validateUniqueName(String name, Long excludeId) {
        List<Tournament> existing = repository.findAll();
        boolean duplicateExists = existing.stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(name) &&
                        (excludeId == null || !t.getId().equals(excludeId)));

        if (duplicateExists) {
            throw new DuplicateResourceException("Tournament", "name", name);
        }
    }
}
