# Check-In Feature Testing Guide

## Overview
This guide will help you test the complete check-in functionality for player registrations with time-window validation.

---

## Prerequisites

### 1. Start the Backend
```bash
cd backend
docker compose up -d  # Start PostgreSQL
mvn spring-boot:run    # Flyway will auto-run migrations V19 and V20
```

### 2. Start the Admin UI
```bash
cd admin-ui
npm run dev  # Runs on http://localhost:5173
```

### 3. Login
- **URL**: http://localhost:5173/login
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## Test Scenarios

### **Scenario 1: Create Registration with Scheduled Time**

#### Steps:
1. Navigate to **Registrations** page
2. Click **New** button
3. Fill in the form:
   - **Tournament**: Select any tournament (e.g., "City Open")
   - **Player**: Select any player (e.g., "Saina Nehwal")
   - **Category Type**: Select "SINGLES"
   - **Scheduled Time**: Set to **2 hours from now**
     - Example: If current time is 14:00, set to 16:00 today
4. Click **Save**

#### Expected Result:
✅ Registration created successfully
✅ Scheduled time shows in the database

---

### **Scenario 2: Check-In Within Time Window (SUCCESS)**

#### Steps:
1. Ensure you have a registration with **scheduledTime = current time ± 2 hours**
2. In the Registrations grid, find the registration
3. Look at the **Status** column - should show ✗ (red X - not checked in)
4. Click the **Check-In button** (green checkmark icon) in the Check-In column

#### Expected Result:
✅ Icon immediately changes to ✓ (green checkmark - optimistic update)
✅ Success toast appears: "Player checked in successfully!"
✅ Hovering over status icon shows: "Checked in • X minutes ago • DD MMM YYYY, HH:mm"
✅ Check-In button changes to yellow/warning color (undo icon)

---

### **Scenario 3: Check-In BEFORE Time Window (FAILURE - 422)**

#### Steps:
1. Create a registration with **scheduledTime = 3 hours from now** (outside window)
2. Try to check in immediately

#### Expected Result:
✅ Check-in fails
✅ Error toast appears with formatted time window:
   `"Check-in allowed only during HH:mm–HH:mm IST"`
✅ Icon remains ✗ (not checked in)
✅ Backend returns HTTP 422 with detailed error JSON

---

### **Scenario 4: Check-In AFTER Time Window (FAILURE - 422)**

#### Steps:
1. Create a registration with **scheduledTime = 3 hours ago** (outside window)
2. Try to check in now

#### Expected Result:
✅ Check-in fails
✅ Error toast appears: `"Check-in allowed only during HH:mm–HH:mm IST"`
✅ Icon remains ✗ (not checked in)

---

### **Scenario 5: Double Check-In (FAILURE - 409 Conflict)**

#### Steps:
1. Successfully check in a player (within time window)
2. Try to check in again by clicking the button

#### Expected Result:
✅ Check-in fails
✅ Error toast appears: `"Already checked in at [timestamp]"`
✅ Backend returns HTTP 409 Conflict
✅ Icon remains ✓ (checked in)

---

### **Scenario 6: Undo Check-In**

#### Steps:
1. Have a player that is checked in (✓ icon)
2. Click the **Undo button** (yellow/orange cancel icon)
3. Confirm in the dialog: "Undo Check-In?"

#### Expected Result:
✅ Confirmation dialog appears
✅ After confirming, success toast: "Check-in undone successfully!"
✅ Icon changes to ✗ (not checked in)
✅ `checkedIn = false`, `checkedInAt = null` in database

---

### **Scenario 7: Check-In Without Scheduled Time (FAILURE - 422)**

#### Steps:
1. Create a registration **without setting Scheduled Time** (leave it blank)
2. Try to check in

#### Expected Result:
✅ Check-in fails
✅ Error toast: `"No scheduled time available for check-in window"`
✅ Backend returns HTTP 422

---

### **Scenario 8: Quick Filters**

#### Steps:
1. Create multiple registrations (some checked in, some not)
2. Click **"Checked In"** chip filter at the top

#### Expected Result:
✅ Grid shows only registrations where `checkedIn = true`

3. Click **"Not Checked In"** chip filter

#### Expected Result:
✅ Grid shows only registrations where `checkedIn = false`

4. Click **"All"** chip filter

#### Expected Result:
✅ Grid shows all registrations

---

### **Scenario 9: Edit Registration and Update Scheduled Time**

#### Steps:
1. Double-click any registration row to edit
2. Change the **Scheduled Time** to a new value
3. Click **Save**

