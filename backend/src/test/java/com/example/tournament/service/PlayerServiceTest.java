package com.example.tournament.service;

import com.example.tournament.domain.Player;
import com.example.tournament.dto.request.CreatePlayerRequest;
import com.example.tournament.dto.request.UpdatePlayerRequest;
import com.example.tournament.mapper.PlayerMapper;
import com.example.tournament.repo.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock
    private PlayerRepository repository;

    @Mock
    private PlayerMapper mapper;

    @InjectMocks
    private PlayerService service;

    private Player player;
    private CreatePlayerRequest createRequest;

    @BeforeEach
    void setUp() {
        player = new Player();
        player.setFirstName("John");
        player.setLastName("Doe");
        player.setGender("M");
        player.setPhone("1234567890");

        createRequest = new CreatePlayerRequest("John", "Doe", "M", "1234567890");
    }

    @Test
    void create_ValidRequest_ReturnsSavedPlayer() {
        when(mapper.toEntity(createRequest)).thenReturn(player);
        when(repository.findAll()).thenReturn(List.of());
        when(repository.save(player)).thenReturn(player);

        Player result = service.create(createRequest);

        assertThat(result).isEqualTo(player);
        verify(repository).save(player);
    }

    @Test
    void create_DuplicatePlayer_ThrowsException() {
        Player existing = new Player();
        existing.setFirstName("John");
        existing.setLastName("Doe");

        when(mapper.toEntity(createRequest)).thenReturn(player);
        when(repository.findAll()).thenReturn(List.of(existing));

        assertThatThrownBy(() -> service.create(createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void create_InvalidGender_ThrowsException() {
        Player invalidPlayer = new Player();
        invalidPlayer.setFirstName("John");
        invalidPlayer.setLastName("Doe");
        invalidPlayer.setGender("X");  // Invalid

        when(mapper.toEntity(any(CreatePlayerRequest.class))).thenReturn(invalidPlayer);
        when(repository.findAll()).thenReturn(List.of());

        CreatePlayerRequest invalidRequest = new CreatePlayerRequest("John", "Doe", "X", "1234567890");

        assertThatThrownBy(() -> service.create(invalidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Gender must be");
    }

    @Test
    void findById_ExistingId_ReturnsPlayer() {
        when(repository.findById(1L)).thenReturn(Optional.of(player));

        Optional<Player> result = service.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(player);
    }

    @Test
    void deleteById_ExistingId_DeletesSuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);

        service.deleteById(1L);

        verify(repository).deleteById(1L);
    }
}
