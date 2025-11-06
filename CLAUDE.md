# Badminton Tournament Manager - AI Context

**Last Updated**: 2025-11-03
**Project Status**: 70-75% Complete (MVP Features Done, Production Prep Remaining)
**Completion Estimate**: 8-12 working days remaining (production hardening + deployment)

---

## Project Overview

A full-stack badminton tournament management system with three platforms:
- **Admin Web UI**: Tournament and player management (React + MUI)
- **User Web UI**: Tournament browsing and registration (React + MUI)
- **Mobile App**: Referee scoring and player check-in (Expo React Native - currently in zips/)

---

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.2 with Maven
- **Java Version**: 17
- **Database**: PostgreSQL 16 (via Docker Compose)
- **Security**: JWT authentication (JJWT 0.11.5) + Spring Security
- **Migrations**: Flyway
- **API Docs**: SpringDoc OpenAPI (Swagger UI)
- **Email Testing**: Mailpit (local dev)
- **Testing**: JUnit 5 + H2

### Frontend (Both UIs)
- **Framework**: React 18 + Vite + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **HTTP Client**: Axios with JWT interceptor
- **Routing**: React Router v6
- **Forms**: Formik + Yup (Admin UI only)

### Mobile App
- **Framework**: Expo React Native
- **Location**: Currently in `zips/mobile-app.zip` (not extracted)
- **Features**: Login, tournament registration, player check-in, match scoring

---

## Directory Structure

```
sports-app/
├── backend/              # Spring Boot API server
│   ├── src/main/java/com/example/tournament/
│   │   ├── domain/       # JPA entities (8 files)
│   │   ├── repo/         # Spring Data repositories
│   │   ├── web/          # REST controllers (6 files)
│   │   ├── security/     # JWT + Spring Security
│   │   └── config/       # SecurityConfig
│   ├── src/main/resources/
│   │   ├── db/migration/ # Flyway SQL scripts
│   │   ├── application.yml
│   │   └── data.sql      # Seed data
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── CLAUDE.md         # Backend-specific context
│
├── admin-ui/             # Admin management interface
│   ├── src/
│   │   ├── pages/        # Tournaments, Players, Courts, Matches, Registrations
│   │   ├── components/   # CrudTable, FormDialog, Layout
│   │   ├── auth/         # Login, RequireAuth
│   │   └── api/          # Axios client
│   ├── package.json
│   ├── .env.example
│   └── CLAUDE.md         # Admin UI context
│
├── user-ui/              # User-facing interface
│   ├── src/
│   │   ├── pages/        # Home, Tournaments, Matches, Brackets, Registrations
│   │   ├── components/   # Layout
│   │   └── api/          # Axios client
│   ├── package.json
│   ├── .env.example
│   └── CLAUDE.md         # User UI context
│
├── docs/
│   └── tournament_project_brief.txt  # Comprehensive project requirements
│
└── zips/                 # Archived versions
    ├── backend.zip
    ├── admin-ui.zip
    ├── user-ui.zip
    └── mobile-app.zip    # Mobile app not yet extracted
```

---

## Quick Start

### 1. Backend
```bash
cd backend
docker compose up -d          # Start PostgreSQL + Mailpit
mvn spring-boot:run           # Run Spring Boot

# Access:
# - API: http://localhost:8080
# - Swagger: http://localhost:8080/swagger-ui/index.html
# - Mailpit UI: http://localhost:8025
```

**Default Admin User**: `admin@example.com` / `admin123`

### 2. Admin UI
```bash
cd admin-ui
cp .env.example .env
npm install
npm run dev                   # Runs on http://localhost:5173
```

### 3. User UI
```bash
cd user-ui
cp .env.example .env
npm install
npm run dev                   # Runs on http://localhost:5174
```

---

## Database Schema

### Core Tables
1. **users** - Authentication (id, email, password_hash, enabled)
2. **user_account_roles** - RBAC (user_account_id, roles)
3. **tournament** - Tournament metadata (id, name, location, start_date, end_date)
4. **player** - Player profiles (id, first_name, last_name, gender, phone)
5. **court** - Court management (id, name, location_note)
6. **matches** - Match details (id, tournament_id, court_id, player1_id, player2_id, score1, score2, status, scheduled_at)
7. **registration** - Player tournament registrations (id, tournament_id, player_id, category_type)

