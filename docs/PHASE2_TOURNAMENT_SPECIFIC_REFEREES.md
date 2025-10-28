# Phase 2: Tournament-Specific Referee Capabilities

**Status**: 🔜 Future Enhancement (Not Started)
**Priority**: Medium
**Estimated Effort**: 5-7 days
**Dependencies**: Phase 1 RBAC (✅ Complete)

---

## Overview

Currently, the REFEREE role provides global permissions across all tournaments. This Phase 2 enhancement will add granular control, allowing administrators to assign referees to specific tournaments. Referees will only be able to perform check-ins and score updates for tournaments they are assigned to.

---

## Business Requirements

### Current Limitation
- ✅ **Phase 1 (Current)**: A user with REFEREE role can check-in players and score matches for **ANY** tournament
- 🔜 **Phase 2 (Desired)**: A user with REFEREE role can only check-in players and score matches for **tournaments they are assigned to**

### Use Cases

1. **Multi-Tournament Organization**
   - Organization runs multiple tournaments simultaneously
   - Different referees staff different tournaments
   - Referee at Tournament A should not access Tournament B data

2. **Security & Data Integrity**
   - Prevent unauthorized match scoring
   - Audit trail shows which referee performed actions at which tournament
   - Reduce risk of accidental cross-tournament operations

3. **Referee Management Dashboard**
   - Admin can assign/unassign referees to tournaments
   - View which referees are assigned to which tournaments
   - Bulk assignment operations

---

## Database Design

### New Table: `tournament_referees`

```sql
CREATE TABLE tournament_referees (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    user_account_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255), -- Email of admin who made assignment

    CONSTRAINT uq_tournament_referee UNIQUE (tournament_id, user_account_id)
);

CREATE INDEX idx_tournament_referees_tournament ON tournament_referees(tournament_id);
CREATE INDEX idx_tournament_referees_user ON tournament_referees(user_account_id);
```

### Migration Script: `V30__tournament_specific_referees.sql`

```sql
-- Phase 2: Add tournament-specific referee assignments

CREATE TABLE tournament_referees (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    user_account_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),

    CONSTRAINT uq_tournament_referee UNIQUE (tournament_id, user_account_id)
);

CREATE INDEX idx_tournament_referees_tournament ON tournament_referees(tournament_id);
CREATE INDEX idx_tournament_referees_user ON tournament_referees(user_account_id);

-- Add feature flag to tournament table (optional)
ALTER TABLE tournament ADD COLUMN enforce_referee_assignment BOOLEAN DEFAULT false;

COMMENT ON TABLE tournament_referees IS 'Maps referees to specific tournaments they can manage';
COMMENT ON COLUMN tournament.enforce_referee_assignment IS 'If true, only assigned referees can score/check-in for this tournament';
```

---

## Backend Implementation

### 1. New Entity: `TournamentReferee.java`

```java
package com.example.tournament.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_referees",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tournament_id", "user_account_id"}))
public class TournamentReferee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount referee;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "assigned_by")
    private String assignedBy;

    // Getters and setters
}
```

### 2. New Repository: `TournamentRefereeRepository.java`

```java
package com.example.tournament.repo;

import com.example.tournament.domain.TournamentReferee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentRefereeRepository extends JpaRepository<TournamentReferee, Long> {
    List<TournamentReferee> findByTournamentId(Long tournamentId);
    List<TournamentReferee> findByRefereeId(Long refereeId);
    Optional<TournamentReferee> findByTournamentIdAndRefereeId(Long tournamentId, Long refereeId);
    boolean existsByTournamentIdAndRefereeId(Long tournamentId, Long refereeId);
}
```

### 3. New Service: `RefereeAssignmentService.java`

```java
package com.example.tournament.service;

import com.example.tournament.domain.TournamentReferee;
import com.example.tournament.repo.TournamentRefereeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class RefereeAssignmentService {

    private final TournamentRefereeRepository repository;

    public RefereeAssignmentService(TournamentRefereeRepository repository) {
        this.repository = repository;
    }

    /**
     * Check if a referee is assigned to a tournament.
     * ADMIN users bypass this check.
     */
    public boolean isRefereeAssignedToTournament(Long tournamentId, Long refereeId) {
        // ADMIN can access all tournaments
        if (isAdmin()) {
            return true;
        }

        return repository.existsByTournamentIdAndRefereeId(tournamentId, refereeId);
    }

    /**
     * Assign a referee to a tournament.
     * ADMIN only.
     */
    public TournamentReferee assignReferee(Long tournamentId, Long refereeId) {
        String assignedBy = getCurrentUserEmail();

        TournamentReferee assignment = new TournamentReferee();
        assignment.setTournamentId(tournamentId);
        assignment.setRefereeId(refereeId);
        assignment.setAssignedBy(assignedBy);

        return repository.save(assignment);
    }

    /**
     * Unassign a referee from a tournament.
     * ADMIN only.
     */
    public void unassignReferee(Long tournamentId, Long refereeId) {
        repository.findByTournamentIdAndRefereeId(tournamentId, refereeId)
                .ifPresent(repository::delete);
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }
}
```

