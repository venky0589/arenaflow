# Bug Fixes Summary: Team Registration Issues

## Date: 2025-11-07

## Problem Discovered

While developing E2E test scripts for doubles categories (Men's Doubles, Women's Doubles, Mixed Doubles), we encountered JSON parsing errors when creating teams and registering them for tournaments.

---

## Root Cause

The Team API response (`POST /api/v1/teams`) returns a JSON object with **multiple `id` fields**:

```json
{
  "id": 49,                    ← Team ID (what we want)
  "player1": {
    "id": 81,                  ← Player 1 ID
    "firstName": "Male1",
    ...
  },
  "player2": {
    "id": 82,                  ← Player 2 ID
    "firstName": "Male2",
    ...
  },
  ...
}
```

When extracting the team ID using bash scripts with:
```bash
grep -o '"id":[0-9]*' | cut -d':' -f2
```

This command matched **ALL three** `"id"` fields, resulting in:
```
49
81
82
```

This caused the team ID variable to contain newlines, which then produced malformed JSON when used in subsequent registration API calls:
```json
{
  "tournamentId": 18,
  "teamId": 49
81    ← Invalid! Newline in the middle of JSON
82,
  "categoryType": "DOUBLES"
}
```

Result: **HTTP 500 Internal Server Error** - "JSON parse error: Unexpected character"

---

## Fixes Applied

### 1. Bash E2E Test Scripts

**File:** `/home/venky/Development-Personal/sports-app/docs/testing/e2e_doubles_only.sh`

**Problem:** Multiple ID extraction
```bash
team_id=$(curl ... | grep -o '"id":[0-9]*' | cut -d':' -f2)
```

**Fix:** Extract only the FIRST match using `head -1`
```bash
team_id=$(curl ... | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
```

**Applied to:** All 6 team creation calls in the script:
- Men's Doubles Team 1 & 2 (lines 116, 123)
- Women's Doubles Team 1 & 2 (lines 133, 140)
- Mixed Doubles Team 1 & 2 (lines 150, 157)

**Test Result:** ✅ All 8 tests passed
- 3 categories created (MD, WD, XD)
- 6 teams created successfully
- 6 registrations completed
- 3 draws generated

### 2. Admin UI TypeScript Code

**File:** `/home/venky/Development-Personal/sports-app/admin-ui/src/pages/Registrations.tsx`

**Status:** ✅ Code was already correct (TypeScript property access works correctly)

**Improvement:** Added defensive validation and logging (lines 157-163)

**Before:**
```typescript
const team = await teamResponse.json()

payload = {
  teamId: team.id,  // Could fail silently if team.id is undefined
  ...
}
```

**After:**
```typescript
const team = await teamResponse.json()

// Validate team response has ID
if (!team || !team.id) {
  console.error('Invalid team response:', team)
  throw new Error('Team creation failed: invalid response from server')
}

console.log('Team created successfully:', team.id)

payload = {
  teamId: team.id,
  ...
}
```

**Benefits:**
- Explicit validation of API response
- Better error messages for debugging
- Logs successful team creation with ID
- Prevents silent failures

### 3. User UI

**Status:** ✅ No changes needed - User UI does not have team creation functionality

---

## Testing Performed

### E2E Test Scripts Created

1. **e2e_tournament_flow.sh** - Singles tournament with 4 players ✅
2. **e2e_16_players_tournament.sh** - 16-player single elimination ✅
3. **e2e_doubles_only.sh** - All doubles categories (MD/WD/XD) ✅

### Test Coverage

- ✅ Team creation (6 teams total)
- ✅ Doubles registration (12 players in 6 teams)
- ✅ Category management (5 categories: MS, WS, MD, WD, XD)
- ✅ Draw generation for all categories
- ✅ Auto-scheduling with multiple courts
- ✅ Singles and doubles workflows

### Logs Preserved

All test runs save logs with timestamps for inspection:
- `e2e_doubles_success.log` - Successful doubles test
- `e2e_comprehensive_*.log` - Full tournament tests

---

## Impact Assessment

### Bash Scripts
- **Severity:** High (completely broken)
- **Impact:** Doubles registration failed with HTTP 500
- **Fix Complexity:** Low (one-line change per curl command)

### Admin UI
- **Severity:** Low (working but could fail silently)
- **Impact:** Already functional, improved error handling
- **Fix Complexity:** Low (added validation)

### User UI
- **Severity:** None
- **Impact:** No team creation feature exists
- **Fix Complexity:** N/A

---

## Lessons Learned

1. **JSON Parsing in Bash:** Always use `head -1` or more specific patterns when extracting IDs from nested JSON
2. **Better Pattern:** Use `jq` tool for proper JSON parsing instead of grep/cut:
   ```bash
   team_id=$(echo "$response" | jq -r '.id')
   ```
3. **Defensive Programming:** Always validate API responses before using them
4. **Comprehensive Testing:** E2E tests revealed issues that unit tests might miss

---

## Related Files

### Modified
- `/home/venky/Development-Personal/sports-app/docs/testing/e2e_doubles_only.sh`
- `/home/venky/Development-Personal/sports-app/admin-ui/src/pages/Registrations.tsx`

### Created
- `/home/venky/Development-Personal/sports-app/docs/testing/e2e_doubles_only.sh` (new)
- `/home/venky/Development-Personal/sports-app/docs/testing/e2e_comprehensive_tournament.sh` (new)

### Test Logs
- `e2e_doubles_success.log`
- `e2e_doubles_fixed.log`
- `e2e_comprehensive_fixed.log`

---

## Verification

To verify the fixes:

1. **Run the doubles E2E test:**
   ```bash
   cd /home/venky/Development-Personal/sports-app/docs/testing
   bash e2e_doubles_only.sh
   ```
   Expected: All 8 tests pass

2. **Test in Admin UI:**
   - Navigate to Registrations page
   - Create a new DOUBLES registration
   - Select 2 partners
   - Save
   - Check console logs for "Team created successfully: [ID]"

---

## Status: ✅ RESOLVED

All identified issues have been fixed and tested. The system now correctly handles:
- Singles registration (player-based)
- Doubles registration (team-based)
- Mixed Doubles (one male, one female)
- All E2E test scenarios
