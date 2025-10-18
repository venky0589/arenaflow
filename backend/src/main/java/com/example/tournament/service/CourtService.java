package com.example.tournament.service;

import com.example.tournament.domain.Court;
import com.example.tournament.repo.CourtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourtService {

    private final CourtRepository repository;

    public CourtService(CourtRepository repository) {
        this.repository = repository;
    }

    /**
     * Get all courts
     */
    public List<Court> findAll() {
        return repository.findAll();
    }

    /**
     * Find court by ID
     */
    public Optional<Court> findById(Long id) {
        return repository.findById(id);
    }

    /**
     * Create a new court with business validations
     */
    public Court create(Court court) {
        // Business validation: check for duplicate court name (unique constraint)
        validateUniqueName(court.getName(), null);

        return repository.save(court);
    }

    /**
     * Update existing court with proper field updates (no reflection hack!)
     */
    public Court update(Long id, Court updates) {
        Court existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Court not found with id: " + id));

        // Business validation: check for duplicate court name if name is being updated
        if (updates.getName() != null && !updates.getName().equals(existing.getName())) {
            validateUniqueName(updates.getName(), id);
        }

        // Proper field updates (no reflection!)
        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }
        if (updates.getLocationNote() != null) {
            existing.setLocationNote(updates.getLocationNote());
        }

        return repository.save(existing);
    }

    /**
     * Delete court by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Court not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Check if court exists
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    // Private validation methods

    private void validateUniqueName(String name, Long excludeId) {
        List<Court> existing = repository.findAll();
        boolean duplicateExists = existing.stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(name) &&
                        (excludeId == null || !c.getId().equals(excludeId)));

        if (duplicateExists) {
            throw new RuntimeException("Court with name '" + name + "' already exists");
        }
    }
}
