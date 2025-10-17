# Backend Refactoring Plan

**Status**: 🚧 In Progress
**Started**: 2025-10-18
**Estimated Total Time**: 10-14 hours

---

## Overview

This document tracks the systematic refactoring of the Spring Boot backend to implement best practices, improve code quality, and add missing architectural layers.

## Current Issues Identified

### Critical Architecture Issues
- ❌ **No Service Layer** - Controllers directly access repositories
- ❌ **Hacky Update Implementation** - Using reflection to set entity IDs in PUT methods
- ❌ **No DTOs** - JPA entities exposed directly in API
- ❌ **No Global Exception Handler** - Inconsistent error responses
- ❌ **Missing Role-Based Authorization** - No @PreAuthorize annotations
- ❌ **Limited Validation** - Only basic @NotBlank annotations
- ❌ **API Endpoint Inconsistency** - Only auth uses /api/v1/ prefix
- ❌ **No Database Indexes** - Performance will degrade with data growth
- ❌ **No Pagination** - findAll() returns all records

### What's Working Well
- ✅ JWT authentication properly configured
- ✅ Spring Security with BCrypt
- ✅ Flyway migrations
- ✅ Basic CRUD operations
- ✅ Swagger UI documentation

---

## Phase 1: Service Layer Implementation

**Status**: ⏳ Pending
**Estimated Time**: 2-3 hours
**Priority**: 🔴 Critical

### Goals
- Separate business logic from controllers
- Remove hacky reflection-based updates
- Enable proper transaction management
- Improve testability

### Tasks
- [ ] Create `service/` package structure
- [ ] Implement `TournamentService`
  - [ ] CRUD operations with proper update logic
  - [ ] Business validations
- [ ] Implement `PlayerService`
  - [ ] CRUD operations
  - [ ] Duplicate check logic
- [ ] Implement `MatchService`
  - [ ] CRUD operations
  - [ ] Score update logic
  - [ ] Status transitions
- [ ] Implement `CourtService`
  - [ ] CRUD operations
  - [ ] Availability checking
- [ ] Implement `RegistrationService`
  - [ ] CRUD operations
  - [ ] Duplicate registration prevention
- [ ] Refactor all controllers to use services
- [ ] Remove reflection-based ID setting

### Code Structure
```
backend/src/main/java/com/example/tournament/
├── service/
│   ├── TournamentService.java
│   ├── PlayerService.java
│   ├── MatchService.java
│   ├── CourtService.java
│   └── RegistrationService.java
```

### Example Service Implementation
```java
@Service
@Transactional
public class TournamentService {
    private final TournamentRepository repository;

    public Tournament create(Tournament tournament) {
        // Business validation
        validateTournamentDates(tournament);
        return repository.save(tournament);
    }

    public Tournament update(Long id, Tournament updates) {
        Tournament existing = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Tournament", id));

        // Proper field updates (no reflection!)
        existing.setName(updates.getName());
        existing.setLocation(updates.getLocation());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());

        return repository.save(existing);
    }

    private void validateTournamentDates(Tournament tournament) {
        if (tournament.getEndDate().isBefore(tournament.getStartDate())) {
            throw new BusinessRuleViolationException("End date must be after start date");
        }
    }
}
```

### Git Commit Message
```
Phase 1: Implement service layer

- Add service package with 5 service classes
- Move business logic from controllers to services
- Remove reflection-based update hack
- Add proper transaction management
- Improve code organization and testability
```

---

## Phase 2: DTOs & Mappers

**Status**: ⏳ Pending
**Estimated Time**: 1-2 hours
**Priority**: 🔴 High

### Goals
- Decouple API from internal domain model
- Control exactly what data is exposed
- Enable API versioning
- Prevent mass assignment vulnerabilities

### Tasks
- [ ] Create `dto/request/` package for input DTOs
- [ ] Create `dto/response/` package for output DTOs
- [ ] Create `mapper/` package for conversions
- [ ] Implement Tournament DTOs
  - [ ] CreateTournamentRequest
  - [ ] UpdateTournamentRequest
  - [ ] TournamentResponse
  - [ ] TournamentSummaryResponse
- [ ] Implement Player DTOs
- [ ] Implement Match DTOs
- [ ] Implement Court DTOs
- [ ] Implement Registration DTOs
- [ ] Create mappers (consider MapStruct)
- [ ] Update all controllers to use DTOs
- [ ] Update services to work with DTOs

