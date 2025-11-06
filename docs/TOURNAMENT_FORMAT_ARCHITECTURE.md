# Tournament Format Flexibility - Architecture Documentation

**Last Updated**: 2025-11-06
**Status**: ✅ **MVP Complete** (Single Elimination fully implemented, Round Robin structure ready for V2)
**Feature**: #9 Tournament Format Flexibility (Structure Only)

---

## Overview

This document describes the architecture for supporting multiple tournament formats (Single Elimination, Round Robin, etc.) in the badminton tournament management system. The implementation uses the **Strategy Pattern** to cleanly separate format-specific logic and enable easy extension for future formats.

### Current Status

| Format | Status | Description |
|--------|--------|-------------|
| **Single Elimination** | ✅ **Production Ready** | Fully implemented with bracket generation, seeding, BYE handling, and winner advancement |
| **Round Robin** | 📦 **V2 Planned** | Data model ready, returns HTTP 501 with clear "Coming in V2" message |

---

## Architecture Pattern: Strategy Pattern

### Design Principles

1. **Open/Closed Principle**: Open for extension (add new formats), closed for modification (existing SE code unchanged)
2. **Single Responsibility**: Each draw engine handles exactly one tournament format
3. **Dependency Inversion**: Service layer depends on DrawEngine abstraction, not concrete implementations
4. **Factory Pattern**: DrawEngineFactory routes to the correct engine based on category format

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BracketController                        │
│  POST /tournaments/{id}/categories/{id}/draw:generate       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BracketServiceImpl                        │
│  - Validates category exists                                │
│  - Gets DrawEngine from factory based on category.format    │
│  - Delegates draw generation to engine                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DrawEngineFactory                         │
│  - Auto-discovers all DrawEngine implementations (Spring)   │
│  - Routes based on TournamentFormat enum                    │
│  - Returns appropriate engine or throws exception           │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ SingleEliminationDraw    │  │   RoundRobinDrawEngine       │
│       Engine             │  │                              │
│ ✅ MVP: Fully Implemented│  │ 📦 V2: Structure Only        │
│ - Bracket generation     │  │ - Throws 501 Not Implemented │
│ - Seeding algorithm      │  │ - Clear V2 guidance message  │
│ - BYE handling           │  │                              │
│ - Winner advancement     │  │                              │
└──────────────────────────┘  └──────────────────────────────┘
```

---

## Implementation Details

### 1. DrawEngine Interface

**File**: `backend/src/main/java/com/example/tournament/service/draw/DrawEngine.java`

```java
public interface DrawEngine {
    /**
     * Generate a tournament draw/bracket for the given category.
     */
    BracketSummaryResponse generateDraw(
        Category category,
        List<Registration> registrations,
        DrawGenerateRequest request
    );

    /**
     * Check if this engine supports the given tournament format.
     */
    boolean supports(TournamentFormat format);
}
```

**Key Features**:
- Clean abstraction for all tournament formats
- Takes Category, Registrations, and optional DrawGenerateRequest
- Returns unified BracketSummaryResponse
- Self-identifying via `supports()` method

---

### 2. SingleEliminationDrawEngine

**File**: `backend/src/main/java/com/example/tournament/service/draw/SingleEliminationDrawEngine.java`

**Responsibilities**:
- Generate knockout bracket structure
- Handle seeding with `SeedPlacementUtil`
- Calculate rounds and effective bracket size (next power of 2)
- Create match skeletons for all rounds
- Link matches via `nextMatchId` and `winnerAdvancesAs`
- Handle BYE participants and auto-advancement
- Build participant labels (player names or team display names)

**Algorithm Highlights**:
- **Seeding**: Fair distribution using `SeedPlacementUtil.orderBySeedOrNatural()`
- **BYE Handling**: Automatically completes first-round BYE matches and advances winners
- **Match Linking**: Tracks winner progression through bracket tree
- **Optimistic Locking**: Uses JPA `@Version` to prevent concurrent edit conflicts
- **Doubles Support**: Handles both singles (player) and doubles (team) registrations

**Example Bracket** (4 participants):
```
Round 1              Round 2 (Final)
┌─────────────┐
│ P1 vs P2    ├───┐
└─────────────┘   │
                  ├─── Winner
