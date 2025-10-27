# Check-In Feature - UAT Sign-Off Document
## Phase 1.1-1.3: checkedInBy, Batch Operations, Match-Based Scheduling

**Project**: Badminton Tournament Manager
**Feature**: Check-In System
**Test Scope**: Phase 1.1, 1.2, 1.3
**Document Version**: 1.0
**Date**: _______________

---

## Executive Summary

### Test Execution Overview
- **Total Test Cases**: _____ / 40+
- **Pass Rate**: _____%
- **Test Environment**: ☐ DEV ☐ UAT ☐ PROD
- **Test Period**: From _____ to _____
- **Backend Version**: Commit `75cfb0a`
- **Frontend Version**: Commit `fb00aa4f`

### Overall Result
☐ **APPROVED** - All acceptance criteria met, ready for production
☐ **APPROVED WITH CONDITIONS** - Minor issues, documented below
☐ **REJECTED** - Critical issues found, requires remediation

---

## Test Team

### QA Team
| Name | Role | Email | Signature |
|------|------|-------|-----------|
| | Lead QA Engineer | | |
| | QA Engineer | | |
| | Test Analyst | | |

### Development Team
| Name | Role | Contact |
|------|------|---------|
| | Backend Developer | |
| | Frontend Developer | |
| | DevOps | |

---

## Acceptance Criteria Status

### 1. Backend Checks ✅
| # | Criterion | Test Case | Status | Notes |
|---|-----------|-----------|--------|-------|
| 1.1 | checkedInBy set on check-in | TC-1.1.1 | ☐ Pass ☐ Fail | |
| 1.2 | checkedInBy cleared on undo | TC-1.1.2 | ☐ Pass ☐ Fail | |
| 1.3 | Different admins attributed correctly | TC-1.1.3 | ☐ Pass ☐ Fail | |
| 1.4 | Time window enforced (match-derived) | TC-1.3.3 | ☐ Pass ☐ Fail | |
| 1.5 | Time window enforced (registration) | TC-1.3.4 | ☐ Pass ☐ Fail | |
| 1.6 | Sync from Match copies time | TC-1.3.1 | ☐ Pass ☐ Fail | |
| 1.7 | Sync fails when no match | TC-1.3.2 | ☐ Pass ☐ Fail | |
| 1.8 | Batch accepts 10-50 IDs | TC-1.2.1, TC-1.2.5 | ☐ Pass ☐ Fail | |
| 1.9 | Batch returns success/failure arrays | TC-1.2.2 | ☐ Pass ☐ Fail | |
| 1.10 | Error codes correct | TC-1.2.2 | ☐ Pass ☐ Fail | |
| 1.11 | Idempotency handled | TC-1.2.4 | ☐ Pass ☐ Fail | |

**Backend Overall**: ☐ PASS ☐ FAIL

---

### 2. Admin-UI Checks ✅
| # | Criterion | Test Case | Status | Notes |
|---|-----------|-----------|--------|-------|
| 2.1 | Tooltip shows "Checked by {Admin} • {time}" | TC-1.1.1 | ☐ Pass ☐ Fail | |
| 2.2 | Batch toolbar appears on multi-select | TC-1.2.1 | ☐ Pass ☐ Fail | |
| 2.3 | Success toast shows correct counts | TC-1.2.1 | ☐ Pass ☐ Fail | |
| 2.4 | Failure toast shows correct counts | TC-1.2.2 | ☐ Pass ☐ Fail | |
| 2.5 | Outside window: error toast (422) | TC-1.3.3 | ☐ Pass ☐ Fail | |
| 2.6 | Outside window: batch partial success | TC-1.2.2 | ☐ Pass ☐ Fail | |
| 2.7 | Sync button disabled when no match | TC-1.3.2 | ☐ Pass ☐ Fail | |
| 2.8 | After sync: rows update (no reload) | TC-1.3.1 | ☐ Pass ☐ Fail | |
| 2.9 | WebSocket real-time updates | TC-EDGE-4 | ☐ Pass ☐ Fail | |