### Code Structure
```
backend/src/main/java/com/example/tournament/
├── dto/
│   ├── request/
│   │   ├── CreateTournamentRequest.java
│   │   ├── UpdateTournamentRequest.java
│   │   ├── CreatePlayerRequest.java
│   │   ├── UpdateMatchScoreRequest.java
│   │   └── ...
│   └── response/
│       ├── TournamentResponse.java
│       ├── TournamentSummaryResponse.java
│       ├── PlayerResponse.java
│       └── ...
├── mapper/
│   ├── TournamentMapper.java
│   ├── PlayerMapper.java
│   └── ...
```

### Example DTO
```java
public record CreateTournamentRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 255)
    String name,

    @NotBlank
    String location,

    @NotNull
    @FutureOrPresent
    LocalDate startDate,

    @NotNull
    @FutureOrPresent
    LocalDate endDate
) {}

public record TournamentResponse(
    Long id,
    String name,
    String location,
    LocalDate startDate,
    LocalDate endDate,
    int totalMatches,
    int totalRegistrations
) {}
```

### Git Commit Message
```
Phase 2: Add DTOs and mappers

- Create separate request/response DTO packages
- Implement DTOs for all entities
- Add mapper classes for entity-DTO conversion
- Update controllers to use DTOs
- Decouple API from domain model
```

---

## Phase 3: Global Exception Handling

**Status**: ⏳ Pending
**Estimated Time**: 1 hour
**Priority**: 🔴 High

### Goals
- Consistent error responses across all endpoints
- Proper HTTP status codes
- User-friendly error messages
- Hide internal implementation details

### Tasks
- [ ] Create `exception/` package
- [ ] Create custom exception classes
  - [ ] EntityNotFoundException
  - [ ] BusinessRuleViolationException
  - [ ] DuplicateEntityException
  - [ ] ValidationException
- [ ] Create error response DTOs
  - [ ] ErrorResponse
  - [ ] ValidationErrorResponse
- [ ] Implement GlobalExceptionHandler with @ControllerAdvice
- [ ] Handle all common exceptions
- [ ] Test exception handling

### Code Structure
```
backend/src/main/java/com/example/tournament/
├── exception/
│   ├── EntityNotFoundException.java
│   ├── BusinessRuleViolationException.java
│   ├── DuplicateEntityException.java
│   ├── GlobalExceptionHandler.java
│   ├── ErrorResponse.java
│   └── ValidationErrorResponse.java
```

