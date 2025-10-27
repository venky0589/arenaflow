# Match Scheduling & Court Assignment – Backend Review Tickets

**Source**: Internal spec review based on the Priority-3 Scheduling Spec (Tejasvi & Soumya)
**Module**: Backend (Spring Boot / PostgreSQL)
**Status**: Review feedback – to be implemented
**Review Date**: 2025-10-25
**Current Implementation**: See [match_scheduling_implementation.md](match_scheduling_implementation.md)

---

## 🔥 Critical (Must-Fix Before Release)

### 🎯 TKT-P3-001 — Doubles & Multi-Category Conflict Detection

**Priority**: 🔥 Critical
**Type**: Bug
**Status**: To Do
**Estimated Effort**: 3-5 days

#### Problem
Current conflict checks use only `player1/player2`, missing doubles (4 players) and cross-category overlaps.

**Current Code Location**:
- `MatchSchedulingService.java:310-350` (checkPlayerConflicts)
- `MatchRepository.java:58-79` (findOverlappingMatchesByPlayer)

**Issue Details**:
- Doubles matches have 4 players but only 2 are tracked (player1, player2)
- No representation for partner players in doubles
- Cross-category conflicts not detected (same player in Singles + Doubles)
- Player can be scheduled in two different categories at overlapping times

#### Acceptance Criteria
- [ ] Conflict query considers all participants (A1, A2, B1, B2) in every match
- [ ] A player appearing in any other category or event on the same day must trigger a conflict
- [ ] Unit tests: doubles vs singles overlap, cross-category same-player overlap

#### Implementation Hints
- Create a `match_participant` view/table to normalize player references
- Schema option 1: Add `player3_id`, `player4_id` to Match entity (simple but rigid)
- Schema option 2: Create separate `MatchParticipant` join table (flexible, normalized)

#### Proposed Solution

**Option A: Extended Match Entity (Quick Fix)**
```sql
ALTER TABLE matches
ADD COLUMN player3_id BIGINT REFERENCES player(id),
ADD COLUMN player4_id BIGINT REFERENCES player(id);

CREATE INDEX idx_match_player3 ON matches(player3_id);
CREATE INDEX idx_match_player4 ON matches(player4_id);
```

**Option B: Match Participants Table (Recommended)**
```sql
CREATE TABLE match_participant (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    registration_id BIGINT NOT NULL REFERENCES registration(id),
    player_id BIGINT NOT NULL REFERENCES player(id),
    team_side SMALLINT NOT NULL, -- 1 or 2
    partner_position SMALLINT, -- 1 or 2 (for doubles)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_participant_match ON match_participant(match_id);
CREATE INDEX idx_match_participant_player ON match_participant(player_id);
CREATE INDEX idx_match_participant_reg ON match_participant(registration_id);
```

**Updated Conflict Query**:
```java
@Query("""
    SELECT DISTINCT m FROM Match m
    JOIN MatchParticipant mp ON mp.match.id = m.id
    WHERE mp.player.id = :playerId
    AND m.scheduledAt IS NOT NULL
    AND m.estimatedDurationMinutes IS NOT NULL
    AND m.scheduledAt < :endTime
    AND FUNCTION('TIMESTAMPADD', MINUTE, m.estimatedDurationMinutes, m.scheduledAt) > :startTime
    """)
List<Match> findOverlappingMatchesByPlayer(...);
```

#### Test Cases
```java
@Test
void shouldDetectDoublesConflict() {
    // Player A in singles at 10:00
    // Player A in doubles (with B, vs C+D) at 10:30
    // Expected: Conflict detected
}

@Test
void shouldDetectCrossCategoryConflict() {
    // Player A in Men's Singles at 10:00
    // Player A in Mixed Doubles at 10:30
    // Expected: Conflict detected
}
```

---

### 🎯 TKT-P3-002 — Round Dependency Enforcement

**Priority**: 🔥 Critical
**Type**: Feature
**Status**: To Do
**Estimated Effort**: 4-6 days

#### Problem
Scheduler uses round order only; matches can be placed before prerequisite matches end.

**Current Code Location**:
- `MatchSchedulingService.java:132-142` (sorting by round)

