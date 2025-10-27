package com.example.tournament.api.dto;

import java.util.List;

public class BracketSummaryResponse {
    private Long categoryId;
    private int totalParticipants;
    private int effectiveSize;
    private int rounds;
    private List<MatchDto> matches;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public int getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }
    public int getEffectiveSize() { return effectiveSize; }
    public void setEffectiveSize(int effectiveSize) { this.effectiveSize = effectiveSize; }
    public int getRounds() { return rounds; }
    public void setRounds(int rounds) { this.rounds = rounds; }
    public List<MatchDto> getMatches() { return matches; }
    public void setMatches(List<MatchDto> matches) { this.matches = matches; }
}
