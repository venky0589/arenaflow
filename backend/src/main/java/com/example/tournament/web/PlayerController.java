package com.example.tournament.web;

import com.example.tournament.domain.Player;
import com.example.tournament.dto.request.CreatePlayerRequest;
import com.example.tournament.dto.request.UpdatePlayerRequest;
import com.example.tournament.dto.response.PlayerResponse;
import com.example.tournament.mapper.PlayerMapper;
import com.example.tournament.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/players")
public class PlayerController {

    private final PlayerService service;
    private final PlayerMapper mapper;

    public PlayerController(PlayerService service, PlayerMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<PlayerResponse> all() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> one(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PlayerResponse> create(@Valid @RequestBody CreatePlayerRequest request) {
        try {
            Player saved = service.create(request);
            PlayerResponse response = mapper.toResponse(saved);
            return ResponseEntity.created(URI.create("/api/v1/players/" + saved.getId())).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerResponse> update(@PathVariable Long id, @Valid @RequestBody UpdatePlayerRequest request) {
        try {
            Player updated = service.update(id, request);
            PlayerResponse response = mapper.toResponse(updated);
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