**Issue Details**:
- Round 16 matches can be scheduled before Round 32 matches complete
- No enforcement of bracket progression logic
- Winners can't advance if their next match is already scheduled

#### Acceptance Criteria
- [ ] Each match computes `earliestStart = max(all prerequisites' end + buffer, playerRestReady)`
- [ ] Scheduler never places a match before its dependent round's completion
- [ ] Add tests: late R32 → R16 delayed accordingly

#### Implementation Hints
- Use draw tree to derive predecessor links
- Match entity already has `nextMatchId` field - use for dependency graph
- Implement topological sort for scheduling order

#### Proposed Solution

**Add Dependency Calculation**:
```java
// In MatchSchedulingService
private LocalDateTime calculateEarliestStart(Match match) {
    LocalDateTime earliestStart = request.startDateTime();

    // Find prerequisite matches (matches that feed into this one)
    List<Match> prerequisites = matchRepository
        .findByNextMatchId(match.getId());

    for (Match prereq : prerequisites) {
        if (prereq.getScheduledAt() != null &&
            prereq.getEstimatedDurationMinutes() != null) {
            LocalDateTime prereqEnd = prereq.getScheduledAt()
                .plusMinutes(prereq.getEstimatedDurationMinutes())
                .plusMinutes(DEFAULT_BUFFER_MINUTES);

            if (prereqEnd.isAfter(earliestStart)) {
                earliestStart = prereqEnd;
            }
        }
    }

    return earliestStart;
}
```

**Repository Method**:
```java
// In MatchRepository
List<Match> findByNextMatchId(Long nextMatchId);
```

**Updated Auto-Schedule Logic**:
```java
// Before finding slot
LocalDateTime earliestPossible = calculateEarliestStart(match);
if (currentSlot.isBefore(earliestPossible)) {
    currentSlot = earliestPossible;
}
```

#### Test Cases
```java
@Test
void shouldEnforceRoundDependency() {
    // R32 Match 1: scheduled 10:00-10:45
    // R16 Match (winner of R32-1): cannot start before 11:00 (10:45 + 15min buffer)
}

@Test
void shouldDelayDependentRounds() {
    // R32 delayed to 14:00 due to court shortage
    // R16, QF, SF must all shift accordingly
}
```

---

### 🎯 TKT-P3-003 — Court Availability & Blackout Support

**Priority**: 🔥 Critical
**Type**: Feature
**Status**: To Do
**Estimated Effort**: 3-4 days

#### Problem
Courts are treated as always available.

**Current Code Location**:
- `MatchSchedulingService.java:128` (courtRepository.findAll())

**Issue Details**:
- No way to mark court unavailable for maintenance
- No lunch break / blackout periods
- Courts assumed available 24/7

#### Acceptance Criteria
- [ ] `court_availability` table respected; unavailable windows excluded from scheduling
- [ ] Blackouts reflected in `/simulate` output with warnings
- [ ] Test: blackout 12:00-13:00 blocks any placement

#### Proposed Solution

**Database Schema**:
```sql
CREATE TABLE court_availability (
    id BIGSERIAL PRIMARY KEY,
    court_id BIGINT NOT NULL REFERENCES court(id) ON DELETE CASCADE,
    available_from TIMESTAMP NOT NULL,
    available_until TIMESTAMP NOT NULL,
    reason VARCHAR(255), -- 'MAINTENANCE', 'LUNCH_BREAK', 'RESERVED', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100)
);

CREATE INDEX idx_court_avail_court ON court_availability(court_id);
CREATE INDEX idx_court_avail_time ON court_availability(available_from, available_until);

COMMENT ON TABLE court_availability IS 'Defines time windows when courts are unavailable';
```

**Repository Methods**:
```java
public interface CourtAvailabilityRepository extends JpaRepository<CourtAvailability, Long> {

    @Query("""
        SELECT ca FROM CourtAvailability ca
        WHERE ca.court.id = :courtId
        AND ca.availableFrom < :endTime
        AND ca.availableUntil > :startTime
        """)
    List<CourtAvailability> findBlackoutsDuringWindow(
        @Param("courtId") Long courtId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<CourtAvailability> findByCourtIdAndAvailableFromBeforeAndAvailableUntilAfter(
        Long courtId, LocalDateTime end, LocalDateTime start
    );
}
```