┌─────────────┐   │
│ P3 vs P4    ├───┘
└─────────────┘
```

---

### 3. RoundRobinDrawEngine (V2 Placeholder)

**File**: `backend/src/main/java/com/example/tournament/service/draw/RoundRobinDrawEngine.java`

**Current Implementation**:
```java
@Override
public BracketSummaryResponse generateDraw(...) {
    log.warn("Attempted to generate Round Robin draw. Feature not yet available.");
    throw new UnsupportedOperationException(
        "Round Robin format will be available in Version 2. " +
        "Please use Single Elimination format for now, or stay tuned for the upcoming release."
    );
}
```

**HTTP Response**: 501 Not Implemented with error code `FEATURE_NOT_AVAILABLE`

**V2 Implementation Plan**:
- Generate all-vs-all match matrix
- Calculate match schedule (avoid player conflicts)
- Track standings (wins, losses, points)
- Determine final rankings
- Handle tie-breaker rules

---

### 4. DrawEngineFactory

**File**: `backend/src/main/java/com/example/tournament/service/draw/DrawEngineFactory.java`

**How It Works**:
1. Spring auto-injects all `@Component` classes implementing `DrawEngine`
2. On `getEngine(TournamentFormat format)` call:
   - Iterates through all registered engines
   - Checks `engine.supports(format)`
   - Returns first matching engine
   - Throws `IllegalArgumentException` if no engine supports the format

**Initialization Log**:
```
DrawEngineFactory initialized with 2 engine(s):
  [SingleEliminationDrawEngine, RoundRobinDrawEngine]
```

**Benefits**:
- Zero configuration required for new engines (just add `@Component`)
- Type-safe format routing
- Clear error messages for unsupported formats
- Easy to test with mock engines

---

### 5. Global Exception Handling

**File**: `backend/src/main/java/com/example/tournament/web/GlobalExceptionHandler.java`

**Added Handler**:
```java
@ExceptionHandler(UnsupportedOperationException.class)
public ResponseEntity<ErrorResponse> handleUnsupportedOperation(...) {
    return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
        .body(new ErrorResponse(501, "Not Implemented", message, ...));
}
```

**Error Response Format**:
```json
{
  "timestamp": "2025-11-06T15:30:00",
  "status": 501,
  "error": "Not Implemented",
  "message": "Round Robin format will be available in Version 2...",
  "path": "/api/v1/tournaments/1/categories/6/draw:generate",
  "code": "FEATURE_NOT_AVAILABLE"
}
```

---

## Database Schema

### Category Table (Existing)

```sql
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id),
    name VARCHAR(120) NOT NULL,
    category_type VARCHAR(20) NOT NULL,  -- 'SINGLES', 'DOUBLES'
    format VARCHAR(30) NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    gender_restriction VARCHAR(16) NOT NULL,
    min_age INT,
    max_age INT,
    max_participants INT,
    registration_fee DECIMAL(10,2),
    display_order INT,
    created_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255)
);
```

**Format Values**:
- `SINGLE_ELIMINATION` (MVP - fully implemented)
- `ROUND_ROBIN` (V2 - structure only)

**Migration**: No new migration required - format column already exists in V6 schema

---

## API Documentation

### Generate Tournament Draw

**Endpoint**: `POST /api/v1/tournaments/{tournamentId}/categories/{categoryId}/draw:generate`

**Request Body** (optional):
```json
{
  "seeds": [
    {"registrationId": 101, "seedNumber": 1},
    {"registrationId": 102, "seedNumber": 2}
  ],
  "overwriteIfDraft": true
}
```

**Response Codes**:
| Code | Description |
|------|-------------|
| 200 | Bracket generated successfully |
| 400 | Invalid request (duplicate seeds, invalid registration IDs) |
| 403 | User lacks permission (requires SYSTEM_ADMIN or tournament owner) |
| 404 | Category or tournament not found |
| 409 | Bracket already exists (set `overwriteIfDraft=true` to regenerate) |
| **501** | **Format not yet implemented (e.g., Round Robin in V2)** |

**Example Success Response** (Single Elimination):
```json
{
  "categoryId": 1,
  "participantCount": 5,
  "effectiveSize": 8,
  "rounds": 3,
  "matches": [
    {
      "id": 1001,
      "round": 1,
      "position": 0,
      "participant1RegistrationId": 101,
      "participant2RegistrationId": 102,
      "participant1Label": "Saina K",
      "participant2Label": "Sindhu P",
      "status": "SCHEDULED",
      "bye": false,
      "nextMatchId": 1005,
      "winnerAdvancesAs": 1
    }
  ],
  "participantLabels": {
    "101": "Saina K",
    "102": "Sindhu P"
  }
}
```

**Example Error Response** (Round Robin):
```json
{
  "timestamp": "2025-11-06T15:30:00",
  "status": 501,
  "error": "Not Implemented",
  "message": "Round Robin format will be available in Version 2. Please use Single Elimination format for now, or stay tuned for the upcoming release.",
  "path": "/api/v1/tournaments/1/categories/6/draw:generate",
  "code": "FEATURE_NOT_AVAILABLE"
}
```

---

## Testing Strategy

### Unit Tests

**File**: `backend/src/test/java/com/example/tournament/service/BracketServiceImplTest.java`

**Coverage**:
- ✅ Bracket generation with BYEs
- ✅ Seeding algorithm
- ✅ Winner advancement
- ✅ Duplicate seed number validation
- ✅ Invalid registration ID validation
- ✅ Bracket already exists error
- ✅ Insufficient participants error
- ✅ Draft bracket deletion
- ✅ Bracket in-progress deletion protection

**Test Results**: 9/9 tests passing ✅

### Integration Tests (Planned)

- [ ] End-to-end SE bracket generation via REST API
- [ ] Round Robin returns 501 error
- [ ] Format switching after category creation
- [ ] Multi-format tournament (some SE, some RR)

---

## Seed Data

**File**: `backend/src/main/resources/data.sql`

### Existing Categories (Single Elimination)

```sql
-- Men's Singles - SINGLE_ELIMINATION
INSERT INTO category(tournament_id, name, category_type, format, ...)
VALUES (1, 'Men''s Singles', 'SINGLES', 'SINGLE_ELIMINATION', ...);