### 4. Update `CheckInService.java`

Add tournament assignment check:

```java
@Service
public class CheckInService {

    private final RefereeAssignmentService refereeAssignmentService;

    public Registration checkIn(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        Long tournamentId = registration.getTournament().getId();
        Long currentUserId = getCurrentUserId();

        // Check if referee is assigned to this tournament
        if (!refereeAssignmentService.isRefereeAssignedToTournament(tournamentId, currentUserId)) {
            throw new AccessDeniedException("You are not assigned to this tournament");
        }

        // Continue with check-in logic...
    }
}
```

### 5. New Controller: `RefereeAssignmentController.java`

```java
package com.example.tournament.web;

import com.example.tournament.domain.TournamentReferee;
import com.example.tournament.security.IsAdmin;
import com.example.tournament.service.RefereeAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tournaments/{tournamentId}/referees")
public class RefereeAssignmentController {

    private final RefereeAssignmentService service;

    public RefereeAssignmentController(RefereeAssignmentService service) {
        this.service = service;
    }

    /**
     * Get all referees assigned to a tournament.
     * ADMIN only.
     */
    @IsAdmin
    @GetMapping
    public ResponseEntity<List<TournamentReferee>> getAssignedReferees(@PathVariable Long tournamentId) {
        List<TournamentReferee> referees = service.findByTournamentId(tournamentId);
        return ResponseEntity.ok(referees);
    }

    /**
     * Assign a referee to a tournament.
     * ADMIN only.
     */
    @IsAdmin
    @PostMapping("/{refereeId}")
    public ResponseEntity<TournamentReferee> assignReferee(
            @PathVariable Long tournamentId,
            @PathVariable Long refereeId) {
        TournamentReferee assignment = service.assignReferee(tournamentId, refereeId);
        return ResponseEntity.ok(assignment);
    }

    /**
     * Unassign a referee from a tournament.
     * ADMIN only.
     */
    @IsAdmin
    @DeleteMapping("/{refereeId}")
    public ResponseEntity<Void> unassignReferee(
            @PathVariable Long tournamentId,
            @PathVariable Long refereeId) {
        service.unassignReferee(tournamentId, refereeId);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Frontend Implementation

### Admin UI: Referee Assignment Interface

#### New Page: `TournamentReferees.tsx`

```tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Button, Stack, Typography, Paper, IconButton } from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import api from '../api/client'

export function TournamentReferees() {
  const { tournamentId } = useParams()
  const [assignments, setAssignments] = useState([])
  const [availableReferees, setAvailableReferees] = useState([])

  const loadAssignments = async () => {
    const res = await api.get(`/api/v1/tournaments/${tournamentId}/referees`)
    setAssignments(res.data)
  }

  const assignReferee = async (refereeId: number) => {
    await api.post(`/api/v1/tournaments/${tournamentId}/referees/${refereeId}`)
    await loadAssignments()
  }

  const unassignReferee = async (refereeId: number) => {
    await api.delete(`/api/v1/tournaments/${tournamentId}/referees/${refereeId}`)
    await loadAssignments()
  }

  const columns: GridColDef[] = [
    { field: 'refereeEmail', headerName: 'Referee Email', flex: 1 },
    { field: 'assignedAt', headerName: 'Assigned At', flex: 1 },
    { field: 'assignedBy', headerName: 'Assigned By', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <IconButton onClick={() => unassignReferee(params.row.refereeId)}>
          <DeleteIcon />
        </IconButton>
      )
    }
  ]

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Tournament Referees</Typography>

      {/* Assignment interface */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Assign Referee</Typography>
        {/* Dropdown with available referees */}
        {/* Assign button */}
      </Paper>

      {/* Assigned referees grid */}
      <Paper>
        <DataGrid rows={assignments} columns={columns} />
      </Paper>
    </Stack>
  )
}
```

#### Update `Tournaments.tsx`

Add "Manage Referees" button for each tournament row.

---

## Testing Strategy

### Unit Tests

```java
@Test
void testRefereeCannotCheckInForUnassignedTournament() {
    // Given: Referee user NOT assigned to tournament 1
    Long refereeId = 100L;
    Long tournamentId = 1L;
    Long registrationId = 500L;

    when(refereeAssignmentService.isRefereeAssignedToTournament(tournamentId, refereeId))
        .thenReturn(false);

    // When: Referee tries to check-in for tournament 1
    // Then: AccessDeniedException thrown
    assertThrows(AccessDeniedException.class, () -> {
        checkInService.checkIn(registrationId);
    });
}