**Service Logic Update**:
```java
// In MatchSchedulingService
private boolean isCourtAvailable(Court court, LocalDateTime start, LocalDateTime end) {
    // Check database conflicts (existing matches)
    List<Match> conflictingMatches = matchRepository
        .findOverlappingMatchesByCourt(court.getId(), start, end);
    if (!conflictingMatches.isEmpty()) {
        return false;
    }

    // Check court availability/blackouts
    List<CourtAvailability> blackouts = courtAvailabilityRepository
        .findBlackoutsDuringWindow(court.getId(), start, end);
    if (!blackouts.isEmpty()) {
        log.debug("Court {} unavailable during {}-{}: {}",
            court.getName(), start, end, blackouts.get(0).getReason());
        return false;
    }

    return true;
}
```

#### Test Cases
```java
@Test
void shouldRespectCourtBlackout() {
    // Blackout: Court 1, 12:00-13:00 (lunch)
    // Attempt to schedule 11:45-12:30 (overlaps)
    // Expected: Scheduler skips Court 1, tries Court 2
}

@Test
void shouldWarnAboutBlackoutConflicts() {
    // Simulate schedule with lunch blackout
    // Expected: Response includes warning about blackout impact
}
```

---

### 🎯 TKT-P3-004 — Buffer-Aware DB Validations

**Priority**: 🔥 Critical
**Type**: Enhancement
**Status**: To Do
**Estimated Effort**: 2-3 days

#### Problem
Overlap checks ignore cleaning/walk-in buffers.

**Current Code Location**:
- `MatchSchedulingService.java:280-340` (conflict checks)

**Issue Details**:
- Current checks: `scheduled_at < endTime AND (scheduled_at + duration) > startTime`
- Doesn't account for buffer time between matches
- Two matches can be adjacent with 0-minute gap

#### Acceptance Criteria
- [ ] DB overlap queries expand both sides by configured `bufferMinutes`
- [ ] Manual inserts violating buffer rejected
- [ ] Test: adjacent matches separated by exactly buffer minutes → pass; less → fail

#### Proposed Solution

**Updated Repository Queries**:
```java
@Query("""
    SELECT m FROM Match m
    WHERE m.court.id = :courtId
    AND m.scheduledAt IS NOT NULL
    AND m.estimatedDurationMinutes IS NOT NULL
    AND FUNCTION('TIMESTAMPADD', MINUTE, -:bufferMinutes, m.scheduledAt) < :endTime
    AND FUNCTION('TIMESTAMPADD', MINUTE, m.estimatedDurationMinutes + :bufferMinutes, m.scheduledAt) > :startTime
    """)
List<Match> findOverlappingMatchesByCourtWithBuffer(
    @Param("courtId") Long courtId,
    @Param("startTime") LocalDateTime startTime,
    @Param("endTime") LocalDateTime endTime,
    @Param("bufferMinutes") int bufferMinutes
);
```

**Validation in Service**:
```java
// In scheduleMatch method
private void validateBufferRequirement(Long courtId, LocalDateTime start, int duration, int buffer) {
    LocalDateTime end = start.plusMinutes(duration);

    // Expand window by buffer on both sides
    LocalDateTime bufferedStart = start.minusMinutes(buffer);
    LocalDateTime bufferedEnd = end.plusMinutes(buffer);

    List<Match> conflicts = matchRepository
        .findOverlappingMatchesByCourtWithBuffer(
            courtId, bufferedStart, bufferedEnd, buffer
        );

    if (!conflicts.isEmpty()) {
        throw new ValidationException(
            String.format("Buffer violation: Court needs %d minutes before/after. Found %d conflicts.",
                buffer, conflicts.size())
        );
    }
}
```

#### Test Cases
```java
@Test
void shouldEnforceBufferBetweenMatches() {
    // Match 1: 10:00-10:45 (buffer: 15 min)
    // Match 2: 11:00-11:45 → Valid (15 min gap)
    // Match 3: 10:50-11:35 → Invalid (only 5 min gap)
}

@Test
void shouldAllowExactBufferGap() {
    // Match 1 ends at 10:45, buffer = 15
    // Match 2 starts at 11:00 → Valid (exactly 15 min)
}
```

---

