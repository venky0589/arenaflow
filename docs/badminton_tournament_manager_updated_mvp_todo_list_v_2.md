# Badminton Tournament Manager – UPDATED MVP TODO List (v2)

## Project Snapshot
- **Backend**: Spring Boot + PostgreSQL + Flyway, JWT auth
- **Admin UI**: React + MUI (DataGrid, Formik)
- **User UI**: React + MUI
- **Mobile**: Expo React Native (login, basic scoring)

---

# 🚨 CRITICAL MVP BLOCKERS (Do These First)

## 1) Draw Generation & Bracket System (PRIORITY 1)
**Backend**
- [ ] Create `DrawGenerationService` for **single-elimination** (MVP) with hooks for other formats
- [ ] `Match` add fields: `round` (int), `nextMatchId` (FK self), `categoryId` (FK)
- [ ] Endpoint: `POST /tournaments/{id}/categories/{categoryId}/generate-draw`
- [ ] **Seeding** (MVP): manual seed numbers; preserve bracket positions for seeds (1 vs 8, 2 vs 7…)
- [ ] Handle **byes** for non-power-of-2 sizes (seeded players get early byes if needed)
- [ ] Validate tournament status = READY before generation

**Admin UI**
- [ ] "Generate Draw" button on Tournament > Category panel
- [ ] Confirmation dialog; toast on success/failure; refresh matches

**User UI**
- [ ] `BracketView` tree with responsive layout; highlight winners; show upcoming matches

**Acceptance**
- [ ] One-click generation from registrations per category; correct winner progression

---

## 2) Replace Raw ID Fields with Searchable Dropdowns (PRIORITY 2)
**Admin UI**
- [ ] Match Form: players, tournament, court -> **MUI Autocomplete** (async fetch)
- [ ] Registration Form: player, tournament, category -> cascading selects
- [ ] Tournament Form: multi-select courts
- [ ] Show human-readable labels; keep IDs in payloads

**Acceptance**
- [ ] No raw ID inputs remain; all selects searchable and correct IDs posted

---

## 3) Match Scheduling & Court Assignment (PRIORITY 3)
**Backend**
- [ ] `Match` add `scheduledTime TIMESTAMP`, `estimatedDuration INT`
- [ ] `MatchSchedulingService` with conflict checks: same player overlap, court double-booking
- [ ] `PUT /matches/{id}/schedule` (admin-only)
- [ ] Batch: "auto-schedule all" (greedy by court/time; avoids back-to-back for players)

**Admin UI**
- [ ] Timeline/Calendar view; drag-and-drop court/time; conflict warnings

**User UI**
- [ ] Filters: by court/time; "My Schedule" for logged-in player

**Acceptance**
- [ ] Prevents double booking of players/courts; admins can auto or manual schedule

---

## 4) Check-In API (PRIORITY 4)
**Backend**
- [ ] Registration: `checkedIn BOOLEAN default false`, `checkedInAt TIMESTAMP`
- [ ] `POST /registrations/{id}/check-in` & `/undo-check-in`
- [ ] Validation: time window (e.g., within 2 hours of `scheduledTime`)

**Admin UI**
- [ ] Registrations grid: status column (✅/❌), manual toggle

**Mobile**
- [ ] Use API instead of local-only; offline queue + retry; visual indicator

**Acceptance**
- [ ] Check-in persists; visible to admin; time-window enforced

---

## 5) Role-Based Access Control (PRIORITY 5)
**Backend**
- [ ] `UserAccount.role` = {ADMIN, REFEREE, USER}
- [ ] JWT includes role; add `@PreAuthorize` on controllers
- [ ] Seed referee user

**Admin/User/Mobile**
- [ ] Guards & conditional UI; REFEREE sees scoring & check-in only

**Acceptance**
- [ ] 403 on unauthorized; UIs hide disallowed features

---

## 6) Match Status Workflow (MOVE TO MVP)
**Reason**: Needed for clear tournament flow and gating actions.

**Backend/UI**
- [ ] Enum `MatchStatus { SCHEDULED, READY_TO_START, IN_PROGRESS, COMPLETED, WALKOVER, RETIRED }` (MVP scope)
- [ ] Auto-transition to `READY_TO_START` when both sides checked-in
- [ ] Scoring allowed only in `IN_PROGRESS`
- [ ] Admin/Referee can set WALKOVER/RETIRED with reason

