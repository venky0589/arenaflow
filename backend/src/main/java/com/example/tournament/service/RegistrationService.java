package com.example.tournament.service;

import com.example.tournament.domain.CategoryType;
import com.example.tournament.domain.Registration;
import com.example.tournament.dto.request.CreateRegistrationRequest;
import com.example.tournament.dto.request.UpdateRegistrationRequest;
import com.example.tournament.exception.DuplicateResourceException;
import com.example.tournament.exception.InvalidRequestException;
import com.example.tournament.exception.ResourceNotFoundException;
import com.example.tournament.mapper.RegistrationMapper;
import com.example.tournament.repo.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RegistrationService {

    private final RegistrationRepository repository;
    private final RegistrationMapper mapper;

    public RegistrationService(RegistrationRepository repository, RegistrationMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    /**
     * Get all registrations
     */
    public List<Registration> findAll() {
        return repository.findAll();
    }

    /**
     * Find registration by ID
     */
    public Optional<Registration> findById(Long id) {
        return repository.findById(id);
    }

    /**
     * Create a new registration with business validations
     */
    public Registration create(CreateRegistrationRequest request) {
        Registration registration = mapper.toEntity(request);

        // Business validation: ensure tournament and player are set
        if (registration.getTournament() == null) {
            throw new InvalidRequestException("Registration must be associated with a tournament");
        }
        if (registration.getPlayer() == null) {
            throw new InvalidRequestException("Registration must be associated with a player");
        }

        // Business validation: prevent duplicate registrations (same player, tournament, category)
        validateUniqueRegistration(
                registration.getTournament().getId(),
                registration.getPlayer().getId(),
                registration.getCategoryType(),
                null
        );

        return repository.save(registration);
    }

    /**
     * Update existing registration with proper field updates (no reflection hack!)
     */
    public Registration update(Long id, UpdateRegistrationRequest request) {
        Registration existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));

        Registration updates = mapper.toEntity(request);

        // Business validation: prevent duplicate if tournament, player, or category is being updated
        Long tournamentId = updates.getTournament() != null ?
                updates.getTournament().getId() : existing.getTournament().getId();
        Long playerId = updates.getPlayer() != null ?
                updates.getPlayer().getId() : existing.getPlayer().getId();
        var categoryType = updates.getCategoryType() != null ?
                updates.getCategoryType() : existing.getCategoryType();

        // Check if any key fields changed
        boolean keyFieldsChanged =
                (updates.getTournament() != null && !updates.getTournament().getId().equals(existing.getTournament().getId())) ||
                (updates.getPlayer() != null && !updates.getPlayer().getId().equals(existing.getPlayer().getId())) ||
                (updates.getCategoryType() != null && !updates.getCategoryType().equals(existing.getCategoryType()));

        if (keyFieldsChanged) {
            validateUniqueRegistration(tournamentId, playerId, categoryType, id);
        }

        // Proper field updates (no reflection!)
        if (updates.getTournament() != null) {
            existing.setTournament(updates.getTournament());
        }
        if (updates.getPlayer() != null) {
            existing.setPlayer(updates.getPlayer());
        }
        if (updates.getCategoryType() != null) {
            existing.setCategoryType(updates.getCategoryType());
        }

        return repository.save(existing);
    }

    /**
     * Delete registration by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Registration", id);
        }
        repository.deleteById(id);
    }

    /**
     * Check if registration exists
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    // Private validation methods

    private void validateUniqueRegistration(Long tournamentId, Long playerId,
                                           CategoryType categoryType, Long excludeId) {
        List<Registration> existing = repository.findAll();
        boolean duplicateExists = existing.stream()
                .anyMatch(r -> r.getTournament().getId().equals(tournamentId) &&
                        r.getPlayer().getId().equals(playerId) &&
                        r.getCategoryType().equals(categoryType) &&
                        (excludeId == null || !r.getId().equals(excludeId)));

        if (duplicateExists) {
            throw new DuplicateResourceException("Player is already registered for this tournament in this category");
        }
    }
}