### 🎯 TKT-P3-005 — Configurable Rest & Duration Settings

**Priority**: 🔥 Critical
**Type**: Feature
**Status**: To Do
**Estimated Effort**: 4-5 days

#### Problem
Durations/rest/buffer hard-coded.

**Current Code Location**:
- `MatchSchedulingService.java:27-29` (constants)

**Issue Details**:
- All matches use same 45-minute duration
- Same 15-minute buffer for all
- Same 30-minute player gap for all
- No per-category or per-round customization

#### Acceptance Criteria
- [ ] Read defaults from `tournament_settings` or request body
- [ ] Override per category/round if available
- [ ] Tests: juniors = 45 min rest, seniors = 60 min; doubles longer duration

#### Proposed Solution

**Database Schema**:
```sql
CREATE TABLE tournament_settings (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    category_id BIGINT REFERENCES category(id), -- NULL for global settings
    round INTEGER, -- NULL for all rounds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100),

    UNIQUE(tournament_id, setting_key, category_id, round)
);

CREATE INDEX idx_tournament_settings_lookup ON tournament_settings(tournament_id, setting_key, category_id, round);

-- Example settings
INSERT INTO tournament_settings (tournament_id, setting_key, setting_value, category_id, round) VALUES
(1, 'default_duration_minutes', '45', NULL, NULL),
(1, 'buffer_minutes', '15', NULL, NULL),
(1, 'player_rest_minutes', '30', NULL, NULL),
(1, 'default_duration_minutes', '60', 2, NULL), -- Category 2 (Doubles) = 60 min
(1, 'player_rest_minutes', '60', 3, NULL), -- Category 3 (Seniors) = 60 min rest
(1, 'default_duration_minutes', '90', NULL, 1); -- Round 1 (Finals) = 90 min
```

**Entity**:
```java
@Entity
@Table(name = "tournament_settings")
public class TournamentSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Tournament tournament;

    @Column(name = "setting_key", nullable = false)
    private String settingKey;

    @Column(name = "setting_value", nullable = false)
    private String settingValue;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "round")
    private Integer round;

    // Getters, setters
}
```

**Repository**:
```java
public interface TournamentSettingRepository extends JpaRepository<TournamentSetting, Long> {

    Optional<TournamentSetting> findByTournamentIdAndSettingKeyAndCategoryIdAndRound(
        Long tournamentId, String settingKey, Long categoryId, Integer round
    );

    List<TournamentSetting> findByTournamentIdAndSettingKey(
        Long tournamentId, String settingKey
    );
}
```

**Service Helper**:
```java
// In MatchSchedulingService
private int getDurationMinutes(Match match, int defaultValue) {
    // Try most specific first: tournament + category + round
    if (match.getCategoryId() != null && match.getRound() != null) {
        Optional<TournamentSetting> setting = settingRepository
            .findByTournamentIdAndSettingKeyAndCategoryIdAndRound(
                match.getTournament().getId(),
                "default_duration_minutes",
                match.getCategoryId(),
                match.getRound()
            );
        if (setting.isPresent()) {
            return Integer.parseInt(setting.get().getSettingValue());
        }
    }

    // Try category-level
    if (match.getCategoryId() != null) {
        Optional<TournamentSetting> setting = settingRepository
            .findByTournamentIdAndSettingKeyAndCategoryIdAndRound(
                match.getTournament().getId(),
                "default_duration_minutes",
                match.getCategoryId(),
                null
            );
        if (setting.isPresent()) {
            return Integer.parseInt(setting.get().getSettingValue());
        }
    }

    // Fall back to tournament default
    Optional<TournamentSetting> setting = settingRepository
        .findByTournamentIdAndSettingKeyAndCategoryIdAndRound(
            match.getTournament().getId(),
            "default_duration_minutes",
            null,
            null
        );

    return setting.map(s -> Integer.parseInt(s.getSettingValue()))
        .orElse(defaultValue);
}
```

