package com.example.tournament.api;

import com.example.tournament.api.dto.BracketSummaryResponse;
import com.example.tournament.api.dto.DrawGenerateRequest;
import com.example.tournament.service.BracketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class BracketController {

    private final BracketService bracketService;

    public BracketController(BracketService bracketService) {
        this.bracketService = bracketService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/tournaments/{tId}/categories/{cId}/draw:generate")
    public ResponseEntity<BracketSummaryResponse> generate(
            @PathVariable Long tId,
            @PathVariable Long cId,
            @RequestBody(required = false) DrawGenerateRequest req) {
        return ResponseEntity.ok(bracketService.generateSingleElimination(tId, cId, req));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/categories/{cId}/bracket")
    public ResponseEntity<BracketSummaryResponse> get(@PathVariable Long cId) {
        return ResponseEntity.ok(bracketService.getBracket(cId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{cId}/bracket")
    public ResponseEntity<Void> deleteDraft(@PathVariable Long cId, @RequestParam(defaultValue = "true") boolean draft) {
        if (!draft) return ResponseEntity.badRequest().build();
        bracketService.deleteDraftBracket(cId);
        return ResponseEntity.noContent().build();
    }
}
