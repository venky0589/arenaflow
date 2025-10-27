package com.example.tournament.api.dto;

import java.util.List;

public class DrawGenerateRequest {
    private List<SeedEntry> seeds;
    private boolean overwriteIfDraft;

    public static class SeedEntry {
        private Long registrationId;
        private int seedNumber;
        public Long getRegistrationId() { return registrationId; }
        public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }
        public int getSeedNumber() { return seedNumber; }
        public void setSeedNumber(int seedNumber) { this.seedNumber = seedNumber; }
    }

    public List<SeedEntry> getSeeds() { return seeds; }
    public void setSeeds(List<SeedEntry> seeds) { this.seeds = seeds; }
    public boolean isOverwriteIfDraft() { return overwriteIfDraft; }
    public void setOverwriteIfDraft(boolean overwriteIfDraft) { this.overwriteIfDraft = overwriteIfDraft; }
}