#### Test Cases
```java
@Test
void shouldUseJuniorSettings() {
    // Category: Juniors → 45 min rest, 40 min duration
    // Expected: Auto-schedule respects junior-specific timings
}

@Test
void shouldUseSeniorSettings() {
    // Category: Seniors → 60 min rest, 45 min duration
    // Expected: Longer rest enforced
}

@Test
void shouldUseDoublesLongerDuration() {
    // Category: Doubles → 60 min duration
    // Expected: Matches get extra time
}

@Test
void shouldUseFinalRoundSettings() {
    // Round: 1 (Finals) → 90 min duration
    // Expected: Final match scheduled with extended time
}
```

---

## ⚙️ High Priority

### 🧩 TKT-P3-006 — Topological Scheduling Order

**Priority**: ⚙️ High
**Type**: Enhancement
**Status**: To Do
**Estimated Effort**: 2-3 days

#### Problem
Ensure scheduling order follows draw dependency graph, not raw round number.

**Current Code Location**:
- `MatchSchedulingService.java:132-135` (simple round-based sort)

#### Acceptance Criteria
- [ ] Add deterministic topological sort
- [ ] Unit test verifying stable order

#### Proposed Solution

**Topological Sort Implementation**:
```java
private List<Match> sortMatchesByDependencies(List<Match> matches) {
    // Build dependency graph
    Map<Long, List<Long>> graph = new HashMap<>(); // matchId -> list of dependent match IDs
    Map<Long, Integer> inDegree = new HashMap<>();

    for (Match match : matches) {
        graph.putIfAbsent(match.getId(), new ArrayList<>());
        inDegree.putIfAbsent(match.getId(), 0);

        if (match.getNextMatchId() != null) {
            graph.computeIfAbsent(match.getId(), k -> new ArrayList<>())
                .add(match.getNextMatchId());
            inDegree.merge(match.getNextMatchId(), 1, Integer::sum);
        }
    }

    // Kahn's algorithm for topological sort
    Queue<Long> queue = new LinkedList<>();
    for (Match match : matches) {
        if (inDegree.get(match.getId()) == 0) {
            queue.offer(match.getId());
        }
    }

    List<Match> sorted = new ArrayList<>();
    Map<Long, Match> matchMap = matches.stream()
        .collect(Collectors.toMap(Match::getId, m -> m));

    while (!queue.isEmpty()) {
        Long matchId = queue.poll();
        sorted.add(matchMap.get(matchId));

        for (Long dependent : graph.getOrDefault(matchId, Collections.emptyList())) {
            inDegree.merge(dependent, -1, Integer::sum);
            if (inDegree.get(dependent) == 0) {
                queue.offer(dependent);
            }
        }
    }

    // Handle cycles (shouldn't happen in valid bracket)
    if (sorted.size() != matches.size()) {
        log.warn("Cycle detected in match dependencies. Falling back to round-based sort.");
        return matches.stream()
            .sorted(Comparator.comparing(Match::getRound, Comparator.nullsLast(Comparator.naturalOrder())))
            .collect(Collectors.toList());
    }

    return sorted;
}
```

---

### 🧩 TKT-P3-007 — Idempotent Batch & Simulation Mode

**Priority**: ⚙️ High
**Type**: Feature
**Status**: To Do
**Estimated Effort**: 5-7 days

#### Problem
No "simulate → apply" cycle or idempotency key.

#### Acceptance Criteria
- [ ] `/scheduling/simulate` → returns proposal + warnings (no DB write)
- [ ] `/scheduling/apply` → accepts batchId + Idempotency-Key
- [ ] `scheduling_batch` record stores parameters + metrics (fill %, mean rest)

#### Proposed Solution

**Database Schema**:
```sql
CREATE TABLE scheduling_batch (
    id BIGSERIAL PRIMARY KEY,
    batch_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tournament_id BIGINT NOT NULL REFERENCES tournament(id),
    status VARCHAR(50) NOT NULL, -- 'SIMULATED', 'APPLIED', 'FAILED'

    -- Request parameters
    start_date_time TIMESTAMP NOT NULL,
    end_date_time TIMESTAMP NOT NULL,
    default_duration_minutes INTEGER,
    buffer_minutes INTEGER,

    -- Metrics
    total_matches INTEGER,
    scheduled_count INTEGER,
    fill_percentage DECIMAL(5,2),
    mean_player_rest_minutes DECIMAL(8,2),
    warnings TEXT[],

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    applied_at TIMESTAMP,
    applied_by VARCHAR(100)
);

CREATE INDEX idx_scheduling_batch_tournament ON scheduling_batch(tournament_id);
CREATE INDEX idx_scheduling_batch_uuid ON scheduling_batch(batch_uuid);
```