### Relationships
- Tournament → Many Registrations, Many Matches
- Player → Many Registrations
- Match → Tournament, Court, Player1, Player2
- Registration → Tournament, Player

### Seed Data (data.sql)
- 2 tournaments: "City Open" (Hyderabad), "Winter Cup" (Bengaluru)
- 4 players: Saina, Sindhu, Srikanth, Lakshya
- 2 courts: Court 1, Court 2
- 1 admin user: admin@example.com

---

## Implementation Status - **ALL MVP FEATURES COMPLETE** ✅

### ✅ Core Features (100% Complete)
1. ✅ JWT authentication system (login/register)
2. ✅ Complete CRUD APIs for all entities
3. ✅ Admin panel with full management interface
4. ✅ User registration flow for tournaments
5. ✅ Match viewing with schedules and scores
6. ✅ Database migrations with Flyway (27 migrations)
7. ✅ Development environment (Docker Compose)
8. ✅ API documentation (Swagger)
9. ✅ Match status workflow (6 states: SCHEDULED, READY_TO_START, IN_PROGRESS, COMPLETED, WALKOVER, RETIRED)
10. ✅ Check-in system with QR codes and batch operations

### ✅ MVP Features (100% Complete)

#### ✅ 1. Draw Generation & Bracket Management (COMPLETE)
- ✅ Backend: `BracketServiceImpl` with single-elimination algorithm
- ✅ Seeding algorithm with fair player distribution
- ✅ BYE handling and auto-advancement
- ✅ Winner progression tracking (`nextMatchId`, `winnerAdvancesAs`)
- ✅ Round management and position calculation
- ✅ Admin UI: `GenerateDrawDialog` with category selection
- ✅ User UI: Professional bracket visualization with `BracketView` component
- ✅ RBAC: ADMIN-only generation, public viewing
- **Status**: Production-ready

#### ✅ 2. Match Scheduling UI (COMPLETE)
- ✅ Backend: `SchedulingService` with simulate-then-apply workflow
- ✅ Constraint validation: court conflicts, player conflicts, blackouts, operating hours
- ✅ Optimistic locking for concurrent updates
- ✅ Admin UI: `MatchScheduler.tsx` with timeline view
- ✅ Drag-and-drop court assignment
- ✅ Time slot management with visual grid
- ✅ Auto-scheduler with preview
- ✅ Export functionality (CSV, JSON, Print)
- ✅ Real-time updates via WebSocket
- ✅ Lock/unlock matches to preserve manual schedules
- **Status**: Advanced features beyond MVP requirements

#### ✅ 3. Relational Field Dropdowns (COMPLETE)
- ✅ All foreign key fields use MUI Autocomplete
- ✅ Matches form: Tournament, Court, Player1, Player2 dropdowns
- ✅ Registrations form: Tournament, Player dropdowns
- ✅ Searchable with proper display names
- ✅ No raw ID text inputs remaining
- **Status**: Production-ready

#### ✅ 4. Check-In System (COMPLETE)
- ✅ Backend: `CheckInService` with time window validation
- ✅ Database fields: `checkedIn`, `checkedInAt`, `scheduledTime`
- ✅ POST endpoint: `/api/v1/registrations/{id}/check-in`
- ✅ ±2 hour check-in window enforcement
- ✅ Admin UI: Check-in management with QR codes
- ✅ Batch check-in operations
- ✅ Real-time sync via WebSocket
- **Status**: Production-ready

#### ✅ 5. Role-Based Access Control (COMPLETE)
- ✅ Backend: 40 `@PreAuthorize` annotations across all controllers
- ✅ Custom security annotations: `@IsAdmin`, `@IsAdminOrReferee`
- ✅ JWT tokens include roles in claims
- ✅ Admin UI: Route guards with `RequireAuth` component
- ✅ Admin UI: `useAuth` hook with role helpers
- ✅ User UI: Zustand store with `hasRole()` method
- ✅ Conditional UI rendering based on roles
- ✅ Public read access, authenticated write access
- **Status**: Production-ready