**UI Overall**: ☐ PASS ☐ FAIL

---

### 3. Security & Roles ✅
| # | Criterion | Test Case | Status | Notes |
|---|-----------|-----------|--------|-------|
| 3.1 | Only ADMIN can check-in | TC-SEC-1 | ☐ Pass ☐ Fail | |
| 3.2 | Only ADMIN can undo | TC-SEC-1 | ☐ Pass ☐ Fail | |
| 3.3 | Only ADMIN can batch | TC-SEC-2 | ☐ Pass ☐ Fail | |
| 3.4 | Only ADMIN can sync | TC-SEC-3 | ☐ Pass ☐ Fail | |
| 3.5 | Non-admin receives 403 | TC-SEC-1, 2, 3 | ☐ Pass ☐ Fail | |

**Security Overall**: ☐ PASS ☐ FAIL

---

### 4. Edge Cases ✅
| # | Criterion | Test Case | Status | Notes |
|---|-----------|-----------|--------|-------|
| 4.1 | Missing schedule → 422 | TC-EDGE-1 | ☐ Pass ☐ Fail | |
| 4.2 | Undo when not checked → 409 | TC-EDGE-2 | ☐ Pass ☐ Fail | |
| 4.3 | Batch with mixed states | TC-1.2.2 | ☐ Pass ☐ Fail | |
| 4.4 | No duplicate on double-click | TC-EDGE-3 | ☐ Pass ☐ Fail | |
| 4.5 | WebSocket race condition | TC-EDGE-4 | ☐ Pass ☐ Fail | |

**Edge Cases Overall**: ☐ PASS ☐ FAIL

---

### 5. Performance ✅
| # | Criterion | Test Case | Measured | Target | Status |
|---|-----------|-----------|----------|--------|--------|
| 5.1 | Batch 50 IDs completion time | TC-PERF-2 | ___ ms | <1000ms | ☐ Pass ☐ Fail |
| 5.2 | No N+1 queries | TC-PERF-1 | ___ queries | <30 | ☐ Pass ☐ Fail |
| 5.3 | UI responsiveness | All | Subjective | Smooth | ☐ Pass ☐ Fail |

**Performance Overall**: ☐ PASS ☐ FAIL

---

### 6. Logging ✅
| # | Criterion | Test Case | Status | Notes |
|---|-----------|-----------|--------|-------|
| 6.1 | Success log includes all fields | TC-LOG-1 | ☐ Pass ☐ Fail | |
| 6.2 | Violation log includes window | TC-LOG-2 | ☐ Pass ☐ Fail | |
| 6.3 | Log levels appropriate | TC-LOG-1, 2 | ☐ Pass ☐ Fail | |

**Logging Overall**: ☐ PASS ☐ FAIL

---

### 7. Defect Status ✅
| Severity | Count | Status |
|----------|-------|--------|
| Sev-1 (Critical) | _____ | ☐ Pass (0) ☐ Fail (>0) |
| Sev-2 (Major) | _____ | ☐ Pass (0) ☐ Fail (>0) |
| Sev-3 (Minor) | _____ | Acceptable |
| Sev-4 (Trivial) | _____ | Acceptable |

**Defects Overall**: ☐ PASS ☐ FAIL

---

## Appendix A: Sample API Requests/Responses

### A.1 Single Check-In (TC-1.1.1)
```http
POST /api/v1/registrations/1001/check-in
Authorization: Bearer {token}

200 OK
{
  "id": 1001,
  "checkedIn": true,
  "checkedInAt": "2025-10-27T15:30:00Z",
  "checkedInBy": "admin@example.com",
  ...
}
```

### A.2 Batch Check-In Success (TC-1.2.1)
```http
POST /api/v1/registrations/batch/check-in
{
  "registrationIds": [1009, 1010, 1011, 1012, 1015]
}

200 OK
{
  "successCount": 5,
  "failureCount": 0,
  "failures": []
}
```

