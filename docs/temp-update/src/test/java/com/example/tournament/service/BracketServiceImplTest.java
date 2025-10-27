package com.example.tournament.service;

import com.example.tournament.api.dto.BracketSummaryResponse;
import com.example.tournament.api.dto.DrawGenerateRequest;
import com.example.tournament.domain.Category;
import com.example.tournament.domain.Match;
import com.example.tournament.domain.MatchStatus;
import com.example.tournament.domain.Registration;
import com.example.tournament.repository.CategoryRepository;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.RegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BracketServiceImplTest {

    private CategoryRepository categoryRepo;
    private RegistrationRepository registrationRepo;
    private MatchRepository matchRepo;
    private BracketServiceImpl service;

    @BeforeEach
    void setUp() {
        categoryRepo = mock(CategoryRepository.class);
        registrationRepo = mock(RegistrationRepository.class);
        matchRepo = mock(MatchRepository.class);
        service = new BracketServiceImpl(categoryRepo, registrationRepo, matchRepo);
    }

    @Test
    void generate_createsBracket_andAutoAdvancesByes() {
        Long tournamentId = 1L;
        Long categoryId = 11L;
        Category cat = new Category();
        // minimal id setup via reflection or setter if available
        try {
            var f = Category.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(cat, categoryId);
        } catch (Exception ignored) {}

        when(categoryRepo.findByIdAndTournamentId(categoryId, tournamentId)).thenReturn(Optional.of(cat));
        when(matchRepo.existsByCategoryId(categoryId)).thenReturn(false);

        // 3 registrations (forces one BYE in an effective size of 4)
        Registration r1 = new Registration(); setId(r1, 101L);
        Registration r2 = new Registration(); setId(r2, 102L);
        Registration r3 = new Registration(); setId(r3, 103L);
        when(registrationRepo.findByCategoryIdOrderByIdAsc(categoryId)).thenReturn(Arrays.asList(r1, r2, r3));

        // capture saved matches to give them IDs
        when(matchRepo.save(any(Match.class))).thenAnswer(inv -> {
            Match m = inv.getArgument(0);
            if (m.getId() == null) {
                try {
                    var f = Match.class.getDeclaredField("id");
                    f.setAccessible(true);
                    f.set(m, new Random().nextLong(1_000_000)); // temp id
                } catch (Exception ignored) {}
            }
            return m;
        });
        when(matchRepo.findByCategoryIdOrderByRoundAscPositionAsc(categoryId)).thenReturn(new ArrayList<>());

        BracketSummaryResponse resp = service.generateSingleElimination(tournamentId, categoryId, new DrawGenerateRequest());
        assertEquals(3, resp.getTotalParticipants());
        assertEquals(4, resp.getEffectiveSize());
        assertEquals(2, resp.getRounds());

        // verify BYE advancement: at least one first-round match should be COMPLETED
        // and next match should have a participant filled.
        verify(matchRepo, atLeast(1)).save(argThat(m -> m.getRound()!=null && m.getRound()==1 && Boolean.TRUE.equals(m.getBye()) && m.getStatus()== MatchStatus.COMPLETED));
        verify(matchRepo, atLeast(1)).save(argThat(m -> m.getRound()!=null && m.getRound()==2 && (m.getParticipant1RegistrationId()!=null || m.getParticipant2RegistrationId()!=null)));
    }

    private static void setId(Object entity, Long id) {
        try {
            var f = entity.getClass().getDeclaredField("id");
            f.setAccessible(true);
            f.set(entity, id);
        } catch (Exception ignored) {}
    }
}
