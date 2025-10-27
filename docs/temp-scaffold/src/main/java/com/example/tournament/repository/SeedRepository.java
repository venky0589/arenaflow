package com.example.tournament.repository;

import com.example.tournament.domain.Seed;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeedRepository extends JpaRepository<Seed, Long> {}
