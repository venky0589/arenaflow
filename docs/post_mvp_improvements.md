# Post-MVP Improvements Roadmap

**Status**: Planning Document
**For Implementation**: After MVP completion
**Estimated Effort**: 30-40 hours total

---

## Overview

This document outlines comprehensive improvements to be implemented **after** the MVP is complete and stable. These improvements will transform the application from MVP to production-grade enterprise quality.

---

## Phase 1: Architecture & Code Quality (10-12 hours)

### 1.1 Domain Model Refinement

**Problem**: Mixed legacy and new fields in entities
**Solution**: Clean up entity relationships

**Changes**:
- **Match Entity Cleanup**
  - Remove legacy `player1`/`player2` `@ManyToOne` fields
  - Use only `participant1RegistrationId`/`participant2RegistrationId`
  - Add `@ManyToOne` relationships to `Registration` entities
  - Migration: Backfill registration IDs from player IDs

- **Registration-Tournament Redundancy**
  - Remove `tournament` field from `Registration` (already via `category.tournament`)
  - Update queries to use `category.tournament` path

**Effort**: 3-4 hours
**Files**: 2 entities, 1 migration, update repositories/services

---

### 1.2 Builder Pattern for Complex Objects

**Problem**: Verbose object creation (especially `Match`)
**Solution**: Introduce Lombok `@Builder`

**Changes**:
```java
// Before
Match m = new Match();
m.setCategoryId(category.getId());
m.setRound(r);
m.setPosition(pos);
m.setStatus(MatchStatus.SCHEDULED);
m.setBye(false);

// After
Match m = Match.builder()
    .categoryId(category.getId())
    .round(r)
    .position(pos)
    .status(MatchStatus.SCHEDULED)
    .bye(false)
    .build();
```

**Effort**: 2 hours
**Files**: Add Lombok dependency, update 5-7 entities

---

### 1.3 API Versioning Strategy

**Problem**: Future API changes may break clients
**Solution**: Implement versioning from the start

**Options**:
1. **URL Versioning** (Recommended)
   ```java
   @RequestMapping("/api/v1/tournaments")
   @RequestMapping("/api/v2/tournaments") // Future
   ```

2. **Header Versioning**
   ```java
   @GetMapping(headers = "API-Version=1")
   ```

**Effort**: 1 hour (add structure, no functional changes yet)
**Files**: Update all controllers with explicit `/v1/`

---

### 1.4 Caching Layer

**Problem**: Repeated database queries for static data
**Solution**: Spring Cache with Redis

**Implementation**:
```java
@Cacheable(value = "tournaments", key = "#id")
public Tournament findById(Long id) { ... }

@CacheEvict(value = "tournaments", key = "#id")
public void delete(Long id) { ... }
```

**Cache Strategies**:
- **Tournaments**: Cache for 5 minutes (semi-static)
- **Categories**: Cache for 10 minutes
- **Brackets**: Cache for 1 minute (dynamic)
- **Players**: Cache for 15 minutes

**Effort**: 3-4 hours
**Files**: Add Redis dependency, cache config, update 5 services

---

### 1.5 Async Processing for Large Operations

**Problem**: Large bracket generation (128+ players) blocks request thread
**Solution**: `@Async` processing with CompletableFuture

**Implementation**:
```java
@Service
public class AsyncBracketService {

    @Async
    public CompletableFuture<BracketSummary> generateBracketAsync(Long categoryId) {
        BracketSummary summary = bracketService.generateSingleElimination(...);
        return CompletableFuture.completedFuture(summary);
    }
}
```

**Polling Endpoint**:
```java
GET /api/v1/categories/{id}/bracket/status
→ { "status": "GENERATING|COMPLETED|FAILED", "progress": 75 }
```

**Effort**: 2-3 hours
**Files**: Async config, async service wrapper, status endpoint

---

## Phase 2: Performance & Scalability (8-10 hours)

### 2.1 Database Query Optimization

**Problem**: N+1 queries, missing indexes
**Solution**: Query optimization + indexes

**Changes**:
1. **Add `@EntityGraph` for eager loading**
   ```java
   @EntityGraph(attributePaths = {"category", "tournament"})
   List<Match> findByCategoryId(Long categoryId);
   ```

2. **Add composite indexes**
   ```sql
   CREATE INDEX idx_match_category_status ON matches(category_id, status);
   CREATE INDEX idx_registration_category_player ON registration(category_id, player_id);
   ```

3. **Add database-level constraints**
   ```sql
   ALTER TABLE matches ADD CONSTRAINT chk_round_positive CHECK (round > 0);
   ALTER TABLE matches ADD CONSTRAINT chk_position_non_negative CHECK (position >= 0);
   ```

**Effort**: 3-4 hours
**Files**: 1 migration, update 3 repositories

---

### 2.2 Pagination Consistency

**Problem**: Some endpoints lack pagination
**Solution**: Paginate all list endpoints

