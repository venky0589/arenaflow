# Backend - AI Context (Spring Boot)

**Component**: Tournament Management Backend API
**Framework**: Spring Boot 3.3.2 + Maven
**Java Version**: 17
**Database**: PostgreSQL 16

---

## 🚧 Active Refactoring (In Progress)

**Status**: Systematic backend improvements underway
**Started**: 2025-10-18
**See**: [Backend Refactoring Plan](../docs/backend_refactoring_plan.md)

### Current Phase
⏳ **Preparation** - Creating planning documents

### Quick Status
- ✅ Detailed refactoring plan created
- ⏳ Updating context documentation
- ⏳ Initial git commit pending
- ⏳ Phase 1-7 pending

### Phase Overview
1. **Service Layer** - Add missing service layer (fixes hacky updates)
2. **DTOs & Mappers** - Decouple API from domain model
3. **Exception Handling** - Centralized error handling
4. **Validation** - Enhanced input validation
5. **Security** - RBAC with @PreAuthorize
6. **Database** - Indexes and constraints
7. **Additional** - Pagination, audit, logging, tests

For detailed implementation plan, see [backend_refactoring_plan.md](../docs/backend_refactoring_plan.md)

---

## Quick Reference

### Start Backend
```bash
# 1. Start PostgreSQL + Mailpit
docker compose up -d

# 2. Run Spring Boot
mvn spring-boot:run

# Access:
# - API: http://localhost:8080
# - Swagger: http://localhost:8080/swagger-ui/index.html
# - Database: localhost:5432 (tournament/tournament/tournament)
# - Mailpit: http://localhost:8025
```

### Default Credentials
- **Admin User**: `admin@example.com` / `admin123`
- **Database**: `tournament` / `tournament` / `tournament` (user/password/database)

---

## Project Structure

```
backend/
├── src/main/java/com/example/tournament/
│   ├── Application.java           # Spring Boot entry point
│   │
│   ├── domain/                    # JPA Entities (8 files)
│   │   ├── UserAccount.java       # Authentication user
│   │   ├── Role.java              # Enum: ADMIN, USER, REFEREE
│   │   ├── Tournament.java        # Tournament metadata
│   │   ├── Player.java            # Player profiles
│   │   ├── Court.java             # Court management
│   │   ├── Match.java             # Match details & scores
│   │   ├── MatchStatus.java       # Enum: SCHEDULED, IN_PROGRESS, COMPLETED
│   │   ├── Registration.java      # Player tournament registrations
│   │   └── CategoryType.java      # Enum: SINGLES, DOUBLES
│   │
│   ├── repo/                      # Spring Data JPA Repositories (6 files)
│   │   ├── UserAccountRepository.java
│   │   ├── TournamentRepository.java
│   │   ├── PlayerRepository.java
│   │   ├── CourtRepository.java
│   │   ├── MatchRepository.java
│   │   └── RegistrationRepository.java
│   │
│   ├── web/                       # REST Controllers (6 files)
│   │   ├── AuthController.java    # /api/v1/auth/* (login, register)
│   │   ├── TournamentController.java  # /tournaments (CRUD)
│   │   ├── PlayerController.java      # /players (CRUD)
│   │   ├── CourtController.java       # /courts (CRUD)
│   │   ├── MatchController.java       # /matches (CRUD)
│   │   ├── RegistrationController.java # /registrations (CRUD)
│   │   └── dto/                   # Request/Response DTOs
│   │       ├── LoginRequest.java
│   │       └── RegisterRequest.java
│   │
│   ├── security/                  # JWT & Spring Security (3 files)
│   │   ├── JwtUtil.java           # Token generation & validation
│   │   ├── JwtAuthFilter.java     # Request filter for JWT
│   │   └── UserDetailsServiceImpl.java  # Spring Security user loader
│   │
│   └── config/                    # Configuration (1 file)
│       └── SecurityConfig.java    # Spring Security configuration
│
├── src/main/resources/
│   ├── application.yml            # App configuration (DB, JWT, server)
│   ├── data.sql                   # Seed data (tournaments, players, admin user)
│   └── db/migration/              # Flyway migrations
│       └── V1__init.sql           # Initial schema
│
├── src/test/java/                 # Tests (minimal currently)
│
├── docker-compose.yml             # PostgreSQL + Mailpit
├── pom.xml                        # Maven dependencies
├── postman_collection.json        # API testing collection
└── README.md                      # Quick start guide
```

