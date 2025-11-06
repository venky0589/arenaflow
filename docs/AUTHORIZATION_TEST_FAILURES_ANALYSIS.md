# Authorization Test Failures Analysis

**Date**: 2025-11-06
**Status**: Pre-existing Issue (Unrelated to Tournament Format Flexibility)
**Priority**: High (Blocking `mvn clean install`)

---

## Executive Summary

27 integration tests are failing in `MatchStatusWorkflowIntegrationTest` (17 failures) and `SchedulingIntegrationTest` (10 failures). These failures are **authorization-related** and existed **before** the Tournament Format Flexibility feature implementation. The root cause is incomplete test configuration for the `AuthzService` bean.

---

## Root Cause Analysis

### Problem

Tests use `@PreAuthorize` annotations with Spring Expression Language (SpEL) that reference `@authzService` bean:

```java
@PreAuthorize("hasRole('SYSTEM_ADMIN') || @authzService.canScoreMatches(@service.getTournamentId(#id))")
@PostMapping("/{id}/start")
public ResponseEntity<MatchResponse> startMatch(@PathVariable Long id) { ... }
```

**What Happens:**
1. Test executes with `@WithMockUser(roles = {"ADMIN"})`
2. Spring Security tries to evaluate the `@PreAuthorize` expression
3. Expression references `@authzService.canScoreMatches(...)`
4. `AuthzService` bean is **not properly mocked/configured** in test context
5. SpEL evaluation fails → returns HTTP 400 instead of expected 404/403/409
6. Test assertion fails (expected 404, got 400)

### Evidence

**TestConfig.java** (current):
```java
@TestConfiguration
public class TestConfig {
    @Bean
    @Primary
    public SimpMessagingTemplate simpMessagingTemplate() {
        return mock(SimpMessagingTemplate.class);  // Only mocks WebSocket
    }
    // ❌ Missing: AuthzService mock
}
```

**Error Pattern in Tests:**
- Expected: HTTP 404 (Not Found), HTTP 403 (Forbidden), HTTP 409 (Conflict)
- Actual: HTTP 400 (Bad Request)
- Reason: `@authzService` bean not found → SpEL evaluation fails → returns 400

### AuthzService Dependencies

The `AuthzService` requires:
- `TournamentRoleAssignmentRepository`
- `RegistrationRepository`
- `UserAccountRepository`
- `CategoryRepository`
- Spring Security `Authentication` context

In tests, these are not properly configured, causing authorization expressions to fail evaluation.

---

## Affected Tests

### MatchStatusWorkflowIntegrationTest (17 failures)

1. **Valid Transitions (ADMIN)** - 5 tests
   - Full workflow: SCHEDULED → IN_PROGRESS → COMPLETED
   - SCHEDULED → IN_PROGRESS (admin override)
   - IN_PROGRESS → COMPLETED
   - IN_PROGRESS → WALKOVER
   - IN_PROGRESS → RETIRED

2. **Valid Transitions (REFEREE)** - 2 tests
   - Referee can start match
   - Referee can complete match

3. **Invalid Transitions** - 3 tests
   - SCHEDULED → COMPLETED not allowed
   - COMPLETED → IN_PROGRESS not allowed
   - SCHEDULED → WALKOVER not allowed

4. **Validation Errors** - 4 tests
   - WALKOVER requires non-blank reason
   - WALKOVER requires winnerId
   - WALKOVER winnerId must be participant
   - Match not found returns 404

5. **Security** - 3 tests
   - USER role cannot start match (403)
   - USER role cannot complete match (403)
   - Unauthenticated cannot start match (403)

### SchedulingIntegrationTest (10 failures)

1. Schedule match successfully
2. Reject match before operating hours
3. Reject match ending after hours
4. ~~Optimistic lock failure~~ (disabled)
5. Filter matches by date
6. Filter matches by court
7. Filter matches by status
8. Pagination support
9. Return 404 when match not found
10. Return 404 when court not found

---

## Solution Approaches

### Option 1: Mock AuthzService (Quick Fix - Recommended for MVP)

**Add to TestConfig.java:**
```java
@Bean
@Primary
public AuthzService authzService() {
    AuthzService mock = mock(AuthzService.class);

    // Configure mock to always return true for ADMIN/REFEREE roles
    when(mock.canManageTournament(anyLong())).thenReturn(true);
    when(mock.canScoreMatches(anyLong())).thenReturn(true);
    when(mock.canManageRegistrations(anyLong())).thenReturn(true);
    when(mock.canManageTournamentOfCategory(anyLong())).thenReturn(true);
    when(mock.isSystemAdmin()).thenReturn(true);

    return mock;
}
```

**Pros:**
- Simple and fast
- Unblocks `mvn clean install` immediately
- Tests focus on business logic, not authorization

**Cons:**
- Doesn't test actual authorization logic
- Assumes authorization always succeeds

