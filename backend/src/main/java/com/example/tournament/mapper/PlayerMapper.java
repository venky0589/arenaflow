package com.example.tournament.mapper;

import com.example.tournament.domain.Player;
import com.example.tournament.dto.request.CreatePlayerRequest;
import com.example.tournament.dto.request.UpdatePlayerRequest;
import com.example.tournament.dto.response.PlayerResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Player entity and DTOs
 */
@Component
public class PlayerMapper {

    /**
     * Convert CreatePlayerRequest to Player entity
     */
    public Player toEntity(CreatePlayerRequest request) {
        if (request == null) {
            return null;
        }

        Player player = new Player();
        player.setFirstName(request.firstName());
        player.setLastName(request.lastName());
        player.setGender(request.gender());
        player.setPhone(request.phone());

        return player;
    }

    /**
     * Convert UpdatePlayerRequest to Player entity
     * Note: This creates a partial entity for update operations
     */
    public Player toEntity(UpdatePlayerRequest request) {
        if (request == null) {
            return null;
        }

        Player player = new Player();
        player.setFirstName(request.firstName());
        player.setLastName(request.lastName());
        player.setGender(request.gender());
        player.setPhone(request.phone());

        return player;
    }

    /**
     * Convert Player entity to PlayerResponse
     */
    public PlayerResponse toResponse(Player player) {
        if (player == null) {
            return null;
        }

        return new PlayerResponse(
                player.getId(),
                player.getFirstName(),
                player.getLastName(),
                player.getGender(),
                player.getPhone()
        );
    }
}
