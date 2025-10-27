# Check-In Feature — Full Spec (PRIORITY 4)

## 1) Scope & Definitions

* **Entity:** `Registration`
* **New fields**

  * `checkedIn` `BOOLEAN NOT NULL DEFAULT false`
  * `checkedInAt` `TIMESTAMP WITH TIME ZONE NULL` (store in UTC; format as local in UI)
* **Endpoints**

  * `POST /api/v1/registrations/{id}/check-in`
  * `POST /api/v1/registrations/{id}/undo-check-in`
* **Time-window rule**

  * Check-in is only allowed **within ±2 hours of the participant’s scheduled time**.
  * “scheduled time” source (priority order):

    1. If `Registration.scheduledTime` exists → use it.
    2. Else, if the registration is assigned to a **Match** with `startTime` → use that.
    3. Else → check-in **not allowed** (422) because the window cannot be computed.
  * (You can tune the window later via config; default now is 2 hours each side.)

## 2) Functional Requirements

* **Admin can toggle check-in** from the Registrations grid:

  * Shows ✅ when checked in (with a hover showing exact time).
  * Shows ❌ when not checked in.
  * Clicking the icon:

    * ❌ → calls **check-in** (if time-window allows).
    * ✅ → calls **undo** (always allowed, but see rules below).
* **Undo rules**

  * Allowed for admins at any time. (If you want a guardrail, add optional config to restrict undo after X minutes—out of scope now.)
* **Persistence**

  * On **check-in**: `checkedIn = true`, `checkedInAt = now(UTC)`.
  * On **undo**: `checkedIn = false`, `checkedInAt = NULL`.

## 3) Validation & Edge Cases

* **Time window**

  * If **now** is not within `[scheduledTime - 2h, scheduledTime + 2h]` → 422 with message like:

    * `"Check-in allowed only within 2 hours of scheduled time (10:30–14:30 IST)."`
* **Already checked in**

  * Hitting **/check-in** when `checkedIn=true` → 409 Conflict (`"Already checked in at 2025-10-27T04:05:00Z"`).
* **Not checked in**

  * Hitting **/undo-check-in** when `checkedIn=false` → 409 Conflict (`"Not checked in yet"`).
* **Missing schedule**

  * If neither registration nor match has a scheduled time → 422 (`"No scheduled time available for check-in window"`).
* **Authorization**

  * Admin roles only (e.g., `ROLE_ADMIN`).
* **Idempotency & race safety**

  * Service should short-circuit if the desired state already holds.
  * Optionally use a single “compare-and-update” statement or an optimistic lock to avoid double clicks.

## 4) API Design

### Success Response (both endpoints)

`200 OK` with a **RegistrationResponse** body (your existing shape) including the new fields:

```json
{
  "id": 123,
  "playerId": 456,
  "tournamentId": 789,
  "categoryId": 1011,
  "scheduledTime": "2025-10-27T08:00:00Z",
  "checkedIn": true,
  "checkedInAt": "2025-10-27T07:15:37Z"
}
```

### Error Responses

* `404` — Registration not found.
* `403` — Not authorized.
* `409` — State conflict (already checked in / not checked in).
* `422` — Time-window violation or missing scheduled time.
* **Error body (standardize):**

```json
{
  "code": "TIME_WINDOW_VIOLATION",
  "message": "Check-in allowed only within 2 hours of scheduled time (10:30–14:30 IST).",
  "details": {
    "scheduledTime": "2025-10-27T08:00:00Z",
    "allowedFrom": "2025-10-27T06:00:00Z",
    "allowedTo": "2025-10-27T10:00:00Z",
    "now": "2025-10-27T10:25:00Z"
  }
}
```

## 5) Database Migration (PostgreSQL)

```sql
ALTER TABLE registrations
  ADD COLUMN checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN checked_in_at TIMESTAMPTZ NULL;

-- Optional: index for quick “who is checked in” views
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON registrations (checked_in);
```

> Naming in code can stay camelCase; map to snake_case via JPA/Hibernate naming strategy.

## 6) Service Logic (high-level)

* **getEffectiveScheduledTime(registration)**:

  * return `registration.scheduledTime ?? registration.assignedMatch?.startTime ?? null`
* **enforceWindow(effectiveTime)**:

  * if null → 422
  * compute `[effectiveTime - 2h, effectiveTime + 2h]`
  * if `now` outside → 422 with formatted local window (Asia/Kolkata)
* **checkIn(id, actor)**

  * find registration; if `checkedIn` → 409
  * enforceWindow(effectiveTime)
  * update: `checkedIn=true`, `checkedInAt=now(UTC)`
* **undoCheckIn(id, actor)**

  * find registration; if `checkedIn=false` → 409
  * update: `checkedIn=false`, `checkedInAt=null`

## 7) Security

* Endpoints require **Admin** (e.g., `hasRole('ADMIN')`).
* Record `actorUserId` in logs. (Optional: add `checkedInBy` field later if you want audit trail.)

## 8) Observability & Audit (lean version)

* Log info events:

  * `CHECK_IN_SUCCESS {registrationId, actorUserId, checkedInAt}`
  * `UNDO_CHECK_IN_SUCCESS {registrationId, actorUserId}`
  * Include `scheduledTime`, `allowedFrom`, `allowedTo`, `now` on violations at WARN level.

## 9) Admin UI (React, MUI DataGrid)