**📄 See**: `docs/MVP_FEATURES_COMPLETE.md` for detailed evidence and implementation details
**📄 See**: `docs/RBAC_IMPLEMENTATION_COMPLETE.md` for comprehensive RBAC documentation

**Roles Defined**:
- `ADMIN`: Full access to admin UI and all APIs
- `USER`: Can register for tournaments, view brackets/matches
- `REFEREE`: Can score matches and check in players

**Files to Modify:**
- `backend/src/main/java/com/example/tournament/web/AuthController.java` (return role in login response)
- `backend/src/main/java/com/example/tournament/config/SecurityConfig.java`
- All controller files (add @PreAuthorize)
- `admin-ui/src/auth/RequireAuth.tsx` (check role)
- `user-ui/src/components/Layout.tsx` (conditional rendering)

---

## Actual Remaining Work (25-30% to Production)

### 🔒 Security Hardening (2-3 days) - HIGH PRIORITY
1. **Move JWT secret to environment variable**
   - Current: Hardcoded in `application.yml`
   - Action: Use `${JWT_SECRET}` and configure in deployment

2. **Add rate limiting on auth endpoints**
   - Prevent brute force attacks
   - Recommended: 5 attempts per 15 minutes per IP
   - Library: Bucket4j or Spring Cloud Gateway

3. **Implement refresh tokens**
   - Current: Single long-lived token (3 days)
   - Recommended: Short access token (15 min) + refresh token (7 days)

4. **Add password complexity validation**
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number, 1 special char

5. **Enable HTTPS only in production**
   - Configure SSL certificates
   - Redirect HTTP → HTTPS

### 🧪 Testing & QA (3-4 days) - HIGH PRIORITY
1. **Frontend Testing**
   - Unit tests: Jest + React Testing Library
   - Integration tests: Cypress or Playwright
   - Target: 70%+ coverage

2. **Load Testing**
   - JMeter or Gatling for performance testing
   - Test with realistic load (100-1000 concurrent users)
   - Identify bottlenecks

3. **Security Testing**
   - OWASP ZAP for vulnerability scanning
   - Penetration testing
   - SQL injection, XSS, CSRF checks

4. **UAT (User Acceptance Testing)**
   - Manual testing with real tournament organizers
   - Collect feedback on UX
   - Bug fixes from QA

### 🚀 Deployment Infrastructure (3-4 days) - HIGH PRIORITY
1. **Dockerfiles**
   - Create production-ready Dockerfiles for backend, admin-ui, user-ui
   - Multi-stage builds for optimization
   - Health checks

2. **CI/CD Pipeline**
   - GitHub Actions workflows
   - Automated testing on PR
   - Automated deployment to staging/production
   - Rollback capabilities

3. **Cloud Deployment**
   - Choose provider: AWS/GCP/Azure or Render/Fly.io
   - Set up database (managed PostgreSQL)
   - Configure CDN for static assets
   - Set up domain and SSL

4. **Monitoring & Logging**
   - Application monitoring (Prometheus, Grafana)
   - Log aggregation (ELK stack or cloud-native)
   - Error tracking (Sentry)
   - Uptime monitoring

### 📱 Mobile App (Optional for V1) (5-7 days)
- Currently in `zips/mobile-app.zip`
- Extract and integrate with backend APIs
- Test on iOS and Android
- Publish to app stores

### ✨ Nice-to-Have V2 Features (10-15 days)
1. **Notification System** (3-5 days)
   - Email confirmations (leverage Mailpit for dev)
   - Match reminders
   - Expo Push Notifications

2. **Payment Integration** (5-7 days)
   - Razorpay or Stripe
   - Registration fee collection
   - Transaction history

3. **Reporting & Analytics** (2-3 days)
   - CSV export for registrations/results (partially done)
   - PDF bracket generation
   - Tournament statistics dashboard
   - Player performance analytics

---

## Architecture Patterns (Current Implementation)