**Standard Pattern**:
```java
@GetMapping
public Page<TournamentResponse> findAll(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "id,desc") String[] sort) {

    Pageable pageable = PageRequest.of(page, size, Sort.by(orders));
    return service.findAll(pageable).map(mapper::toResponse);
}
```

**Effort**: 2 hours
**Files**: Update 5 controllers

---

### 2.3 Connection Pooling Optimization

**Problem**: Default HikariCP settings may not be optimal
**Solution**: Tune connection pool

**Configuration**:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

**Effort**: 1 hour
**Files**: application.yml, load testing to validate

---

### 2.4 Response Compression

**Problem**: Large bracket responses (128 players = ~1.5MB JSON)
**Solution**: Enable GZip compression

**Configuration**:
```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain
    min-response-size: 1024
```

**Effort**: 30 minutes
**Files**: application.yml

---

### 2.5 Database Read Replicas

**Problem**: Read queries compete with writes
**Solution**: Read replica routing (optional, for scale)

**Implementation**:
```java
@Transactional(readOnly = true)
public List<Tournament> findAll() {
    // Routes to read replica
}
```

**Effort**: 2-3 hours (if needed)
**Files**: DataSource config, routing logic

---

## Phase 3: Observability & Operations (6-8 hours)

### 3.1 Structured Logging

**Problem**: Unstructured log messages, hard to query
**Solution**: Structured logging with Logback + JSON

**Configuration**:
```xml
<encoder class="net.logstash.logback.encoder.LogstashEncoder">
  <customFields>{"app":"tournament-backend","env":"${ENVIRONMENT}"}</customFields>
</encoder>
```

**Log Format**:
```json
{
  "timestamp": "2025-10-19T12:00:00Z",
  "level": "INFO",
  "logger": "BracketService",
  "message": "Bracket generated",
  "context": {
    "categoryId": 11,
    "participants": 8,
    "rounds": 3,
    "byesAdvanced": 0,
    "durationMs": 127
  }
}
```

**Effort**: 2 hours
**Files**: logback-spring.xml, update log statements

---

### 3.2 Metrics & Monitoring

**Problem**: No visibility into application health
**Solution**: Spring Boot Actuator + Micrometer + Prometheus

**Metrics to Track**:
- Bracket generation time (histogram)
- Active tournaments (gauge)
- Match status distribution (gauge)
- API response times (timer)
- Database connection pool usage (gauge)
- Error rates by endpoint (counter)

**Endpoints**:
```
GET /actuator/health
GET /actuator/metrics
GET /actuator/prometheus
```

**Effort**: 2-3 hours
**Files**: Add dependencies, configure actuator, custom metrics

---

### 3.3 Distributed Tracing

**Problem**: Hard to debug multi-service calls
**Solution**: Spring Cloud Sleuth + Zipkin (if microservices later)

**Implementation**:
```yaml
spring:
  sleuth:
    sampler:
      probability: 1.0  # 100% sampling in dev/staging
  zipkin:
    base-url: http://localhost:9411
```

**Effort**: 2 hours (optional, for future)
**Files**: Dependencies, config

---

### 3.4 Health Checks

**Problem**: No way to verify app readiness
**Solution**: Custom health indicators

