package com.example.tournament.repository;

import com.example.tournament.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByIdAndTournamentId(Long id, Long tournamentId);
}