**Total Java Files**: 28 (8 entities, 6 repos, 6 controllers, 3 security, 2 DTOs, 1 config, 1 main, 1 enums)

---

## Architecture

### Current Pattern (Incomplete MVC)
```
Client → Controller → Repository → Database
                         ↑
                    (❌ Missing Service Layer)
```

**Problem**: Business logic is in controllers, violating separation of concerns.

### Recommended Pattern
```
Client → Controller → Service → Repository → Database
```

**Example Refactor Needed**:
```java
// ❌ Current (bad)
@RestController
public class TournamentController {
    private final TournamentRepository repo;

    @GetMapping
    public List<Tournament> all() {
        return repo.findAll(); // Direct repository access
    }
}

// ✅ Recommended (good)
@RestController
public class TournamentController {
    private final TournamentService service;

    @GetMapping
    public List<Tournament> all() {
        return service.getAllTournaments(); // Service layer handles logic
    }
}
```

---

## Domain Model

### Entity Relationships

```
UserAccount (users table)
  └─ Set<Role> roles (ADMIN, USER, REFEREE)

Tournament
  ├─ Many → Registration
  └─ Many → Match

Player
  └─ Many → Registration

Court
  └─ Many → Match

Match
  ├─ Many-to-One → Tournament
  ├─ Many-to-One → Court
  ├─ Many-to-One → Player (player1)
  ├─ Many-to-One → Player (player2)
  └─ MatchStatus (SCHEDULED, IN_PROGRESS, COMPLETED)

Registration
  ├─ Many-to-One → Tournament
  ├─ Many-to-One → Player
  └─ CategoryType (SINGLES, DOUBLES)
```

### Entity Details

#### 1. UserAccount (users table)
```java
@Entity
@Table(name = "users")
public class UserAccount {
    Long id;
    String email;              // Unique, used for login
    String passwordHash;       // BCrypt encoded
    Set<Role> roles;           // ADMIN, USER, REFEREE
    Boolean enabled;           // Default: true
}
```

#### 2. Tournament
```java
@Entity
public class Tournament {
    Long id;
    @NotBlank String name;
    String location;
    LocalDate startDate;
    LocalDate endDate;
}
```

#### 3. Player
```java
@Entity
public class Player {
    Long id;
    @NotBlank String firstName;
    @NotBlank String lastName;
    String gender;             // M/F
    String phone;
}
```

#### 4. Court
```java
@Entity
public class Court {
    Long id;
    @NotBlank String name;     // Unique
    String locationNote;
}
```

#### 5. Match
```java
@Entity
@Table(name = "matches")
public class Match {
    Long id;
    @ManyToOne(optional = false) Tournament tournament;
    @ManyToOne Court court;
    @ManyToOne Player player1;
    @ManyToOne Player player2;
    Integer score1;
    Integer score2;
    @Enumerated(EnumType.STRING) MatchStatus status;  // Default: SCHEDULED
    LocalDateTime scheduledAt;
}
```

#### 6. Registration
```java
@Entity
public class Registration {
    Long id;
    @ManyToOne(optional = false) Tournament tournament;
    @ManyToOne(optional = false) Player player;
    @Enumerated(EnumType.STRING) CategoryType categoryType;  // SINGLES, DOUBLES
}
```

#### 7. Enums
```java
enum Role { ADMIN, USER, REFEREE }
enum MatchStatus { SCHEDULED, IN_PROGRESS, COMPLETED }
enum CategoryType { SINGLES, DOUBLES }
```

---

## API Endpoints

### Authentication (✅ Uses /api/v1/ prefix)

#### POST /api/v1/auth/register
**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: `200 OK`
```json
{
  "message": "registered"
}
```
**Notes**: Automatically assigns `USER` role

#### POST /api/v1/auth/login
**Request**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
**Notes**: Token valid for 3 days (259200000ms)

### CRUD Endpoints (❌ Missing /api/v1/ prefix - inconsistency!)

