# RBAC (Role-Based Access Control) Guide

**Version**: 1.0
**Last Updated**: 2025-10-28
**Feature Status**: ✅ Implemented

---

## Table of Contents

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix](#permission-matrix)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Test Accounts](#test-accounts)
7. [How to Create Users with Specific Roles](#how-to-create-users-with-specific-roles)
8. [Testing Role-Based Features](#testing-role-based-features)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Badminton Tournament Manager implements a three-tier role-based access control system:

- **ADMIN**: Full system access (CRUD operations, exports, analytics, batch operations)
- **REFEREE**: Match scoring and single player check-in/undo only
- **USER**: Self-service registration and viewing public data

### Security Principles

1. **Least Privilege**: Each role has minimum necessary permissions
2. **Defense in Depth**: UI hides actions + backend always enforces via `@PreAuthorize`
3. **JWT-Based**: Roles embedded in JWT claims for stateless authentication

---

## Role Definitions

### ADMIN

**Purpose**: System administrators and tournament organizers

**Capabilities**:
- Full CRUD on all entities (Tournaments, Players, Courts, Matches, Registrations, Categories)
- Batch check-in operations
- Export data (CSV, PDF)
- View analytics and reports
- Sync registrations from match schedules
- Match scheduling and auto-scheduling
- Lock/unlock matches

**Navigation Access**:
- Dashboard ✓
- Tournaments ✓
- Players ✓
- Courts ✓
- Matches ✓
- Registrations ✓
- Scheduler ✓

---

### REFEREE

**Purpose**: Match referees and check-in volunteers

**Capabilities**:
- Check-in/undo single registrations
- Update match scores
- View matches and registrations

**Restrictions** (Cannot):
- Batch check-in operations
- Export data
- CRUD operations on tournaments, players, courts
- View/access scheduling features
- View analytics

**Navigation Access**:
- Dashboard ✓
- Matches ✓
- Registrations ✓ (limited to single check-in)

---

### USER

**Purpose**: Players and public users

**Capabilities**:
- Register for tournaments
- View public tournament data
- View own registrations
- View brackets and matches

**Restrictions** (Cannot):
- Access admin panel
- Perform check-ins
- Update match scores
- CRUD operations on any entity

**Navigation Access**:
- Only User UI (not Admin UI)

---

## Permission Matrix

| Capability | ADMIN | REFEREE | USER |
|-----------|-------|---------|------|
| **Tournament CRUD** | ✅ | ❌ | ❌ |
| **Player CRUD** | ✅ | ❌ | ❌ |
| **Court CRUD** | ✅ | ❌ | ❌ |
| **Match CRUD** | ✅ | ❌ | ❌ |
| **Category CRUD** | ✅ | ❌ | ❌ |
| **Registration CRUD** | ✅ | ❌ | ❌ |
| **Self Registration** | ✅ | ❌ | ✅ (own) |
| **Single Check-In** | ✅ | ✅ | ❌ |
| **Single Undo Check-In** | ✅ | ✅ | ❌ |
| **Batch Check-In** | ✅ | ❌ | ❌ |
| **Batch Undo Check-In** | ✅ | ❌ | ❌ |
| **Sync from Match** | ✅ | ❌ | ❌ |
| **Update Match Score** | ✅ | ✅ | ❌ |
| **Lock/Unlock Match** | ✅ | ❌ | ❌ |
| **Schedule Match** | ✅ | ❌ | ❌ |
| **Auto-Schedule** | ✅ | ❌ | ❌ |
| **Export CSV/PDF** | ✅ | ❌ | ❌ |
| **View Analytics** | ✅ | ❌ | ❌ |
| **WebSocket Subscribe** | ✅ (all) | ✅ (check-ins, scoring) | ✅ (limited/own) |

---

## Backend Implementation

### Role Enum

Location: `backend/src/main/java/com/example/tournament/domain/Role.java`

```java
public enum Role {
    ADMIN, REFEREE, USER
}
```

### JWT Claims Structure

When a user logs in, the JWT includes their roles:

```json
{
  "sub": "referee@example.com",
  "roles": ["REFEREE"],
  "scope": "api",
  "iat": 1698451200,
  "exp": 1698710400
}
```

### Security Annotations

#### Standard Annotations

```java
// ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/tournaments")
public ResponseEntity<...> create(...) { }

// ADMIN or REFEREE
@PreAuthorize("hasAnyRole('ADMIN', 'REFEREE')")
@PostMapping("/{id}/check-in")
public ResponseEntity<...> checkIn(@PathVariable Long id) { }
```

#### Meta-Annotations (Optional, Cleaner Code)

```java
@IsAdmin
@PostMapping("/tournaments")
public ResponseEntity<...> create(...) { }

@IsAdminOrReferee
@PostMapping("/{id}/check-in")
public ResponseEntity<...> checkIn(@PathVariable Long id) { }
```

**Location**: `backend/src/main/java/com/example/tournament/security/`
- `IsAdmin.java`
- `IsAdminOrReferee.java`

### Protected Endpoints

#### RegistrationController

```java
// Check-in (single) - ADMIN or REFEREE
@PreAuthorize("hasAnyRole('ADMIN', 'REFEREE')")
@PostMapping("/{id}/check-in")

// Undo check-in (single) - ADMIN or REFEREE
@PreAuthorize("hasAnyRole('ADMIN', 'REFEREE')")
@PostMapping("/{id}/undo-check-in")

// Batch check-in - ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/batch-check-in")

// Batch undo - ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/batch-undo-check-in")

// Sync from match - ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}/sync-scheduled-time")

// Export endpoints - ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/export/csv")
@GetMapping("/export/pdf")
```

#### MatchController

```java
// Update score - ADMIN or REFEREE
@PreAuthorize("hasAnyRole('REFEREE', 'ADMIN')")
@PutMapping("/{id}/score")

// All other match operations - ADMIN only
@PreAuthorize("hasRole('ADMIN')")
@PostMapping, @PutMapping, @DeleteMapping
```

---

## Frontend Implementation

### useAuth Hook

Location: `admin-ui/src/hooks/useAuth.ts`

```typescript
const { isAuthenticated, userEmail, roles, isAdmin, isReferee, hasAnyRole } = useAuth()

// Check specific role
if (isAdmin) { /* Show admin features */ }

// Check multiple roles
if (hasAnyRole('ADMIN', 'REFEREE')) { /* Show check-in button */ }
```

### RoleGuard Component

Location: `admin-ui/src/components/common/RoleGuard.tsx`

```tsx
<RoleGuard roles={['ADMIN']}>
  <Button>Admin Only Action</Button>
</RoleGuard>

<RoleGuard roles={['ADMIN', 'REFEREE']}>
  <CheckInButton />
</RoleGuard>
```

### RoleBadge Component

Location: `admin-ui/src/components/common/RoleBadge.tsx`

Displays current user's role in the app bar with color coding:
- ADMIN: Red badge
- REFEREE: Orange badge
- USER: Gray badge

### RequireAuth Route Guard

Location: `admin-ui/src/auth/RequireAuth.tsx`

```tsx
// Auth only (any authenticated user)
<RequireAuth><Dashboard /></RequireAuth>

// Auth + role check (ADMIN only)
<RequireAuth roles={['ADMIN']}><AdminPage /></RequireAuth>

// Auth + multiple roles (ADMIN or REFEREE)
<RequireAuth roles={['ADMIN', 'REFEREE']}><CheckInPage /></RequireAuth>
```

### Route Protection

Location: `admin-ui/src/App.tsx`

Routes are organized by role requirements:

```tsx
{/* Auth-only routes (no role restriction) */}
<Route element={<RequireAuth><Layout /></RequireAuth>}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

{/* ADMIN-only routes */}
<Route element={<RequireAuth roles={['ADMIN']}><Layout /></RequireAuth>}>
  <Route path="/tournaments" element={<Tournaments />} />
  <Route path="/scheduler" element={<Scheduler />} />
</Route>

{/* ADMIN or REFEREE routes */}
<Route element={<RequireAuth roles={['ADMIN', 'REFEREE']}><Layout /></RequireAuth>}>
  <Route path="/registrations" element={<Registrations />} />
</Route>
```

---

## Test Accounts

The following test accounts are created by migration `V22__add_referee_role.sql`:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@example.com | admin123 | ADMIN | Primary admin account |
| admin2@example.com | admin123 | ADMIN | Secondary admin (for attribution testing) |
| referee@example.com | referee123 | REFEREE | Referee test account |
| user@example.com | user123 | USER | Regular user test account |

---

## How to Create Users with Specific Roles

### Option 1: SQL Insert (Production)

```sql
-- 1. Create user
INSERT INTO users (email, password_hash, enabled)
VALUES ('newuser@example.com', '$2a$10$...BCryptHash...', true);

-- 2. Assign role
INSERT INTO user_account_roles (user_account_id, roles)
SELECT id, 'REFEREE'
FROM users
WHERE email = 'newuser@example.com';
```

**Generate BCrypt Hash**:

```bash
# Using htpasswd (Apache utils)
htpasswd -bnBC 10 "" yourpassword | tr -d ':\n'

# Using Java (in backend code)
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("yourpassword");
```

### Option 2: Register API + Manual Role Assignment

```bash
# 1. Register user via API (defaults to USER role)
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123"}'

# 2. Update role in database
psql -h localhost -U postgres -d sports_app
UPDATE user_account_roles SET roles = 'REFEREE'
WHERE user_account_id = (SELECT id FROM users WHERE email = 'newuser@example.com');
```

### Option 3: Admin API Endpoint (Future Enhancement)

Not yet implemented. Roadmap:

```java
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/users/{id}/roles")
public ResponseEntity<?> updateRoles(@PathVariable Long id, @RequestBody Set<Role> roles) { }
```

---

## Testing Role-Based Features

### Manual Testing Checklist

#### 1. ADMIN Role

- [ ] Login as admin@example.com
- [ ] Verify role badge shows "ADMIN" (red)
- [ ] Verify navigation shows: Dashboard, Tournaments, Players, Courts, Matches, Registrations, Scheduler
- [ ] Create/edit/delete a tournament
- [ ] Perform batch check-in on registrations
- [ ] Export data (CSV/PDF)
- [ ] Access scheduler page

#### 2. REFEREE Role

- [ ] Login as referee@example.com
- [ ] Verify role badge shows "REFEREE" (orange)
- [ ] Verify navigation shows: Dashboard, Matches, Registrations ONLY
- [ ] Attempt to access /tournaments → Redirected to /unauthorized
- [ ] Perform single check-in on registration → Success
- [ ] Attempt batch check-in → Button not visible
- [ ] Update match score → Success
- [ ] Attempt to export data → Button not visible

#### 3. USER Role

- [ ] Login as user@example.com
- [ ] Verify cannot access admin UI at all
- [ ] Can access user UI (port 5174)
- [ ] Can register for tournaments
- [ ] Can view own registrations

#### 4. API Security Testing

```bash
# Get JWT tokens
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

REFEREE_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"referee@example.com","password":"referee123"}' | jq -r '.token')

USER_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}' | jq -r '.token')

# Test ADMIN can batch check-in
curl -X POST http://localhost:8080/api/v1/registrations/batch-check-in \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registrationIds": [1001, 1002]}'
# Expected: 200 OK

# Test REFEREE cannot batch check-in
curl -X POST http://localhost:8080/api/v1/registrations/batch-check-in \
  -H "Authorization: Bearer $REFEREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registrationIds": [1001, 1002]}'
# Expected: 403 Forbidden

# Test REFEREE can single check-in
curl -X POST http://localhost:8080/api/v1/registrations/1001/check-in \
  -H "Authorization: Bearer $REFEREE_TOKEN"
# Expected: 200 OK

# Test USER cannot check-in
curl -X POST http://localhost:8080/api/v1/registrations/1001/check-in \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden
```

---

## Troubleshooting

### Issue 1: "Access Denied" for valid role

**Symptoms**: User with REFEREE role sees "Access Denied" when trying to check-in

**Possible Causes**:
1. JWT doesn't include roles claim
2. Role not assigned in database

**Debug Steps**:

```bash
# 1. Decode JWT to inspect claims
echo "$REFEREE_TOKEN" | cut -d'.' -f2 | base64 -d | jq '.'

# 2. Check database roles
psql -h localhost -U postgres -d sports_app
SELECT u.email, r.roles
FROM users u
JOIN user_account_roles r ON u.id = r.user_account_id
WHERE u.email = 'referee@example.com';
```

**Solution**:
- Ensure `V22__add_referee_role.sql` migration ran successfully
- Verify `AuthController.login()` includes roles in JWT creation
- Clear localStorage and re-login

---

### Issue 2: Navigation items not hidden for REFEREE

**Symptoms**: REFEREE sees admin-only navigation items

**Possible Causes**:
1. RoleGuard not imported correctly
2. localStorage has stale data

**Debug Steps**:

```javascript
// In browser console
localStorage.getItem('userRoles')
// Should return: ["REFEREE"]
```

**Solution**:
- Clear browser cache and localStorage
- Re-login
- Verify `Layout.tsx` wraps admin buttons with `<RoleGuard roles={['ADMIN']}>`

---

### Issue 3: Backend returns 403 unexpectedly

**Symptoms**: Even ADMIN gets 403 on certain endpoints

**Possible Causes**:
1. `@EnableMethodSecurity` not enabled
2. Spring Security filterchain blocking request

**Debug Steps**:

```bash
# Check backend logs for security debug info
tail -f backend/logs/application.log | grep "PreAuthorize"
```

**Solution**:
- Ensure `@EnableMethodSecurity` annotation exists in `SecurityConfig.java`
- Verify `SecurityConfig.filterChain()` allows authenticated requests:
  ```java
  .anyRequest().authenticated()
  ```

---

### Issue 4: JWT expired or invalid

**Symptoms**: All API calls return 401 Unauthorized

**Solution**:
- JWT tokens expire after 72 hours by default
- Re-login to get new token
- Check `application.yml` for `app.jwt.validity-ms` setting

---

## Related Documentation

- **Main Project Context**: [../../CLAUDE.md](../../CLAUDE.md)
- **Backend README**: [../../backend/README.md](../../backend/README.md)
- **Admin UI README**: [../../admin-ui/README.md](../../admin-ui/README.md)
- **Check-In Feature QA Plan**: [../CHECKIN_QA_UAT_PHASE1_PLAN.md](../CHECKIN_QA_UAT_PHASE1_PLAN.md)

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-28 | Initial RBAC implementation |

---

**For Questions**: Contact project maintainers or open an issue on GitHub.