### Backend (Proper MVC with Service Layer)
```
Controller → Service → Repository
```
✅ **Service layer properly implemented** across all domains:
- `TournamentService`, `MatchService`, `BracketService`, `SchedulingService`, etc.
- DTOs for request/response (not exposing entities directly)
- Proper separation of concerns

**Should Be:**
```
Controller → Service → Repository
```

### Frontend (Both UIs)
- **Component-Based**: Reusable React components
- **API Client**: Centralized Axios instance with JWT interceptor
- **Protected Routes**: `RequireAuth` wrapper (Admin UI only)
- **State Management**: Local component state (useState) - no global state

---

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### CRUD Endpoints (Missing `/api/v1/` prefix)
- `/tournaments` - Tournament CRUD
- `/players` - Player CRUD
- `/courts` - Court CRUD
- `/matches` - Match CRUD
- `/registrations` - Registration CRUD

All CRUD endpoints support:
- `GET /` - List all
- `GET /{id}` - Get by ID
- `POST /` - Create new
- `PUT /{id}` - Update existing
- `DELETE /{id}` - Delete by ID

### Scheduling & Courts Endpoints

#### Match Scheduling
- `POST /api/v1/scheduling/simulate` - Simulate auto-scheduling (dry-run, no database changes)
- `POST /api/v1/scheduling/apply` - Apply a simulated schedule using Idempotency-Key header
- `GET /api/v1/scheduling/matches` - Get scheduled matches with advanced filtering

#### Filtering Parameters (for `/matches` endpoint)
- `tournamentId` (required) - Filter by tournament
- `date` (optional) - Filter by specific date (ISO format: 2025-11-03)
- `courtId` (optional) - Filter by court
- `categoryId` (optional) - Filter by category
- `round` (optional) - Filter by round number
- `status` (optional) - Filter by match status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `playerId` (optional) - Filter by player (checks both player1 and player2)
- `page`, `size`, `sort` - Standard pagination parameters

**Example Request:**
```bash
GET /api/v1/scheduling/matches?tournamentId=1&date=2025-11-03&courtId=2&status=SCHEDULED&page=0&size=50&sort=scheduledAt,asc
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 123,
      "tournamentId": 1,
      "tournamentName": "City Open 2025",
      "courtId": 2,
      "courtName": "Court 2",
      "player1Id": 10,
      "player1Name": "Saina Nehwal",
      "player2Id": 11,
      "player2Name": "PV Sindhu",
      "score1": null,
      "score2": null,
      "status": "SCHEDULED",
      "scheduledAt": "2025-11-03T10:00:00",
      "version": 5
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 50
  },
  "totalElements": 120,
  "totalPages": 3
}
```

---

## Scheduling System Architecture

### Core Concepts

#### 1. Constraints & Validation
The scheduling system enforces multiple constraints to ensure valid match scheduling:

**Court Conflicts** (`COURT_CONFLICT`)
- Same court cannot host overlapping matches
- Enforced at both service layer (application-level) and database layer (PostgreSQL exclusion constraint)
- Includes mandatory buffer time between matches on the same court (default: 15 minutes)

**Player Conflicts** (`PLAYER_CONFLICT`)
- Same player cannot have overlapping matches across any category
- Minimum rest time enforced between matches (default: 30 minutes)
- Handles singles and doubles participants correctly

**Court Blackouts** (`BLACKOUT_CONFLICT`)
- Courts can have unavailability periods (maintenance, reserved, etc.)
- Stored in `court_availability` table
- Checked before scheduling any match

**Operating Hours** (`HOURS_CONSTRAINT`) ✅ **NEW**
- Tournaments can define daily start/end times (e.g., 08:00 - 22:00)
- Matches cannot be scheduled outside these hours
- Configurable per tournament in `tournament` table
- Set to NULL for no restrictions (24/7 operation)

**Optimistic Locking** (`OPTIMISTIC_LOCK`) ✅ **NEW**
- Prevents lost updates when multiple users edit the same match
- Uses JPA `@Version` annotation
- Returns HTTP 409 when version mismatch detected
- Client must refresh data and retry

#### 2. Database-Level Safety (PostgreSQL Only)

