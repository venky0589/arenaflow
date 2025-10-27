Awesome update, Tejasvi — I read your `draw_implementation_status.md`. Noted the alignment choices:

* custom, domain-specific exceptions + `GlobalExceptionHandler`
* DTOs in `dto.request` / `dto.response`
* mapping centralized via `*Mapper` components
* clean controllers (no try/catch), service throws domain exceptions
* entity bean naming normalized (e.g., `bye` vs `isBye`)
* tests with Mockito/JUnit 5

I’ll keep these patterns in every next pack.

Here’s how to **maximize ChatGPT + Claude Code Agent together**, plus a **ready-to-paste Refinery Pack for Phase 2 (backend)** that fits your code style.

---

## How to get the most out of both systems

1. **Single-source tickets:**

   * You tell me the phase → I produce a **Refinery Pack**: atomic steps, file paths, method signatures, DTOs, mapper methods, exception types, tests, and commands.
   * You paste that pack directly to Claude. Claude implements **exactly** as written.

2. **Tight feedback loop:**

   * Claude outputs `implementation_status.md` with files changed, tests added, and any deviations.
   * You send me that status file → I generate a **Fix/Follow-up Pack** (patch-size).

3. **Micro-PRs (fast merge cadence):**

   * Each pack targets 1–3 commits and one PR.
   * Keep diffs small; run tests on every PR.

4. **Convention guardrails (from your status file):**

   * Exceptions: prefer domain-specific (e.g., `DuplicateSeedNumberException`) over generic.
   * DTOs: `dto.request`, `dto.response`, no entity leakage.
   * Mapping: `*Mapper` only (no inline mapping in services/controllers).
   * Controller: throw; let `@RestControllerAdvice` map to consistent error JSON.
   * Tests: utility + service mandatory; integration optional unless specified.

5. **Status & Health:**

   * Claude always updates: `docs/<feature>_implementation_status.md` + Postman collection.
   * You and I track a running checklist (in the canvas) of MVP blockers → done.

---

# Phase 2 – Backend for “Searchable Dropdowns” (ready to paste to Claude)

**You are my coding agent. Follow exactly. Ask only if a required input is missing.**

## 0) Context

* Spring Boot 3.3, Postgres 16, Flyway, JWT.
* Conventions: domain exceptions + `GlobalExceptionHandler`, DTOs in `dto.request/response`, mappers as `@Component`, Service layer contains business logic; Controllers are thin.

## 1) Task Goal

Provide **search/autocomplete backend endpoints** for Admin UI to replace raw ID fields with searchable dropdowns for:

* Players
* Tournaments
* Courts (by tournament)
* Categories (by tournament)
* Registrations (by tournament/category; used in some admin grids)

## 2) Acceptance Criteria

* All endpoints support query `q` (case-insensitive contains), `page`, `size`, `sort` (where applicable).
* 200 responses with **standard response DTOs** (no JPA entities).
* Return only minimal fields needed for dropdowns (`id`, `label`, optional `subtitle`/extras).
* 400 for invalid paging/sort; 404 only for parent lookups (e.g., tournament not found).
* Unit tests for service + mapper; controller slice tests optional.

## 3) Constraints

* Use Spring `Pageable` and `Page<T>`.
* Reuse existing `GlobalExceptionHandler`.
* Never return entities from controllers.
* Keep names consistent: `Search...Request/Response`, `...LookupDto`.

## 4) Implementation Plan (do in order)

1. **DTOs (new)**

   * `src/main/java/.../dto/request/SearchRequest.java`

     ```java
     public class SearchRequest { String q; Integer page; Integer size; String sort; }
     ```
   * `src/main/java/.../dto/response/LookupItemDto.java`

     ```java
     public class LookupItemDto { Long id; String label; String subtitle; }
     ```
   * `src/main/java/.../dto/response/PagedResponse.java`

     ```java
     public class PagedResponse<T> { List<T> content; int page; int size; long totalElements; int totalPages; boolean last; }
     ```

2. **Mapper (new)**

   * `src/main/java/.../mapper/LookupMapper.java`
     Methods:

     * `LookupItemDto toPlayerLookup(Player p)` → label = `p.getFullName()` (or first+last), subtitle = (rating/club if available or null)
     * `toTournamentLookup(Tournament t)` → label = `t.getName()`, subtitle = year/dates if available
     * `toCourtLookup(Court c)` → label = `c.getName()`, subtitle = location if any
     * `toCategoryLookup(Category c)` → label = `c.getName()`, subtitle = `c.getCategoryType() + " / " + c.getFormat()`
     * `toRegistrationLookup(Registration r)` → label = player name (from relation), subtitle = category

