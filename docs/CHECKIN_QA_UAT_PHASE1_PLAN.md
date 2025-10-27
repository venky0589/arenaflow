# Check-In Feature - QA/UAT Test Plan (Phase 1.1-1.3)

**Document Version**: 1.0
**Last Updated**: 2025-10-27
**Test Scope**: Phase 1.1 (checkedInBy), Phase 1.2 (Batch Check-In), Phase 1.3 (Match-based Scheduling)
**Target Environment**: DEV/UAT
**Prerequisites**: Backend commit `75cfb0a`, Admin-UI commit `fb00aa4f`

---

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Test Data Requirements](#test-data-requirements)
3. [Phase 1.1: checkedInBy Attribution](#phase-11-checkedinby-attribution)
4. [Phase 1.2: Batch Check-In Operations](#phase-12-batch-check-in-operations)
5. [Phase 1.3: Match-Based Scheduling](#phase-13-match-based-scheduling)
6. [Security & Role-Based Access](#security--role-based-access)
7. [Edge Cases](#edge-cases)
8. [Performance & Logging](#performance--logging)
9. [Acceptance Criteria](#acceptance-criteria)
10. [UAT Sign-Off Requirements](#uat-sign-off-requirements)

---

## Test Environment Setup

### Prerequisites Checklist
- [ ] Backend running with latest code (commit `75cfb0a`)
- [ ] Admin-UI running with latest code (commit `fb00aa4f`)
- [ ] Database migrations applied (V19, V20, V21, V10)
- [ ] Test data script executed (`test-data-checkin-phase1.sql`)
- [ ] 2 admin users can log in:
  - admin@example.com / admin123
  - admin2@example.com / admin123
- [ ] PostgreSQL accessible (localhost:5432)
- [ ] Mailpit running (optional, for email testing)
- [ ] SQL logging enabled for N+1 query detection

### Configuration Verification
```bash
# Verify backend running
curl http://localhost:8080/actuator/health

# Verify admin-ui running
curl http://localhost:5173

# Verify database connection
psql -h localhost -U postgres -d sports_app -c "SELECT COUNT(*) FROM registration;"
```

### Enable SQL Logging (for Performance Tests)
```yaml
# backend/src/main/resources/application.yml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

---

## Test Data Requirements

### Required Test Data (created by `test-data-checkin-phase1.sql`)

#### Tournaments
- **Tournament ID 101**: "QA Test Tournament Alpha" (3 categories)
- **Tournament ID 102**: "QA Test Tournament Beta" (2 categories)

#### Categories
- Singles Men
- Singles Women
- Doubles Men
- Doubles Women
- Mixed Doubles

#### Players
- 8 players total with emails:
  - player1@test.com, player2@test.com, ...

#### Registrations (15 total)
| ID  | Tournament | Player | Category | Scheduled Time | Match Link | Scenario |
|-----|------------|--------|----------|----------------|------------|----------|
| 1001 | 101 | Player 1 | Singles Men | NOW + 30 min | Match 5001 | Inside window ✓ |
| 1002 | 101 | Player 2 | Singles Men | NOW + 1 hour | Match 5002 | Inside window ✓ |
| 1003 | 101 | Player 3 | Singles Women | NOW + 90 min | Match 5003 | Inside window ✓ |
| 1004 | 101 | Player 4 | Singles Women | NOW - 3 hours | NULL | Before window ✗ |
| 1005 | 101 | Player 5 | Doubles Men | NOW + 5 hours | NULL | Before window ✗ |
| 1006 | 101 | Player 6 | Doubles Men | NOW - 2 hours | Match 5004 | After window ✗ |
| 1007 | 101 | Player 7 | Doubles Women | NOW - 1 hour | NULL | After window ✗ |
| 1008 | 101 | Player 8 | Mixed Doubles | NULL | NULL | No scheduled time ✗ |
| 1009 | 102 | Player 1 | Singles Men | NOW + 45 min | Match 5005 | Inside window ✓ |
| 1010 | 102 | Player 2 | Singles Women | NOW + 2 hours | Match 5006 | Inside window ✓ |
| 1011 | 102 | Player 3 | Doubles Men | NOW + 15 min | NULL | Inside window ✓ |
| 1012 | 102 | Player 4 | Doubles Women | NOW + 100 min | NULL | Inside window ✓ |
| 1013 | 102 | Player 5 | Mixed Doubles | NOW - 5 hours | NULL | After window ✗ |
| 1014 | 102 | Player 6 | Singles Men | NOW + 4 hours | NULL | Before window ✗ |
| 1015 | 102 | Player 7 | Singles Women | NOW + 50 min | NULL | Inside window ✓ |

**Time Window**: 120 minutes before to 30 minutes after scheduled time

#### Matches
- 6 matches (IDs: 5001-5006) with `startTime` set
- Half of registrations linked to matches for sync testing

#### Admin Users
- admin@example.com (existing)
- admin2@example.com (new, for attribution testing)

---

## Phase 1.1: checkedInBy Attribution

### TC-1.1.1: Single Check-In - checkedInBy Set

**Test ID**: TC-1.1.1
**Priority**: P1 (Critical)
**Precondition**:
- Registration 1001 NOT checked in
- Current time within check-in window (NOW + 30 min)
- Logged in as admin@example.com

**Test Steps**:
1. Navigate to Admin UI → Registrations page
2. Find registration 1001 (Tournament Alpha, Player 1, Singles Men)
3. Click the check-in icon button (gray circle with X)
4. Observe UI update

**Expected Results**:
- ✅ UI shows success notification: "Player checked in successfully!"
- ✅ Icon changes to green checkmark
- ✅ Tooltip on hover shows: "Checked by admin@example.com • {relative time} • {IST timestamp}"
- ✅ Database verification:
  ```sql
  SELECT checked_in, checked_in_by, checked_in_at
  FROM registration WHERE id = 1001;

  -- Expected:
  -- checked_in = TRUE
  -- checked_in_by = 'admin@example.com'
  -- checked_in_at = {current timestamp}
  ```
- ✅ Backend log contains:
  ```
  CHECK_IN_SUCCESS registrationId=1001, checkedInBy=admin@example.com,
  checkedInAt={timestamp}, scheduledTime={timestamp}
  ```

**API Request/Response**:
```http
POST /api/v1/registrations/1001/check-in
Authorization: Bearer {token}

200 OK
{
  "id": 1001,
  "tournament": {
    "id": 101,
    "name": "QA Test Tournament Alpha"
  },
  "player": {
    "id": 1,
    "firstName": "Test",
    "lastName": "Player1"
  },
  "categoryType": "SINGLES",
  "scheduledTime": "2025-10-27T16:00:00Z",
  "checkedIn": true,
  "checkedInAt": "2025-10-27T15:30:00Z",
  "checkedInBy": "admin@example.com"
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Actual Result**: _______________
**Tester**: _______________
**Date**: _______________
**Notes**: _______________

---

### TC-1.1.2: Undo Check-In - checkedInBy Cleared

**Test ID**: TC-1.1.2
**Priority**: P1 (Critical)
**Precondition**:
- Registration 1001 already checked in by admin@example.com (from TC-1.1.1)
- Logged in as admin@example.com

**Test Steps**:
1. Navigate to Registrations page
2. Find registration 1001 (should show green checkmark)
3. Click the check-in icon button (now shows warning/orange color)
4. Confirm in the undo dialog: "Undo Check-In?"
5. Observe UI update

**Expected Results**:
- ✅ Confirmation dialog appears with message: "Are you sure you want to undo check-in for this player?"
- ✅ After confirming, success notification: "Check-in undone successfully!"
- ✅ Icon changes back to gray circle with X
- ✅ Database verification:
  ```sql
  SELECT checked_in, checked_in_by, checked_in_at
  FROM registration WHERE id = 1001;

  -- Expected:
  -- checked_in = FALSE
  -- checked_in_by = NULL
  -- checked_in_at = NULL
  ```
- ✅ Backend log contains:
  ```
  UNDO_CHECK_IN registrationId=1001, previouslyCheckedBy=admin@example.com
  ```

**API Request/Response**:
```http
POST /api/v1/registrations/1001/undo-check-in
Authorization: Bearer {token}

200 OK
{
  "id": 1001,
  "checkedIn": false,
  "checkedInAt": null,
  "checkedInBy": null,
  ...
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.1.3: Different Admin Attribution

**Test ID**: TC-1.1.3
**Priority**: P1 (Critical)
**Objective**: Verify that checkedInBy correctly attributes to the logged-in admin user

**Precondition**:
- Registrations 1002 and 1003 NOT checked in
- Both within check-in window

**Test Steps**:
1. **As admin@example.com**:
   - Log in to Admin UI
   - Check in registration 1002
   - Take screenshot of tooltip

2. **As admin2@example.com**:
   - Log out
   - Log in as admin2@example.com
   - Check in registration 1003
   - Take screenshot of tooltip

3. **Verification**:
   - Query database for both registrations
   - View both rows in Registrations grid

**Expected Results**:
- ✅ Registration 1002:
  ```sql
  SELECT checked_in_by FROM registration WHERE id = 1002;
  -- Expected: 'admin@example.com'
  ```
  - Tooltip: "Checked by admin@example.com • ..."

- ✅ Registration 1003:
  ```sql
  SELECT checked_in_by FROM registration WHERE id = 1003;
  -- Expected: 'admin2@example.com'
  ```
  - Tooltip: "Checked by admin2@example.com • ..."

- ✅ Both tooltips display correct admin email
- ✅ Backend logs show different checkedInBy values

**Screenshots Required**:
- [ ] Registration 1002 tooltip (admin@example.com)
- [ ] Registration 1003 tooltip (admin2@example.com)
- [ ] Registrations grid showing both rows

**Test Result**: ☐ PASS ☐ FAIL
**Evidence Attached**: ☐ Yes ☐ No
**Notes**: _______________

---

## Phase 1.2: Batch Check-In Operations

### TC-1.2.1: Batch Success - All Valid

**Test ID**: TC-1.2.1
**Priority**: P1 (Critical)
**Precondition**:
- Registrations 1009, 1010, 1011, 1012, 1015 NOT checked in
- All within time window
- Logged in as admin@example.com

**Test Steps**:
1. Navigate to Registrations page
2. Select registrations using checkboxes (click header checkbox or individual checkboxes):
   - 1009 (Tournament Beta, Player 1)
   - 1010 (Tournament Beta, Player 2)
   - 1011 (Tournament Beta, Player 3)
   - 1012 (Tournament Beta, Player 4)
   - 1015 (Tournament Beta, Player 7)
3. Observe "Batch Check-In (5)" button appears in toolbar
4. Click "Batch Check-In (5)" button
5. Wait for operation to complete
6. Observe results

**Expected Results**:
- ✅ Success notification: "Successfully checked in 5 registration(s)"
- ✅ All 5 rows show green checkmark icon
- ✅ Selection cleared automatically
- ✅ Batch button disappears
- ✅ Database verification:
  ```sql
  SELECT id, checked_in, checked_in_by
  FROM registration
  WHERE id IN (1009, 1010, 1011, 1012, 1015);

  -- Expected: All 5 rows:
  -- checked_in = TRUE
  -- checked_in_by = 'admin@example.com'
  ```

**API Request**:
```http
POST /api/v1/registrations/batch/check-in
Content-Type: application/json
Authorization: Bearer {token}

{
  "registrationIds": [1009, 1010, 1011, 1012, 1015]
}
```

**API Response**:
```json
{
  "successCount": 5,
  "failureCount": 0,
  "failures": []
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.2.2: Batch Partial Success - Mixed States

**Test ID**: TC-1.2.2
**Priority**: P1 (Critical)
**Objective**: Verify batch operation handles mix of valid/invalid registrations correctly

**Precondition**:
- Registration 1001: Inside window, NOT checked in ✓ (Valid)
- Registration 1004: Outside window (3 hours before), NOT checked in ✗ (TIME_WINDOW_VIOLATION)
- Registration 1002: Inside window, ALREADY checked in ✗ (STATE_CONFLICT - check it in first)
- Registration 1011: Inside window, NOT checked in ✓ (Valid)
- Registration 1008: No scheduled time ✗ (VALIDATION_ERROR)

**Setup Steps**:
1. Undo check-in for 1001 and 1011 if needed
2. Check in registration 1002 manually first (to create STATE_CONFLICT scenario)

**Test Steps**:
1. Select all 5 registrations: 1001, 1002, 1004, 1008, 1011
2. Click "Batch Check-In (5)"
3. Observe results

**Expected Results**:
- ✅ Warning notification: "Checked in 2 registration(s). 3 failed. Check console for details."
- ✅ Registrations 1001 and 1011: Show green checkmark (SUCCESS)
- ✅ Registrations 1002, 1004, 1008: Remain unchecked (FAILED)
- ✅ Browser console shows failure details array

**API Response**:
```json
{
  "successCount": 2,
  "failureCount": 3,
  "failures": [
    {
      "registrationId": 1002,
      "reason": "STATE_CONFLICT",
      "message": "Player is already checked in"
    },
    {
      "registrationId": 1004,
      "reason": "TIME_WINDOW_VIOLATION",
      "message": "Check-in not allowed at this time"
    },
    {
      "registrationId": 1008,
      "reason": "VALIDATION_ERROR",
      "message": "No scheduled time available for check-in validation"
    }
  ]
}
```

**Verification**:
```sql
SELECT id, checked_in FROM registration
WHERE id IN (1001, 1002, 1004, 1008, 1011);

-- Expected:
-- 1001: TRUE  (success)
-- 1002: TRUE  (was already checked in)
-- 1004: FALSE (failed - time window)
-- 1008: FALSE (failed - no schedule)
-- 1011: TRUE  (success)
```

**Test Result**: ☐ PASS ☐ FAIL
**Console Log Captured**: ☐ Yes ☐ No
**Notes**: _______________

---

### TC-1.2.3: Batch Undo

**Test ID**: TC-1.2.3
**Priority**: P2 (High)
**Precondition**:
- Registrations 1001, 1002, 1011 already checked in

**Test Steps**:
1. Select registrations 1001, 1002, 1011 using checkboxes
2. Observe "Batch Undo (3)" button appears
3. Click "Batch Undo (3)"
4. Wait for completion

**Expected Results**:
- ✅ Success notification: "Successfully undone check-in for 3 registration(s)"
- ✅ All 3 rows show unchecked state (gray icons)
- ✅ Database verification:
  ```sql
  SELECT id, checked_in, checked_in_by, checked_in_at
  FROM registration WHERE id IN (1001, 1002, 1011);

  -- Expected: All 3 rows:
  -- checked_in = FALSE
  -- checked_in_by = NULL
  -- checked_in_at = NULL
  ```

**API Request**:
```http
POST /api/v1/registrations/batch/undo-check-in
{
  "registrationIds": [1001, 1002, 1011]
}
```

**API Response**:
```json
{
  "successCount": 3,
  "failureCount": 0,
  "failures": []
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.2.4: Idempotency - Already Checked IDs

**Test ID**: TC-1.2.4
**Priority**: P2 (High)
**Objective**: Verify batch operation handles already-checked registrations predictably

**Precondition**:
- Registration 1009: Already checked in
- Registrations 1010, 1012: NOT checked in, within window

**Setup**:
1. Check in registration 1009 manually first

**Test Steps**:
1. Select registrations 1009, 1010, 1012
2. Click "Batch Check-In (3)"
3. Observe results

**Expected Results**:
- ✅ Partial success: "Checked in 2 registration(s). 1 failed."
- ✅ Registration 1009: Remains checked, reported in failures array
- ✅ Registrations 1010, 1012: Successfully checked in

**API Response**:
```json
{
  "successCount": 2,
  "failureCount": 1,
  "failures": [
    {
      "registrationId": 1009,
      "reason": "STATE_CONFLICT",
      "message": "Player is already checked in"
    }
  ]
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.2.5: Large Batch Performance

**Test ID**: TC-1.2.5
**Priority**: P2 (High)
**Objective**: Verify batch operation performance with 50 registrations

**Precondition**:
- Additional test data created (50 valid registrations within window)
- SQL logging enabled to detect N+1 queries

**Test Steps**:
1. Select 50 registrations
2. Start browser performance timer
3. Click "Batch Check-In (50)"
4. Measure completion time
5. Review backend logs for query patterns

**Expected Results**:
- ✅ Operation completes in < 1 second (local dev)
- ✅ Success notification: "Successfully checked in 50 registration(s)"
- ✅ All 50 registrations checked in database
- ✅ **No N+1 Query Issue**: Backend logs show:
  - Single SELECT query to fetch all 50 registrations (or paginated batches)
  - Batch UPDATE query (NOT 50 individual UPDATEs)

**Log Pattern to Look For**:
```
✅ GOOD:
Batch processing 50 registrations
SELECT * FROM registration WHERE id IN (1001, 1002, ..., 1050)
UPDATE registration SET checked_in=true, ... WHERE id IN (...)

✗ BAD:
Processing registration ID=1001
SELECT * FROM registration WHERE id=1001
UPDATE registration SET checked_in=true WHERE id=1001
Processing registration ID=1002
... (repeated 50 times)
```

**Performance Metrics**:
- Frontend response time: _______ ms (target: <1000ms)
- Backend processing time: _______ ms (from logs)
- Total queries executed: _______ (target: <10)

**Test Result**: ☐ PASS ☐ FAIL
**Performance Acceptable**: ☐ Yes ☐ No
**Notes**: _______________

---

## Phase 1.3: Match-Based Scheduling

### TC-1.3.1: Sync from Match - Success

**Test ID**: TC-1.3.1
**Priority**: P1 (Critical)
**Precondition**:
- Match 5001 exists with `startTime = NOW + 30 minutes`
- Registration 1001 linked to match 5001
- Registration 1001 has different or NULL `scheduled_time`

**Test Steps**:
1. Navigate to Registrations page
2. Double-click registration 1001 to edit
3. Observe scheduled time field (should be empty or different from match)
4. Click "Sync from Match" button (sync icon ⟳ next to scheduled time)
5. Observe scheduled time field update
6. Click Save
7. Close dialog

**Expected Results**:
- ✅ Success toast: "Scheduled time synced from match successfully!"
- ✅ Scheduled time field updates to match's startTime (without page reload)
- ✅ After saving, registration shows updated scheduled time in grid
- ✅ Database verification:
  ```sql
  SELECT r.id, r.scheduled_time, m.start_time
  FROM registration r
  JOIN matches m ON m.id = 5001
  WHERE r.id = 1001;

  -- Expected: r.scheduled_time = m.start_time
  ```

**API Request**:
```http
POST /api/v1/registrations/1001/sync-scheduled-time
Authorization: Bearer {token}

200 OK
{
  "id": 1001,
  "scheduledTime": "2025-10-27T16:00:00Z",
  "tournament": {...},
  "player": {...}
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.3.2: Sync - No Match Mapping

**Test ID**: TC-1.3.2
**Priority**: P2 (High)
**Precondition**:
- Registration 1005 NOT linked to any match

**Test Steps**:
1. Edit registration 1005
2. Observe "Sync from Match" button state
3. Attempt to click (if enabled)

**Expected Results**:
- ✅ **Option A**: Button is disabled (grayed out) with tooltip: "No match assigned"
- ✅ **Option B**: Button is enabled but clicking shows error toast: "No match found for this registration"
- ✅ Scheduled time field remains unchanged

**API Response** (if clicked):
```http
POST /api/v1/registrations/1005/sync-scheduled-time

404 Not Found
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "No match found for this registration"
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Button Behavior**: ☐ Disabled ☐ Enabled with error
**Notes**: _______________

---

### TC-1.3.3: Time Window with Match-Derived Time

**Test ID**: TC-1.3.3
**Priority**: P1 (Critical)
**Objective**: Verify check-in time window validation uses match-derived scheduled time

**Precondition**:
- Match 5004 has `startTime = NOW - 2 hours`
- Registration 1006 linked to match 5004
- Registration 1006 synced scheduled_time from match (NOW - 2 hours)
- Current time is AFTER the allowed window (window ended 1.5 hours ago)

**Test Steps**:
1. Attempt to check in registration 1006
2. Observe error

**Expected Results**:
- ✅ Error toast appears with time window details
- ✅ Registration NOT checked in (icon remains gray)
- ✅ Error message format: "Check-in allowed only during {time} - {time}"

**API Response**:
```http
POST /api/v1/registrations/1006/check-in

422 Unprocessable Entity
{
  "code": "TIME_WINDOW_VIOLATION",
  "message": "Check-in not allowed at this time",
  "details": {
    "allowedFrom": "2025-10-27T12:00:00+05:30",
    "allowedTo": "2025-10-27T14:30:00+05:30",
    "attemptedAt": "2025-10-27T16:00:00+05:30",
    "scheduledTime": "2025-10-27T14:00:00+05:30"
  }
}
```

**Backend Log Should Contain**:
```
CHECK_IN_VIOLATION registrationId=1006, violation=TIME_WINDOW,
allowedFrom=..., allowedTo=..., attemptedAt=..., scheduledTime=...
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-1.3.4: Fallback to Registration Time

**Test ID**: TC-1.3.4
**Priority**: P2 (High)
**Objective**: Verify system uses registration's own scheduled_time when no match is linked

**Precondition**:
- Registration 1011 has `scheduled_time = NOW + 15 minutes` (manually set)
- Registration 1011 NOT linked to any match
- Current time is within window (15 min before to 45 min after)

**Test Steps**:
1. Attempt to check in registration 1011
2. Verify success

**Expected Results**:
- ✅ Check-in succeeds
- ✅ Success toast: "Player checked in successfully!"
- ✅ Registration shows green checkmark
- ✅ Backend log indicates registration time used:
  ```
  CHECK_IN_SUCCESS registrationId=1011, scheduledTime={registration.scheduled_time},
  source=REGISTRATION (no match found)
  ```

**API Response**:
```http
POST /api/v1/registrations/1011/check-in

200 OK
{
  "id": 1011,
  "checkedIn": true,
  "scheduledTime": "2025-10-27T15:45:00Z",
  ...
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

## Security & Role-Based Access

### TC-SEC-1: Non-Admin Check-In Blocked

**Test ID**: TC-SEC-1
**Priority**: P1 (Critical)
**Precondition**:
- User account with USER role (not ADMIN) exists: user@example.com / user123
- OR: Test using direct API call without admin token

**Test Steps**:

**Option A - UI Test**:
1. Log out of admin account
2. Log in as user@example.com (USER role)
3. Attempt to navigate to Registrations page

**Option B - API Test**:
1. Obtain USER role JWT token
2. Execute API call:
   ```bash
   curl -X POST http://localhost:8080/api/v1/registrations/1001/check-in \
     -H "Authorization: Bearer {user_token}"
   ```

**Expected Results**:
- ✅ **UI**: Access denied OR check-in buttons not visible/disabled
- ✅ **API**: HTTP 403 Forbidden
- ✅ Response body:
  ```json
  {
    "error": "Access Denied",
    "message": "Insufficient permissions",
    "status": 403
  }
  ```
- ✅ Registration NOT checked in

**Test Result**: ☐ PASS ☐ FAIL
**Test Method Used**: ☐ UI ☐ API
**Notes**: _______________

---

### TC-SEC-2: Batch Operation - Admin Only

**Test ID**: TC-SEC-2
**Priority**: P1 (Critical)
**Precondition**: User with USER role

**Test Steps**:
```bash
curl -X POST http://localhost:8080/api/v1/registrations/batch/check-in \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{"registrationIds": [1001, 1002]}'
```

**Expected Results**:
- ✅ HTTP 403 Forbidden
- ✅ Error message: "Insufficient permissions" or "Access Denied"
- ✅ No registrations checked in

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-SEC-3: Sync from Match - Admin Only

**Test ID**: TC-SEC-3
**Priority**: P2 (High)
**Precondition**: User with USER role

**Test Steps**:
```bash
curl -X POST http://localhost:8080/api/v1/registrations/1001/sync-scheduled-time \
  -H "Authorization: Bearer {user_token}"
```

**Expected Results**:
- ✅ HTTP 403 Forbidden
- ✅ Scheduled time NOT updated

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

## Edge Cases

### TC-EDGE-1: Missing Schedule - Both Sources

**Test ID**: TC-EDGE-1
**Priority**: P2 (High)
**Precondition**:
- Registration 1008 has `scheduled_time = NULL`
- Registration 1008 NOT linked to any match

**Test Steps**:
1. Attempt to check in registration 1008

**Expected Results**:
- ✅ HTTP 422 Unprocessable Entity
- ✅ Error toast: "No scheduled time available for check-in validation"
- ✅ Registration NOT checked in

**API Response**:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "No scheduled time available for check-in validation",
  "status": 422
}
```

**Backend Log**:
```
CHECK_IN_FAILED registrationId=1008, reason=MISSING_SCHEDULED_TIME
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-EDGE-2: Undo When Not Checked In

**Test ID**: TC-EDGE-2
**Priority**: P3 (Medium)
**Precondition**: Registration 1012 NOT checked in

**Test Steps**:
```bash
curl -X POST http://localhost:8080/api/v1/registrations/1012/undo-check-in \
  -H "Authorization: Bearer {admin_token}"
```

**Expected Results**:
- ✅ HTTP 409 Conflict
- ✅ Error code: `STATE_CONFLICT`
- ✅ Message: "Player is not checked in" or "Cannot undo check-in: player not checked in"

**API Response**:
```json
{
  "code": "STATE_CONFLICT",
  "message": "Player is not checked in",
  "status": 409
}
```

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

### TC-EDGE-3: Concurrent Double-Click Prevention

**Test ID**: TC-EDGE-3
**Priority**: P2 (High)
**Objective**: Verify UI prevents duplicate check-in submissions

**Precondition**: Registration 1015 valid for check-in

**Test Steps**:
1. Open browser DevTools → Network tab
2. Rapidly double-click check-in button for registration 1015
3. Observe network requests
4. Check final database state

**Expected Results**:
- ✅ Only ONE API call sent to `/check-in` endpoint
- ✅ Button disabled immediately after first click (shows loading spinner)
- ✅ Final state: Checked in exactly ONCE
- ✅ Database:
  ```sql
  SELECT checked_in, checked_in_at FROM registration WHERE id = 1015;
  -- Should have single timestamp, not multiple
  ```
- ✅ No duplicate entries in audit log

**Test Result**: ☐ PASS ☐ FAIL
**Network Requests Count**: _______
**Notes**: _______________

---

### TC-EDGE-4: WebSocket Race Condition

**Test ID**: TC-EDGE-4
**Priority**: P3 (Medium)
**Objective**: Verify consistent state across multiple admin clients

**Precondition**:
- Two browser windows/tabs open
- Both logged in as admin (can be same or different admin users)
- Both viewing Registrations page
- Registration 1014 NOT checked in

**Test Steps**:
1. **Browser A**: Check in registration 1014
2. **Browser B**: Observe real-time update (WebSocket event)
3. **Browser B**: Attempt to check in same registration 1014

**Expected Results**:
- ✅ **Browser B**: Green checkmark appears automatically within 1-2 seconds (WebSocket update)
- ✅ **Browser B**: Clicking check-in button shows error: "Player is already checked in"
- ✅ HTTP 409 STATE_CONFLICT error
- ✅ Consistent final state across both browsers
- ✅ Console log in Browser B shows WebSocket event received:
  ```javascript
  [WebSocket Debug] Received check-in event: {registrationId: 1014, checkedIn: true, ...}
  ```

**Test Result**: ☐ PASS ☐ FAIL
**WebSocket Event Received**: ☐ Yes ☐ No
**Notes**: _______________

---

## Performance & Logging

### TC-PERF-1: No N+1 Query - Batch Operations

**Test ID**: TC-PERF-1
**Priority**: P2 (High)
**Precondition**: SQL logging enabled

**Test Steps**:
1. Enable SQL logging in application.yml:
   ```yaml
   logging:
     level:
       org.hibernate.SQL: DEBUG
   ```
2. Restart backend
3. Execute batch check-in for 20 registrations
4. Review backend application logs

**Expected Results**:
- ✅ **Single or Minimal SELECT Queries**:
  - Ideal: 1 query: `SELECT * FROM registration WHERE id IN (1001, 1002, ..., 1020)`
  - Acceptable: Paginated batches (e.g., 2 queries for 10 each)

- ✅ **Batch UPDATE or Individual UPDATEs** (both acceptable):
  - Option A: `UPDATE registration SET checked_in=true, ... WHERE id IN (...)`
  - Option B: 20 individual UPDATE statements (acceptable if fast)

- ✅ **NO Repeated SELECT Per Registration**:
  - ✗ BAD: 20 separate `SELECT * FROM registration WHERE id=?` queries

**Log Analysis**:
```
Total queries executed: _______ (target: <30 for 20 registrations)
Pattern observed: ☐ Batch SELECT ☐ Individual SELECTs ☐ N+1 detected
```

**Test Result**: ☐ PASS ☐ FAIL
**Performance Acceptable**: ☐ Yes ☐ No
**Notes**: _______________

---

### TC-PERF-2: Batch 50 IDs - SLA < 1s

**Test ID**: TC-PERF-2
**Priority**: P2 (High)
**Precondition**: 50 valid registrations available

**Test Steps**:
1. Select 50 registrations
2. Open browser DevTools → Performance tab
3. Start recording
4. Click "Batch Check-In (50)"
5. Stop recording when toast appears
6. Measure time

**Expected Results**:
- ✅ **Frontend Total Time**: < 1000ms (from button click to success toast)
- ✅ **Backend Processing Time**: < 800ms (from logs)
- ✅ Success toast appears
- ✅ All 50 registrations updated in database

**Backend Log Target**:
```
Batch check-in processing started for 50 registrations
... (processing)
Batch check-in completed in 756ms
```

**Measurements**:
- Frontend response time: _______ ms
- Backend processing time: _______ ms (from log)
- Network latency: _______ ms
- Total time: _______ ms

**Test Result**: ☐ PASS ☐ FAIL
**SLA Met (<1000ms)**: ☐ Yes ☐ No
**Notes**: _______________

---

### TC-LOG-1: Check-In Success Audit Log

**Test ID**: TC-LOG-1
**Priority**: P3 (Medium)
**Precondition**: Backend running with INFO log level

**Test Steps**:
1. Check in registration 1001
2. Review backend application logs (console or file)

**Expected Log Entry Format**:
```
[INFO] CheckInService - CHECK_IN_SUCCESS registrationId=1001,
checkedInBy=admin@example.com, checkedInAt=2025-10-27T15:30:00Z,
scheduledTime=2025-10-27T16:00:00Z
```

**Verification Checklist**:
- ✅ Log level is INFO or higher
- ✅ Contains `registrationId`
- ✅ Contains `checkedInBy` (email of admin)
- ✅ Contains `checkedInAt` (ISO 8601 timestamp)
- ✅ Contains `scheduledTime`
- ✅ Timestamp format is ISO 8601

**Test Result**: ☐ PASS ☐ FAIL
**Log Entry Captured**: ☐ Yes ☐ No
**Notes**: _______________

---

### TC-LOG-2: Time Window Violation Logging

**Test ID**: TC-LOG-2
**Priority**: P3 (Medium)
**Precondition**: Registration with scheduled time outside window

**Test Steps**:
1. Attempt to check in registration 1004 (scheduled time too early)
2. Review backend logs

**Expected Log Entry**:
```
[WARN] CheckInService - CHECK_IN_VIOLATION registrationId=1004,
violation=TIME_WINDOW, allowedFrom=2025-10-27T12:00:00Z,
allowedTo=2025-10-27T14:30:00Z, attemptedAt=2025-10-27T10:00:00Z,
scheduledTime=2025-10-27T14:00:00Z
```

**Verification Checklist**:
- ✅ Log level is WARN
- ✅ Contains `violation=TIME_WINDOW`
- ✅ Contains `allowedFrom` timestamp
- ✅ Contains `allowedTo` timestamp
- ✅ Contains `attemptedAt` timestamp
- ✅ Contains `scheduledTime`

**Test Result**: ☐ PASS ☐ FAIL
**Notes**: _______________

---

## Acceptance Criteria

### Criterion 1: Backend Checks ✅

- [ ] **1.1** checkedInBy is set on check-in (TC-1.1.1)
- [ ] **1.2** checkedInBy is cleared on undo (TC-1.1.2)
- [ ] **1.3** Different admins are correctly attributed (TC-1.1.3)
- [ ] **1.4** Time window enforced with match-derived scheduled time (TC-1.3.3)
- [ ] **1.5** Time window enforced with registration's own scheduled time (TC-1.3.4)
- [ ] **1.6** Sync from Match endpoint copies times correctly (TC-1.3.1)
- [ ] **1.7** Sync from Match fails gracefully when no match (TC-1.3.2)
- [ ] **1.8** Batch check-in accepts 10-50 IDs (TC-1.2.1, TC-1.2.5)
- [ ] **1.9** Batch returns success/failure arrays with error codes (TC-1.2.2)
- [ ] **1.10** Error codes are correct: TIME_WINDOW_VIOLATION, STATE_CONFLICT, NOT_FOUND, VALIDATION_ERROR
- [ ] **1.11** Idempotency: already-checked IDs handled predictably (TC-1.2.4)

**Overall Backend Status**: ☐ PASS ☐ FAIL

---

### Criterion 2: Admin-UI Checks ✅

- [ ] **2.1** Grid shows "Checked by {Admin} • {relative time} • {IST time}" tooltip (TC-1.1.1)
- [ ] **2.2** Batch toolbar appears on multi-select (TC-1.2.1)
- [ ] **2.3** Success toast shows correct counts (TC-1.2.1)
- [ ] **2.4** Failure toast shows correct counts and details (TC-1.2.2)
- [ ] **2.5** Outside window: single toggle shows error toast with HTTP 422 (TC-1.3.3)
- [ ] **2.6** Outside window: batch shows partial success banner (TC-1.2.2)
- [ ] **2.7** Sync button disabled when no match mapping (TC-1.3.2)
- [ ] **2.8** After sync, rows update without page reload (TC-1.3.1)
- [ ] **2.9** WebSocket real-time updates work across multiple clients (TC-EDGE-4)

**Overall UI Status**: ☐ PASS ☐ FAIL

---

### Criterion 3: Security ✅

- [ ] **3.1** Only ADMIN can check-in (TC-SEC-1)
- [ ] **3.2** Only ADMIN can undo check-in (TC-SEC-1)
- [ ] **3.3** Only ADMIN can batch check-in (TC-SEC-2)
- [ ] **3.4** Only ADMIN can sync from match (TC-SEC-3)
- [ ] **3.5** Non-admin receives HTTP 403 on all operations

**Overall Security Status**: ☐ PASS ☐ FAIL

---

### Criterion 4: Edge Cases ✅

- [ ] **4.1** Missing schedule (no reg time, no match) → HTTP 422 (TC-EDGE-1)
- [ ] **4.2** Undo when not checked in → HTTP 409 STATE_CONFLICT (TC-EDGE-2)
- [ ] **4.3** Batch with mixed states handled correctly (TC-1.2.2)
- [ ] **4.4** No duplicate check-ins on concurrent clicks (TC-EDGE-3)
- [ ] **4.5** WebSocket race condition handled (TC-EDGE-4)

**Overall Edge Cases Status**: ☐ PASS ☐ FAIL

---

### Criterion 5: Performance ✅

- [ ] **5.1** Batch 50 IDs completes < 1s local (TC-PERF-2)
- [ ] **5.2** No N+1 queries detected (TC-PERF-1)
- [ ] **5.3** All operations responsive (no UI freezing)

**Overall Performance Status**: ☐ PASS ☐ FAIL

---

### Criterion 6: Logging ✅

- [ ] **6.1** Success logs include all required fields (TC-LOG-1):
  - registrationId
  - checkedInBy
  - checkedInAt
  - scheduledTime
- [ ] **6.2** Violation logs include window bounds and attempted time (TC-LOG-2)
- [ ] **6.3** Log levels appropriate (INFO for success, WARN for violations)

**Overall Logging Status**: ☐ PASS ☐ FAIL

---

### Criterion 7: No Critical Defects ✅

- [ ] **7.1** No Sev-1 defects open (system crashes, data corruption)
- [ ] **7.2** No Sev-2 defects open (major feature broken, security issues)
- [ ] **7.3** All Sev-3/4 defects documented for future sprints

**Defect Summary**:
- Sev-1: _______ (target: 0)
- Sev-2: _______ (target: 0)
- Sev-3: _______ (acceptable)
- Sev-4: _______ (acceptable)

**Overall Defect Status**: ☐ PASS ☐ FAIL

---

## UAT Sign-Off Requirements

### Required Documentation

#### 1. Test Execution Summary
- [ ] Total test cases executed: _____ / 40+
- [ ] Pass rate: _____%
- [ ] Execution date range: _____ to _____
- [ ] Environment: ☐ DEV ☐ UAT
- [ ] Tester name(s): _____________

#### 2. Sample API Requests/Responses (Appendix A)
- [ ] Single check-in (TC-1.1.1)
- [ ] Batch check-in (TC-1.2.1)
- [ ] Batch partial success (TC-1.2.2)
- [ ] Sync from match (TC-1.3.1)
- [ ] Time window violation (TC-1.3.3)
- [ ] Security 403 response (TC-SEC-1)

#### 3. Screenshots (Appendix B)
- [ ] Unchecked state
- [ ] Checked state with tooltip (admin@example.com)
- [ ] Checked state with tooltip (admin2@example.com)
- [ ] Batch selection toolbar
- [ ] Batch success toast
- [ ] Batch partial success toast
- [ ] Time window error toast
- [ ] Sync from match dialog (before and after)

#### 4. Two-Admin Attribution Test Evidence (Appendix C)
- [ ] Test execution log
- [ ] Database query results showing different checkedInBy
- [ ] Screenshots of both tooltips
- [ ] Date/time of test execution
- [ ] Tester signatures

#### 5. Performance Test Results (Appendix D)
- [ ] Batch 50 IDs timing measurements
- [ ] SQL query log analysis (N+1 check)
- [ ] Network waterfall screenshots

#### 6. Defect Log (Appendix E)
- [ ] All defects logged with severity
- [ ] Status of each defect (Open/Resolved/Deferred)
- [ ] Resolution plan for Sev-1/2 defects

---

### Sign-Off Approval

**QA Lead Approval**:
- Name: _____________
- Signature: _____________
- Date: _____________
- Comments: _____________

**Product Owner Approval**:
- Name: _____________
- Signature: _____________
- Date: _____________
- Comments: _____________

**Development Lead Approval**:
- Name: _____________
- Signature: _____________
- Date: _____________
- Comments: _____________

---

## Appendices

### Appendix A: Sample API Requests/Responses
*(To be filled during test execution)*

### Appendix B: Screenshots
*(To be attached during test execution)*

### Appendix C: Two-Admin Attribution Evidence
*(To be filled during test execution)*

### Appendix D: Performance Test Results
*(To be filled during test execution)*

### Appendix E: Defect Log
*(To be maintained throughout testing)*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | AI Dev Team | Initial test plan created |

---

**End of Test Plan**