-- Women's Singles - SINGLE_ELIMINATION
INSERT INTO category(tournament_id, name, category_type, format, ...)
VALUES (1, 'Women''s Singles', 'SINGLES', 'SINGLE_ELIMINATION', ...);

-- Men's Doubles - SINGLE_ELIMINATION
INSERT INTO category(tournament_id, name, category_type, format, ...)
VALUES (1, 'Men''s Doubles', 'DOUBLES', 'SINGLE_ELIMINATION', ...);
```

### V2 Demo Category (Round Robin)

```sql
-- Men's Singles (Round Robin) - V2 Feature Demo Category
INSERT INTO category(tournament_id, name, category_type, format, ...)
VALUES (2, 'Men''s Singles - Round Robin (V2 Demo)', 'SINGLES', 'ROUND_ROBIN', ...);
```

**Purpose**: Demonstrates format infrastructure and allows testing of 501 error handling

---

## Frontend Integration (Pending)

### Admin UI

**Tasks**:
1. Display format badge in category list (SE / RR chip)
2. Show format in category create/edit form
3. Disable "Generate Draw" button if format is Round Robin
4. Show tooltip: "Round Robin draw generation will be available in V2"
5. Handle 501 error gracefully with user-friendly message

**Files to Update**:
- `admin-ui/src/components/GenerateDrawDialog.tsx`
- `admin-ui/src/components/categories/CategoryBadges.tsx`
- Category form component (TBD)

### User UI

**Tasks**:
1. Display format label in category selector
2. Show "Coming in V2" message for Round Robin brackets
3. Keep Single Elimination bracket visualization working as-is

**Files to Update**:
- `user-ui/src/components/brackets/BracketView.tsx`
- `user-ui/src/components/brackets/CategorySelector.tsx`

---

## Extension Guide: Adding a New Format

To add a new tournament format (e.g., Double Elimination, Swiss System):

### 1. Update TournamentFormat Enum

```java
public enum TournamentFormat {
    SINGLE_ELIMINATION,
    ROUND_ROBIN,
    DOUBLE_ELIMINATION  // NEW
}
```

### 2. Create DrawEngine Implementation

```java
@Component
public class DoubleEliminationDrawEngine implements DrawEngine {
    @Override
    public boolean supports(TournamentFormat format) {
        return format == TournamentFormat.DOUBLE_ELIMINATION;
    }