### Example Implementation
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            "RESOURCE_NOT_FOUND",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleViolationException ex) {
        ErrorResponse error = new ErrorResponse(
            "BUSINESS_RULE_VIOLATION",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
        MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"
            ));

        ValidationErrorResponse response = new ValidationErrorResponse(
            "VALIDATION_FAILED",
            "Input validation failed",
            errors,
            LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

### Git Commit Message
```
Phase 3: Add global exception handling

- Create custom exception classes
- Implement @ControllerAdvice for centralized error handling
- Add structured error response DTOs
- Standardize HTTP status codes
- Improve API error consistency
```

---

## Phase 4: Enhanced Validation

**Status**: ⏳ Pending
**Estimated Time**: 1 hour
**Priority**: 🟡 Medium

### Goals
- Comprehensive input validation
- Business rule enforcement
- Better error messages
- Data integrity

### Tasks
- [ ] Add validation annotations to all DTOs
- [ ] Implement custom validators if needed
- [ ] Add service-level business validations
- [ ] Test validation rules

### Validation Examples
```java
public record CreatePlayerRequest(
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100)
    String firstName,

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100)
    String lastName,

    @Pattern(regexp = "^[MF]$", message = "Gender must be M or F")
    String gender,

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    String phone
) {}

// Service-level validation
public class TournamentService {
    public Tournament create(CreateTournamentRequest request) {
        // Business rule validations
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleViolationException(
                "Tournament end date must be after start date"
            );
        }

        if (request.startDate().isBefore(LocalDate.now())) {
            throw new BusinessRuleViolationException(
                "Tournament start date cannot be in the past"
            );
        }

        // Check for duplicate names
        if (repository.existsByName(request.name())) {
            throw new DuplicateEntityException(
                "Tournament with name '" + request.name() + "' already exists"
            );
        }

        // ... rest of creation logic
    }
}
```

### Git Commit Message
```
Phase 4: Enhance validation

- Add comprehensive validation annotations to DTOs
- Implement business rule validations in services
- Add custom validators for complex rules
- Improve validation error messages
```

---

## Phase 5: Security Enhancements

**Status**: ⏳ Pending
**Estimated Time**: 1-2 hours
**Priority**: 🔴 High

### Goals
- Implement role-based access control
- Standardize API endpoints
- Return user roles with login
- Secure all endpoints properly

### Tasks
- [ ] Add @PreAuthorize annotations to all endpoints
- [ ] Update login response to include user roles
- [ ] Standardize all endpoints to /api/v1/ prefix
- [ ] Update SecurityConfig for fine-grained control
- [ ] Test authorization rules

### Endpoint Security Mapping
```java
// Public endpoints
GET  /api/v1/tournaments (public list)
GET  /api/v1/tournaments/{id} (public details)

// USER role
POST /api/v1/registrations (register for tournament)
GET  /api/v1/registrations/my (my registrations)

// REFEREE role
PUT  /api/v1/matches/{id}/score (update match score)
POST /api/v1/matches/{id}/complete (complete match)

// ADMIN role
POST   /api/v1/tournaments (create tournament)
PUT    /api/v1/tournaments/{id} (update tournament)
DELETE /api/v1/tournaments/{id} (delete tournament)
POST   /api/v1/tournaments/{id}/generate-draw
// ... all other admin operations
```

### Implementation
```java
@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    @GetMapping
    public List<TournamentResponse> getAll() {
        // Public - no auth required
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public TournamentResponse create(@Valid @RequestBody CreateTournamentRequest request) {
        // Only ADMIN can create
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public TournamentResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateTournamentRequest request
    ) {
        // Only ADMIN can update
    }
}

// Update login response
public record LoginResponse(
    String token,
    String email,
    Set<Role> roles
) {}
```

### Git Commit Message
```
Phase 5: Security enhancements

- Add @PreAuthorize annotations to all endpoints
- Update login to return user roles
- Standardize all API endpoints to /api/v1/ prefix
- Implement fine-grained role-based access control
- Update SecurityConfig for proper authorization
```

---

## Phase 6: Database Optimizations

**Status**: ⏳ Pending
**Estimated Time**: 1 hour
**Priority**: 🟡 Medium

### Goals
- Improve query performance
- Enforce data integrity
- Prevent duplicate data
- Prepare for production scale

### Tasks
- [ ] Create V2__add_indexes.sql migration
- [ ] Add indexes on foreign keys
- [ ] Add composite indexes for common queries
- [ ] Create V3__add_constraints.sql migration
- [ ] Add CHECK constraints
- [ ] Add UNIQUE constraints
- [ ] Test migrations

### Migration Files

**V2__add_indexes.sql**
```sql
-- Foreign key indexes for joins
CREATE INDEX idx_match_tournament ON matches(tournament_id);
CREATE INDEX idx_match_court ON matches(court_id);
CREATE INDEX idx_match_player1 ON matches(player1_id);
CREATE INDEX idx_match_player2 ON matches(player2_id);
CREATE INDEX idx_registration_tournament ON registration(tournament_id);
CREATE INDEX idx_registration_player ON registration(player_id);

-- Composite indexes for common queries
CREATE INDEX idx_match_tournament_status ON matches(tournament_id, status);
CREATE INDEX idx_match_court_scheduled ON matches(court_id, scheduled_at);
CREATE INDEX idx_registration_tournament_category ON registration(tournament_id, category_type);

-- Indexes for sorting/filtering
CREATE INDEX idx_tournament_dates ON tournament(start_date, end_date);
CREATE INDEX idx_match_scheduled_at ON matches(scheduled_at);
```

**V3__add_constraints.sql**
```sql
-- Data integrity constraints
ALTER TABLE matches
ADD CONSTRAINT check_valid_scores
CHECK (score1 >= 0 AND score2 >= 0);

ALTER TABLE tournament
ADD CONSTRAINT check_valid_dates
CHECK (end_date >= start_date);

ALTER TABLE matches
ADD CONSTRAINT check_different_players
CHECK (player1_id != player2_id OR player1_id IS NULL OR player2_id IS NULL);

-- Prevent duplicate registrations
ALTER TABLE registration
ADD CONSTRAINT unique_player_tournament_category
UNIQUE (player_id, tournament_id, category_type);

-- Ensure court names are unique (already in V1 but good to verify)
-- ALTER TABLE court ADD CONSTRAINT unique_court_name UNIQUE (name);
```

### Git Commit Message
```
Phase 6: Database optimizations

- Add indexes on foreign keys for better join performance
- Add composite indexes for common query patterns
- Add CHECK constraints for data validation
- Add UNIQUE constraints to prevent duplicates
- Create V2 and V3 Flyway migrations
```

---

## Phase 7: Additional Improvements

**Status**: ⏳ Pending
**Estimated Time**: 2-3 hours
**Priority**: 🟢 Nice to Have

### Goals
- Add pagination for large datasets
- Implement audit trail
- Add structured logging
- Create integration tests

### Tasks
- [ ] Implement pagination
  - [ ] Update repositories to extend PagingAndSortingRepository
  - [ ] Update controllers to accept Pageable parameters
  - [ ] Return Page<> instead of List<>
- [ ] Add audit fields
  - [ ] Add createdBy, createdAt, updatedBy, updatedAt to entities
  - [ ] Configure Spring Data JPA auditing
  - [ ] Create V4 migration for audit columns
- [ ] Add logging
  - [ ] Add SLF4J logger to all services
  - [ ] Log important operations (create, update, delete)
  - [ ] Log errors with context
- [ ] Create tests
  - [ ] Service unit tests with Mockito
  - [ ] Controller integration tests
  - [ ] Repository tests

### Pagination Example
```java
@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    @GetMapping
    public Page<TournamentResponse> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "startDate") String sortBy,
        @RequestParam(defaultValue = "DESC") Sort.Direction direction
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return service.findAll(pageable);
    }
}
```

### Audit Fields Example
```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Tournament {
    // ... existing fields

    @CreatedBy
    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedBy
    private String lastModifiedBy;

    @LastModifiedDate
    private LocalDateTime lastModifiedAt;
}

// Enable auditing
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return Optional.ofNullable(auth)
                .map(Authentication::getName)
                .filter(name -> !"anonymousUser".equals(name));
        };
    }
}
```

### Logging Example
```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TournamentService {

    public Tournament create(CreateTournamentRequest request) {
        log.info("Creating tournament: name={}, startDate={}",
                 request.name(), request.startDate());

        try {
            Tournament tournament = mapper.toEntity(request);
            Tournament saved = repository.save(tournament);

            log.info("Tournament created successfully: id={}, name={}",
                     saved.getId(), saved.getName());

            return saved;
        } catch (Exception e) {
            log.error("Failed to create tournament: name={}", request.name(), e);
            throw e;
        }
    }
}
```

### Git Commit Message
```
Phase 7: Additional improvements

- Add pagination support to all list endpoints
- Implement audit trail (createdBy, createdAt, updatedBy, updatedAt)
- Add structured logging with SLF4J
- Create service unit tests
- Create controller integration tests
```

---

## Progress Tracking

### Phase Completion Checklist
- [ ] Phase 1: Service Layer
- [ ] Phase 2: DTOs & Mappers
- [ ] Phase 3: Global Exception Handling
- [ ] Phase 4: Enhanced Validation
- [ ] Phase 5: Security Enhancements
- [ ] Phase 6: Database Optimizations
- [ ] Phase 7: Additional Improvements

### Time Tracking
| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Phase 1 | 2-3h | - | |
| Phase 2 | 1-2h | - | |
| Phase 3 | 1h | - | |
| Phase 4 | 1h | - | |
| Phase 5 | 1-2h | - | |
| Phase 6 | 1h | - | |
| Phase 7 | 2-3h | - | |
| **Total** | **10-14h** | **-** | |

---

## Notes & Decisions

### Design Decisions
- Using manual mappers instead of MapStruct for simplicity (can switch later)
- Following Spring Boot best practices from improvement docs
- Prioritizing critical issues first (service layer, DTOs, exceptions)
- Git commit after each phase for rollback capability

### Dependencies to Add (if needed)
```xml
<!-- For Lombok (reduce boilerplate) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>

<!-- For MapStruct (if we choose to use it) -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
```

### Future Enhancements (Post Phase 7)
- Caching with Spring Cache + Caffeine
- Event-driven architecture with Spring Events
- API documentation with OpenAPI annotations
- Performance monitoring with Micrometer
- Integration with notification service (email)
- Real-time updates with WebSocket

---

**Last Updated**: 2025-10-18
**Maintained By**: Backend Refactoring Team
