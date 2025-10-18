package com.example.tournament.service;

import com.example.tournament.domain.Tournament;
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

    public TournamentService(TournamentRepository repository) {
        this.repository = repository;
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
    public Tournament create(Tournament tournament) {
        // Business validation: end date must be after start date
        validateTournamentDates(tournament);

        // Business validation: check for duplicate tournament names
        validateUniqueName(tournament.getName(), null);

        return repository.save(tournament);
    }

    /**
     * Update existing tournament with proper field updates (no reflection hack!)
     */
    public Tournament update(Long id, Tournament updates) {
        Tournament existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));

        // Business validation for dates
        if (updates.getStartDate() != null && updates.getEndDate() != null) {
            validateDates(updates.getStartDate(), updates.getEndDate());
        }

        // Business validation: check for duplicate names (excluding current tournament)
        if (updates.getName() != null && !updates.getName().equals(existing.getName())) {
            validateUniqueName(updates.getName(), id);
        }

        // Proper field updates (no reflection!)
        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }
        if (updates.getLocation() != null) {
            existing.setLocation(updates.getLocation());
        }
        if (updates.getStartDate() != null) {
            existing.setStartDate(updates.getStartDate());
        }
        if (updates.getEndDate() != null) {
            existing.setEndDate(updates.getEndDate());
        }

        return repository.save(existing);
    }

    /**
     * Delete tournament by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Tournament not found with id: " + id);
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
            throw new RuntimeException("Tournament start date cannot be in the past");
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("Tournament end date must be after start date");
        }
    }

    private void validateUniqueName(String name, Long excludeId) {
        List<Tournament> existing = repository.findAll();
        boolean duplicateExists = existing.stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(name) &&
                        (excludeId == null || !t.getId().equals(excludeId)));

        if (duplicateExists) {
            throw new RuntimeException("Tournament with name '" + name + "' already exists");
        }
    }
}