**Endpoints**:
```java
// Simulate endpoint
@PostMapping("/scheduling/simulate")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<SchedulingSimulationResponse> simulate(
        @Valid @RequestBody AutoScheduleRequest request) {
    SchedulingSimulation simulation = schedulingService
        .simulateScheduling(request);
    return ResponseEntity.ok(simulation.toResponse());
}

// Apply endpoint
@PostMapping("/scheduling/apply")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<SchedulingBatchResponse> apply(
        @RequestHeader("Idempotency-Key") UUID batchId) {
    SchedulingBatch batch = schedulingService.applyScheduling(batchId);
    return ResponseEntity.ok(batch.toResponse());
}
```

---

### 🧩 TKT-P3-008 — Locks & Manual Control

**Priority**: ⚙️ High
**Type**: Feature
**Status**: To Do
**Estimated Effort**: 2-3 days

#### Problem
No way to lock matches from auto-change.

#### Acceptance Criteria
- [ ] `match.locked` boolean column
- [ ] Endpoints: `/matches/{id}/lock`, `/matches/{id}/unlock`
- [ ] Scheduler skips locked matches during auto-runs

#### Proposed Solution

**Migration**:
```sql
ALTER TABLE matches
ADD COLUMN locked BOOLEAN DEFAULT FALSE,
ADD COLUMN locked_at TIMESTAMP,
ADD COLUMN locked_by VARCHAR(100);

CREATE INDEX idx_matches_locked ON matches(locked) WHERE locked = TRUE;
```

**Endpoints**:
```java
@PutMapping("/{id}/lock")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<MatchResponse> lockMatch(@PathVariable Long id) {
    Match locked = matchService.lockMatch(id);
    return ResponseEntity.ok(mapper.toResponse(locked));
}

@PutMapping("/{id}/unlock")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<MatchResponse> unlockMatch(@PathVariable Long id) {
    Match unlocked = matchService.unlockMatch(id);
    return ResponseEntity.ok(mapper.toResponse(unlocked));
}
```

---

### 🧩 TKT-P3-009 — Performance Optimization

**Priority**: ⚙️ High
**Type**: Tech Debt
**Status**: To Do
**Estimated Effort**: 3-4 days

#### Problem
DB queries inside per-slot loop cause slowdown.

#### Acceptance Criteria
- [ ] Maintain in-memory interval maps for courts & players
- [ ] Bulk-validate overlaps once per batch
- [ ] Schedule ≥ 300 matches × 6 courts < 3 s (local test)

#### Proposed Solution
Pre-load all scheduled matches into memory, use interval trees for conflict detection.

---

## 🧱 Medium Priority

### 📦 TKT-P3-010 — Generated End-Time Column

**Priority**: 🧱 Medium
**Type**: Tech Debt
**Status**: To Do
**Estimated Effort**: 1-2 days

#### Problem
Removes `FUNCTION('TIMESTAMPADD', …)` dependence.

#### Proposed Solution

**Migration**:
```sql
ALTER TABLE matches
ADD COLUMN scheduled_end_at TIMESTAMP GENERATED ALWAYS AS
    (scheduled_at + (estimated_duration_minutes || ' minutes')::INTERVAL) STORED;

CREATE INDEX idx_matches_scheduled_time ON matches(scheduled_at, scheduled_end_at);
```

**Simplified Query**:
```sql
WHERE scheduled_at < :end AND scheduled_end_at > :start
```

---

### 📦 TKT-P3-011 — Timezone Awareness

**Priority**: 🧱 Medium
**Type**: Enhancement
**Status**: To Do
**Estimated Effort**: 3-4 days

#### Problem
Replace `LocalDateTime` with `ZonedDateTime` (tournament timezone).

---

### 📦 TKT-P3-012 — Court-Balance & Rest-Margin Scoring

**Priority**: 🧱 Medium
**Type**: Optimization
**Status**: To Do
**Estimated Effort**: 4-5 days

#### Problem
Introduce light scoring weights for better scheduling quality.

---

## 🧪 Testing & Validation