    @Override
    public BracketSummaryResponse generateDraw(...) {
        // Implement double elimination logic
        // - Winner's bracket
        // - Loser's bracket
        // - Grand final
    }
}
```

### 3. Test

```java
@Test
void testDoubleEliminationGeneration() {
    Category cat = new Category();
    cat.setFormat(TournamentFormat.DOUBLE_ELIMINATION);
    // ... test generation
}
```

### 4. Update Documentation

- Add to this document
- Update Swagger/OpenAPI
- Add to CLAUDE.md

**That's it!** No changes needed to:
- ✅ BracketServiceImpl (uses factory)
- ✅ BracketController (delegates to service)
- ✅ DrawEngineFactory (auto-discovers new engine)
- ✅ Database schema (format column is text)

---

## Performance Considerations

### Single Elimination

- **Time Complexity**: O(n) for n participants
  - Bracket generation: O(n log n) due to seeding sort
  - Match creation: O(n) for all rounds
  - BYE advancement: O(n) for first round only
- **Database Queries**:
  - 1 query to load category
  - 1 query to load registrations
  - n queries to save matches (could be optimized with batch insert)
  - m queries to update BYE matches (m = number of BYEs)
- **Memory**: O(n) to store all matches in memory during generation

### Round Robin (V2 Projection)

- **Time Complexity**: O(n²) for n participants
  - All-vs-all requires n(n-1)/2 matches
- **Database Queries**: O(n²) match inserts
- **Memory**: O(n²) to store match matrix

### Optimizations (Future)

- [ ] Batch insert for matches (reduce DB round-trips)
- [ ] Async bracket generation for large tournaments
- [ ] Caching for completed brackets
- [ ] Pagination for large bracket responses

---

## Security & Authorization

### Draw Generation

- **Endpoint**: `POST /api/v1/tournaments/{id}/categories/{id}/draw:generate`
- **Authorization**: `@PreAuthorize("hasRole('SYSTEM_ADMIN') || @authzService.canManageTournament(#tournamentId)")`
- **Roles Allowed**:
  - `SYSTEM_ADMIN`: Full access to all tournaments
  - Tournament Owner: Can manage their own tournaments (checked via `@authzService`)

### Bracket Viewing

- **Endpoint**: `GET /api/v1/categories/{id}/bracket`
- **Authorization**: Public (no authentication required)
- **Rationale**: Brackets are public information for tournament transparency

### Draft Bracket Deletion

- **Endpoint**: `DELETE /api/v1/categories/{id}/bracket`
- **Authorization**: `@PreAuthorize("hasRole('SYSTEM_ADMIN')")`
- **Safeguard**: Only deletes if all matches are in SCHEDULED or COMPLETED status

---

## Logging

### Key Log Points

1. **DrawEngineFactory Initialization**:
   ```
   DrawEngineFactory initialized with 2 engine(s): [SingleEliminationDrawEngine, RoundRobinDrawEngine]
   ```

2. **Format Routing**:
   ```
   Generating bracket for tournament=1, category=5
   Using SingleEliminationDrawEngine for category format: SINGLE_ELIMINATION
   ```

3. **Bracket Generation**:
   ```
   Bracket: 5 participants, effective size=8, rounds=3
   Bracket generated successfully: 7 total matches, 3 BYEs auto-advanced
   ```

4. **Unsupported Format Attempt**:
   ```
   Attempted to generate Round Robin draw for category=6 (Men's Singles - RR). Feature not yet available.
   ```

---

## Troubleshooting

### Problem: "No draw engine found for tournament format: X"

**Cause**: DrawEngineFactory couldn't find an engine supporting the format
**Solution**:
1. Ensure the engine class has `@Component` annotation
2. Verify `supports(format)` returns true for the format
3. Check Spring component scanning includes the `service.draw` package

### Problem: All formats return 501

**Cause**: DrawEngineFactory not finding any engines
**Solution**:
1. Check logs for "DrawEngineFactory initialized with N engine(s)"
2. If N=0, engines aren't being discovered by Spring
3. Verify package structure: `com.example.tournament.service.draw.*`

### Problem: Tests fail with NullPointerException

**Cause**: Test not providing DrawEngineFactory to BracketServiceImpl
**Solution**:
```java
SingleEliminationDrawEngine seEngine = new SingleEliminationDrawEngine(...);
DrawEngineFactory factory = new DrawEngineFactory(List.of(seEngine));
service = new BracketServiceImpl(..., factory);
```

---

## Future Enhancements

### V2: Round Robin Implementation

- [ ] Implement `RoundRobinDrawEngine.generateDraw()`
- [ ] Create standings/leaderboard table
- [ ] Handle tie-breaker rules
- [ ] UI for round-robin matrix view
- [ ] Scheduling algorithm to minimize player conflicts

### V3: Advanced Formats

- [ ] Double Elimination (winner's + loser's brackets)
- [ ] Swiss System (pairings based on current standings)
- [ ] Group Stage + Knockout (hybrid format)
- [ ] Custom formats (user-defined rules)

### Performance

- [ ] Batch insert for matches
- [ ] Async draw generation
- [ ] Bracket caching
- [ ] GraphQL support for flexible bracket queries

---

## References

- **Project Brief**: `docs/tournament_project_brief.txt`
- **Main Context**: `CLAUDE.md`
- **Backend Context**: `backend/CLAUDE.md`
- **Admin UI Context**: `admin-ui/CLAUDE.md`
- **User UI Context**: `user-ui/CLAUDE.md`
- **Strategy Pattern**: https://refactoring.guru/design-patterns/strategy
- **Spring Dependency Injection**: https://docs.spring.io/spring-framework/reference/core/beans.html

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | Claude Code | Initial implementation: DrawEngine pattern, SingleElimination refactor, RoundRobin stub, tests passing (9/9) |

---

**For Questions**: Refer to this document or check the inline code comments in the `service.draw` package.
