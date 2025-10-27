package com.example.tournament.api.dto;

public class MatchDto {
    private Long id;
    private int round;
    private int position;
    private Long participant1RegistrationId;
    private Long participant2RegistrationId;
    private boolean bye;
    private Long nextMatchId;
    private Short winnerAdvancesAs;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getRound() { return round; }
    public void setRound(int round) { this.round = round; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public Long getParticipant1RegistrationId() { return participant1RegistrationId; }
    public void setParticipant1RegistrationId(Long participant1RegistrationId) { this.participant1RegistrationId = participant1RegistrationId; }
    public Long getParticipant2RegistrationId() { return participant2RegistrationId; }
    public void setParticipant2RegistrationId(Long participant2RegistrationId) { this.participant2RegistrationId = participant2RegistrationId; }
    public boolean isBye() { return bye; }
    public void setBye(boolean bye) { this.bye = bye; }
    public Long getNextMatchId() { return nextMatchId; }
    public void setNextMatchId(Long nextMatchId) { this.nextMatchId = nextMatchId; }
    public Short getWinnerAdvancesAs() { return winnerAdvancesAs; }
    public void setWinnerAdvancesAs(Short winnerAdvancesAs) { this.winnerAdvancesAs = winnerAdvancesAs; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