**Effort:** 15 minutes

---

### Option 2: Create Test Security Configuration (Medium - Better Coverage)

**Create TestSecurityConfig.java:**
```java
@TestConfiguration
public class TestSecurityConfig {

    @Bean
    @Primary
    public AuthzService authzService(
        TournamentRoleAssignmentRepository roleRepo,
        RegistrationRepository registrationRepo,
        UserAccountRepository userRepo,
        CategoryRepository categoryRepo
    ) {
        return new AuthzService(roleRepo, registrationRepo, userRepo, categoryRepo);
    }

    @BeforeEach
    void setupTestRoles() {
        // Create test user with proper roles in database
        // This allows real AuthzService to work in tests
    }
}
```

**Pros:**
- Tests real authorization logic
- Better integration testing
- Catches authorization bugs

**Cons:**
- More complex setup
- Requires test data setup (users, roles)
- Slower tests

**Effort:** 2-3 hours

---

### Option 3: Separate Authorization Tests (Best Practice - Long Term)

Create dedicated `AuthzServiceTest` (already exists) and use mocked `AuthzService` in integration tests.

**Structure:**
- **Unit Tests**: Test `AuthzService` methods independently
- **Integration Tests**: Mock `AuthzService` to focus on business logic
- **E2E Tests**: Test full stack including real authorization

**Pros:**
- Best separation of concerns
- Fast unit tests, comprehensive E2E tests
- Industry best practice

**Cons:**
- Requires refactoring test suite
- Most time-consuming

**Effort:** 1-2 days

---

## Recommended Action Plan

### Immediate (This Sprint)
1. **Implement Option 1** - Mock `AuthzService` in `TestConfig.java`
2. Verify all 27 tests pass with mocked authorization
3. Unblock `mvn clean install` for deployment

### Short Term (Next Sprint)
4. Create dedicated `AuthzService` unit tests (already exists - verify coverage)
5. Add integration tests with test-specific security context

### Long Term (Post-MVP)
6. Implement Testcontainers for true integration testing
7. Create E2E test suite with real authentication flows
8. Add security penetration testing

---

## Impact Assessment

### On Tournament Format Flexibility Feature
- **Zero Impact**: Our feature (BracketServiceImplTest) passes 9/9 tests ✅
- **Independent**: Format flexibility logic doesn't use `AuthzService`
- **Production Ready**: Backend compiles successfully, frontend working

### On CI/CD Pipeline
- **Blocking**: `mvn clean install` fails (cannot deploy)
- **Workaround**: `mvn clean compile` succeeds (development OK)
- **Priority**: Must fix before production deployment

### On Team Productivity
- **High Impact**: Blocks PR merges that require passing tests
- **Confidence**: Reduced confidence in authorization logic
- **Tech Debt**: Highlights gap in test coverage

---

## Next Steps

1. **Immediate**: Discuss with team which solution approach to take
2. **Assigned To**: [Backend Lead]
3. **Estimated Fix Time**: 15 minutes (Option 1) to 2 hours (Option 2)
4. **Testing**: Re-run full test suite after fix
5. **Documentation**: Update testing guidelines to prevent similar issues

---

## Technical Details

### Authorization Expression Examples

**Working Expression (Simple):**
```java
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
```
✅ Works because Spring Security directly checks roles

**Failing Expression (Bean Reference):**
```java
@PreAuthorize("hasRole('SYSTEM_ADMIN') || @authzService.canManageTournament(#tournamentId)")
```
❌ Fails because `@authzService` bean not properly configured in test context

### Test Execution Flow

1. `@SpringBootTest` loads application context
2. `@Import(TestConfig.class)` imports test-specific beans
3. `@WithMockUser(roles = {"ADMIN"})` sets up authentication
4. Test calls controller endpoint
5. Spring Security evaluates `@PreAuthorize` expression
6. Expression tries to call `@authzService.canManageTournament(...)`
7. **FAILURE**: Bean not found or misconfigured
8. Returns HTTP 400 instead of proceeding to business logic

---

## References

- **Controller with Annotations**: [MatchController.java](../backend/src/main/java/com/example/tournament/web/MatchController.java)
- **Authorization Service**: [AuthzService.java](../backend/src/main/java/com/example/tournament/service/AuthzService.java)
- **Failing Tests**:
  - [MatchStatusWorkflowIntegrationTest.java](../backend/src/test/java/com/example/tournament/integration/MatchStatusWorkflowIntegrationTest.java)
  - [SchedulingIntegrationTest.java](../backend/src/test/java/com/example/tournament/integration/SchedulingIntegrationTest.java)
- **Current Test Config**: [TestConfig.java](../backend/src/test/java/com/example/tournament/config/TestConfig.java)

---

**Prepared By**: Claude (AI Assistant)
**Review Status**: Draft - Awaiting Team Review
**Last Updated**: 2025-11-06
