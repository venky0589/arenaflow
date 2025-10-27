# Check-In Feature - Quick Test Execution Guide
## Phase 1.1-1.3: Fast Validation for QA/UAT

**Purpose**: Rapid validation of critical check-in functionality
**Time to Complete**: 30-45 minutes
**Audience**: QA Engineers, UAT Testers, Product Owners

---

## Prerequisites (5 minutes)

### ✅ Pre-Test Checklist
- [ ] Backend running: `http://localhost:8080`
- [ ] Admin-UI running: `http://localhost:5173`
- [ ] Test data loaded: Run `test-data-checkin-phase1.sql`
- [ ] 2 admin accounts ready:
  - admin@example.com / admin123
  - admin2@example.com / admin123
- [ ] Browser DevTools open (F12)

### Quick Setup Commands
```bash
# Terminal 1: Start backend
cd backend
docker compose up -d
mvn spring-boot:run

# Terminal 2: Load test data
psql -h localhost -U postgres -d sports_app -f src/main/resources/test-data-checkin-phase1.sql

# Terminal 3: Start admin-ui
cd admin-ui
npm run dev

# Verify backend running
curl http://localhost:8080/actuator/health

# Verify test data loaded
psql -h localhost -U postgres -d sports_app -c "SELECT COUNT(*) FROM registration WHERE id >= 1001;"
# Expected: 15
```

---

## Critical Path Tests (25 minutes)

### 🔴 Test 1: Single Check-In (3 min)
**Test ID**: TC-1.1.1
**Priority**: P0 (Blocker)

1. **Login**: admin@example.com / admin123
2. **Navigate**: Registrations page
3. **Find**: Registration 1001 (Tournament Alpha, Player1, Singles Men)
4. **Check-in**: Click gray icon → Should turn green
5. **Verify**: Hover icon → Tooltip shows "Checked by admin@example.com • {time}"

**✅ Pass Criteria**:
- Icon changes from gray to green
- Success toast appears
- Tooltip shows correct admin email

**Database Verification**:
```sql
SELECT checked_in, checked_in_by, checked_in_at
FROM registration WHERE id = 1001;
-- Expected: TRUE, 'admin@example.com', {recent timestamp}
```

---

### 🔴 Test 2: Undo Check-In (2 min)
**Test ID**: TC-1.1.2
**Priority**: P0 (Blocker)

1. **Find**: Same registration 1001 (now checked in)
2. **Undo**: Click icon (now warning color) → Confirm dialog
3. **Verify**: Icon changes back to gray

**✅ Pass Criteria**:
- Confirmation dialog appears
- Icon changes from green to gray
- Database: `checked_in = FALSE, checked_in_by = NULL`

---

### 🟡 Test 3: Two-Admin Attribution (5 min)
**Test ID**: TC-1.1.3
**Priority**: P0 (Blocker)

1. **As admin@example.com**:
   - Check in registration 1002
   - Hover icon → Screenshot tooltip

2. **Logout and login as admin2@example.com**:
   - Check in registration 1003
   - Hover icon → Screenshot tooltip

3. **Verify both** in grid:
   - 1002 tooltip: "admin@example.com"
   - 1003 tooltip: "admin2@example.com"

**✅ Pass Criteria**:
- Different emails in tooltips
- Database shows different `checked_in_by` values

**Database Verification**:
```sql
SELECT id, checked_in_by FROM registration WHERE id IN (1002, 1003);
-- Expected:
-- 1002 | admin@example.com
-- 1003 | admin2@example.com
```

---

### 🔴 Test 4: Batch Check-In Success (3 min)
**Test ID**: TC-1.2.1
**Priority**: P0 (Blocker)

1. **Select** 5 registrations (checkboxes):
   - 1009, 1010, 1011, 1012, 1015
2. **Click**: "Batch Check-In (5)" button
3. **Observe**: Success toast "Successfully checked in 5 registration(s)"

**✅ Pass Criteria**:
- All 5 rows show green checkmark
- Success toast shows count "5"
- Selection cleared

---