* **Grid columns additions**

  * **Status**: shows ✅ when `row.checkedIn` else ❌

    * Tooltip:

      * Checked: `Checked in • {relativeTime} • {localDateTime}`
      * Not checked: `Not checked in`
  * **Action (Toggle)**:

    * Button/IconButton that:

      * If ❌ → attempts **check-in**
      * If ✅ → attempts **undo**
    * Disabled state + tooltip with **specific reason** (e.g., “Check-in window opens at 10:30 AM”).
* **UX details**

  * **Optimistic UI**: flip the icon immediately; revert on failure (with toast).
  * **Undo confirmation**: lightweight confirm (`Are you sure to undo?`).
  * **Local time**: display `checkedInAt` and window boundaries in **Asia/Kolkata**.
  * **Batched refresh**: after success, merge server response into row rather than full reload.
  * **Filters**: quick filter chips: All / Checked-in / Not checked-in.
  * **Legend**: small legend row explaining ✅/❌.

## 10) Configurability

* Add application property (read once at boot):

  * `checkin.window.minutes=120`
* Future-proof: could be per-tournament override later.

## 11) Acceptance Criteria (what you asked for)

* **Persistence:** `checkedIn` and `checkedInAt` update correctly and survive reload.
* **Admin visibility:** Admin grid shows correct status and timestamps; toggle works.
* **Time-window enforced:** Outside the window, check-in endpoint returns 422; UI disables the button and explains why.
* **State conflicts:** 409 returned where appropriate; UI shows toast.
* **Security:** Only admins can trigger endpoints.

---

# Instructions for the Code Agent

> If you see any safe improvements, **please implement them** and note them in your PR description.

## Backend (Spring Boot)

1. **DB Migration**

* Create a Flyway/Liquibase migration adding:

  * `checked_in boolean not null default false`
  * `checked_in_at timestamptz null`
  * Index on `checked_in`.

2. **Entity & DTO**

* Update `Registration` entity with `checkedIn`, `checkedInAt`.
* Update `RegistrationResponse` (and mapper) to expose these fields.
* If you already have `scheduledTime` on `Registration` or a relation to `Match`, ensure accessors are available in the Service.

3. **Config**

* Add `CheckInProperties` with `windowMinutes` default `120`. Bind to `checkin.window.minutes`.

4. **Service**

* Create `CheckInService` with methods:

  * `Registration checkIn(Long registrationId, UserPrincipal actor)`
  * `Registration undoCheckIn(Long registrationId, UserPrincipal actor)`
* Implement `getEffectiveScheduledTime(Registration)` and the time-window check.
* Use UTC `Instant.now()` for `checkedInAt`.
* Throw custom exceptions mapped to:

  * 422: `TimeWindowViolationException`
  * 409: `StateConflictException`
  * 404: `NotFoundException`

5. **Controller**

* `POST /api/v1/registrations/{id}/check-in`
* `POST /api/v1/registrations/{id}/undo-check-in`
* `@PreAuthorize("hasRole('ADMIN')")`
* Return `RegistrationResponse`.
* Add OpenAPI annotations and examples.

6. **Exception Handling**

* Add/adapt `@ControllerAdvice` to standardize error JSON (with `code`, `message`, `details`).

7. **Logging**

* Log success & violation events with registrationId, actor, now, scheduledTime, window bounds.

8. **Tests**

* **Unit (service):**

  * within window → success
  * before window → 422
  * after window → 422
  * already checked in → 409
  * undo when not checked in → 409
  * missing schedule → 422
* **Integration (controller):**

  * Security: 403 for non-admin
  * Happy paths for both endpoints
  * JSON payload assertions
* **Repository (if using custom update):**

  * optional compare-and-update path.

## Admin UI (React + MUI)

1. **API client**

* Add two functions:

  * `postCheckIn(registrationId: number): Promise<Registration>`
  * `postUndoCheckIn(registrationId: number): Promise<Registration>`
* Parse and surface server errors. Map 422 to a typed `TimeWindowError` that includes `allowedFrom`, `allowedTo`.

2. **Grid**

* In Registrations page/grid:

  * Add **Status** column rendering ✅/❌.
  * Add **Toggle** column with an IconButton:

    * If not checked in → call `postCheckIn`.
    * If checked in → open a small confirm → call `postUndoCheckIn`.
  * Show tooltips:

    * Checked: “Checked in • {fromNow} • {formatLocal}”
    * Not checked: “Not checked in”
  * **Disable** the check-in button when backend indicates it’s outside the window.

    * Strategy: on row load, compute `isWithinWindow` if you have `scheduledTime` locally; else just let backend respond with 422 and show toast. (Pick whichever is simpler; **prefer backend-driven truth**.)
* Add quick filters (All / ✅ / ❌).

3. **UX polish**

* Use **optimistic update** with rollback on error.
* Toasts:

  * success: “Checked in” / “Check-in undone”
  * 422: show explicit local window (e.g., “Allowed 10:30–14:30”)
  * 409: “Already checked in” / “Not checked in yet”
* Timezone: render `checkedInAt` and window times in **Asia/Kolkata** (use `dayjs` or `date-fns-tz`).

4. **Types**

* Extend `Registration` type with `checkedIn?: boolean`, `checkedInAt?: string | null`.

5. **Testing**

* Component test for the toggle behavior (mock API).
* Error handling snapshot (422, 409).
* Verify tooltips render correct local time strings.

---

## Optional Improvements (green-light to implement)

* Make the window configurable per **Tournament** (override global minutes).
* Add `checkedInBy` (userId) & show “by AdminName”.
* Batch check-in (multi-select rows) — optional.
* Soft-lock once a match starts: disallow **undo** if match is marked started (return 409).
* Add a dashboard widget: “Checked-in / Total” per category.