All CRUD controllers support standard operations:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/{resource}` | List all |
| GET | `/{resource}/{id}` | Get by ID |
| POST | `/{resource}` | Create new |
| PUT | `/{resource}/{id}` | Update existing |
| DELETE | `/{resource}/{id}` | Delete by ID |

**Resources**: `tournaments`, `players`, `courts`, `matches`, `registrations`

#### Example: Tournament CRUD

**GET /tournaments** - List all tournaments
```json
[
  {
    "id": 1,
    "name": "City Open",
    "location": "Hyderabad",
    "startDate": "2025-10-01",
    "endDate": "2025-10-05"
  }
]
```

**GET /tournaments/1** - Get tournament by ID

**POST /tournaments** - Create tournament
```json
{
  "name": "Summer Cup",
  "location": "Mumbai",
  "startDate": "2025-08-15",
  "endDate": "2025-08-20"
}
```

**PUT /tournaments/1** - Update tournament
```json
{
  "name": "City Open 2025",
  "location": "Hyderabad",
  "startDate": "2025-10-01",
  "endDate": "2025-10-05"
}
```

**DELETE /tournaments/1** - Delete tournament
- Returns: `204 No Content`

---

## Security Implementation

### JWT Configuration

**File**: `application.yml`
```yaml
app:
  jwt:
    secret: "change-me-please-change-me-please-change-me-change"
    validity-ms: 259200000  # 3 days
```

⚠️ **Security Issue**: JWT secret is hardcoded in plain text. Should be environment variable in production.

### JWT Flow

1. **Login**: User submits email/password
2. **Authentication**: Spring Security validates credentials
3. **Token Generation**: `JwtUtil.createToken(email, claims)` creates JWT
4. **Token Storage**: Frontend stores in localStorage
5. **Authenticated Requests**: Frontend sends `Authorization: Bearer <token>` header
6. **Token Validation**: `JwtAuthFilter` intercepts requests, validates token
7. **User Loading**: `UserDetailsServiceImpl` loads user details

### Security Configuration

**File**: `config/SecurityConfig.java`

Key configurations:
- JWT filter added before `UsernamePasswordAuthenticationFilter`
- Password encoder: BCrypt
- Public endpoints: `/api/v1/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- All other endpoints require authentication

### Password Encoding

Uses BCrypt with default strength (10 rounds):
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

---

## Database Configuration

### application.yml (⚠️ MISMATCH ISSUE)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sports_app
    username: postgres
    password: 123456
```

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: tournament
      POSTGRES_USER: tournament
      POSTGRES_PASSWORD: tournament
```

### ❌ CRITICAL ISSUE: Configuration Mismatch

**Problem**: `application.yml` expects database `sports_app` but Docker provides `tournament`.

**Solutions**:
1. **Option A** (Recommended): Update `application.yml`:
   ```yaml
   url: jdbc:postgresql://localhost:5432/tournament
   username: tournament
   password: tournament
   ```

2. **Option B**: Update `docker-compose.yml`:
   ```yaml
   POSTGRES_DB: sports_app
   POSTGRES_USER: postgres
   POSTGRES_PASSWORD: 123456
   ```

### Flyway Migrations

**Directory**: `src/main/resources/db/migration/`

**Current Migration**: `V1__init.sql`
- Creates 7 tables (users, user_account_roles, tournament, player, court, matches, registration)
- Adds foreign key constraints
- No indexes defined (performance concern)

**Adding New Migration**:
1. Create file: `V2__description.sql` (version must increment)
2. Write SQL (CREATE, ALTER, INSERT, etc.)
3. Restart app (Flyway runs automatically)

**Flyway Config**:
```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true  # Allows migrations on existing DB
```

### Seed Data

**File**: `src/main/resources/data.sql`

Automatically loaded on startup:
- 2 tournaments (City Open, Winter Cup)
- 4 players (Saina, Sindhu, Srikanth, Lakshya)
- 2 courts (Court 1, Court 2)
- 1 admin user (admin@example.com / admin123)

---

## Known Issues & Technical Debt

### 1. Hacky Update Implementation

**Problem**: Controllers use reflection to set IDs during updates.