#### Expected Result:
✅ Registration updated successfully
✅ New scheduled time is saved
✅ Check-in window recalculates based on new time

---

## API Testing (Swagger UI)

### Access Swagger
```
http://localhost:8080/swagger-ui/index.html
```

### Key Endpoints to Test

#### 1. Check-In
```
POST /api/v1/registrations/{id}/check-in
```
**Authorization**: Bearer token (admin role required)

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "tournamentId": 1,
  "tournamentName": "City Open",
  "playerId": 1,
  "playerName": "Saina Nehwal",
  "categoryType": "SINGLES",
  "scheduledTime": "2025-10-27T10:30:00Z",
  "checkedIn": true,
  "checkedInAt": "2025-10-27T10:15:37Z"
}
```

**Error Responses**:
- **404**: Registration not found
- **409**: Already checked in
- **422**: Outside time window or no scheduled time
- **403**: Not authorized (non-admin)

#### 2. Undo Check-In
```
POST /api/v1/registrations/{id}/undo-check-in
```
**Authorization**: Bearer token (admin role required)

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "tournamentId": 1,
  "tournamentName": "City Open",
  "playerId": 1,
  "playerName": "Saina Nehwal",
  "categoryType": "SINGLES",
  "scheduledTime": "2025-10-27T10:30:00Z",
  "checkedIn": false,
  "checkedInAt": null
}
```

---

## Database Verification

### Check Registration Table
```sql
-- Connect to PostgreSQL
docker exec -it sports-app-postgres-1 psql -U postgres -d sports_app

-- View registrations with check-in details
SELECT
    id,
    player_id,
    tournament_id,
    category_type,
    scheduled_time,
    checked_in,
    checked_in_at,
    created_at
FROM registration
ORDER BY id DESC;
```

### Verify Migrations
```sql
-- Check Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
```

You should see:
- ✅ V19__add_checkin_fields_to_registration.sql
- ✅ V20__add_scheduled_time_to_registration.sql

---

## Time Window Calculations

The check-in window is **±2 hours** (configurable via `checkin.window.minutes` in application.yml).

### Example:
- **Scheduled Time**: 2025-10-27 14:00:00 IST (08:30:00 UTC)
- **Allowed From**: 2025-10-27 12:00:00 IST (06:30:00 UTC)
- **Allowed To**: 2025-10-27 16:00:00 IST (10:30:00 UTC)

If you try to check in at:
- ✅ **13:30 IST** → SUCCESS (within window)
- ❌ **11:30 IST** → FAILURE (too early)
- ❌ **16:30 IST** → FAILURE (too late)

---

## Common Issues & Troubleshooting

### Issue 1: "No scheduled time available"
**Cause**: Registration doesn't have a `scheduledTime` set
**Fix**: Edit the registration and set a Scheduled Time

### Issue 2: Backend returns 500 error
**Cause**: Database migration not run
**Fix**: Restart backend - Flyway will auto-run V19 and V20

### Issue 3: Time window error shows wrong times
**Cause**: Timezone mismatch
**Fix**: All times are stored in UTC, displayed in IST (Asia/Kolkata)

### Issue 4: Check-in button doesn't work
**Cause**: Check browser console for errors
**Fix**: Verify API is running, check network tab for 403/401 errors

---

## Feature Acceptance Checklist

- [ ] Database migrations V19 and V20 applied successfully
- [ ] Can create registration with scheduled time
- [ ] Can check in within time window (±2 hours)
- [ ] Check-in fails outside time window with formatted error message
- [ ] Check-in fails when already checked in (409 Conflict)
- [ ] Can undo check-in successfully
- [ ] Undo fails when not checked in (409 Conflict)
- [ ] Quick filters work (All / Checked In / Not Checked In)
- [ ] Status icons display correctly with tooltips
- [ ] Check-in times display in IST timezone
- [ ] Only ADMIN role can access check-in endpoints
- [ ] Optimistic UI updates work with rollback on error
- [ ] All error messages are user-friendly

---

## Next Steps (Optional Enhancements)

1. **Add `checkedInBy` field** to track which admin performed check-in
2. **Batch check-in**: Multi-select rows and check in multiple players at once
3. **Match-based scheduled time**: Auto-populate scheduled time from assigned match
4. **Real-time updates**: WebSocket notifications when check-in status changes
5. **Check-in reports**: Export checked-in players to CSV/PDF
6. **QR code check-in**: Generate QR codes for mobile app scanning

---

**Happy Testing! 🎉**
