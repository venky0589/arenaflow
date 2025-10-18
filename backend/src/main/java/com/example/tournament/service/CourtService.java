package com.example.tournament.service;

import com.example.tournament.domain.Court;
import com.example.tournament.dto.request.CreateCourtRequest;
import com.example.tournament.dto.request.UpdateCourtRequest;
import com.example.tournament.exception.DuplicateResourceException;
import com.example.tournament.exception.ResourceNotFoundException;
import com.example.tournament.mapper.CourtMapper;
import com.example.tournament.repo.CourtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourtService {

    private final CourtRepository repository;
    private final CourtMapper mapper;

    public CourtService(CourtRepository repository, CourtMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
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
    public Court create(CreateCourtRequest request) {
        Court court = mapper.toEntity(request);

        // Business validation: check for duplicate court name (unique constraint)
        validateUniqueName(court.getName(), null);

        return repository.save(court);
    }

    /**
     * Update existing court with proper field updates (no reflection hack!)
     */
    public Court update(Long id, UpdateCourtRequest request) {
        Court existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Court", id));

        // Business validation: check for duplicate court name if name is being updated
        if (request.name() != null && !request.name().equals(existing.getName())) {
            validateUniqueName(request.name(), id);
        }

        // Proper field updates (no reflection!)
        if (request.name() != null) {
            existing.setName(request.name());
        }
        if (request.locationNote() != null) {
            existing.setLocationNote(request.locationNote());
        }

        return repository.save(existing);
    }

    /**
     * Delete court by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Court", id);
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
            throw new DuplicateResourceException("Court", "name", name);
        }
    }
}