**Exclusion Constraint** ✅ **NEW** (V24 migration)
```sql
-- Prevents double-booking at database level
ALTER TABLE matches
  ADD CONSTRAINT no_court_overlap_during_match
  EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(scheduled_at, scheduled_end_at, '[)') WITH &&
  )
  WHERE (scheduled_at IS NOT NULL AND court_id IS NOT NULL);
```

This provides an additional safety layer beyond application-level validation. Even if the service layer has a bug, the database will reject conflicting schedules.

**Note:** H2 (used in tests) doesn't support exclusion constraints. For H2 environments, only service-level validation is active.

#### 3. Optimistic Concurrency Control ✅ **NEW**

**How it Works:**
1. User A loads match (version=5)
2. User B loads same match (version=5)
3. User A saves changes → version becomes 6 ✅
4. User B tries to save with version=5 → HTTP 409 OPTIMISTIC_LOCK ❌

**Error Response Format:**
```json
{
  "timestamp": "2025-10-28T14:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "This record was updated by another user. Please refresh and try again.",
  "path": "/api/v1/scheduling/matches/123",
  "code": "OPTIMISTIC_LOCK",
  "details": {
    "entityType": "com.example.tournament.domain.Match",
    "entityId": 123
  }
}
```

**Frontend Handling:**
- Display user-friendly message: "Match was updated by another user"
- Provide action buttons: "Refresh Match" / "Reload Schedule"
- Rollback optimistic UI update to show correct state

#### 4. Auto-Scheduler Algorithm

**Simulate-Then-Apply Workflow:**
1. **Simulate** (`POST /api/v1/scheduling/simulate`)
   - Runs scheduling algorithm WITHOUT persisting to database
   - Creates `SchedulingBatch` record in SIMULATED status
   - Returns preview with batch UUID (idempotency key)
   - Shows: scheduled count, unscheduled count, fill percentage, warnings

2. **Apply** (`POST /api/v1/scheduling/apply` with `Idempotency-Key` header)
   - Applies the simulated schedule to database
   - Idempotent: calling multiple times with same UUID returns same result
   - Marks batch as APPLIED
   - Updates all match records

**Algorithm Features:**
- **Topological sorting** - respects bracket dependencies (prerequisites must finish first)
- **Greedy slot allocation** - finds earliest available slot for each match
- **Performance optimized** - pre-loads all data to eliminate N+1 queries
- **Conflict-aware** - skips slots with court/player/blackout/hours conflicts
- **Locked match respect** - skips manually locked matches to preserve manual edits

### Tournament Operating Hours ✅ **NEW**

**Database Schema:**
```sql
ALTER TABLE tournament
ADD COLUMN daily_start_time TIME,
ADD COLUMN daily_end_time TIME;
```

**Example Usage:**
```sql
-- Regular tournament (8 AM - 10 PM)
UPDATE tournament SET daily_start_time = '08:00:00', daily_end_time = '22:00:00'
WHERE id = 1;

-- Morning-only tournament
UPDATE tournament SET daily_start_time = '07:00:00', daily_end_time = '12:00:00'
WHERE id = 2;

-- No restrictions (24/7)
UPDATE tournament SET daily_start_time = NULL, daily_end_time = NULL
WHERE id = 3;
```

**Validation Rules:**
- `scheduled_at.time >= daily_start_time`
- `scheduled_end_at.time <= daily_end_time`
- Returns HTTP 400 with code `HOURS_CONSTRAINT` if violated

**Auto-Scheduler Integration:**
- Automatically skips time slots outside operating hours
- No manual intervention needed

### Error Codes Reference

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|------------|
| `COURT_CONFLICT` | 409 Conflict | Court is double-booked or buffer violation | Choose different time or court |
| `PLAYER_CONFLICT` | 409 Conflict | Player has overlapping match or insufficient rest | Adjust match time to allow rest period |
| `BLACKOUT_CONFLICT` | 400 Bad Request | Court unavailable during this time | Check court availability schedule |
| `HOURS_CONSTRAINT` | 400 Bad Request | Match falls outside tournament operating hours | Reschedule within daily hours |
| `OPTIMISTIC_LOCK` | 409 Conflict | Match was updated by another user | Refresh data and retry operation |

