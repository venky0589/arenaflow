package com.example.tournament.domain;

import jakarta.persistence.*;

@Entity
public class Seed {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Category category;

    @ManyToOne(optional = false)
    private Registration registration;

    @Column(nullable = false)
    private Integer seedNumber; // 1 = highest

    public Long getId() { return id; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Registration getRegistration() { return registration; }
    public void setRegistration(Registration registration) { this.registration = registration; }
    public Integer getSeedNumber() { return seedNumber; }
    public void setSeedNumber(Integer seedNumber) { this.seedNumber = seedNumber; }
}
