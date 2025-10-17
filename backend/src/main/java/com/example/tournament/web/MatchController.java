package com.example.tournament.web;

import com.example.tournament.domain.Match;
import com.example.tournament.repo.MatchRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

    private final MatchRepository repo;

    public MatchController(MatchRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Match> all() {{ return repo.findAll(); }}

    @GetMapping("/{id}")
    public ResponseEntity<Match> one(@PathVariable Long id) {{
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }}

    @PostMapping
    public ResponseEntity<Match> create(@Valid @RequestBody Match body) {{
        Match saved = repo.save(body);
        return ResponseEntity.created(URI.create("/matches/" + saved.getId())).body(saved);
    }}

    @PutMapping("/{id}")
    public ResponseEntity<Match> update(@PathVariable Long id, @Valid @RequestBody Match body) {{
        return repo.findById(id).map(existing -> {{
            body.getClass(); // no-op
            // naive replace: set ID and save
            try {{
                var idField = Match.class.getDeclaredField("id");
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