**Acceptance**
- [ ] Status changes drive UI (buttons enabled/disabled) and validations

---

## 7) Category Management Enhancements (MINIMUM TO UNBLOCK DRAW)
**Backend**
- [ ] `Category` add: `name`, `genderRestriction (enum)`, `minAge`, `maxAge`, `maxParticipants`, `registrationFee`
- [ ] Basic validation: age bounds & gender where applicable

**Admin UI**
- [ ] Manage fields above; show participant count and max

**Acceptance**
- [ ] Categories carry rules used during registration and draw generation

---

## 8) Team/Doubles Support (MINIMUM FOR MIXED/DOUBLES IN MVP)
**Backend**
- [ ] `Team(id, name, player1Id, player2Id)`
- [ ] `Registration` allows `teamId` **or** `playerId` (mutually exclusive)
- [ ] `Match` participant slots accept player or team (store as participant refs)

**Admin/UI/Mobile**
- [ ] Doubles registration flow with partner selection/confirmation
- [ ] Scoring shows team names

**Acceptance**
- [ ] Can run at least one doubles category end-to-end

---

## 9) Tournament Format Flexibility (MVP SCOPE: STRUCTURE ONLY)
**Backend**
- [ ] `Category.format` = `SINGLE_ELIMINATION | ROUND_ROBIN` (enum)
- [ ] Implement **single-elimination** now; define interfaces for other formats

**Admin/UI**
- [ ] Select format per category; show warnings that RR is V2

**Acceptance**
- [ ] Data model prepared; SE works; UI surfaces format

---

# 🎯 MVP SUCCESS CRITERIA (Updated)
- [ ] One-click bracket generation (single-elim) with seeds & byes
- [ ] Bracket visible and responsive in User UI
- [ ] Searchable dropdowns replace all raw IDs
- [ ] Admin can schedule with conflict prevention; players see "My Schedule"
- [ ] Mobile/API check-in persisted with window rules
- [ ] RBAC enforced across platforms
- [ ] **Match status workflow** gates scoring and reflects check-in
- [ ] **Doubles** minimal path supported for at least one category
- [ ] **Category rules** respected (age/gender/max size)

---

# 📦 PHASED ROADMAP (Post-MVP)

## V2 (Should-Haves)
- **Round Robin format** draw & standings
- **Live updates**: WebSocket/SSE for scores & bracket changes; LIVE badges
- **Enhanced scoring**: game-by-game (best of 3), deuce logic, service indicator, undo last point
- **Referee management**: assign refs, availability & workload, referee dashboard
- **Statistics dashboard**: tournament KPIs; player profiles with W/L
- **Notifications**: email reminders; push (Expo) for matches
- **Payment integration**: registration fees via Razorpay/Stripe; status in `Registration`
- **Schedule board**: print-friendly daily run-order

## V3 (Nice-to-Haves)
- Spectator public pages (no login), shareable links
- Communication hub (announcements, SMS/WhatsApp hooks)
- Multi-tournament season & ranking points
- Offline mobile mode (broader caching & sync)
- QR codes for player check-in & match cards
- Audit logging & 2FA for admins
- Internationalization (Hindi/Telugu/Tamil) & Dark Mode

## V4+ (Future Considerations)
- Equipment/Inventory, Volunteers, Medical & Safety
- Prize/Awards, Photo/Highlights, Financial reports
- Backup/Recovery, Data privacy flows, BI & forecasting

---

# 🔧 Implementation Notes
- Add Flyway migrations per entity/enum changes
- Keep DTOs/API stable where possible; version endpoints if needed
- Test: service-level unit tests for draw/schedule/check-in; E2E smoke via Postman/Playwright
- Deployment: prepare Dockerfiles + CI once MVP stabilizes

---

# 📋 Two-Week Work Plan (Updated)
**Week 1**
- Days 1–2: Draw Generation + Bracket UI + Seeds/Byes
- Day 3: Dropdown replacements (all forms)
- Days 4–5: Scheduling service + timeline UI

**Week 2**
- Day 6: Check-In API + Mobile integration
- Day 7: RBAC wiring & guards
- Day 8: Match Status workflow across apps
- Days 9–10: Doubles minimal path + QA & bugfixes

---

# ✅ Definition of Done (per item)
- Code + tests + migrations merged
- Admin/User/Mobile UX flows validated
- Swagger updated; Postman tests pass
- Seed data updated; demo tournament runnable end-to-end

