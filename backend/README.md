# Badminton Tournament Manager — Backend (Spring Boot, Maven)

Requirements: **Java 17+**, **Maven 3.9+**, **Docker**

## Quick start (Dev)
1. Start DB:
   ```bash
   docker compose up -d
   ```

2. Run app:
   ```bash
   mvn spring-boot:run
   ```

3. Swagger UI: http://localhost:8080/swagger-ui/index.html

## Auth
- Default admin: `admin@example.com` / `admin123` (seeded)
- Endpoints:
  - `POST /auth/register` { email, password }
  - `POST /auth/login` { email, password } -> `{ token }`
- Use returned token in `Authorization: Bearer <token>` for protected endpoints.

## Entities & Endpoints (CRUD)
- `/tournaments`
- `/players`
- `/courts`
- `/registrations`
- `/matches`

## Database
- Postgres via Docker Compose (`tournament` / `tournament` user & DB)
- Flyway migrations under `src/main/resources/db/migration`
- Sample seed data in `data.sql`

## Testing
- Add tests under `src/test/java` (H2 is on test scope).

## Docker Compose
```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: tournament
      POSTGRES_USER: tournament
      POSTGRES_PASSWORD: tournament
    volumes: ["pgdata:/var/lib/postgresql/data"]
  mailpit:
    image: axllent/mailpit:latest
    ports: ["8025:8025", "1025:1025"]
volumes:
  pgdata: {}
```

> A `docker-compose.yml` file is included at repo root.