**Example** (`TournamentController.java:39`):
```java
@PutMapping("/{id}")
public ResponseEntity<Tournament> update(@PathVariable Long id, @RequestBody Tournament body) {
    return repo.findById(id).map(existing -> {
        try {
            var idField = Tournament.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(body, id);  // ❌ Hacky reflection to set private field
        } catch (Exception ignored) {}
        return ResponseEntity.ok(repo.save(body));
    }).orElse(ResponseEntity.notFound().build());
}
```

**Fix**: Proper service layer with update methods:
```java
// In TournamentService
public Tournament updateTournament(Long id, TournamentDTO dto) {
    Tournament existing = repo.findById(id)
        .orElseThrow(() -> new NotFoundException("Tournament not found"));
    existing.setName(dto.getName());
    existing.setLocation(dto.getLocation());
    existing.setStartDate(dto.getStartDate());
    existing.setEndDate(dto.getEndDate());
    return repo.save(existing);
}
```

### 2. No Service Layer

**Impact**:
- Business logic mixed with controllers
- Hard to test
- Difficult to reuse logic
- Violates single responsibility principle

**Fix**: Create service layer:
- `service/TournamentService.java`
- `service/PlayerService.java`
- `service/MatchService.java`
- `service/RegistrationService.java`
- `service/BracketService.java` (for draw generation)
- `service/SchedulingService.java` (for match scheduling)

### 3. No DTOs (Entities Exposed Directly)

**Problem**: JPA entities are used as request/response objects.

**Issues**:
- Exposes internal structure
- No control over serialization
- Lazy loading issues
- Security risks (mass assignment)

**Fix**: Create DTO layer:
```java
// TournamentDTO.java
public class TournamentDTO {
    private Long id;
    private String name;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    // Getters, setters, constructors
}
```

Use MapStruct or ModelMapper for entity-DTO conversion.

### 4. API Endpoint Inconsistency

**Problem**: AuthController uses `/api/v1/` prefix, others don't.

**Current**:
- `/api/v1/auth/login` ✅
- `/tournaments` ❌
- `/players` ❌

**Fix**: Add to all controllers:
```java
@RestController
@RequestMapping("/api/v1/tournaments")  // Add this
public class TournamentController { ... }
```

### 5. No Role-Based Authorization

**Problem**: `@PreAuthorize` annotations missing from endpoints.

**Current**: All authenticated users can access all endpoints.

**Fix**: Add role checks:
```java
@PreAuthorize("hasRole('ADMIN')")
@PostMapping
public ResponseEntity<Tournament> create(@RequestBody Tournament body) { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'REFEREE')")
@PutMapping("/{id}/score")
public ResponseEntity<Match> updateScore(...) { ... }
```

### 6. Limited Validation

**Current**: Only `@NotBlank` on some fields.

**Missing**:
- Email validation
- Password complexity rules
- Date range validation (startDate < endDate)
- Phone number format
- Score validation (non-negative)

**Fix**: Add validation annotations:
```java
public class Player {
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @Pattern(regexp = "^[MF]$", message = "Gender must be M or F")
    private String gender;

    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String phone;
}
```

### 7. No Error Handling

**Problem**: No global exception handler.

**Result**: Ugly error responses, stack traces exposed to clients.

**Fix**: Create `@ControllerAdvice`:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
```

### 8. No Pagination

**Problem**: `findAll()` returns all records (performance issue for large datasets).

**Fix**: Use `PagingAndSortingRepository`:
```java
@GetMapping
public Page<Tournament> all(Pageable pageable) {
    return repo.findAll(pageable);
}
```

### 9. Missing Indexes

**Problem**: No database indexes defined (queries will be slow as data grows).

**Fix**: Add indexes in migration:
```sql
CREATE INDEX idx_match_tournament ON matches(tournament_id);
CREATE INDEX idx_match_court ON matches(court_id);
CREATE INDEX idx_registration_tournament ON registration(tournament_id);
CREATE INDEX idx_registration_player ON registration(player_id);
```

### 10. Hardcoded JWT Secret

**Problem**: JWT secret in `application.yml` (security risk).

**Fix**: Use environment variable:
```yaml
app:
  jwt:
    secret: ${JWT_SECRET}
