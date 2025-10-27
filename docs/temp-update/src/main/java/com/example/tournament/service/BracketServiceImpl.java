package com.example.tournament.service;

import com.example.tournament.api.dto.BracketSummaryResponse;
import com.example.tournament.api.dto.DrawGenerateRequest;
import com.example.tournament.api.dto.MatchDto;
import com.example.tournament.domain.Category;
import com.example.tournament.domain.Match;
import com.example.tournament.domain.MatchStatus;
import com.example.tournament.domain.Registration;
import com.example.tournament.repository.CategoryRepository;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BracketServiceImpl implements BracketService {

    private final CategoryRepository categoryRepository;
    private final RegistrationRepository registrationRepository;
    private final MatchRepository matchRepository;

    public BracketServiceImpl(CategoryRepository categoryRepository,
                              RegistrationRepository registrationRepository,
                              MatchRepository matchRepository) {
        this.categoryRepository = categoryRepository;
        this.registrationRepository = registrationRepository;
        this.matchRepository = matchRepository;
    }

    @Override
    @Transactional
    public BracketSummaryResponse generateSingleElimination(Long tournamentId, Long categoryId, DrawGenerateRequest req) {
        Category category = categoryRepository.findByIdAndTournamentId(categoryId, tournamentId)
                .orElseThrow(() -> new NoSuchElementException("Category not found for tournament"));

        if (matchRepository.existsByCategoryId(category.getId())) {
            if (req == null || !req.isOverwriteIfDraft()) {
                throw new IllegalStateException("Bracket already exists. Set overwriteIfDraft=true to recreate (draft only).");
            }
            deleteDraftBracket(category.getId()); // TODO: ensure none progressed
        }

        // Load registrations
        List<Long> regIds = registrationRepository.findByCategoryIdOrderByIdAsc(category.getId())
                .stream().map(Registration::getId).collect(Collectors.toList());
        if (regIds.size() < 2) throw new IllegalStateException("At least two registrations are required");

        // Seeds
        Map<Long,Integer> seedMap = new HashMap<>();
        if (req != null && req.getSeeds() != null) {
            for (DrawGenerateRequest.SeedEntry se : req.getSeeds()) {
                if (seedMap.containsValue(se.getSeedNumber()))
                    throw new IllegalArgumentException("Duplicate seed number: " + se.getSeedNumber());
                seedMap.put(se.getRegistrationId(), se.getSeedNumber());
            }
        }
        List<Long> ordered = SeedPlacementUtil.orderBySeedOrNatural(regIds, seedMap);

        int n = ordered.size();
        int effective = SeedPlacementUtil.nextPowerOfTwo(n);
        int rounds = Integer.numberOfTrailingZeros(effective);

        // Build match skeletons (round/position)
        Map<String, Match> byRoundPos = new HashMap<>();
        for (int r = 1; r <= rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                Match m = new Match();
                m.setCategoryId(category.getId());
                m.setRound(r);
                m.setPosition(pos);
                m.setStatus(MatchStatus.SCHEDULED);
                m.setBye(false);
                byRoundPos.put(r+":"+pos, m);
            }
        }
        // Link nextMatch side (we'll set IDs after save)
        Map<Match, SeedPlacementUtil.NextRef> nextRefs = new HashMap<>();
        for (int r = 1; r < rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                SeedPlacementUtil.NextRef ref = SeedPlacementUtil.nextFor(r, pos);
                Match cur = byRoundPos.get(r+":"+pos);
                cur.setWinnerAdvancesAs(ref.whichSide);
                nextRefs.put(cur, ref);
            }
        }

        // First round pairings & BYEs
        int firstRound = 1;
        int matchesFirstRound = effective >> firstRound;
        for (int i = 0; i < matchesFirstRound; i++) {
            Match m = byRoundPos.get(firstRound+":"+i);
            int idx1 = i;
            int idx2 = SeedPlacementUtil.opponentIndexForRound1(i, effective);
            Long p1 = (idx1 < n) ? ordered.get(idx1) : null;
            Long p2 = (idx2 < n) ? ordered.get(idx2) : null;
            m.setParticipant1RegistrationId(p1);
            m.setParticipant2RegistrationId(p2);
            boolean bye = (p1 == null || p2 == null);
            m.setBye(bye);
        }

        // Persist all matches round-by-round
        for (int r = 1; r <= rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                Match saved = matchRepository.save(byRoundPos.get(r+":"+pos));
                byRoundPos.put(r+":"+pos, saved);
            }
        }
        // Set nextMatchId now that IDs exist
        for (Map.Entry<Match, SeedPlacementUtil.NextRef> e : nextRefs.entrySet()) {
            Match cur = e.getKey();
            SeedPlacementUtil.NextRef ref = e.getValue();
            Match next = byRoundPos.get(ref.round+":"+ref.position);
            cur.setNextMatchId(next.getId());
            matchRepository.save(cur);
        }

        // --- AUTO-ADVANCE BYEs ---
        // If a first-round match has a BYE, immediately mark COMPLETED and advance the present participant.
        for (int pos = 0; pos < (effective >> 1); pos++) { // first round count
            Match m = byRoundPos.get("1:"+pos);
            if (Boolean.TRUE.equals(m.getBye())) {
                Long winnerRegId = (m.getParticipant1RegistrationId() != null)
                        ? m.getParticipant1RegistrationId()
                        : m.getParticipant2RegistrationId();
                // mark this match COMPLETED
                m.setStatus(MatchStatus.COMPLETED);
                matchRepository.save(m);

                // advance to next
                if (m.getNextMatchId() != null && winnerRegId != null) {
                    Match next = matchRepository.findById(m.getNextMatchId())
                            .orElseThrow(() -> new IllegalStateException("Broken bracket: next match missing"));
                    if (m.getWinnerAdvancesAs() != null && m.getWinnerAdvancesAs() == 1) {
                        next.setParticipant1RegistrationId(winnerRegId);
                    } else {
                        next.setParticipant2RegistrationId(winnerRegId);
                    }
                    matchRepository.save(next);
                }
            }
        }

        // Map to response
        List<MatchDto> dtos = matchRepository.findByCategoryIdOrderByRoundAscPositionAsc(category.getId())
                .stream().map(m -> {
                    MatchDto d = new MatchDto();
                    d.setId(m.getId());
                    d.setRound(m.getRound());
                    d.setPosition(m.getPosition());
                    d.setParticipant1RegistrationId(m.getParticipant1RegistrationId());
                    d.setParticipant2RegistrationId(m.getParticipant2RegistrationId());
                    d.setBye(Boolean.TRUE.equals(m.getBye()));
                    d.setNextMatchId(m.getNextMatchId());
                    d.setWinnerAdvancesAs(m.getWinnerAdvancesAs());
                    d.setStatus(m.getStatus().name());
                    return d;
                }).collect(Collectors.toList());

        BracketSummaryResponse resp = new BracketSummaryResponse();
        resp.setCategoryId(category.getId());
        resp.setTotalParticipants(n);
        resp.setEffectiveSize(effective);
        resp.setRounds(rounds);
        resp.setMatches(dtos);
        return resp;
    }

    @Override
    public BracketSummaryResponse getBracket(Long categoryId) {
        List<MatchDto> dtos = matchRepository.findByCategoryIdOrderByRoundAscPositionAsc(categoryId)
                .stream().map(m -> {
                    MatchDto d = new MatchDto();
                    d.setId(m.getId());
                    d.setRound(m.getRound());
                    d.setPosition(m.getPosition());
                    d.setParticipant1RegistrationId(m.getParticipant1RegistrationId());
                    d.setParticipant2RegistrationId(m.getParticipant2RegistrationId());
                    d.setBye(Boolean.TRUE.equals(m.getBye()));
                    d.setNextMatchId(m.getNextMatchId());
                    d.setWinnerAdvancesAs(m.getWinnerAdvancesAs());
                    d.setStatus(m.getStatus().name());
                    return d;
                }).collect(Collectors.toList());
        BracketSummaryResponse resp = new BracketSummaryResponse();
        resp.setCategoryId(categoryId);
        resp.setMatches(dtos);
        return resp;
    }

    @Override
    @Transactional
    public void deleteDraftBracket(Long categoryId) {
        matchRepository.findByCategoryIdOrderByRoundAscPositionAsc(categoryId)
                .forEach(matchRepository::delete);
    }
}
