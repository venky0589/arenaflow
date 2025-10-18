package com.example.tournament.web;

import com.example.tournament.domain.Match;
import com.example.tournament.dto.request.CreateMatchRequest;
import com.example.tournament.dto.request.UpdateMatchRequest;
import com.example.tournament.dto.request.UpdateMatchScoreRequest;
import com.example.tournament.dto.response.MatchResponse;
import com.example.tournament.mapper.MatchMapper;
import com.example.tournament.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

    private final MatchService service;
    private final MatchMapper mapper;

    public MatchController(MatchService service, MatchMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<MatchResponse> all() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> one(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MatchResponse> create(@Valid @RequestBody CreateMatchRequest request) {
        Match saved = service.create(request);
        MatchResponse response = mapper.toResponse(saved);
        return ResponseEntity.created(URI.create("/api/v1/matches/" + saved.getId())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatchResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateMatchRequest request) {
        Match updated = service.update(id, request);
        MatchResponse response = mapper.toResponse(updated);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/score")
    public ResponseEntity<MatchResponse> updateScore(@PathVariable Long id, @Valid @RequestBody UpdateMatchScoreRequest request) {
        Match updated = service.updateScore(id, request);
        MatchResponse response = mapper.toResponse(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