### 🟡 Test 5: Batch Partial Success (5 min)
**Test ID**: TC-1.2.2
**Priority**: P1 (Critical)

**Setup**: Check in registration 1002 first (to create STATE_CONFLICT)

1. **Select** registrations:
   - 1001 (valid)
   - 1002 (already checked in - conflict)
   - 1004 (outside window - violation)
   - 1008 (no schedule - error)
   - 1011 (valid)

2. **Click**: "Batch Check-In (5)"

3. **Observe**:
   - Warning toast: "Checked in 2... 3 failed"
   - 1001, 1011: Green (SUCCESS)
   - 1002, 1004, 1008: Gray (FAILED)

4. **Check console**: Should show failures array with error codes

**✅ Pass Criteria**:
- 2 successes, 3 failures
- Console shows error details
- Error codes: STATE_CONFLICT, TIME_WINDOW_VIOLATION, VALIDATION_ERROR

---

### 🟡 Test 6: Sync from Match (3 min)
**Test ID**: TC-1.3.1
**Priority**: P1 (Critical)

1. **Edit** registration 1001 (double-click row)
2. **Observe** scheduled time field
3. **Click** sync button (⟳ icon)
4. **Verify**: Field updates to match's startTime
5. **Save** and close

**✅ Pass Criteria**:
- Success toast: "Scheduled time synced..."
- Field updates without page reload
- Database: `scheduled_time` matches match's `start_time`

---

### 🔴 Test 7: Time Window Violation (2 min)
**Test ID**: TC-1.3.3
**Priority**: P0 (Blocker)

1. **Attempt check-in**: Registration 1004 (scheduled 3 hours in future)
2. **Observe**: Error toast with time window details

**✅ Pass Criteria**:
- Error toast appears
- Message includes allowed time window
- Registration NOT checked in (icon stays gray)

**Expected Error**:
```
Check-in allowed only during {time} - {time}
```

---

### 🟡 Test 8: Security - Non-Admin Blocked (2 min)
**Test ID**: TC-SEC-1
**Priority**: P1 (Critical)

**Option A - API Test** (faster):
```bash
# Get user token (not admin)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com", "password":"user123"}'

# Try to check in
curl -X POST http://localhost:8080/api/v1/registrations/1001/check-in \
  -H "Authorization: Bearer {user_token}"

# Expected: 403 Forbidden
```

**✅ Pass Criteria**:
- HTTP 403 response
- Error: "Access Denied" or "Insufficient permissions"

---

## Smoke Tests (10 minutes)

### Quick Validation Suite

#### ✅ Check 1: WebSocket Real-Time (1 min)
1. Open 2 browser tabs (both on Registrations page)
2. Tab 1: Check in registration 1014
3. Tab 2: Should automatically update (green checkmark appears)

**Pass**: ☐ WebSocket event received, icon updates in Tab 2

---

#### ✅ Check 2: Double-Click Prevention (30 sec)
1. Rapidly double-click check-in icon
2. Open DevTools → Network tab
3. Verify only ONE request sent

**Pass**: ☐ Single API call, button disabled after first click

---

#### ✅ Check 3: Missing Schedule (30 sec)
1. Attempt check-in: Registration 1008 (no scheduled time)
2. Verify error: "No scheduled time available"

**Pass**: ☐ HTTP 422, appropriate error message

---

#### ✅ Check 4: Undo When Not Checked (30 sec)
1. Find unchecked registration
2. Try to undo via API:
```bash
curl -X POST http://localhost:8080/api/v1/registrations/1012/undo-check-in \
  -H "Authorization: Bearer {admin_token}"
```

**Pass**: ☐ HTTP 409 STATE_CONFLICT

---

#### ✅ Check 5: Batch Performance (1 min)
1. Select 20+ registrations
2. Start timer
3. Batch check-in
4. Measure time to success toast

**Pass**: ☐ Completes in < 2 seconds (local dev)

---

## Quick Debugging

### Common Issues & Fixes

