package com.example.tournament.service;

import com.example.tournament.domain.Player;
import com.example.tournament.dto.request.CreatePlayerRequest;
import com.example.tournament.dto.request.UpdatePlayerRequest;
import com.example.tournament.mapper.PlayerMapper;
import com.example.tournament.repo.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository repository;
    private final PlayerMapper mapper;

    public PlayerService(PlayerRepository repository, PlayerMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    /**
     * Get all players
     */
    public List<Player> findAll() {
        return repository.findAll();
    }

    /**
     * Find player by ID
     */
    public Optional<Player> findById(Long id) {
        return repository.findById(id);
    }

    /**
     * Create a new player with business validations
     */
    public Player create(CreatePlayerRequest request) {
        Player player = mapper.toEntity(request);

        // Business validation: check for duplicate player (same first name + last name)
        validateUniquePlayer(player.getFirstName(), player.getLastName(), null);

        // Business validation: validate gender if provided
        if (player.getGender() != null) {
            validateGender(player.getGender());
        }

        return repository.save(player);
    }

    /**
     * Update existing player with proper field updates (no reflection hack!)
     */
    public Player update(Long id, UpdatePlayerRequest request) {
        Player existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));

        // Business validation: check for duplicate player names (excluding current player)
        if (request.firstName() != null || request.lastName() != null) {
            String firstName = request.firstName() != null ? request.firstName() : existing.getFirstName();
            String lastName = request.lastName() != null ? request.lastName() : existing.getLastName();

            if (!firstName.equals(existing.getFirstName()) || !lastName.equals(existing.getLastName())) {
                validateUniquePlayer(firstName, lastName, id);
            }
        }

        // Business validation: validate gender if being updated
        if (request.gender() != null) {
            validateGender(request.gender());
        }

        // Proper field updates (no reflection!)
        if (request.firstName() != null) {
            existing.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            existing.setLastName(request.lastName());
        }
        if (request.gender() != null) {
            existing.setGender(request.gender());
        }
        if (request.phone() != null) {
            existing.setPhone(request.phone());
        }

        return repository.save(existing);
    }

    /**
     * Delete player by ID
     */
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Player not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Check if player exists
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    // Private validation methods

    private void validateUniquePlayer(String firstName, String lastName, Long excludeId) {
        List<Player> existing = repository.findAll();
        boolean duplicateExists = existing.stream()
                .anyMatch(p -> p.getFirstName().equalsIgnoreCase(firstName) &&
                        p.getLastName().equalsIgnoreCase(lastName) &&
                        (excludeId == null || !p.getId().equals(excludeId)));

        if (duplicateExists) {
            throw new RuntimeException("Player with name '" + firstName + " " + lastName + "' already exists");
        }
    }

    private void validateGender(String gender) {
        if (gender != null && !gender.isEmpty()) {
            String upperGender = gender.toUpperCase();
            if (!upperGender.equals("M") && !upperGender.equals("F")) {
                throw new RuntimeException("Gender must be 'M' or 'F'");
            }
        }
    }
}
