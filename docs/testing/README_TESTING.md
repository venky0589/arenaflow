# Automated E2E Testing Guide

This directory contains automated end-to-end (E2E) test scripts for the Badminton Tournament Manager backend API.

## 📋 Overview

The E2E test suite validates a complete tournament workflow using REST API calls:

1. ✅ Tournament creation
2. ✅ Player and court setup
3. ✅ Category configuration
4. ✅ Player registrations
5. ✅ Draw generation (single elimination)
6. ✅ Match scheduling
7. ✅ Match scoring and status workflow
8. ✅ Winner progression through bracket
9. ✅ Tournament completion and champion determination

## 📁 Files

| File | Purpose |
|------|---------|
| `test_helpers.sh` | Reusable utility functions for HTTP requests, JSON parsing, validation |
| `e2e_tournament_flow.sh` | Main E2E test script - complete tournament lifecycle |
| `README_TESTING.md` | This documentation file |

## 🚀 Prerequisites

### 1. Backend Running

The backend server must be running before executing tests:

```bash
# Terminal 1 - Start backend
cd /home/venky/Development-Personal/sports-app/backend
docker compose up -d  # Start PostgreSQL
mvn spring-boot:run   # Start Spring Boot

# Verify backend is ready
curl http://localhost:8080/actuator/health
```

### 2. Required Tools

- **bash** - Shell interpreter (pre-installed on Linux/macOS)
- **curl** - HTTP client (pre-installed on most systems)
- **date** - Date manipulation (pre-installed)

Optional:
- **jq** - JSON parser for prettier output (not required, but recommended)

```bash
# Install jq (optional)
sudo apt install jq  # Ubuntu/Debian
brew install jq      # macOS
```

### 3. Test User Credentials

The tests use the default admin account:
- **Email**: `admin@example.com`
- **Password**: `password123`

This account should exist in your database (created by seed data).

## 🏃 Running the Tests

### Basic Execution

```bash
cd /home/venky/Development-Personal/sports-app/docs/testing

# Run the full E2E test
./e2e_tournament_flow.sh
```

### Test Modes

#### 1. Debug Mode (Verbose Output)

```bash
DEBUG=1 ./e2e_tournament_flow.sh
```

Shows detailed HTTP requests, responses, and JWT tokens.

#### 2. Continue on Failure

```bash
CONTINUE_ON_FAIL=1 ./e2e_tournament_flow.sh
```

Continues executing tests even if one fails (default: stop on first failure).

#### 3. No Cleanup Mode

```bash
NO_CLEANUP=1 ./e2e_tournament_flow.sh
```

Leaves test data in database for manual inspection after test completes.

#### 4. Custom API URL

```bash
API_BASE=http://localhost:8081 ./e2e_tournament_flow.sh
```

Test against a different backend instance.

#### 5. Combined Modes

```bash
DEBUG=1 NO_CLEANUP=1 ./e2e_tournament_flow.sh
```

## 📊 Expected Output

### Successful Test Run

```
========================================
E2E Test: Complete Tournament Flow
========================================
Backend: http://localhost:8080
Tournament: E2E Test Tournament 20251107_143022
========================================

[INFO] Test helpers loaded successfully

========================================
Step 0: Checking Prerequisites
========================================
[INFO] Waiting for backend to be ready...
[PASS] Backend is ready
[PASS] All prerequisites met
[INFO] Running: Prerequisites Check
[PASS] Prerequisites Check passed

========================================
Step 1: Authentication
========================================
[INFO] Logging in as admin@example.com...
[PASS] Login successful
[PASS] Authentication successful
[INFO] Running: Authentication
[PASS] Authentication passed

========================================
Step 2: Create Tournament
========================================
[INFO] Creating tournament: E2E Test Tournament 20251107_143022
[PASS] Tournament created with ID: 42
[PASS] Verify tournament exists (HTTP 200)
[PASS] Verify tournament name - name=E2E Test Tournament 20251107_143022
[INFO] Running: Create Tournament
[PASS] Create Tournament passed

... [additional test steps] ...

========================================
   TOURNAMENT COMPLETE!
========================================
🏆 Champion: Alice Anderson
🥈 Runner-up: Carol Chen
========================================

========================================
Test Summary
========================================
Total:  13
Passed: 13
Failed: 0
========================================
All tests passed!
```

