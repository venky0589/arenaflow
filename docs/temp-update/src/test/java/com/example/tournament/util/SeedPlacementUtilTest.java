package com.example.tournament.util;

import com.example.tournament.service.SeedPlacementUtil;
import org.junit.jupiter.api.Test;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class SeedPlacementUtilTest {

    @Test
    void nextPowerOfTwo_works() {
        assertEquals(1, SeedPlacementUtil.nextPowerOfTwo(1));
        assertEquals(2, SeedPlacementUtil.nextPowerOfTwo(2));
        assertEquals(4, SeedPlacementUtil.nextPowerOfTwo(3));
        assertEquals(8, SeedPlacementUtil.nextPowerOfTwo(5));
        assertEquals(16, SeedPlacementUtil.nextPowerOfTwo(9));
    }

    @Test
    void orderBySeedOrNatural_prioritizesSeeds() {
        List<Long> regs = Arrays.asList(10L,20L,30L,40L,50L);
        Map<Long,Integer> seeds = new HashMap<>();
        seeds.put(30L, 1);
        seeds.put(10L, 2);
        List<Long> ordered = SeedPlacementUtil.orderBySeedOrNatural(regs, seeds);
        assertEquals(Arrays.asList(30L,10L,20L,40L,50L), ordered);
    }

    @Test
    void nextFor_mapsToNextMatch() {
        SeedPlacementUtil.NextRef r = SeedPlacementUtil.nextFor(1, 3);
        // round2, position=1 (3/2), side should be 2 (odd)
        assertEquals(2, r.round);
        assertEquals(1, r.position);
        assertEquals(2, r.whichSide);
    }

    @Test
    void opponentIndexForRound1_mirrorsEnds() {
        assertEquals(7, SeedPlacementUtil.opponentIndexForRound1(0, 8));
        assertEquals(6, SeedPlacementUtil.opponentIndexForRound1(1, 8));
        assertEquals(0, SeedPlacementUtil.opponentIndexForRound1(7, 8));
    }
}