3. **Repository queries (extend as needed)**

   * Player: `Page<Player> findByFullNameIgnoreCaseContaining(String q, Pageable p)`; fallback to all if q blank.
   * Tournament: same pattern on `name`.
   * Court: `Page<Court> findByTournamentIdAndNameIgnoreCaseContaining(Long tournamentId, String q, Pageable p)`
   * Category: `Page<Category> findByTournamentIdAndNameIgnoreCaseContaining(Long tournamentId, String q, Pageable p)`
   * Registration:

     * by tournament: `Page<Registration> findByTournamentId(Long tournamentId, Pageable p)` (plus q on player’s name)
     * by category: `Page<Registration> findByCategoryId(Long categoryId, Pageable p)`

   If you prefer JPQL for player name search, add a `@Query` that concatenates first/last.

4. **Service (new)**

   * `LookupService` / `LookupServiceImpl`

     * `PagedResponse<LookupItemDto> searchPlayers(SearchRequest req, Pageable pageable)`
     * `PagedResponse<LookupItemDto> searchTournaments(SearchRequest req, Pageable pageable)`
     * `PagedResponse<LookupItemDto> searchCourts(Long tournamentId, SearchRequest req, Pageable pageable)`
     * `PagedResponse<LookupItemDto> searchCategories(Long tournamentId, SearchRequest req, Pageable pageable)`
     * `PagedResponse<LookupItemDto> searchRegistrationsByTournament(Long tournamentId, SearchRequest req, Pageable pageable)`
     * `PagedResponse<LookupItemDto> searchRegistrationsByCategory(Long categoryId, SearchRequest req, Pageable pageable)`
   * Rules:

     * If parent not found (tournament/category) → throw `ResourceNotFoundException` (use your existing one or create if missing).
     * Normalize `q = ""` for null/blank to return results (still paged).
     * Map `Page<Domain>` → `PagedResponse<LookupItemDto>` via `LookupMapper`.

5. **Controller (new)**

   * `LookupController` (`/api/v1/lookups`)

     * `GET /players` → params: `q,page,size,sort`
     * `GET /tournaments` → `q,page,size,sort`
     * `GET /tournaments/{tId}/courts` → `q,page,size,sort`
     * `GET /tournaments/{tId}/categories` → `q,page,size,sort`
     * `GET /tournaments/{tId}/registrations` → `q,page,size,sort`
     * `GET /categories/{cId}/registrations` → `q,page,size,sort`
   * Security:

     * `@PreAuthorize("hasAnyRole('ADMIN','REFEREE','USER')")` (read-only).
   * Validate paging args (use Spring defaults if not provided).

6. **Global Exception Handling**

   * Ensure `ResourceNotFoundException` already mapped to 404; `MethodArgumentNotValidException` to 400.
   * No new handlers needed unless you add a custom `InvalidPagingException` (optional).

7. **Tests**

   * `LookupServiceImplTest`:

     * players search: with `q` and without `q`
     * parent not found cases for tournament/category
     * mapping correctness (id/label/subtitle)
   * `LookupMapperTest`: pure mapper tests for each domain → dto
   * (Optional) `@WebMvcTest(LookupController.class)` for one happy-path endpoint

8. **Postman**

   * Add a `Lookup` folder:

     * `/lookups/players?q=vi&page=0&size=10`
     * `/lookups/tournaments?q=2025`
     * `/lookups/tournaments/{tId}/courts?q=court`
     * `/lookups/tournaments/{tId}/categories?q=men`
     * `/lookups/tournaments/{tId}/registrations?q=ram`
     * `/lookups/categories/{cId}/registrations?q=ram`

## 5) Exact File Changes (sketch)

```
src/main/java/.../dto/request/SearchRequest.java
src/main/java/.../dto/response/LookupItemDto.java
src/main/java/.../dto/response/PagedResponse.java

src/main/java/.../mapper/LookupMapper.java

src/main/java/.../service/LookupService.java
src/main/java/.../service/impl/LookupServiceImpl.java

src/main/java/.../web/LookupController.java
```

*(Adjust package roots to your repo; keep dto.request/response split; put impl under `service.impl` if that’s your convention.)*

## 6) Sample Signatures

```java
// Controller
@GetMapping("/lookups/players")
@PreAuthorize("hasAnyRole('ADMIN','REFEREE','USER')")
public PagedResponse<LookupItemDto> players(@RequestParam(required=false) String q, Pageable pageable) { ... }

// Service
public PagedResponse<LookupItemDto> searchPlayers(SearchRequest req, Pageable pageable);

// Mapper
public LookupItemDto toPlayerLookup(Player p);
```

## 7) Commands

```
./mvnw -q -DskipTests
./mvnw test
```

## 8) Test Plan

* **Service tests** mock repos and assert mapping + paging metadata.
* **Mapper tests** verify label/subtitle formatting for each domain type.
* **Controller slice (optional)**: one endpoint to assert 200 + JSON schema.

## 9) Deliverables

* Code + tests committed.
* `docs/lookups_implementation_status.md` summarizing endpoints, queries, and tests.
* Updated Postman collection with Lookup folder.

---

If you prefer to tackle **Match Scheduling & Court Assignment** next instead of lookups, say the word — I’ll drop a similarly aligned Refinery Pack (conflict checks, greedy auto-scheduler, DTOs, exceptions, and tests) tailored to your patterns.