### ✅ TKT-P3-013 — Expanded Test Matrix

**Priority**: 🧪 Testing
**Status**: To Do
**Estimated Effort**: 5-6 days

#### Test Coverage Required
- [ ] Doubles overlap detection
- [ ] Cross-category same-player conflict
- [ ] Round-dependency delay
- [ ] Buffer enforcement
- [ ] Court blackout skip
- [ ] Partial re-run preserving locked matches
- [ ] Idempotent re-apply (same result)

---

## 🧭 Nice to Have / Future Enhancements

### TKT-P3-014 — Delay Ripple API
`POST /scheduling/delay` adjusts downstream matches locally.

### TKT-P3-015 — Swap Tool
`POST /scheduling/swap` swaps two matches (re-validates).

### TKT-P3-016 — Metrics Dashboard
Report fill-rate, mean rest, court balance per batch.

---

## 📋 Summary Table

| Priority | Ticket | Title | Type | Effort | Status |
|----------|--------|-------|------|--------|--------|
| 🔥 | P3-001 | Doubles & Multi-Category Conflict | Bug | 3-5 days | To Do |
| 🔥 | P3-002 | Round Dependency Enforcement | Feature | 4-6 days | To Do |
| 🔥 | P3-003 | Court Availability Support | Feature | 3-4 days | To Do |
| 🔥 | P3-004 | Buffer-Aware Validation | Enhancement | 2-3 days | To Do |
| 🔥 | P3-005 | Configurable Durations/Rest | Feature | 4-5 days | To Do |
| ⚙️ | P3-006 | Topological Order | Enhancement | 2-3 days | To Do |
| ⚙️ | P3-007 | Simulate + Apply Batch | Feature | 5-7 days | To Do |
| ⚙️ | P3-008 | Locks & Manual Control | Feature | 2-3 days | To Do |
| ⚙️ | P3-009 | Performance Optimization | Tech Debt | 3-4 days | To Do |
| 🧱 | P3-010 | Generated End-Time Column | Tech Debt | 1-2 days | To Do |
| 🧱 | P3-011 | Timezone Awareness | Enhancement | 3-4 days | To Do |
| 🧱 | P3-012 | Court-Balance Scoring | Optimization | 4-5 days | To Do |
| 🧪 | P3-013 | Test Matrix Expansion | QA | 5-6 days | To Do |
| 🧭 | P3-014 | Delay Ripple API | Future | TBD | Backlog |
| 🧭 | P3-015 | Swap Tool | Future | TBD | Backlog |
| 🧭 | P3-016 | Metrics Dashboard | Future | TBD | Backlog |

---

## Total Effort Estimate

**Critical (Must-Fix)**: 16-23 days
**High Priority**: 12-17 days
**Medium Priority**: 8-11 days
**Testing**: 5-6 days

**Total**: 41-57 days (~8-11 weeks for 1 developer)

---

## Implementation Priority Order

### Phase 1: Critical Fixes (3-4 weeks)
1. TKT-P3-001 — Doubles & Multi-Category Conflict (highest impact)
2. TKT-P3-002 — Round Dependency Enforcement
3. TKT-P3-005 — Configurable Settings
4. TKT-P3-004 — Buffer-Aware Validation
5. TKT-P3-003 — Court Availability

### Phase 2: High Priority (2-3 weeks)
6. TKT-P3-007 — Simulate + Apply Batch
7. TKT-P3-009 — Performance Optimization
8. TKT-P3-008 — Locks & Manual Control
9. TKT-P3-006 — Topological Order

### Phase 3: Polish (2-3 weeks)
10. TKT-P3-013 — Test Matrix Expansion
11. TKT-P3-010 — Generated End-Time Column
12. TKT-P3-011 — Timezone Awareness
13. TKT-P3-012 — Court-Balance Scoring

### Phase 4: Future (Backlog)
14. TKT-P3-014 — Delay Ripple API
15. TKT-P3-015 — Swap Tool
16. TKT-P3-016 — Metrics Dashboard

---

## Notes

- All tickets assume familiarity with existing codebase
- Effort estimates are for 1 full-time developer
- Testing time included in estimates
- Code review and QA cycles not included
- Some tickets can be parallelized if multiple developers available

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Next Review**: After Phase 1 completion
