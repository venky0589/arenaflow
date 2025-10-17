package com.example.tournament.domain;

import jakarta.persistence.*;

@Entity
public class Registration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Tournament tournament;

    @ManyToOne(optional = false)
    private Player player;

    @Enumerated(EnumType.STRING)
    private CategoryType categoryType = CategoryType.SINGLES;

    public Long getId() { return id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }
    public CategoryType getCategoryType() { return categoryType; }
    public void setCategoryType(CategoryType categoryType) { this.categoryType = categoryType; }
}
