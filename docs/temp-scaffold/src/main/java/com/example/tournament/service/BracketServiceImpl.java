package com.example.tournament.service;

import com.example.tournament.api.dto.BracketSummaryResponse;
import com.example.tournament.api.dto.DrawGenerateRequest;
import com.example.tournament.api.dto.MatchDto;
import com.example.tournament.domain.*;
import com.example.tournament.repository.*;
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
            // Simple guard: only allow overwriteIfDraft in MVP (assumes draft = no progress yet)
            if (req == null || !req.isOverwriteIfDraft()) {
                throw new IllegalStateException("Bracket already exists. Set overwriteIfDraft=true to recreate (draft only).");
            }
            // TODO: ensure no progressed matches before deleting
            deleteDraftBracket(category.getId());
        }

        // Load registrations in this category
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

        // Build all matches (topology) and persist
        Map<String, Match> byRoundPos = new HashMap<>();
        // Create empty matches per round
        for (int r = 1; r <= rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                Match m = new Match();
                m.setCategoryId(category.getId()); // requires new fields in Match entity
                m.setRound(r);
                m.setPosition(pos);
                m.setStatus(MatchStatus.SCHEDULED);
                byRoundPos.put(r+":"+pos, m);
            }
        }
        // Link nextMatch/winnerAdvancesAs
        for (int r = 1; r < rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                SeedPlacementUtil.NextRef ref = SeedPlacementUtil.nextFor(r, pos);
                Match cur = byRoundPos.get(r+":"+pos);
                Match next = byRoundPos.get(ref.round+":"+ref.position);
                // Persist later; we only set ids after save, so temporarily store links via map
                // We'll perform a second pass after saving round by round.
                cur.setWinnerAdvancesAs(ref.whichSide);
                // We will set nextMatchId after save.
            }
        }

        // First round participants & BYEs
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

        // Persist round by round so we can set nextMatchId
        for (int r = 1; r <= rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                Match saved = matchRepository.save(byRoundPos.get(r+":"+pos));
                byRoundPos.put(r+":"+pos, saved);
            }
        }
        // Second pass: set nextMatchId now that ids exist
        for (int r = 1; r < rounds; r++) {
            int matchesThisRound = effective >> r;
            for (int pos = 0; pos < matchesThisRound; pos++) {
                SeedPlacementUtil.NextRef ref = SeedPlacementUtil.nextFor(r, pos);
                Match cur = byRoundPos.get(r+":"+pos);
                Match next = byRoundPos.get(ref.round+":"+ref.position);
                cur.setNextMatchId(next.getId());
                matchRepository.save(cur);
            }
        }

        // Build response
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
        // MVP: naive delete (ensure no progressed matches in real impl)
        matchRepository.findByCategoryIdOrderByRoundAscPositionAsc(categoryId)
                .forEach(matchRepository::delete);
    }
}
