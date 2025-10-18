package com.example.tournament.web;

import com.example.tournament.domain.Tournament;
import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.TournamentResponse;
import com.example.tournament.mapper.TournamentMapper;
import com.example.tournament.service.TournamentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    private final TournamentService service;
    private final TournamentMapper mapper;

    public TournamentController(TournamentService service, TournamentMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<TournamentResponse> all() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentResponse> one(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TournamentResponse> create(@Valid @RequestBody CreateTournamentRequest request) {
        try {
            Tournament saved = service.create(request);
            TournamentResponse response = mapper.toResponse(saved);
            return ResponseEntity.created(URI.create("/api/v1/tournaments/" + saved.getId())).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTournamentRequest request) {
        try {
            Tournament updated = service.update(id, request);
            TournamentResponse response = mapper.toResponse(updated);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
