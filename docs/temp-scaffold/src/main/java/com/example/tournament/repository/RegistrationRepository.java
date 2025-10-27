package com.example.tournament.repository;

import com.example.tournament.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByCategoryIdOrderByIdAsc(Long categoryId);
}
