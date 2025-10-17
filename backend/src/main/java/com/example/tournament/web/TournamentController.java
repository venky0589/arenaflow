package com.example.tournament.web;

import com.example.tournament.domain.Tournament;
import com.example.tournament.repo.TournamentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    private final TournamentRepository repo;

    public TournamentController(TournamentRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Tournament> all() {{ return repo.findAll(); }}

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> one(@PathVariable Long id) {{
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }}

    @PostMapping
    public ResponseEntity<Tournament> create(@Valid @RequestBody Tournament body) {{
        Tournament saved = repo.save(body);
        return ResponseEntity.created(URI.create("/tournaments/" + saved.getId())).body(saved);
    }}

    @PutMapping("/{id}")
    public ResponseEntity<Tournament> update(@PathVariable Long id, @Valid @RequestBody Tournament body) {{
        return repo.findById(id).map(existing -> {{
            body.getClass(); // no-op
            // naive replace: set ID and save
            try {{
                var idField = Tournament.class.getDeclaredField("id");
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