### Troubleshooting

**Q: Why did I get OPTIMISTIC_LOCK error?**
A: Another user (or another browser tab) edited the same match while you were making changes. Refresh the schedule to see the latest version, then re-apply your changes.

**Q: Why won't this time slot accept my match?**
A: Check the following:
1. **Court availability** - Court may have a blackout period
2. **Operating hours** - Time may fall outside tournament daily hours
3. **Player conflicts** - One of the players may have a match too close in time
4. **Court buffer** - Previous match on same court may not have enough buffer time

**Q: How do I override the auto-scheduler for a specific match?**
A: Use the "Lock Match" feature in the admin UI. Locked matches are skipped by the auto-scheduler and preserve your manual schedule decisions.

**Q: Can I have different operating hours for different days?**
A: Not currently. Operating hours are applied uniformly to all days. Future enhancement: per-day-of-week hours (weekday vs weekend).

---

## Testing Strategy

### Current (Minimal)
- H2 in-memory database for integration tests
- Basic JUnit 5 test structure
- No frontend tests

### Recommended (To Implement)
**Backend**:
- Unit tests for services (70%+ coverage target)
- Integration tests with Testcontainers
- API contract testing

**Frontend**:
- Jest for unit tests
- React Testing Library for component tests
- Cypress or Playwright for E2E tests

**Mobile**:
- Jest for logic tests
- Detox for E2E testing (optional)

---

## Development Workflow

### Starting Development Session
1. Start backend: `cd backend && docker compose up -d && mvn spring-boot:run`
2. Start admin UI: `cd admin-ui && npm run dev`
3. Start user UI: `cd user-ui && npm run dev`
4. Verify Swagger: http://localhost:8080/swagger-ui/index.html

### Making Database Changes
1. Create Flyway migration: `src/main/resources/db/migration/V{N}__{description}.sql`
2. Update domain entity
3. Restart backend (Flyway runs automatically)

### Making API Changes
1. Update domain entity (if needed)
2. Update controller
3. Restart backend
4. Test in Swagger UI
5. Update frontend API calls

### Common Tasks

**Add New Entity:**
1. Create entity class in `domain/`
2. Create repository in `repo/`
3. Create controller in `web/`
4. Create migration script
5. Add seed data (optional)

**Add New UI Page:**
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Layout.tsx`
4. Create API calls in page component

---

## Useful Commands

### Backend
```bash
# Start infrastructure
docker compose up -d

# Run backend
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package

# View DB logs
docker compose logs -f postgres