@Test
void testAdminBypassesTournamentAssignment() {
    // Given: ADMIN user (not assigned to any tournament)
    // When: Admin tries to check-in for any tournament
    // Then: Operation succeeds (ADMIN bypasses assignment check)
    assertTrue(refereeAssignmentService.isRefereeAssignedToTournament(1L, adminUserId));
}
```

### Integration Tests

```bash
# Test: Referee assigned to Tournament A can check-in for Tournament A
curl -X POST http://localhost:8080/api/v1/registrations/1001/check-in \
  -H "Authorization: Bearer $REFEREE_TOKEN"
# Expected: 200 OK

# Test: Same referee cannot check-in for Tournament B
curl -X POST http://localhost:8080/api/v1/registrations/2001/check-in \
  -H "Authorization: Bearer $REFEREE_TOKEN"
# Expected: 403 Forbidden with message: "You are not assigned to this tournament"
```

---

## Migration Path

### Option 1: Feature Flag (Recommended)

Add `enforce_referee_assignment` boolean to `tournament` table:
- `false` (default): Phase 1 behavior - any REFEREE can access
- `true`: Phase 2 behavior - only assigned REFEREEs can access

This allows gradual rollout:
1. Deploy Phase 2 code with feature flag OFF
2. Assign referees to tournaments
3. Enable feature flag per tournament
4. Eventually make it default for all new tournaments

### Option 2: Global Rollout

Deploy Phase 2 with immediate enforcement:
- All existing REFEREEs lose access until assigned
- ADMIN must assign all REFEREEs to tournaments before go-live

---

## Security Considerations

1. **Authorization Check Placement**
   - Perform tournament assignment check AFTER authentication
   - Check must be in service layer (not just UI)

2. **ADMIN Bypass**
   - ADMIN role always bypasses tournament assignment
   - Document this clearly in RBAC guide

3. **Audit Logging**
   - Log all referee assignments/unassignments
   - Include: who assigned, to which tournament, when

4. **Cascade Deletion**
   - When tournament deleted → delete assignments (CASCADE)
   - When user deleted → delete assignments (CASCADE)

---

## API Endpoints Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/v1/tournaments/{id}/referees` | GET | ADMIN | List assigned referees |
| `/api/v1/tournaments/{id}/referees/{userId}` | POST | ADMIN | Assign referee |
| `/api/v1/tournaments/{id}/referees/{userId}` | DELETE | ADMIN | Unassign referee |
| `/api/v1/users/{id}/assigned-tournaments` | GET | ADMIN, REFEREE | List tournaments for referee |

---

## Rollout Checklist

- [ ] Create `V30__tournament_specific_referees.sql` migration
- [ ] Implement `TournamentReferee` entity and repository
- [ ] Implement `RefereeAssignmentService`
- [ ] Update `CheckInService` and `MatchService` with assignment checks
- [ ] Create `RefereeAssignmentController`
- [ ] Update Admin UI with referee assignment interface
- [ ] Write unit tests for assignment logic
- [ ] Write integration tests for access control
- [ ] Update RBAC documentation
- [ ] Test feature flag rollout (if using Option 1)
- [ ] QA testing with multiple tournaments and referees
- [ ] Production deployment plan

---

## Estimated Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Database & Entities** | Migration, TournamentReferee entity, repository | 1 day |
| **Service Layer** | RefereeAssignmentService, update CheckInService | 1-2 days |
| **Controller & API** | RefereeAssignmentController, endpoints | 1 day |
| **Admin UI** | Referee assignment interface | 1-2 days |
| **Testing** | Unit, integration, E2E tests | 1 day |
| **Documentation** | Update RBAC guide, API docs | 0.5 day |
| **QA & Bug Fixes** | Testing and refinement | 1 day |

**Total**: 5-7 days

---

## Dependencies

- ✅ Phase 1 RBAC (Complete)
- ✅ CheckIn feature (Complete)
- ✅ Match scoring feature (Complete)

---

## Related Documentation

- [RBAC Guide](security/RBAC_GUIDE.md)
- [Main Project Context](../CLAUDE.md)
- [Check-In Feature QA Plan](CHECKIN_QA_UAT_PHASE1_PLAN.md)

---

**Status**: Ready for implementation in Phase 2 / Sprint 2
