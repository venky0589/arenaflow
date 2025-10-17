package com.example.tournament.web;

import com.example.tournament.domain.Player;
import com.example.tournament.repo.PlayerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/players")
public class PlayerController {

    private final PlayerRepository repo;

    public PlayerController(PlayerRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Player> all() {{ return repo.findAll(); }}

    @GetMapping("/{id}")
    public ResponseEntity<Player> one(@PathVariable Long id) {{
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }}

    @PostMapping
    public ResponseEntity<Player> create(@Valid @RequestBody Player body) {{
        Player saved = repo.save(body);
        return ResponseEntity.created(URI.create("/players/" + saved.getId())).body(saved);
    }}

    @PutMapping("/{id}")
    public ResponseEntity<Player> update(@PathVariable Long id, @Valid @RequestBody Player body) {{
        return repo.findById(id).map(existing -> {{
            body.getClass(); // no-op
            // naive replace: set ID and save
            try {{
                var idField = Player.class.getDeclaredField("id");
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