**Implementation**:
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        try {
            // Check DB connection
            repository.count();
            return Health.up().withDetail("database", "PostgreSQL").build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

**Effort**: 1 hour
**Files**: 2-3 custom health indicators

---

## Phase 4: Security Hardening (6-8 hours)

### 4.1 Rate Limiting

**Problem**: API abuse, DoS attacks
**Solution**: Bucket4j rate limiter

**Implementation**:
```java
@GetMapping
@RateLimiter(name = "api", fallbackMethod = "rateLimitFallback")
public ResponseEntity<List<Tournament>> findAll() { ... }
```

**Limits**:
- Public endpoints: 100 req/min per IP
- Authenticated: 1000 req/min per user
- Admin: Unlimited

**Effort**: 2-3 hours
**Files**: Dependency, config, filter/interceptor

---

### 4.2 Input Sanitization

**Problem**: XSS, SQL injection risks
**Solution**: OWASP Java Encoder + parameterized queries

**Implementation**:
```java
String sanitized = Encode.forHtml(userInput);
```

**Effort**: 2 hours
**Files**: Utility class, update DTOs with sanitization

---

### 4.3 Audit Trail

**Problem**: No record of who changed what
**Solution**: Enhance JPA auditing + audit log table

**Implementation**:
```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {
    String entityType;
    Long entityId;
    String action; // CREATE, UPDATE, DELETE
    String changedBy;
    LocalDateTime changedAt;
    String changeDetails; // JSON diff
}
```

**Effort**: 2-3 hours
**Files**: Audit entity, listener, migration

---

### 4.4 Secrets Management

**Problem**: JWT secret hardcoded in config
**Solution**: Externalize secrets (Vault, AWS Secrets Manager, or env vars)

**Implementation**:
```yaml
app:
  jwt:
    secret: ${JWT_SECRET:fallback-dev-secret}
```

**Effort**: 1 hour
**Files**: application.yml, deployment docs

---

## Phase 5: Testing & Quality (6-8 hours)

### 5.1 Contract Testing

**Problem**: API changes break frontend
**Solution**: Spring Cloud Contract

**Implementation**:
```groovy
Contract.make {
    request {
        method 'GET'
        url '/api/v1/tournaments/1'
    }
    response {
        status 200
        body([
            id: 1,
            name: "Test Tournament"
        ])
    }
}
```

**Effort**: 3-4 hours
**Files**: Contract definitions, test setup

---

### 5.2 Load Testing

**Problem**: Unknown performance limits
**Solution**: JMeter or Gatling tests

**Scenarios**:
- 100 concurrent users browsing tournaments
- 50 concurrent bracket generations
- 1000 match score updates/min

**Effort**: 2-3 hours
**Files**: Test scripts, results analysis

---

### 5.3 Mutation Testing

**Problem**: Tests may not catch all bugs
**Solution**: PIT mutation testing

**Configuration**:
```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
</plugin>
```

**Effort**: 1 hour (setup + fix weak tests)
**Files**: pom.xml, improve test coverage

---

## Phase 6: Developer Experience (4-6 hours)

### 6.1 API Documentation Enhancement

**Problem**: Basic Swagger docs
**Solution**: Rich OpenAPI with examples

**Implementation**:
```java
@Operation(
    summary = "Generate bracket",
    description = "Creates single-elimination bracket with optional seeds",
    requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(
            examples = @ExampleObject(
                name = "8-player seeded",
                value = "{\"seeds\":[{\"registrationId\":1,\"seedNumber\":1}]}"
            )
        )
    )
)
```

**Effort**: 2 hours
**Files**: Update all controllers with rich annotations

---

### 6.2 Database Seeding Script

**Problem**: Manual test data setup
**Solution**: Flyway callback for dev data

**Implementation**:
```sql
-- afterMigrate.sql (only in dev profile)
INSERT INTO tournament (...) VALUES (...);
INSERT INTO category (...) VALUES (...);
-- etc.
```

**Effort**: 1-2 hours
**Files**: Seed script, profile config

---

### 6.3 Docker Compose for Full Stack

**Problem**: Manual service startup
**Solution**: docker-compose with all services

**Services**:
- PostgreSQL
- Backend API
- Admin UI
- User UI
- Redis (cache)
- Prometheus (metrics)
- Grafana (dashboards)

**Effort**: 1-2 hours
**Files**: docker-compose.yml, Dockerfiles

---

## Implementation Priority Matrix

| Phase | Priority | Complexity | Impact | When |
|-------|----------|------------|--------|------|
| 1.1 Domain Model Cleanup | High | Medium | High | Week 1-2 post-MVP |
| 1.4 Caching | High | Low | High | Week 1-2 post-MVP |
| 2.1 Query Optimization | High | Medium | High | Week 2-3 post-MVP |
| 4.1 Rate Limiting | High | Low | Medium | Week 2-3 post-MVP |
| 4.3 Audit Trail | High | Medium | High | Week 3-4 post-MVP |
| 3.2 Metrics | Medium | Low | High | Week 4-5 post-MVP |
| 1.2 Builder Pattern | Low | Low | Low | Anytime |
| 5.2 Load Testing | Medium | Medium | Medium | Before production |
| 6.3 Docker Compose | Low | Low | High | Anytime |

---

## Estimated Total Effort

**Total**: 30-40 hours across 6 phases

- **Week 1-2**: Architecture cleanup (Phase 1) - 10-12 hours
- **Week 3-4**: Performance & Security (Phases 2, 4) - 14-18 hours
- **Week 5-6**: Observability & Testing (Phases 3, 5) - 12-16 hours
- **Anytime**: Developer Experience (Phase 6) - 4-6 hours

---

## Success Metrics

After completing post-MVP improvements:

✅ **Performance**
- P95 API response time < 200ms
- Bracket generation (16 players) < 100ms
- Database connection pool utilization < 70%

✅ **Reliability**
- Uptime > 99.9%
- Error rate < 0.1%
- Zero data loss incidents

✅ **Security**
- No critical vulnerabilities (SonarQube, Snyk)
- All secrets externalized
- Audit log coverage 100%

✅ **Maintainability**
- Test coverage > 85%
- Mutation score > 75%
- Tech debt ratio < 5%

✅ **Observability**
- All critical operations logged
- Metrics exported to Prometheus
- Alert rules configured

---

## Conclusion

This roadmap provides a clear path from MVP to production-grade enterprise application. Prioritize based on immediate needs, but aim to complete all phases before scaling to larger tournaments.

**Next Steps**:
1. Complete MVP features
2. Stabilize and bug-fix
3. Begin Phase 1 (architecture cleanup)
4. Implement remaining phases iteratively
