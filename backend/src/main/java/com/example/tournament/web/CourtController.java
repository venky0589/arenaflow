package com.example.tournament.web;

import com.example.tournament.domain.Court;
import com.example.tournament.dto.request.CreateCourtRequest;
import com.example.tournament.dto.request.UpdateCourtRequest;
import com.example.tournament.dto.response.CourtResponse;
import com.example.tournament.mapper.CourtMapper;
import com.example.tournament.service.CourtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/courts")
public class CourtController {

    private final CourtService service;
    private final CourtMapper mapper;

    public CourtController(CourtService service, CourtMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<CourtResponse> all() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourtResponse> one(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CourtResponse> create(@Valid @RequestBody CreateCourtRequest request) {
        try {
            Court saved = service.create(request);
            CourtResponse response = mapper.toResponse(saved);
            return ResponseEntity.created(URI.create("/api/v1/courts/" + saved.getId())).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourtResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCourtRequest request) {
        try {
            Court updated = service.update(id, request);
            CourtResponse response = mapper.toResponse(updated);
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