```

---

## Dependencies (pom.xml)

### Core Dependencies
- `spring-boot-starter-web` - REST API support
- `spring-boot-starter-security` - Authentication/authorization
- `spring-boot-starter-validation` - Bean validation
- `spring-boot-starter-data-jpa` - Database access

### Security
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (v0.11.5) - JWT handling

### Database
- `postgresql` - PostgreSQL driver
- `flyway-core` (v9.22.3) - Database migrations
- `h2` (test scope) - In-memory DB for tests

### Documentation
- `springdoc-openapi-starter-webmvc-ui` (v2.6.0) - Swagger UI

### Testing
- `spring-boot-starter-test` - JUnit 5, Mockito, etc.

---

## Testing

### Current State
- Test directory exists but minimal tests
- H2 configured for test scope
- No service layer tests (because no services exist)
- No integration tests

### Recommended Testing Strategy

**Unit Tests** (Target: 70%+ coverage):
```java
@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {
    @Mock
    private TournamentRepository repo;

    @InjectMocks
    private TournamentService service;

    @Test
    void shouldCreateTournament() {
        // Test business logic
    }
}
```

**Integration Tests** (with Testcontainers):
```java
@SpringBootTest
@Testcontainers
class TournamentControllerIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void shouldCreateTournamentViaAPI() {
        // Test full request/response cycle
    }
}
```

**Repository Tests**:
```java
@DataJpaTest
class TournamentRepositoryTest {
    @Autowired
    private TournamentRepository repo;

    @Test
    void shouldFindTournamentsByLocation() {
        // Test custom queries
    }
}
```

---

## Common Development Tasks

### Adding a New Entity

1. **Create Entity**:
   ```java
   // src/main/java/com/example/tournament/domain/Category.java
   @Entity
   public class Category {
       @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       private String name;
       // getters, setters
   }
   ```

2. **Create Repository**:
   ```java
   // src/main/java/com/example/tournament/repo/CategoryRepository.java
   public interface CategoryRepository extends JpaRepository<Category, Long> {
   }
   ```

3. **Create Controller**:
   ```java
   // src/main/java/com/example/tournament/web/CategoryController.java
   @RestController
   @RequestMapping("/api/v1/categories")
   public class CategoryController {
       private final CategoryRepository repo;
       // CRUD methods
   }
   ```

4. **Create Migration**:
   ```sql
   -- src/main/resources/db/migration/V2__add_category.sql
   CREATE TABLE category (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL
   );
   ```

5. **Restart Application** (Flyway runs migration automatically)

### Adding a New API Endpoint

```java
@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    // Add custom endpoint
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public List<Tournament> getUpcoming() {
        LocalDate today = LocalDate.now();
        return repo.findByStartDateAfter(today);  // Add to repository
    }
}
```

### Adding Custom Repository Query

```java
public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    // Method name query
    List<Tournament> findByStartDateAfter(LocalDate date);

    // JPQL query
    @Query("SELECT t FROM Tournament t WHERE t.location = ?1 AND t.startDate >= ?2")
    List<Tournament> findByLocationAndStartDateAfter(String location, LocalDate date);

    // Native query
    @Query(value = "SELECT * FROM tournament WHERE EXTRACT(YEAR FROM start_date) = ?1", nativeQuery = true)
    List<Tournament> findByYear(int year);
}
```

### Updating Database Schema

1. **Create Migration**:
   ```sql
   -- V3__add_checkin_to_registration.sql
   ALTER TABLE registration
   ADD COLUMN checked_in BOOLEAN DEFAULT FALSE,
   ADD COLUMN checked_in_at TIMESTAMP;
   ```

2. **Update Entity**:
   ```java
   @Entity
   public class Registration {
       // existing fields...

       private Boolean checkedIn = false;
       private LocalDateTime checkedInAt;

       // getters, setters
   }
   ```

3. **Restart Application**

---

## Debugging Tips

### View SQL Queries

Add to `application.yml`:
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate.format_sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### Access Database Directly

```bash
# Via Docker
docker exec -it sports-app-postgres-1 psql -U tournament -d tournament

# List tables
\dt

