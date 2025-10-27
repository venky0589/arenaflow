package com.example.tournament.service;

import java.util.*;

public final class SeedPlacementUtil {
    private SeedPlacementUtil() {}

    public static int nextPowerOfTwo(int n) {
        int p = 1; while (p < n) p <<= 1; return p;
    }

    public static List<Long> orderBySeedOrNatural(List<Long> regs, Map<Long,Integer> seedMap) {
        if (seedMap == null || seedMap.isEmpty()) return new ArrayList<>(regs);
        List<Long> seeded = new ArrayList<>();
        List<Long> unseeded = new ArrayList<>();
        for (Long r : regs) {
            if (seedMap.containsKey(r)) seeded.add(r); else unseeded.add(r);
        }
        seeded.sort(Comparator.comparingInt(seedMap::get));
        List<Long> out = new ArrayList<>(seeded); out.addAll(unseeded);
        return out;
    }

    public static int opponentIndexForRound1(int idx, int size) { return size - 1 - idx; }

    public static NextRef nextFor(int round, int position) {
        int nextRound = round + 1;
        int nextPos = position / 2;
        short whichSide = (short)((position % 2 == 0) ? 1 : 2);
        return new NextRef(nextRound, nextPos, whichSide);
    }

    public static class NextRef {
        public final int round;
        public final int position;
        public final short whichSide;
        public NextRef(int round, int position, short whichSide) {
            this.round = round; this.position = position; this.whichSide = whichSide;
        }
    }
}
