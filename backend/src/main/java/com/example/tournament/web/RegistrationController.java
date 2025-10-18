package com.example.tournament.web;

import com.example.tournament.domain.Registration;
import com.example.tournament.dto.request.CreateRegistrationRequest;
import com.example.tournament.dto.request.UpdateRegistrationRequest;
import com.example.tournament.dto.response.RegistrationResponse;
import com.example.tournament.mapper.RegistrationMapper;
import com.example.tournament.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/registrations")
public class RegistrationController {

    private final RegistrationService service;
    private final RegistrationMapper mapper;

    public RegistrationController(RegistrationService service, RegistrationMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<RegistrationResponse> all() {
        return service.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistrationResponse> one(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> create(@Valid @RequestBody CreateRegistrationRequest request) {
        try {
            Registration saved = service.create(request);
            RegistrationResponse response = mapper.toResponse(saved);
            return ResponseEntity.created(URI.create("/api/v1/registrations/" + saved.getId())).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistrationResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateRegistrationRequest request) {
        try {
            Registration updated = service.update(id, request);
            RegistrationResponse response = mapper.toResponse(updated);
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
