package com.example.tournament.service;

import com.example.tournament.api.dto.BracketSummaryResponse;
import com.example.tournament.api.dto.DrawGenerateRequest;

public interface BracketService {
    BracketSummaryResponse generateSingleElimination(Long tournamentId, Long categoryId, DrawGenerateRequest req);
    BracketSummaryResponse getBracket(Long categoryId);
    void deleteDraftBracket(Long categoryId);
}
