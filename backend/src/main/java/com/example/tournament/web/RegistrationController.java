package com.example.tournament.web;

import com.example.tournament.domain.Registration;
import com.example.tournament.repo.RegistrationRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
public class RegistrationController {

    private final RegistrationRepository repo;

    public RegistrationController(RegistrationRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Registration> all() {{ return repo.findAll(); }}

    @GetMapping("/{id}")
    public ResponseEntity<Registration> one(@PathVariable Long id) {{
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }}

    @PostMapping
    public ResponseEntity<Registration> create(@Valid @RequestBody Registration body) {{
        Registration saved = repo.save(body);
        return ResponseEntity.created(URI.create("/registrations/" + saved.getId())).body(saved);
    }}

    @PutMapping("/{id}")
    public ResponseEntity<Registration> update(@PathVariable Long id, @Valid @RequestBody Registration body) {{
        return repo.findById(id).map(existing -> {{
            body.getClass(); // no-op
            // naive replace: set ID and save
            try {{
                var idField = Registration.class.getDeclaredField("id");
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
