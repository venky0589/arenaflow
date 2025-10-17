package com.example.tournament.repo;

import com.example.tournament.domain.Court;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtRepository extends JpaRepository<Court, Long> { }
