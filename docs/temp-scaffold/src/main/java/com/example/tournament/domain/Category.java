package com.example.tournament.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Tournament tournament;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryType categoryType = CategoryType.SINGLES; // SINGLES/DOUBLES

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TournamentFormat format = TournamentFormat.SINGLE_ELIMINATION;

    private String genderRestriction; // MVP: free text; upgrade to enum later
    private Integer minAge;
    private Integer maxAge;
    private Integer maxParticipants;
    private BigDecimal registrationFee;

    // getters/setters
    public Long getId() { return id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public CategoryType getCategoryType() { return categoryType; }
    public void setCategoryType(CategoryType categoryType) { this.categoryType = categoryType; }
    public TournamentFormat getFormat() { return format; }
    public void setFormat(TournamentFormat format) { this.format = format; }
    public String getGenderRestriction() { return genderRestriction; }
    public void setGenderRestriction(String genderRestriction) { this.genderRestriction = genderRestriction; }
    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }
    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public BigDecimal getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(BigDecimal registrationFee) { this.registrationFee = registrationFee; }
}