# Query data
SELECT * FROM tournament;
```

### Test JWT Token

```bash
# 1. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Copy token from response

# 3. Use token in authenticated request
curl http://localhost:8080/tournaments \
  -H 'Authorization: Bearer <paste-token-here>'
```

### Check Flyway Migration Status

```bash
# Query flyway_schema_history table
docker exec -it sports-app-postgres-1 psql -U tournament -d tournament \
  -c "SELECT * FROM flyway_schema_history;"
```

---

## Performance Optimization Checklist

- [ ] Add database indexes on foreign keys
- [ ] Implement pagination for list endpoints
- [ ] Add caching for tournament data (Redis)
- [ ] Use `@EntityGraph` to prevent N+1 queries
- [ ] Enable connection pooling (HikariCP - already default)
- [ ] Add query optimization for complex joins
- [ ] Implement lazy loading where appropriate
- [ ] Use DTOs to control serialization depth
- [ ] Add API response compression

---

## Security Hardening Checklist

- [ ] Move JWT secret to environment variable
- [ ] Add rate limiting on auth endpoints (Spring Boot Rate Limiter)
- [ ] Implement password complexity validation
- [ ] Add account lockout after failed login attempts
- [ ] Implement secure password reset flow
- [ ] Add CSRF protection for state-changing operations
- [ ] Enable HTTPS in production
- [ ] Add audit logging for sensitive operations
- [ ] Implement refresh token rotation
- [ ] Add request input sanitization

---

## Useful Commands

```bash
# Build project
mvn clean package

# Run tests
mvn test

# Run specific test
mvn test -Dtest=TournamentControllerTest

# Skip tests during build
mvn clean package -DskipTests

# Generate dependency tree
mvn dependency:tree

# Clean Docker volumes (reset database)
docker compose down -v

# View logs
docker compose logs -f postgres
docker compose logs -f mailpit

# Build Docker image (when Dockerfile is created)
docker build -t tournament-backend .
```

---

## Environment Variables for Production

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-host:5432/tournament_prod
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=strong_password_here

# JWT
JWT_SECRET=very-long-random-secret-at-least-256-bits

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Flyway
SPRING_FLYWAY_ENABLED=true
```

---

## Next Implementation Priorities

### 1. Add Service Layer (2-3 days)
Create services for all entities to separate business logic from controllers.

### 2. Implement Bracket Generation (5-7 days)
- `BracketService.generateDraw(tournamentId, categoryType)`
- Seeding algorithm
- Match pairing logic
- Winner advancement

### 3. Add Match Scheduling (3-4 days)
- `SchedulingService.scheduleTournament(tournamentId)`
- Court assignment algorithm
- Conflict detection
- Time slot management

### 4. Implement RBAC (3-4 days)
- Add `@PreAuthorize` annotations
- Update login response to include role
- Secure all endpoints appropriately

### 5. Add Check-In API (1-2 days)
- Migration to add `checkedIn` field
- `POST /api/v1/registrations/{id}/check-in`
- Check-in time window validation

---

## Related Documentation

- **Main Project Context**: [../CLAUDE.md](../CLAUDE.md)
- **Admin UI Context**: [../admin-ui/CLAUDE.md](../admin-ui/CLAUDE.md)
- **User UI Context**: [../user-ui/CLAUDE.md](../user-ui/CLAUDE.md)
- **Project Brief**: [../docs/tournament_project_brief.txt](../docs/tournament_project_brief.txt)

---

## AI Assistant Guidelines for Backend

1. **Always create service layer** - Don't put business logic in controllers
2. **Use DTOs** - Don't expose entities directly
3. **Add validation** - Use Bean Validation annotations
4. **Write tests** - Aim for 70%+ coverage
5. **Use proper HTTP methods** - GET (read), POST (create), PUT (update), DELETE (delete)
6. **Return appropriate status codes** - 200 (OK), 201 (Created), 204 (No Content), 404 (Not Found)
7. **Handle exceptions** - Create global exception handler
8. **Add logging** - Use SLF4J for important operations
9. **Document APIs** - Add OpenAPI annotations
10. **Consider security** - Always check authorization before operations

---

**For Questions**: See main project context at [../CLAUDE.md](../CLAUDE.md)
