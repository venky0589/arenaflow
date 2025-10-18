package com.example.tournament.service;

import com.example.tournament.domain.Player;
import com.example.tournament.repo.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository repository;

    public PlayerService(PlayerRepository repository) {
        this.repository = repository;
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
    public Player create(Player player) {
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
    public Player update(Long id, Player updates) {
        Player existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));

        // Business validation: check for duplicate player names (excluding current player)
        if (updates.getFirstName() != null || updates.getLastName() != null) {
            String firstName = updates.getFirstName() != null ? updates.getFirstName() : existing.getFirstName();
            String lastName = updates.getLastName() != null ? updates.getLastName() : existing.getLastName();

            if (!firstName.equals(existing.getFirstName()) || !lastName.equals(existing.getLastName())) {
                validateUniquePlayer(firstName, lastName, id);
            }
        }

        // Business validation: validate gender if being updated
        if (updates.getGender() != null) {
            validateGender(updates.getGender());
        }

        // Proper field updates (no reflection!)
        if (updates.getFirstName() != null) {
            existing.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            existing.setLastName(updates.getLastName());
        }
        if (updates.getGender() != null) {
            existing.setGender(updates.getGender());
        }
        if (updates.getPhone() != null) {
            existing.setPhone(updates.getPhone());
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