### Failed Test Example

```
[FAIL] Failed to create tournament
[ERROR] Create Tournament failed
========================================
Test Summary
========================================
Total:  2
Passed: 1
Failed: 1
========================================
Some tests failed!
```

## 🧪 Test Scenarios Covered

### Test Scenario: Complete Single Elimination Tournament

#### Phase 1: Setup
- ✅ Backend health check
- ✅ Admin authentication (JWT token)
- ✅ Tournament creation with dates
- ✅ Court creation (2 courts)
- ✅ Player creation (4 players: Alice, Bob, Carol, David)

#### Phase 2: Configuration
- ✅ Category creation (Mixed Singles, Single Elimination)
- ✅ Player registrations (4 players → 1 category)

#### Phase 3: Draw & Scheduling
- ✅ Draw generation (creates 3 matches: 2 semis + 1 final)
- ✅ Bracket structure validation
- ✅ Auto-scheduler simulation and application

#### Phase 4: Match Execution
- ✅ Semifinal 1: Start → Score (21-15) → Complete
- ✅ Semifinal 2: Start → Score (18-21) → Complete
- ✅ Winner progression validation
- ✅ Final: Start → Score (21-19) → Complete
- ✅ Champion determination

#### Phase 5: Verification
- ✅ Bracket state validation
- ✅ Tournament completion status
- ✅ Cleanup (optional)

## 🔍 Troubleshooting

### Error: "Backend is not running"

**Problem**: Cannot connect to http://localhost:8080

**Solution**:
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# If not running, start it
cd backend
docker compose up -d
mvn spring-boot:run
```

### Error: "Login failed with status 401"

**Problem**: Invalid admin credentials

**Solution**:
1. Verify admin user exists in database:
```sql
SELECT * FROM users WHERE email = 'admin@example.com';
```

2. Reset admin password if needed (via backend API or SQL)

3. Update credentials in test script if you changed them

### Error: "Failed to create player"

**Problem**: Likely a permission issue or database constraint

**Solution**:
```bash
# Run test in debug mode to see full error
DEBUG=1 ./e2e_tournament_flow.sh

# Check backend logs for detailed error messages
```

### Error: "Could not find enough matches for tournament"

**Problem**: Match creation or retrieval failed

**Solution**:
1. Check database for matches:
```sql
SELECT * FROM matches WHERE tournament_id = <your_tournament_id>;
```

2. Verify draw generation succeeded in previous step
3. Run with `DEBUG=1` to see API responses

### Tests Leave Data Behind

**Problem**: Test data remains in database after run

**Solution**:
```bash
# Run with cleanup enabled (default)
./e2e_tournament_flow.sh

# Or manually clean up
# Find tournament ID from test output, then:
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/tournaments/<id>
```

## 📝 Writing Custom Tests

### Using Test Helpers

```bash
#!/bin/bash

# Source the helpers
source "$(dirname $0)/test_helpers.sh"

# Login
login_admin

# Create tournament
TOURNAMENT_ID=$(create_tournament "My Test" "Location" "2025-12-01" "2025-12-05")

# Create player
PLAYER_ID=$(create_player "John" "Doe" "M")

# Make custom HTTP request
response=$(http_get "/api/v1/tournaments/$TOURNAMENT_ID")

# Validate response
assert_status "$response" "200" "Tournament exists"
assert_field_equals "$response" "name" "My Test" "Name matches"

