package com.example.tournament.repo;

import com.example.tournament.domain.Match;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> { }
