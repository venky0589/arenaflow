package com.example.tournament.web;

import com.example.tournament.domain.Court;
import com.example.tournament.repo.CourtRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/courts")
public class CourtController {

    private final CourtRepository repo;

    public CourtController(CourtRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Court> all() {{ return repo.findAll(); }}

    @GetMapping("/{id}")
    public ResponseEntity<Court> one(@PathVariable Long id) {{
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }}

    @PostMapping
    public ResponseEntity<Court> create(@Valid @RequestBody Court body) {{
        Court saved = repo.save(body);
        return ResponseEntity.created(URI.create("/courts/" + saved.getId())).body(saved);
    }}

    @PutMapping("/{id}")
    public ResponseEntity<Court> update(@PathVariable Long id, @Valid @RequestBody Court body) {{
        return repo.findById(id).map(existing -> {{
            body.getClass(); // no-op
            // naive replace: set ID and save
            try {{
                var idField = Court.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(body, id);
            }} catch (Exception ignored) {{}}
            return ResponseEntity.ok(repo.save(body));
        }}).orElse(ResponseEntity.notFound().build());
    }}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {{
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }}
}