# Access DB directly
docker exec -it sports-app-postgres-1 psql -U tournament -d tournament
```

### Frontend (both UIs)
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

### Backend (application.yml)
```yaml
spring.datasource.url: Database URL
spring.datasource.username: Database user
spring.datasource.password: Database password
app.jwt.secret: JWT signing key (CHANGE IN PRODUCTION!)
app.jwt.validity-ms: Token expiration time
```

### Frontend (.env)
```bash
VITE_API_BASE=http://localhost:8080  # Backend API URL
```

---

## Timeline & Roadmap

### Current Status
- **Completion**: 70-75% (All MVP features complete)
- **MVP Criteria Met**: 10/10 ✅

### ✅ Completed MVP Work
- ✅ Draw generation algorithm (BracketServiceImpl)
- ✅ Bracket visualization (Interactive admin UI)
- ✅ Relational field dropdowns (All forms use Autocomplete)
- ✅ Match scheduling service (Auto-scheduler with constraints)
- ✅ Court assignment UI (Drag-and-drop scheduler)
- ✅ Check-in API persistence (Registration.checkedIn field)
- ✅ Role-based access control (40+ @PreAuthorize annotations)
- ✅ Match status workflow (6 states with validation)

### Remaining Work (Production-Ready)
**Week 1** (3-4 days):
- Security hardening (rate limiting, secrets management)
- Comprehensive testing (integration tests, E2E tests)
- Performance optimization

**Week 2** (3-4 days):
- Deployment infrastructure (Dockerfiles, CI/CD)
- Monitoring and logging setup
- Production environment configuration

**Week 3** (2-4 days):
- Final QA and bug fixes
- Documentation updates
- User acceptance testing

**Total Estimate**: 8-12 working days to production deployment

---

## Nice-to-Have Features (Post-MVP)

### V2 Features (Medium Priority)
1. **Notification System** (3-5 days)
   - Email confirmations (leverage Mailpit)
   - Match reminders
   - Expo Push Notifications

2. **Real-Time Updates** (3-4 days)
   - WebSocket or SSE implementation
   - Live score updates without refresh
   - Live bracket updates

3. **Payment Integration** (5-7 days)
   - Razorpay or Stripe
   - Registration fee collection
   - Transaction history

4. **Reporting & Analytics** (2-3 days)
   - CSV export for registrations/results
   - PDF bracket generation
   - Tournament statistics dashboard
   - Player performance analytics

5. **Deployment & CI/CD** (3-4 days)
   - Dockerfiles for all services
   - GitHub Actions workflows
   - Cloud deployment (AWS/Render/Fly.io)
   - Monitoring and logging

---

## Security Considerations

### Implemented
- JWT authentication
- Password hashing (BCrypt)
- CORS configuration

### To Implement/Review
- ✅ Rate limiting on auth endpoints
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries - JPA handles this)
- ✅ XSS protection in frontends
- ✅ CSRF tokens for state-changing operations
- ✅ Secure password reset flow
- ✅ API key management for third-party services
- ✅ Audit logging for sensitive operations
- ✅ Move JWT secret to environment variable

---

## Performance Considerations

### Current Approach
- Basic pagination in DataGrid
- Simple CRUD operations
- No caching

### Recommended Optimizations
- Database indexing on frequently queried fields (tournament_id, player_id)
- Lazy loading for large datasets
- Caching for tournament data (Redis)
- Query optimization and N+1 prevention
- Image/file upload optimization
- Mobile app bundle size optimization
- API response compression

---

## Known Limitations

1. **Mobile App**: Not extracted from zips folder (optional for MVP)
2. ~~**Bracket Visualization**: Only placeholder UI exists~~ ✅ **COMPLETE** - Interactive bracket tree UI
3. ~~**Admin UI Relations**: Raw ID inputs instead of dropdowns~~ ✅ **COMPLETE** - All forms use Autocomplete
4. **Real-Time Updates**: Partial (WebSocket exists but limited frontend integration)
5. **No Payment Integration**: Free registration only (post-MVP feature)
6. **No Email Notifications**: Mailpit is for testing only (post-MVP feature)
7. **No File Uploads**: No player photos, tournament logos, etc. (post-MVP feature)
8. **No Audit Trail**: No tracking of who made changes (post-MVP feature)
9. **No Soft Deletes**: Records are permanently deleted
10. **No Multi-Tenancy**: Single organization only

---

## External Resources

### Documentation
- Project Brief: `docs/tournament_project_brief.txt`
- Backend README: `backend/README.md`
- Admin UI README: `admin-ui/README.md`
- User UI README: `user-ui/README.md`

### API Testing
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Postman Collection: `backend/postman_collection.json`

### Email Testing
- Mailpit Web UI: http://localhost:8025
- SMTP: localhost:1025

---

## Component-Specific Context

For detailed information about each component, see:
- **Backend**: [backend/CLAUDE.md](backend/CLAUDE.md)
- **Admin UI**: [admin-ui/CLAUDE.md](admin-ui/CLAUDE.md)
- **User UI**: [user-ui/CLAUDE.md](user-ui/CLAUDE.md)

---

## AI Assistant Guidelines

When working on this project:

1. **Always check database config** before running backend
2. **Use service layer** when adding new business logic (don't put it in controllers)
3. **Create DTOs** instead of exposing entities directly
4. **Add proper error handling** in both backend and frontend
5. **Follow existing patterns** in the codebase
6. **Test in Swagger** before updating frontend
7. **Consider mobile app** when making API changes
8. **Update migrations** for any schema changes
9. **Add validation** for all user inputs
10. **Document complex algorithms** (especially bracket generation)

---

**For Questions or Issues**: Refer to component-specific CLAUDE.md files for detailed technical context.
