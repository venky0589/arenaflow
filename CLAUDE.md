# Badminton Tournament Manager - AI Context

**Last Updated**: 2025-10-18
**Project Status**: 40% Complete (MVP in progress)
**Completion Estimate**: 15-18 working days remaining

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

## Implementation Status (7/10 MVP Criteria Met)

### ✅ Completed Features
1. JWT authentication system (login/register)
2. Complete CRUD APIs for all entities
3. Admin panel with full management interface
4. User registration flow for tournaments
5. Match viewing with schedules and scores
6. Database migrations with Flyway
7. Development environment (Docker Compose)
8. API documentation (Swagger)

### ⏳ Pending MVP Features

#### 1. Draw Generation & Bracket Management (5-7 days) - HIGH PRIORITY
**What's Missing:**
- Automatic match generation from registrations
- Seeding algorithm for fair player distribution
- Bracket structure creation (knockout/round-robin)
- Winner progression logic
- Round management

**Required Implementation:**
- Backend service: `BracketService.generateDraw(tournamentId, categoryId)`
- Match pairing algorithm based on seedings
- Bracket tree data structure
- Admin UI: "Generate Bracket" button
- User UI: Interactive bracket visualization (tree view)
- Mobile: Score updates trigger winner advancement

**Files to Create/Modify:**
- `backend/src/main/java/com/example/tournament/service/BracketService.java`
- `backend/src/main/java/com/example/tournament/web/BracketController.java`
- `admin-ui/src/pages/Brackets.tsx`
- `user-ui/src/pages/Brackets.tsx` (currently placeholder)

#### 2. Match Scheduling & Court Assignment (3-4 days) - HIGH PRIORITY
**What's Missing:**
- Intelligent court allocation
- Time slot management
- Conflict detection (same player, same court)
- Schedule optimization

**Required Implementation:**
- Backend: Scheduling algorithm with constraints
- Match entity already has `scheduledAt` field - need service layer
- Admin UI: Schedule editor with date/time pickers
- Admin UI: Drag-drop court assignment
- User UI: Schedule view filtered by court and time

**Files to Modify:**
- `backend/src/main/java/com/example/tournament/domain/Match.java` (add duration field)
- `backend/src/main/java/com/example/tournament/service/SchedulingService.java` (new)
- `admin-ui/src/pages/MatchScheduler.tsx` (new)

#### 3. Relational Field Improvements (2-3 days) - MEDIUM PRIORITY
**Current Issue**: Admin UI uses raw ID text fields for foreign keys

**Required Changes:**
- Replace all ID text fields with searchable dropdowns (MUI Autocomplete)
- Match form: Select tournament, court, player1, player2 from dropdowns
- Registration form: Select tournament and player from lists
- Load options from API on form open
- Cascading dropdowns (e.g., categories depend on tournament)

**Files to Modify:**
- `admin-ui/src/pages/Matches.tsx`
- `admin-ui/src/pages/Registrations.tsx`

#### 4. Check-In API Persistence (2-3 days) - MEDIUM PRIORITY
**Current Issue**: Mobile app has check-in UI but doesn't persist to backend

**Required Implementation:**
- Add `checkedIn` boolean + `checkedInAt` timestamp to Registration entity
- Migration script to alter table
- POST endpoint: `/api/v1/registrations/{id}/check-in`
- Validation: Only allow check-in within time window (e.g., 1 hour before match)
- Admin UI: Check-in status column in registrations grid
- Mobile: Sync check-in state with backend

**Files to Create/Modify:**
- `backend/src/main/resources/db/migration/V2__add_checkin.sql`
- `backend/src/main/java/com/example/tournament/domain/Registration.java`
- `backend/src/main/java/com/example/tournament/web/RegistrationController.java`
- `admin-ui/src/pages/Registrations.tsx`

#### 5. Role-Based Access Control (3-4 days) - HIGH PRIORITY
**Current Issue**: Roles exist but not enforced

**Required Implementation:**
- Backend: `@PreAuthorize("hasRole('ADMIN')")` annotations on endpoints
- Admin UI: Only accessible to ADMIN role
- Mobile: Referee role shows only scoring/check-in screens
- User UI: Hide admin features from regular users
- Login should return user role with JWT (currently only returns token)
- Role-based menu and navigation

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

## Critical Issues to Fix

### 1. Database Configuration Mismatch (BLOCKER)
**Problem**: `application.yml` doesn't match `docker-compose.yml`

**Current State**:
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sports_app
    username: postgres
    password: 123456
```

```yaml
# docker-compose.yml
environment:
  POSTGRES_DB: tournament
  POSTGRES_USER: tournament
  POSTGRES_PASSWORD: tournament
```

**Fix Required**: Update `application.yml` to match Docker Compose OR update Docker Compose to match application.yml

### 2. API Endpoint Inconsistency
**Problem**: Some controllers use `/api/v1/` prefix, others don't

**Current**:
- `/api/v1/auth/login` (AuthController)
- `/tournaments` (TournamentController - missing prefix)
- `/players`, `/courts`, `/matches`, `/registrations` (all missing prefix)

**Fix**: Standardize all endpoints to use `/api/v1/` prefix

### 3. No Service Layer
**Problem**: Controllers directly access repositories (violates separation of concerns)

**Example**:
```java
@RestController
public class TournamentController {
    private final TournamentRepository repo; // Direct repository access

    @GetMapping
    public List<Tournament> all() {
        return repo.findAll(); // Business logic in controller
    }
}
```

**Fix**: Introduce service layer between controllers and repositories

### 4. Security Gaps
- JWT secret hardcoded in plain text (`application.yml`)
- No rate limiting on auth endpoints
- No password complexity validation
- Entities exposed directly (no DTOs)

### 5. Hacky Update Implementation
Controllers use reflection to set IDs during updates:
```java
var idField = Tournament.class.getDeclaredField("id");
idField.setAccessible(true);
idField.set(body, id);
```

**Fix**: Proper update methods in service layer

---

## Architecture Patterns

### Backend (Incomplete MVC)
```
Controller → Repository (❌ Missing Service Layer)
```

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
- **Completion**: 40% (Infrastructure + basic CRUD)
- **MVP Criteria Met**: 7/10

### Remaining Work
**Week 1** (5-6 days):
- Draw generation algorithm
- Bracket visualization
- Relational field dropdowns

**Week 2** (5-6 days):
- Match scheduling service
- Court assignment UI
- Check-in API persistence

**Week 3** (5-6 days):
- Role-based access control
- Security hardening
- QA & bug fixes

**Total Estimate**: 15-18 working days to production-ready MVP

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

1. **Mobile App**: Not extracted from zips folder
2. **Bracket Visualization**: Only placeholder UI exists
3. **Admin UI Relations**: Raw ID inputs instead of dropdowns
4. **No Real-Time Updates**: Manual refresh required
5. **No Payment Integration**: Free registration only
6. **No Email Notifications**: Mailpit is for testing only
7. **No File Uploads**: No player photos, tournament logos, etc.
8. **No Audit Trail**: No tracking of who made changes
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