### A.3 Batch Partial Success (TC-1.2.2)
```http
POST /api/v1/registrations/batch/check-in
{
  "registrationIds": [1001, 1002, 1004, 1008, 1011]
}

200 OK
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
      "message": "No scheduled time available"
    }
  ]
}
```

### A.4 Sync from Match (TC-1.3.1)
```http
POST /api/v1/registrations/1001/sync-scheduled-time

200 OK
{
  "id": 1001,
  "scheduledTime": "2025-10-27T16:00:00Z",
  ...
}
```

### A.5 Time Window Violation (TC-1.3.3)
```http
POST /api/v1/registrations/1004/check-in

422 Unprocessable Entity
{
  "code": "TIME_WINDOW_VIOLATION",
  "message": "Check-in not allowed at this time",
  "details": {
    "allowedFrom": "2025-10-27T12:00:00+05:30",
    "allowedTo": "2025-10-27T14:30:00+05:30",
    "attemptedAt": "2025-10-27T10:00:00+05:30"
  }
}
```

### A.6 Security - Non-Admin Rejected (TC-SEC-1)
```http
POST /api/v1/registrations/1001/check-in
Authorization: Bearer {user_token}

403 Forbidden
{
  "error": "Access Denied",
  "message": "Insufficient permissions"
}
```

---

## Appendix B: Screenshot Evidence

### B.1 Unchecked State
![Unchecked Registration](screenshots/unchecked-state.png)
**Captured**: _____
**Shows**: Gray cancel icon, "Not checked in" status

### B.2 Checked State - admin@example.com
![Checked by Admin 1](screenshots/admin1-checked.png)
**Captured**: _____
**Shows**: Green checkmark, tooltip "Checked by admin@example.com • {time}"

### B.3 Checked State - admin2@example.com
![Checked by Admin 2](screenshots/admin2-checked.png)
**Captured**: _____
**Shows**: Green checkmark, tooltip "Checked by admin2@example.com • {time}"

### B.4 Batch Selection Toolbar
![Batch Toolbar](screenshots/batch-toolbar.png)
**Captured**: _____
**Shows**: Multiple rows selected, "Batch Check-In (5)" button visible

### B.5 Batch Success Toast
![Batch Success](screenshots/batch-success-toast.png)
**Captured**: _____
**Shows**: Success notification "Successfully checked in 5 registration(s)"

### B.6 Batch Partial Success Toast
![Batch Partial](screenshots/batch-partial-toast.png)
**Captured**: _____
**Shows**: Warning "Checked in 2 registration(s). 3 failed."

### B.7 Time Window Error Toast
![Time Window Error](screenshots/time-window-error.png)
**Captured**: _____
**Shows**: Error toast with time window details

### B.8 Sync from Match Dialog
![Sync Dialog](screenshots/sync-from-match.png)
**Captured**: _____
**Shows**: Scheduled time field, sync button, before/after state

---

## Appendix C: Two-Admin Attribution Test Evidence

### Test Execution Log

**Date**: _____
**Time**: _____
**Testers**: _____ (Admin 1), _____ (Admin 2)

#### Step 1: Admin 1 Check-In
- **User**: admin@example.com
- **Registration ID**: 1002
- **Action**: Check-in
- **Timestamp**: _____

**Database Query**:
```sql
SELECT checked_in_by FROM registration WHERE id = 1002;
```

**Result**: `admin@example.com` ✅

**Screenshot**: See Appendix B.2

---

#### Step 2: Admin 2 Check-In
- **User**: admin2@example.com
- **Registration ID**: 1003
- **Action**: Check-in
- **Timestamp**: _____

**Database Query**:
```sql
SELECT checked_in_by FROM registration WHERE id = 1003;
```

**Result**: `admin2@example.com` ✅

**Screenshot**: See Appendix B.3

---

#### Step 3: Verification
- **Action**: Viewed both registrations in grid
- **Observation**: Tooltips show different admin emails

**Combined Query**:
```sql
SELECT id, checked_in_by
FROM registration
WHERE id IN (1002, 1003);
```

