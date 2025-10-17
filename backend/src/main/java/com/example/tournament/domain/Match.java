package com.example.tournament.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Tournament tournament;

    @ManyToOne
    private Court court;

    @ManyToOne
    private Player player1;

    @ManyToOne
    private Player player2;

    private Integer score1;
    private Integer score2;

    @Enumerated(EnumType.STRING)
    private MatchStatus status = MatchStatus.SCHEDULED;

    private LocalDateTime scheduledAt;

    public Long getId() { return id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public Court getCourt() { return court; }
    public void setCourt(Court court) { this.court = court; }
    public Player getPlayer1() { return player1; }
    public void setPlayer1(Player player1) { this.player1 = player1; }
    public Player getPlayer2() { return player2; }
    public void setPlayer2(Player player2) { this.player2 = player2; }
    public Integer getScore1() { return score1; }
    public void setScore1(Integer score1) { this.score1 = score1; }
    public Integer getScore2() { return score2; }
    public void setScore2(Integer score2) { this.score2 = score2; }
    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
}