#### ❌ Issue: "Cannot find test registrations"
**Fix**:
```bash
# Verify test data loaded
psql -h localhost -U postgres -d sports_app -c \
  "SELECT id, tournament_id, checked_in FROM registration WHERE id >= 1001;"

# Reload if needed
psql -h localhost -U postgres -d sports_app -f \
  backend/src/main/resources/test-data-checkin-phase1.sql
```

---

#### ❌ Issue: "All registrations outside time window"
**Reason**: Test data times calculated relative to NOW, but you're testing later

**Fix**: Re-run test data script (times recalculate):
```bash
psql -h localhost -U postgres -d sports_app -f \
  backend/src/main/resources/test-data-checkin-phase1.sql
```

---

#### ❌ Issue: "WebSocket not updating"
**Check**:
1. Browser console for WebSocket connection errors
2. Backend logs for WebSocket endpoint
3. CORS configuration

**Fix**: Restart both backend and frontend

---

#### ❌ Issue: "403 Forbidden on check-in"
**Check**: JWT token valid and user has ADMIN role

**Fix**:
```bash
# Verify admin role
psql -h localhost -U postgres -d sports_app -c \
  "SELECT u.email, r.roles FROM users u
   JOIN user_account_roles r ON u.id = r.user_account_id
   WHERE u.email = 'admin@example.com';"

# Expected: roles = 'ADMIN'
```

---

## Test Result Summary (Quick)

| Test | ID | Status | Time | Notes |
|------|----|--------|------|-------|
| Single Check-In | TC-1.1.1 | ☐ Pass ☐ Fail | ___ min | |
| Undo Check-In | TC-1.1.2 | ☐ Pass ☐ Fail | ___ min | |
| Two-Admin Attribution | TC-1.1.3 | ☐ Pass ☐ Fail | ___ min | |
| Batch Success | TC-1.2.1 | ☐ Pass ☐ Fail | ___ min | |
| Batch Partial | TC-1.2.2 | ☐ Pass ☐ Fail | ___ min | |
| Sync from Match | TC-1.3.1 | ☐ Pass ☐ Fail | ___ min | |
| Time Window Violation | TC-1.3.3 | ☐ Pass ☐ Fail | ___ min | |
| Security Block | TC-SEC-1 | ☐ Pass ☐ Fail | ___ min | |

**Total Time**: _____ minutes
**Pass Rate**: _____ / 8 tests

**Overall Result**: ☐ PASS ☐ FAIL

---

## Next Steps

### ✅ If All Tests Pass
1. Mark critical path tests complete
2. Proceed with full UAT test plan (40+ test cases)
3. Complete UAT sign-off document
4. Schedule production deployment

### ❌ If Tests Fail
1. Document failures in defect log
2. Assign severity (Sev-1/2/3/4)
3. Notify development team
4. Re-test after fixes

---

## References

- **Full Test Plan**: `CHECKIN_QA_UAT_PHASE1_PLAN.md` (40+ test cases)
- **Test Data Script**: `backend/src/main/resources/test-data-checkin-phase1.sql`
- **UAT Sign-Off**: `CHECKIN_UAT_SIGNOFF_TEMPLATE.md`
- **Implementation Status**: `CHECKIN_IMPLEMENTATION_STATUS.md`

---

## Tips for Efficient Testing

### 🚀 Speed Tips
1. **Keep DevTools open**: Network tab for API inspection
2. **Use keyboard shortcuts**: Ctrl+Shift+I (DevTools), Ctrl+R (refresh)
3. **Database client ready**: Keep psql or pgAdmin open for quick queries
4. **Screenshot tool**: Use Snipping Tool or similar for evidence

### 🎯 Focus Areas
1. **checkedInBy attribution**: Most critical feature
2. **Batch operations**: High-risk for N+1 queries
3. **Time window validation**: Complex business logic
4. **Security**: Must block non-admin access

### 📸 Evidence Collection
- Screenshot every PASS/FAIL state
- Save API responses (Postman/curl output)
- Copy database query results
- Record performance metrics

---

**End of Quick Test Guide**

*For comprehensive testing, use the full test plan: `CHECKIN_QA_UAT_PHASE1_PLAN.md`*