**Result**:
```
 id   | checked_in_by
------+------------------
 1002 | admin@example.com
 1003 | admin2@example.com
```

✅ **PASS**: Different admins correctly attributed

---

## Appendix D: Performance Test Results

### D.1 Batch 50 IDs Performance (TC-PERF-2)

**Test Date**: _____
**Environment**: ☐ Local ☐ DEV ☐ UAT

**Measurements**:
- Frontend response time: _______ ms
- Backend processing time: _______ ms (from log)
- Network latency: _______ ms
- **Total time**: _______ ms

**Target**: < 1000ms
**Result**: ☐ PASS ☐ FAIL

**Browser Performance Timeline**:
*(Attach screenshot of DevTools Performance tab)*

**Backend Log**:
```
Batch check-in processing started for 50 registrations
... (processing details)
Batch check-in completed in XXXms
```

---

### D.2 N+1 Query Analysis (TC-PERF-1)

**Test Date**: _____
**Batch Size**: 20 registrations

**SQL Queries Executed** (from backend log):
```
Total queries: _______
Pattern: ☐ Batch SELECT ☐ Individual SELECTs ☐ N+1 detected
```

**Query Log Analysis**:
```sql
-- Example of GOOD pattern:
SELECT * FROM registration WHERE id IN (1001, 1002, ..., 1020)  -- 1 query
UPDATE registration SET checked_in=true, ... WHERE id IN (...)   -- 1 query

Total: 2-5 queries ✅
```

**Result**: ☐ PASS (No N+1) ☐ FAIL (N+1 detected)

**SQL Log File**: *(Attach or reference)*

---

## Appendix E: Defect Log

| Defect ID | Severity | Summary | Test Case | Status | Resolution |
|-----------|----------|---------|-----------|--------|------------|
| DEF-001 | Sev-? | | | ☐ Open ☐ Resolved ☐ Deferred | |
| DEF-002 | Sev-? | | | ☐ Open ☐ Resolved ☐ Deferred | |
| DEF-003 | Sev-? | | | ☐ Open ☐ Resolved ☐ Deferred | |

### Severity Definitions
- **Sev-1 (Critical)**: System crash, data corruption, security breach
- **Sev-2 (Major)**: Major feature broken, workaround available
- **Sev-3 (Minor)**: Minor feature issue, cosmetic defect
- **Sev-4 (Trivial)**: Documentation, spelling, low-impact

### Open Critical/Major Defects
*(Must be 0 for approval)*

**Sev-1 Defects**: _____
**Sev-2 Defects**: _____

---

## Sign-Off

### QA Lead Approval

By signing below, I certify that:
- All test cases have been executed as per the test plan
- Acceptance criteria have been met (or documented exceptions)
- Evidence has been collected and attached
- Defect status is acceptable for release

**Name**: _________________________
**Signature**: _________________________
**Date**: _________________________

**Decision**: ☐ APPROVED ☐ APPROVED WITH CONDITIONS ☐ REJECTED

**Conditions/Comments**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

### Product Owner Approval

By signing below, I certify that:
- The feature meets business requirements
- UAT results are acceptable
- Feature is ready for production release

**Name**: _________________________
**Signature**: _________________________
**Date**: _________________________

**Decision**: ☐ APPROVED ☐ APPROVED WITH CONDITIONS ☐ REJECTED

**Comments**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

### Development Lead Approval

By signing below, I certify that:
- Code quality meets standards
- All critical defects resolved
- Documentation is complete
- Deployment plan is ready

**Name**: _________________________
**Signature**: _________________________
**Date**: _________________________

**Decision**: ☐ APPROVED ☐ APPROVED WITH CONDITIONS ☐ REJECTED

**Comments**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Final Approval Summary

**Overall Decision**: ☐ APPROVED FOR PRODUCTION ☐ REQUIRES REMEDIATION

**Next Steps**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Planned Release Date**: _________________________

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | QA Team | Initial sign-off document |

---

**End of UAT Sign-Off Document**
