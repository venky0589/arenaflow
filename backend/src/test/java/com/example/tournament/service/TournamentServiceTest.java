package com.example.tournament.service;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.mapper.TournamentMapper;
import com.example.tournament.repo.TournamentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

    @Mock
    private TournamentRepository repository;

    @Mock
    private TournamentMapper mapper;

    @InjectMocks
    private TournamentService service;

    private Tournament tournament;
    private CreateTournamentRequest createRequest;
    private UpdateTournamentRequest updateRequest;

    @BeforeEach
    void setUp() {
        tournament = new Tournament();
        tournament.setName("Test Tournament");
        tournament.setLocation("Test Location");
        tournament.setStartDate(LocalDate.now().plusDays(1));
        tournament.setEndDate(LocalDate.now().plusDays(5));

        createRequest = new CreateTournamentRequest(
                "Test Tournament",
                "Test Location",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(5)
        );

        updateRequest = new UpdateTournamentRequest(
                "Updated Tournament",
                "Updated Location",
                LocalDate.now().plusDays(2),
                LocalDate.now().plusDays(6)
        );
    }

    @Test
    void findAll_ReturnsAllTournaments() {
        // Given
        List<Tournament> tournaments = Arrays.asList(tournament);
        when(repository.findAll()).thenReturn(tournaments);

        // When
        List<Tournament> result = service.findAll();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(tournament);
        verify(repository).findAll();
    }

    @Test
    void findById_ExistingId_ReturnsTournament() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(tournament));

        // When
        Optional<Tournament> result = service.findById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(tournament);
        verify(repository).findById(1L);
    }

    @Test
    void findById_NonExistingId_ReturnsEmpty() {
        // Given
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Tournament> result = service.findById(999L);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
    }

    @Test
    void create_ValidRequest_ReturnsSavedTournament() {
        // Given
        when(mapper.toEntity(createRequest)).thenReturn(tournament);
        when(repository.findAll()).thenReturn(List.of());  // No duplicates
        when(repository.save(tournament)).thenReturn(tournament);

        // When
        Tournament result = service.create(createRequest);

        // Then
        assertThat(result).isEqualTo(tournament);
        verify(mapper).toEntity(createRequest);
        verify(repository).save(tournament);
    }

    @Test
    void create_EndDateBeforeStartDate_ThrowsException() {
        // Given
        Tournament invalidTournament = new Tournament();
        invalidTournament.setName("Invalid");
        invalidTournament.setLocation("Test");
        invalidTournament.setStartDate(LocalDate.now().plusDays(5));
        invalidTournament.setEndDate(LocalDate.now().plusDays(1));  // Before start date

        when(mapper.toEntity(any(CreateTournamentRequest.class))).thenReturn(invalidTournament);

        CreateTournamentRequest invalidRequest = new CreateTournamentRequest(
                "Invalid",
                "Test",
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(1)
        );

        // When/Then
        assertThatThrownBy(() -> service.create(invalidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("end date must be after start date");
    }

    @Test
    void create_StartDateInPast_ThrowsException() {
        // Given
        Tournament pastTournament = new Tournament();
        pastTournament.setName("Past Tournament");
        pastTournament.setLocation("Test");
        pastTournament.setStartDate(LocalDate.now().minusDays(1));  // Past date
        pastTournament.setEndDate(LocalDate.now().plusDays(1));

        when(mapper.toEntity(any(CreateTournamentRequest.class))).thenReturn(pastTournament);

        CreateTournamentRequest pastRequest = new CreateTournamentRequest(
                "Past Tournament",
                "Test",
                LocalDate.now().minusDays(1),
                LocalDate.now().plusDays(1)
        );

        // When/Then
        assertThatThrownBy(() -> service.create(pastRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("start date cannot be in the past");
    }

    @Test
    void create_DuplicateName_ThrowsException() {
        // Given
        Tournament existingTournament = new Tournament();
        existingTournament.setName("Test Tournament");

        when(mapper.toEntity(createRequest)).thenReturn(tournament);
        when(repository.findAll()).thenReturn(List.of(existingTournament));

        // When/Then
        assertThatThrownBy(() -> service.create(createRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void update_ValidRequest_ReturnsUpdatedTournament() {
        // Given
        Tournament existing = new Tournament();
        existing.setName("Original Name");
        existing.setLocation("Original Location");
        existing.setStartDate(LocalDate.now().plusDays(1));
        existing.setEndDate(LocalDate.now().plusDays(5));

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.findAll()).thenReturn(List.of());  // No duplicate names
        when(repository.save(existing)).thenReturn(existing);

        // When
        Tournament result = service.update(1L, updateRequest);

        // Then
        assertThat(result.getName()).isEqualTo("Updated Tournament");
        assertThat(result.getLocation()).isEqualTo("Updated Location");
        verify(repository).save(existing);
    }

    @Test
    void update_NonExistingId_ThrowsException() {
        // Given
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.update(999L, updateRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void deleteById_ExistingId_DeletesSuccessfully() {
        // Given
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        // When
        service.deleteById(1L);

        // Then
        verify(repository).deleteById(1L);
    }

    @Test
    void deleteById_NonExistingId_ThrowsException() {
        // Given
        when(repository.existsById(999L)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> service.deleteById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void existsById_ExistingId_ReturnsTrue() {
        // Given
        when(repository.existsById(1L)).thenReturn(true);

        // When
        boolean result = service.existsById(1L);

        // Then
        assertThat(result).isTrue();
        verify(repository).existsById(1L);
    }

    @Test
    void existsById_NonExistingId_ReturnsFalse() {
        // Given
        when(repository.existsById(999L)).thenReturn(false);

        // When
        boolean result = service.existsById(999L);

        // Then
        assertThat(result).isFalse();
        verify(repository).existsById(999L);
    }
}