# Cleanup
delete_tournament "$TOURNAMENT_ID"
```

### Available Helper Functions

#### HTTP Requests
- `http_get <url> [use_auth]`
- `http_post <url> <json_data> [use_auth]`
- `http_put <url> <json_data> [use_auth]`
- `http_delete <url> [use_auth]`

#### Response Parsing
- `extract_status <response>` - Get HTTP status code
- `extract_body <response>` - Get JSON body
- `extract_json_field <json> <field_name>` - Extract field value
- `is_success <status>` - Check if status is 2xx

#### Authentication
- `login <email> <password>` - Login and store JWT token
- `login_admin` - Login as default admin

#### Assertions
- `assert_status <response> <expected> <message>`
- `assert_field_exists <response> <field> <message>`
- `assert_field_equals <response> <field> <value> <message>`

#### Data Creation
- `create_tournament <name> <location> <start> <end>` → Returns ID
- `create_player <first> <last> <gender>` → Returns ID
- `create_court <name> <note>` → Returns ID
- `create_category <tournament_id> <name> <type> <format> <gender>` → Returns ID
- `create_registration <tournament_id> <player_id> <category_id>` → Returns ID

#### Cleanup
- `delete_tournament <id>`
- `delete_player <id>`
- `delete_court <id>`

#### Logging
- `log_info <message>` - Blue info message
- `log_success <message>` - Green success message
- `log_error <message>` - Red error message
- `log_warn <message>` - Yellow warning message
- `log_step <message>` - Step header

## 🎯 Test Coverage

### ✅ Covered Features

- Authentication (JWT)
- Tournament CRUD
- Player CRUD
- Court CRUD
- Category CRUD
- Registration CRUD
- Draw generation (single elimination)
- Bracket structure
- Match status workflow (SCHEDULED → IN_PROGRESS → COMPLETED)
- Match scoring
- Winner progression
- Auto-scheduler (simulation & apply)

### ⏳ Not Yet Covered (Potential Extensions)

- Round robin format
- Doubles/team registration
- Check-in system (QR codes)
- Court blackouts and availability
- Conflict detection (court, player, hours)
- Optimistic locking scenarios
- Tournament roles (OWNER, ADMIN, STAFF, REFEREE)
- Walkover/Retired match scenarios
- Match scheduling conflicts
- Batch operations

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: tournament
          POSTGRES_USER: tournament
          POSTGRES_PASSWORD: 123456
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Start Backend
        run: |
          cd backend
          mvn spring-boot:run &
          sleep 30  # Wait for startup

      - name: Run E2E Tests
        run: |
          cd docs/testing
          ./e2e_tournament_flow.sh

      - name: Upload Test Logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-logs
          path: docs/testing/*.log
```

### Jenkins Example

```groovy
pipeline {
    agent any

    stages {
        stage('Start Services') {
            steps {
                sh 'docker compose -f backend/docker-compose.yml up -d'
                sh 'cd backend && mvn spring-boot:run &'
                sh 'sleep 30'
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'cd docs/testing && ./e2e_tournament_flow.sh'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker compose -f backend/docker-compose.yml down'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'docs/testing/*.log', allowEmptyArchive: true
        }
    }
}
```

## 📚 Additional Resources

- [Main Testing Guide](../MANUAL_TESTING_GUIDE.md) - Comprehensive manual testing documentation
- [OpenAPI Spec](/tmp/openapi.json) - Complete API documentation
- [Project README](../../CLAUDE.md) - Project overview and setup
- [Backend Documentation](../../backend/CLAUDE.md) - Backend-specific details

## 🤝 Contributing

To add new test scenarios:

1. Create a new test file (e.g., `e2e_doubles_tournament.sh`)
2. Source `test_helpers.sh` for utilities
3. Follow the naming convention: `test_XX_description()` functions
4. Use `run_test` to execute and track results
5. Document the test in this README

Example:
```bash
#!/bin/bash
source "$(dirname $0)/test_helpers.sh"

test_01_your_scenario() {
    log_step "Step 1: Your Test Scenario"
    # Your test logic here
    return 0
}

main() {
    run_test "Your Scenario" test_01_your_scenario
    print_test_summary
}

main "$@"
```

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section above
2. Review backend logs: `docker compose logs -f` (in backend directory)
3. Run tests in debug mode: `DEBUG=1 ./e2e_tournament_flow.sh`
4. Check API documentation: http://localhost:8080/swagger-ui/index.html

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
