package com.example.tournament.web;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.TournamentResponse;
import com.example.tournament.mapper.TournamentMapper;
import com.example.tournament.service.TournamentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TournamentController.class)
class TournamentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TournamentService service;

    @MockBean
    private TournamentMapper mapper;

    private Tournament tournament;
    private TournamentResponse tournamentResponse;
    private CreateTournamentRequest createRequest;

    @BeforeEach
    void setUp() {
        tournament = new Tournament();
        tournament.setName("Test Tournament");
        tournament.setLocation("Test Location");
        tournament.setStartDate(LocalDate.of(2025, 11, 1));
        tournament.setEndDate(LocalDate.of(2025, 11, 5));

        tournamentResponse = new TournamentResponse(
                1L,
                "Test Tournament",
                "Test Location",
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 11, 5)
        );

        createRequest = new CreateTournamentRequest(
                "Test Tournament",
                "Test Location",
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 11, 5)
        );
    }

    @Test
    void getAll_ReturnsListOfTournaments() throws Exception {
        // Given
        List<Tournament> tournaments = Arrays.asList(tournament);
        when(service.findAll()).thenReturn(tournaments);
        when(mapper.toResponse(tournament)).thenReturn(tournamentResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/tournaments"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Test Tournament"))
                .andExpect(jsonPath("$[0].location").value("Test Location"));

        verify(service).findAll();
    }

    @Test
    void getById_ExistingId_ReturnsTournament() throws Exception {
        // Given
        when(service.findById(1L)).thenReturn(Optional.of(tournament));
        when(mapper.toResponse(tournament)).thenReturn(tournamentResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/tournaments/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Tournament"))
                .andExpect(jsonPath("$.location").value("Test Location"));

        verify(service).findById(1L);
    }

    @Test
    void getById_NonExistingId_Returns404() throws Exception {
        // Given
        when(service.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        mockMvc.perform(get("/api/v1/tournaments/999"))
                .andExpect(status().isNotFound());

        verify(service).findById(999L);
    }

    @Test
    void create_ValidRequest_Returns201WithTournament() throws Exception {
        // Given
        when(service.create(any(CreateTournamentRequest.class))).thenReturn(tournament);
        when(mapper.toResponse(tournament)).thenReturn(tournamentResponse);

        // When/Then
        mockMvc.perform(post("/api/v1/tournaments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/tournaments/1"))
                .andExpect(jsonPath("$.name").value("Test Tournament"));

        verify(service).create(any(CreateTournamentRequest.class));
    }

    @Test
    void create_InvalidRequest_Returns400() throws Exception {
        // Given
        when(service.create(any())).thenThrow(new RuntimeException("Validation failed"));

        // When/Then
        mockMvc.perform(post("/api/v1/tournaments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_ValidRequest_Returns200WithUpdatedTournament() throws Exception {
        // Given
        UpdateTournamentRequest updateRequest = new UpdateTournamentRequest(
                "Updated Tournament",
                "Updated Location",
                null,
                null
        );

        when(service.update(eq(1L), any(UpdateTournamentRequest.class))).thenReturn(tournament);
        when(mapper.toResponse(tournament)).thenReturn(tournamentResponse);

        // When/Then
        mockMvc.perform(put("/api/v1/tournaments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").exists());

        verify(service).update(eq(1L), any(UpdateTournamentRequest.class));
    }

    @Test
    void update_NonExistingId_Returns404() throws Exception {
        // Given
        UpdateTournamentRequest updateRequest = new UpdateTournamentRequest("Updated", "Location", null, null);
        when(service.update(eq(999L), any())).thenThrow(new RuntimeException("Not found"));

        // When/Then
        mockMvc.perform(put("/api/v1/tournaments/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_ExistingId_Returns204() throws Exception {
        // Given
        doNothing().when(service).deleteById(1L);

        // When/Then
        mockMvc.perform(delete("/api/v1/tournaments/1"))
                .andExpect(status().isNoContent());

        verify(service).deleteById(1L);
    }

    @Test
    void delete_NonExistingId_Returns404() throws Exception {
        // Given
        doThrow(new RuntimeException("Not found")).when(service).deleteById(999L);

        // When/Then
        mockMvc.perform(delete("/api/v1/tournaments/999"))
                .andExpect(status().isNotFound());
    }
}
