package com.example.tournament.mapper;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.TournamentResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TournamentMapperTest {

    private TournamentMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new TournamentMapper();
    }

    @Test
    void toEntity_CreateRequest_MapsAllFields() {
        // Given
        CreateTournamentRequest request = new CreateTournamentRequest(
                "Test Tournament",
                "Test Location",
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 11, 5)
        );

        // When
        Tournament entity = mapper.toEntity(request);

        // Then
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Tournament");
        assertThat(entity.getLocation()).isEqualTo("Test Location");
        assertThat(entity.getStartDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(entity.getEndDate()).isEqualTo(LocalDate.of(2025, 11, 5));
    }

    @Test
    void toEntity_UpdateRequest_MapsAllFields() {
        // Given
        UpdateTournamentRequest request = new UpdateTournamentRequest(
                "Updated Tournament",
                "Updated Location",
                LocalDate.of(2025, 12, 1),
                LocalDate.of(2025, 12, 5)
        );

        // When
        Tournament entity = mapper.toEntity(request);

        // Then
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Updated Tournament");
        assertThat(entity.getLocation()).isEqualTo("Updated Location");
        assertThat(entity.getStartDate()).isEqualTo(LocalDate.of(2025, 12, 1));
        assertThat(entity.getEndDate()).isEqualTo(LocalDate.of(2025, 12, 5));
    }

    @Test
    void toResponse_Entity_MapsAllFields() {
        // Given
        Tournament entity = new Tournament();
        entity.setName("Test Tournament");
        entity.setLocation("Test Location");
        entity.setStartDate(LocalDate.of(2025, 11, 1));
        entity.setEndDate(LocalDate.of(2025, 11, 5));

        // When
        TournamentResponse response = mapper.toResponse(entity);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Test Tournament");
        assertThat(response.location()).isEqualTo("Test Location");
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(response.endDate()).isEqualTo(LocalDate.of(2025, 11, 5));
    }

    @Test
    void toResponse_NullEntity_ReturnsNull() {
        // When
        TournamentResponse response = mapper.toResponse(null);

        // Then
        assertThat(response).isNull();
    }

    @Test
    void toEntity_NullCreateRequest_ReturnsNull() {
        // When
        Tournament entity = mapper.toEntity((CreateTournamentRequest) null);

        // Then
        assertThat(entity).isNull();
    }

    @Test
    void toEntity_NullUpdateRequest_ReturnsNull() {
        // When
        Tournament entity = mapper.toEntity((UpdateTournamentRequest) null);

        // Then
        assertThat(entity).isNull();
    }
}
