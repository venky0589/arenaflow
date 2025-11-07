# Badminton Tournament Manager - Manual Testing Guide

**Version**: 1.0
**Date**: 2025-11-07
**Status**: Production Pre-Release Testing
**Estimated Testing Time**: 40-60 hours (comprehensive coverage)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Credentials & Seed Data](#3-test-credentials--seed-data)
4. [Authentication Testing](#4-authentication-testing)
5. [Tournament Management Testing](#5-tournament-management-testing)
6. [Player Management Testing](#6-player-management-testing)
7. [Court Management Testing](#7-court-management-testing)
8. [Category Management Testing](#8-category-management-testing)
9. [Match Management Testing](#9-match-management-testing)
10. [Match Scheduling Testing](#10-match-scheduling-testing)
11. [Draw Generation & Bracket Testing](#11-draw-generation--bracket-testing)
12. [Registration & Check-In Testing](#12-registration--check-in-testing)
13. [Role-Based Access Control Testing](#13-role-based-access-control-testing)
14. [User UI Workflow Testing](#14-user-ui-workflow-testing)
15. [Integration & End-to-End Testing](#15-integration--end-to-end-testing)
16. [Edge Cases & Error Handling](#16-edge-cases--error-handling)
17. [Performance & Load Testing](#17-performance--load-testing)
18. [Security Testing](#18-security-testing)
19. [Bug Reporting Template](#19-bug-reporting-template)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

### 1.1 Project Overview

The Badminton Tournament Manager is a full-stack tournament management system with three platforms:
- **Backend API**: Spring Boot 3.3.2 + PostgreSQL 16
- **Admin UI**: React + Material-UI (for tournament organizers)
- **User UI**: React + Material-UI (for players and public)

**Key Features**:
- Tournament creation and management
- Player and court management
- Automated draw generation (single elimination)
- Advanced match scheduling with conflict detection
- Real-time bracket visualization
- Check-in system with QR codes
- Role-based access control
- WebSocket real-time updates

### 1.2 Testing Scope

This guide covers:
- **Functional Testing**: All CRUD operations, business logic, workflows
- **Integration Testing**: End-to-end user journeys across UI and API
- **Security Testing**: Authentication, authorization, RBAC
- **Error Handling**: Validation, conflict detection, edge cases
- **Performance**: Load testing, concurrent users, stress scenarios

**Out of Scope**:
- Mobile app testing (currently in zips folder)
- Automated testing (separate test suite)
- Cross-browser compatibility (recommend Chrome/Firefox)

### 1.3 Testing Objectives

1. Verify all MVP features work as specified
2. Identify critical bugs before production deployment
3. Validate user experience across admin and user interfaces
4. Ensure data integrity and security
5. Confirm RBAC permissions are correctly enforced
6. Test scheduling conflict detection and auto-scheduler
7. Validate bracket generation and progression logic

---

## 2. Test Environment Setup

### 2.1 System Requirements

- **OS**: Linux, macOS, or Windows (WSL recommended)
- **Java**: JDK 17+
- **Node.js**: v18+ and npm
- **Docker**: Docker Desktop or Docker Engine
- **Database**: PostgreSQL 16 (via Docker)
- **Browser**: Chrome 120+ or Firefox 120+

### 2.2 Backend Setup

```bash
# Navigate to backend directory
cd /home/venky/Development-Personal/sports-app/backend

# Start PostgreSQL and Mailpit
docker compose up -d

# Verify services are running
docker ps
# Expected: postgres and mailpit containers running

# Start Spring Boot application
mvn spring-boot:run

# Verify backend is running
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

**Backend URLs**:
- API Base: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Actuator Health: http://localhost:8080/actuator/health
- Mailpit UI: http://localhost:8025 (email testing)

### 2.3 Admin UI Setup

```bash
# Navigate to admin UI directory
cd /home/venky/Development-Personal/sports-app/admin-ui

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev

# Expected output: Running on http://localhost:5173
```

**Admin UI URL**: http://localhost:5173

### 2.4 User UI Setup

```bash
# Navigate to user UI directory
cd /home/venky/Development-Personal/sports-app/user-ui

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev

# Expected output: Running on http://localhost:5174
```

**User UI URL**: http://localhost:5174

### 2.5 Database Access (Optional for Verification)

```bash
# Access PostgreSQL CLI
docker exec -it sports-app-postgres-1 psql -U tournament -d tournament

# Common verification queries
SELECT * FROM users;
SELECT * FROM tournament;
SELECT * FROM player;
SELECT * FROM court;
SELECT * FROM matches;
```

### 2.6 Pre-Testing Checklist

- [ ] PostgreSQL container is running
- [ ] Mailpit container is running
- [ ] Backend server started successfully (port 8080)
- [ ] Admin UI accessible (port 5173)
- [ ] User UI accessible (port 5174)
- [ ] Swagger UI loads and shows all endpoints
- [ ] Can login to Admin UI with admin credentials
- [ ] Browser console shows no critical errors

---

## 3. Test Credentials & Seed Data

### 3.1 User Accounts

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@example.com | password123 | SYSTEM_ADMIN | Full system access for testing |

**Note**: To create additional test users, use the registration API:
```bash
POST /api/v1/auth/register
{
  "email": "testuser@example.com",
  "password": "TestPass123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### 3.2 Seed Data Overview

**Tournaments** (2):
1. **City Open** - Hyderabad, 2025-10-01 to 2025-10-05
2. **Winter Cup** - Bengaluru, 2025-12-10 to 2025-12-12

**Players** (12):
1. Saina K (Female)
2. Sindhu P (Female)
3. Srikanth K (Male)
4. Lakshya S (Male)
5. Ashwini Ponnappa (Female)
6. Chirag Shetty (Male)
7. Satwiksairaj Rankireddy (Male)
8. Jwala Gutta (Female)
9. Kidambi Nandagopal (Male)
10. Arundhati Pantawane (Female)
11. Pranaav Jerry Chopra (Male)
12. Sikki Reddy (Female)

**Courts** (2):
1. Court 1 - Main Hall
2. Court 2 - Main Hall

**Categories** (City Open - 5):
1. Men's Singles
2. Women's Singles
3. Men's Doubles
4. Women's Doubles
5. Mixed Doubles

**Registrations**: Pre-populated for all categories with 3-4 participants each

---

## 4. Authentication Testing

### Test Case Auth-001: Valid Admin Login

**Priority**: HIGH
**Feature**: Authentication
**Prerequisites**: Backend running, Admin UI accessible

**Test Steps**:
1. Navigate to http://localhost:5173
2. Enter email: `admin@example.com`
3. Enter password: `password123`
4. Click "Login" button

**Expected Results**:
- Login successful
- Redirected to Tournaments page
- Navigation bar shows "Logout" button
- JWT token stored in localStorage (check DevTools → Application → Local Storage)
- Token contains roles: `["SYSTEM_ADMIN"]`

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-002: Invalid Credentials

**Priority**: HIGH
**Feature**: Authentication

**Test Steps**:
1. Navigate to http://localhost:5173
2. Enter email: `admin@example.com`
3. Enter password: `wrongpassword`
4. Click "Login" button

**Expected Results**:
- Login fails
- Error message displayed: "Invalid credentials" or similar
- HTTP 401 Unauthorized in Network tab
- User remains on login page
- No token stored

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-003: Logout Functionality

**Priority**: MEDIUM
**Feature**: Authentication

**Test Steps**:
1. Login as admin user
2. Click "Logout" button in navigation bar

**Expected Results**:
- User logged out
- Redirected to login page
- JWT token removed from localStorage
- Cannot access protected routes without re-login

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-004: Token Expiration

**Priority**: MEDIUM
**Feature**: Authentication

**Test Steps**:
1. Login as admin user
2. Wait for token to expire (default: 3 days, can modify for testing)
3. Attempt to access protected resource (e.g., tournaments page)

**Expected Results**:
- API returns HTTP 401 Unauthorized
- User redirected to login page
- Error message: "Session expired, please login again"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-005: Register New User (API)

**Priority**: HIGH
**Feature**: Authentication

**Test Steps**:
1. Open Swagger UI: http://localhost:8080/swagger-ui/index.html
2. Navigate to auth-controller
3. POST /api/v1/auth/register
4. Request body:
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "New",
  "lastName": "User"
}
```
5. Execute request

**Expected Results**:
- HTTP 201 Created
- Response contains user object with `roles: ["USER"]`
- User can login with provided credentials
- User record created in database

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-006: Duplicate Email Registration

**Priority**: MEDIUM
**Feature**: Authentication

**Test Steps**:
1. Register user with email: `duplicate@example.com`
2. Attempt to register again with same email

**Expected Results**:
- HTTP 409 Conflict or HTTP 400 Bad Request
- Error message: "Email already exists" or similar
- No duplicate user created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-007: Password Validation

**Priority**: MEDIUM
**Feature**: Authentication

**Test Steps**:
1. Attempt to register with weak password: `123`

**Expected Results**:
- HTTP 400 Bad Request
- Error message indicates password requirements
- No user created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Auth-008: JWT Token Contains Roles

**Priority**: HIGH
**Feature**: Authentication, RBAC

**Test Steps**:
1. Login as admin user
2. Copy JWT token from localStorage
3. Decode token using jwt.io or similar tool
4. Inspect payload

**Expected Results**:
- Token payload contains `roles: ["SYSTEM_ADMIN"]`
- Token contains user email
- Token has valid `exp` (expiration) timestamp

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 5. Tournament Management Testing

### Test Case Tourn-001: List All Tournaments

**Priority**: HIGH
**Feature**: Tournament Management

**Test Steps**:
1. Login to Admin UI as admin
2. Navigate to "Tournaments" page

**Expected Results**:
- DataGrid displays list of tournaments
- Shows columns: ID, Name, Location, Start Date, End Date, Actions
- Pagination controls visible
- 2 tournaments displayed (City Open, Winter Cup)
- "New" button visible at top

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-002: Create New Tournament

**Priority**: HIGH
**Feature**: Tournament Management

**Test Steps**:
1. Navigate to Tournaments page
2. Click "New" button
3. Fill in form:
   - Name: "Summer Championship"
   - Location: "Mumbai"
   - Start Date: 2025-08-01
   - End Date: 2025-08-05
4. Click "Submit"

**Expected Results**:
- Form dialog closes
- Success message displayed
- New tournament appears in list
- HTTP 201 Created in Network tab
- Tournament ID auto-generated

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-003: Validate Tournament Name

**Priority**: MEDIUM
**Feature**: Tournament Management - Validation

**Test Steps**:
1. Click "New" button
2. Enter name: "AB" (less than 3 characters)
3. Fill other required fields
4. Click "Submit"

**Expected Results**:
- Validation error shown: "Name must be at least 3 characters"
- Form does not submit
- No HTTP request made

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-004: Validate End Date >= Start Date

**Priority**: HIGH
**Feature**: Tournament Management - Validation

**Test Steps**:
1. Click "New" button
2. Enter valid name and location
3. Start Date: 2025-08-10
4. End Date: 2025-08-05 (before start date)
5. Click "Submit"

**Expected Results**:
- Validation error: "End date must be after or equal to start date"
- Form does not submit
- No tournament created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-005: Update Tournament

**Priority**: HIGH
**Feature**: Tournament Management

**Test Steps**:
1. Navigate to Tournaments page
2. Click edit icon on "City Open" tournament
3. Change location from "Hyderabad" to "Hyderabad - Gachibowli"
4. Click "Submit"

**Expected Results**:
- Form closes
- Success message displayed
- Tournament list refreshes
- Location updated in grid
- HTTP 200 OK with updated tournament in response

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-006: Delete Tournament

**Priority**: HIGH
**Feature**: Tournament Management

**Test Steps**:
1. Create a new test tournament
2. Click delete icon on the test tournament
3. Confirm deletion in dialog

**Expected Results**:
- Confirmation dialog appears
- After confirmation, tournament deleted
- Success message displayed
- Tournament removed from list
- HTTP 204 No Content

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-007: Cancel Delete Operation

**Priority**: LOW
**Feature**: Tournament Management

**Test Steps**:
1. Click delete icon on any tournament
2. Click "Cancel" in confirmation dialog

**Expected Results**:
- Dialog closes
- Tournament NOT deleted
- No HTTP DELETE request made
- Tournament remains in list

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-008: Pagination - Next Page

**Priority**: MEDIUM
**Feature**: Tournament Management - Pagination

**Test Steps**:
1. Create 15+ tournaments (to span multiple pages with default page size)
2. Navigate to Tournaments page
3. Click "Next Page" button

**Expected Results**:
- Page 2 data loads
- Different set of tournaments displayed
- HTTP request with `page=1` parameter
- Pagination controls update (page number changes)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-009: Sort Tournaments

**Priority**: LOW
**Feature**: Tournament Management - Sorting

**Test Steps**:
1. Navigate to Tournaments page
2. Click column header to sort (e.g., "Name")

**Expected Results**:
- Tournaments sorted alphabetically by name
- HTTP request includes `sort=name,asc` or `sort=name,desc`
- Sort indicator visible on column header

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Tourn-010: View Tournament Details (API)

**Priority**: MEDIUM
**Feature**: Tournament Management

**Test Steps**:
1. Open Swagger UI
2. GET /api/v1/tournaments/{id}
3. Enter ID: 1 (City Open)
4. Execute

**Expected Results**:
- HTTP 200 OK
- Response contains:
  - `id: 1`
  - `name: "City Open"`
  - `location: "Hyderabad"`
  - `startDate`, `endDate`
  - `dailyStartTime`, `dailyEndTime` (if set)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 6. Player Management Testing

### Test Case Player-001: List All Players

**Priority**: HIGH
**Feature**: Player Management

**Test Steps**:
1. Login to Admin UI
2. Navigate to "Players" page

**Expected Results**:
- DataGrid displays 12 players
- Columns: ID, First Name, Last Name, Gender, Phone, Actions
- Pagination and sorting available
- "New" button visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-002: Create New Player

**Priority**: HIGH
**Feature**: Player Management

**Test Steps**:
1. Navigate to Players page
2. Click "New" button
3. Fill in form:
   - First Name: "Rahul"
   - Last Name: "Verma"
   - Gender: "M"
   - Phone: "9876543210"
4. Click "Submit"

**Expected Results**:
- Form closes
- Success message
- New player appears in list
- HTTP 201 Created
- Player ID auto-generated

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-003: Validate Player Name (Min Length)

**Priority**: MEDIUM
**Feature**: Player Management - Validation

**Test Steps**:
1. Click "New" button
2. First Name: "A" (1 character)
3. Last Name: "B" (1 character)
4. Fill other fields
5. Click "Submit"

**Expected Results**:
- Validation error: "First name must be 2-50 characters"
- Form does not submit

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-004: Validate Gender Field

**Priority**: MEDIUM
**Feature**: Player Management - Validation

**Test Steps**:
1. Create player via API with invalid gender value: "X"

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Gender must be M or F"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-005: Update Player

**Priority**: HIGH
**Feature**: Player Management

**Test Steps**:
1. Click edit icon on "Saina K"
2. Change phone number to "9999999999"
3. Click "Submit"

**Expected Results**:
- Form closes
- Success message
- Phone number updated in grid
- HTTP 200 OK

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-006: Delete Player (No Dependencies)

**Priority**: MEDIUM
**Feature**: Player Management

**Test Steps**:
1. Create a new test player
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- Player deleted successfully
- HTTP 204 No Content
- Player removed from list

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-007: Delete Player (With Registrations)

**Priority**: HIGH
**Feature**: Player Management - Data Integrity

**Test Steps**:
1. Identify player with existing registrations (e.g., Saina K)
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- HTTP 409 Conflict or HTTP 400 Bad Request
- Error message: "Cannot delete player with existing registrations" or foreign key constraint error
- Player NOT deleted

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Player-008: Search/Filter Players

**Priority**: LOW
**Feature**: Player Management

**Test Steps**:
1. Navigate to Players page
2. Use DataGrid filter (if available)
3. Filter by gender: "F"

**Expected Results**:
- Only female players displayed
- Total count updates
- HTTP request with filter parameter

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 7. Court Management Testing

### Test Case Court-001: List All Courts

**Priority**: HIGH
**Feature**: Court Management

**Test Steps**:
1. Login to Admin UI
2. Navigate to "Courts" page

**Expected Results**:
- DataGrid displays 2 courts
- Columns: ID, Name, Location Note, Actions
- "New" button visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Court-002: Create New Court

**Priority**: HIGH
**Feature**: Court Management

**Test Steps**:
1. Navigate to Courts page
2. Click "New" button
3. Fill in form:
   - Name: "Court 3"
   - Location Note: "Practice Hall"
4. Click "Submit"

**Expected Results**:
- Form closes
- Success message
- New court appears in list
- HTTP 201 Created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Court-003: Update Court

**Priority**: MEDIUM
**Feature**: Court Management

**Test Steps**:
1. Click edit icon on "Court 1"
2. Change location note to "Main Hall - Left Side"
3. Click "Submit"

**Expected Results**:
- Form closes
- Court updated in list
- HTTP 200 OK

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Court-004: Delete Court (No Matches)

**Priority**: MEDIUM
**Feature**: Court Management

**Test Steps**:
1. Create a test court
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- Court deleted successfully
- HTTP 204 No Content

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Court-005: Delete Court (With Matches)

**Priority**: HIGH
**Feature**: Court Management - Data Integrity

**Test Steps**:
1. Identify court with scheduled matches (e.g., Court 1)
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- HTTP 409 Conflict or HTTP 400
- Error: "Cannot delete court with existing matches"
- Court NOT deleted

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Court-006: Validate Court Name Required

**Priority**: LOW
**Feature**: Court Management - Validation

**Test Steps**:
1. Click "New" button
2. Leave name empty
3. Fill location note
4. Click "Submit"

**Expected Results**:
- Validation error: "Name is required"
- Form does not submit

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 8. Category Management Testing

### Test Case Cat-001: List Categories by Tournament

**Priority**: HIGH
**Feature**: Category Management

**Test Steps**:
1. Login to Admin UI
2. Navigate to "Categories" page
3. Select "City Open" tournament from dropdown

**Expected Results**:
- DataGrid displays 5 categories (MS, WS, MD, WD, XD)
- Columns: ID, Name, Type, Format, Gender Restriction, Max Participants
- "New" button visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-002: Create New Category

**Priority**: HIGH
**Feature**: Category Management

**Test Steps**:
1. Navigate to Categories page
2. Select tournament: "City Open"
3. Click "New" button
4. Fill in form:
   - Name: "Under-18 Singles"
   - Type: "SINGLES"
   - Format: "SINGLE_ELIMINATION"
   - Gender Restriction: "OPEN"
   - Max Participants: 16
5. Click "Submit"

**Expected Results**:
- Form closes
- Success message
- New category appears in list
- HTTP 201 Created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-003: Update Category

**Priority**: MEDIUM
**Feature**: Category Management

**Test Steps**:
1. Click edit icon on "Men's Singles"
2. Change max participants from current value to 32
3. Click "Submit"

**Expected Results**:
- Form closes
- Category updated
- HTTP 200 OK

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-004: Delete Category (No Registrations)

**Priority**: MEDIUM
**Feature**: Category Management

**Test Steps**:
1. Create a test category
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- Category deleted successfully
- HTTP 204 No Content

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-005: Delete Category (With Registrations)

**Priority**: HIGH
**Feature**: Category Management - Data Integrity

**Test Steps**:
1. Select category with existing registrations (e.g., "Men's Singles")
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- HTTP 409 Conflict or HTTP 400
- Error: "Cannot delete category with existing registrations"
- Category NOT deleted

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-006: Validate Category Type Enum

**Priority**: LOW
**Feature**: Category Management - Validation

**Test Steps**:
1. Create category via API with invalid type: "TRIPLES"

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Type must be SINGLES or DOUBLES"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Cat-007: Validate Format Enum

**Priority**: LOW
**Feature**: Category Management - Validation

**Test Steps**:
1. Create category via API with invalid format: "KNOCKOUT"

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Format must be SINGLE_ELIMINATION or ROUND_ROBIN"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 9. Match Management Testing

### Test Case Match-001: List All Matches

**Priority**: HIGH
**Feature**: Match Management

**Test Steps**:
1. Login to Admin UI
2. Navigate to "Matches" page

**Expected Results**:
- DataGrid displays all matches
- Columns: ID, Tournament, Court, Player1, Player2, Score1, Score2, Status, Scheduled At, Actions
- Pagination controls visible
- "New" button visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-002: Create Match with Dropdowns

**Priority**: HIGH
**Feature**: Match Management - Autocomplete

**Test Steps**:
1. Navigate to Matches page
2. Click "New" button
3. Fill in form using AUTOCOMPLETE dropdowns:
   - Tournament: Select "City Open" from dropdown
   - Court: Select "Court 1" from dropdown
   - Player1: Select "Saina K" from dropdown
   - Player2: Select "Sindhu P" from dropdown
   - Status: "SCHEDULED"
   - Scheduled At: Select future datetime
4. Click "Submit"

**Expected Results**:
- All fields use Autocomplete dropdowns (NOT raw ID inputs)
- Form closes
- Success message
- New match appears in list
- HTTP 201 Created
- Match displays player/court/tournament NAMES (not IDs)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-003: Validate Same Player Cannot Play Twice

**Priority**: HIGH
**Feature**: Match Management - Validation

**Test Steps**:
1. Click "New" button
2. Select same player for Player1 and Player2
3. Fill other fields
4. Click "Submit"

**Expected Results**:
- Validation error: "Player1 and Player2 must be different"
- Form does not submit
- No match created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-004: Update Match Score

**Priority**: HIGH
**Feature**: Match Management - Scoring

**Test Steps**:
1. Find match with status "IN_PROGRESS"
2. Click edit icon
3. Enter Score1: 21
4. Enter Score2: 15
5. Click "Submit"

**Expected Results**:
- Form closes
- Scores updated in grid
- HTTP 200 OK
- Winner automatically determined (Player1 in this case)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-005: Match Status Workflow - Start Match

**Priority**: HIGH
**Feature**: Match Management - Status Workflow

**Test Steps**:
1. Find match with status "SCHEDULED"
2. Click Actions menu (three dots)
3. Select "Start Match"

**Expected Results**:
- Match status changes to "IN_PROGRESS"
- HTTP 200 OK
- `startedAt` timestamp populated
- Success message displayed

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-006: Match Status Workflow - Complete Match

**Priority**: HIGH
**Feature**: Match Management - Status Workflow

**Test Steps**:
1. Find match with status "IN_PROGRESS"
2. Ensure scores are entered
3. Click Actions menu
4. Select "Complete Match"

**Expected Results**:
- Match status changes to "COMPLETED"
- HTTP 200 OK
- `endedAt` timestamp populated
- Winner determined based on higher score
- Winner advances to next match (if bracket exists)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-007: Invalid Status Transition

**Priority**: MEDIUM
**Feature**: Match Management - Status Workflow

**Test Steps**:
1. Via API, attempt to transition match from "SCHEDULED" to "COMPLETED" directly
   - POST /api/v1/matches/{id}/complete

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Cannot complete match that is not in progress"
- Match status unchanged

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-008: Walkover with Winner

**Priority**: MEDIUM
**Feature**: Match Management - Status Workflow

**Test Steps**:
1. Find match with status "IN_PROGRESS"
2. Click Actions menu
3. Select "Mark as Walkover"
4. Enter winner ID (e.g., Player1)
5. Enter reason: "Player2 did not show up"
6. Submit

**Expected Results**:
- Match status changes to "WALKOVER"
- HTTP 200 OK
- Winner recorded
- Reason stored
- Winner advances in bracket

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-009: Retired with Winner

**Priority**: MEDIUM
**Feature**: Match Management - Status Workflow

**Test Steps**:
1. Find match with status "IN_PROGRESS"
2. Click Actions menu
3. Select "Mark as Retired"
4. Enter winner ID
5. Enter reason: "Player2 injured"
6. Submit

**Expected Results**:
- Match status changes to "RETIRED"
- HTTP 200 OK
- Winner recorded
- Reason stored
- Winner advances in bracket

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-010: Delete Match

**Priority**: LOW
**Feature**: Match Management

**Test Steps**:
1. Create a test match
2. Click delete icon
3. Confirm deletion

**Expected Results**:
- Match deleted successfully
- HTTP 204 No Content
- Match removed from list

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-011: Validate Negative Scores

**Priority**: MEDIUM
**Feature**: Match Management - Validation

**Test Steps**:
1. Edit match
2. Enter Score1: -5
3. Click "Submit"

**Expected Results**:
- Validation error: "Score cannot be negative"
- Form does not submit

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Match-012: Validate Tied Scores in Single Elimination

**Priority**: HIGH
**Feature**: Match Management - Validation

**Test Steps**:
1. Edit match in single elimination category
2. Enter Score1: 21
3. Enter Score2: 21
4. Click "Submit"

**Expected Results**:
- Validation error: "Scores cannot be tied in single elimination"
- Form does not submit

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 10. Match Scheduling Testing

### Test Case Sched-001: Manual Schedule - No Conflicts

**Priority**: HIGH
**Feature**: Match Scheduling

**Test Steps**:
1. Navigate to Matches page
2. Edit unscheduled match
3. Select Court: "Court 1"
4. Set Scheduled At: "2025-11-10 10:00 AM"
5. Click "Submit"

**Expected Results**:
- Match scheduled successfully
- HTTP 200 OK
- Court and scheduled time displayed in grid
- No conflict error

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-002: Court Conflict Detection

**Priority**: HIGH
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Schedule Match A on Court 1 at 10:00 AM - 10:30 AM
2. Attempt to schedule Match B on Court 1 at 10:15 AM - 10:45 AM (overlaps)

**Expected Results**:
- HTTP 409 Conflict
- Error code: "COURT_CONFLICT"
- Error message: "Court is already booked during this time" or similar
- Match B NOT scheduled
- Detailed conflict info in response

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-003: Court Buffer Time Validation

**Priority**: HIGH
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Schedule Match A on Court 1 at 10:00 AM - 10:30 AM
2. Attempt to schedule Match B on Court 1 at 10:31 AM (within buffer period)
   - Default buffer: 15 minutes

**Expected Results**:
- HTTP 409 Conflict
- Error code: "COURT_CONFLICT"
- Error message mentions buffer time
- Match B NOT scheduled

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-004: Player Conflict Detection

**Priority**: HIGH
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Schedule Match A (Saina vs Sindhu) at 10:00 AM
2. Attempt to schedule Match B (Saina vs Jwala) at 10:15 AM (overlaps)

**Expected Results**:
- HTTP 409 Conflict
- Error code: "PLAYER_CONFLICT"
- Error message: "Player Saina is already scheduled during this time"
- Match B NOT scheduled

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-005: Player Rest Time Validation

**Priority**: HIGH
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Schedule Match A (Saina vs Sindhu) at 10:00 AM - 10:30 AM
2. Attempt to schedule Match B (Saina vs Jwala) at 10:45 AM (within rest period)
   - Default rest time: 30 minutes

**Expected Results**:
- HTTP 409 Conflict
- Error code: "PLAYER_CONFLICT"
- Error message mentions rest time requirement
- Match B NOT scheduled

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-006: Court Blackout Validation

**Priority**: MEDIUM
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Create court blackout for Court 1: 12:00 PM - 2:00 PM (lunch break)
2. Attempt to schedule match on Court 1 at 1:00 PM

**Expected Results**:
- HTTP 400 Bad Request
- Error code: "BLACKOUT_CONFLICT"
- Error message: "Court is unavailable during this time"
- Match NOT scheduled

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-007: Tournament Operating Hours Validation

**Priority**: MEDIUM
**Feature**: Match Scheduling - Conflict Detection

**Test Steps**:
1. Set City Open tournament operating hours: 8:00 AM - 10:00 PM
2. Attempt to schedule match at 11:00 PM (outside hours)

**Expected Results**:
- HTTP 400 Bad Request
- Error code: "HOURS_CONSTRAINT"
- Error message: "Match falls outside tournament operating hours"
- Match NOT scheduled

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-008: Auto-Scheduler - Simulate

**Priority**: HIGH
**Feature**: Match Scheduling - Auto-Scheduler

**Test Steps**:
1. Navigate to Match Scheduler page (or use Swagger)
2. POST /api/v1/scheduling/simulate
3. Request body:
```json
{
  "tournamentId": 1,
  "startTime": "2025-11-10T08:00:00",
  "slotDurationMinutes": 30,
  "bufferTimeMinutes": 15,
  "restTimeMinutes": 30
}
```
4. Execute

**Expected Results**:
- HTTP 200 OK
- Response contains:
  - Batch UUID (idempotency key)
  - Scheduled count
  - Unscheduled count
  - Fill percentage
  - Warnings (if any)
- NO database changes (dry-run)
- Can view simulation results

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-009: Auto-Scheduler - Apply

**Priority**: HIGH
**Feature**: Match Scheduling - Auto-Scheduler

**Test Steps**:
1. Run simulation (previous test)
2. Copy batch UUID from response
3. POST /api/v1/scheduling/apply
4. Add header: `Idempotency-Key: {batchUUID}`
5. Execute

**Expected Results**:
- HTTP 200 OK
- Matches scheduled in database
- Response shows applied schedule details
- Matches visible in Matches page with scheduled times
- Batch status changes to "APPLIED"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-010: Auto-Scheduler - Idempotency

**Priority**: HIGH
**Feature**: Match Scheduling - Auto-Scheduler

**Test Steps**:
1. Apply schedule with batch UUID (previous test)
2. Apply again with SAME batch UUID

**Expected Results**:
- HTTP 200 OK
- Same result returned
- NO duplicate matches created
- Database unchanged on second call
- Idempotency respected

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-011: Auto-Scheduler - Topological Sorting

**Priority**: HIGH
**Feature**: Match Scheduling - Auto-Scheduler Algorithm

**Test Steps**:
1. Generate bracket for tournament (creates match dependencies)
2. Run auto-scheduler
3. Verify schedule order

**Expected Results**:
- Prerequisite matches scheduled BEFORE dependent matches
- Round 1 matches scheduled before Round 2
- No match scheduled before its prerequisites complete
- Respects bracket progression logic

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-012: Lock Match to Preserve Manual Schedule

**Priority**: MEDIUM
**Feature**: Match Scheduling - Lock/Unlock

**Test Steps**:
1. Manually schedule match at specific time
2. Lock the match (PUT /api/v1/matches/{id}/lock)
3. Run auto-scheduler
4. Verify locked match not rescheduled

**Expected Results**:
- HTTP 200 OK on lock
- Match marked as locked
- Auto-scheduler skips this match
- Locked match time preserved

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-013: Unlock Match

**Priority**: LOW
**Feature**: Match Scheduling - Lock/Unlock

**Test Steps**:
1. Lock a match
2. Unlock the match (PUT /api/v1/matches/{id}/unlock)
3. Run auto-scheduler

**Expected Results**:
- HTTP 200 OK on unlock
- Match marked as unlocked
- Auto-scheduler can now reschedule this match

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-014: Filter Matches by Date

**Priority**: MEDIUM
**Feature**: Match Scheduling - Filtering

**Test Steps**:
1. Navigate to Match Scheduler or use API
2. GET /api/v1/scheduling/matches?tournamentId=1&date=2025-11-10

**Expected Results**:
- HTTP 200 OK
- Only matches on 2025-11-10 returned
- Pagination metadata included

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-015: Filter Matches by Court

**Priority**: MEDIUM
**Feature**: Match Scheduling - Filtering

**Test Steps**:
1. GET /api/v1/scheduling/matches?tournamentId=1&courtId=1

**Expected Results**:
- HTTP 200 OK
- Only matches on Court 1 returned

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-016: Filter Matches by Status

**Priority**: MEDIUM
**Feature**: Match Scheduling - Filtering

**Test Steps**:
1. GET /api/v1/scheduling/matches?tournamentId=1&status=IN_PROGRESS

**Expected Results**:
- HTTP 200 OK
- Only matches with status "IN_PROGRESS" returned

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-017: Optimistic Locking - Concurrent Update Detection

**Priority**: HIGH
**Feature**: Match Scheduling - Optimistic Locking

**Test Steps**:
1. User A loads match for editing (version=5)
2. User B loads same match (version=5)
3. User A updates match → version becomes 6
4. User B attempts to update with version=5

**Expected Results**:
- User A: HTTP 200 OK, match updated
- User B: HTTP 409 Conflict
- Error code: "OPTIMISTIC_LOCK"
- Error message: "This record was updated by another user. Please refresh and try again."
- User B's changes NOT applied

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-018: Optimistic Lock Dialog (Admin UI)

**Priority**: MEDIUM
**Feature**: Match Scheduling - Optimistic Locking UI

**Test Steps**:
1. Simulate optimistic lock conflict (previous test)
2. Observe Admin UI response

**Expected Results**:
- OptimisticLockDialog appears
- Message: "Match was updated by another user"
- "Refresh Match" button available
- Clicking refresh loads latest version
- User can re-apply changes

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-019: Export Schedule to CSV

**Priority**: LOW
**Feature**: Match Scheduling - Export

**Test Steps**:
1. Navigate to Match Scheduler page
2. Schedule several matches
3. Click "Export" button
4. Select "CSV"

**Expected Results**:
- CSV file downloads
- Contains: Match ID, Tournament, Court, Player1, Player2, Scheduled Time, Status
- Proper CSV formatting

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sched-020: Export Schedule to JSON

**Priority**: LOW
**Feature**: Match Scheduling - Export

**Test Steps**:
1. Navigate to Match Scheduler
2. Click "Export" → "JSON"

**Expected Results**:
- JSON file downloads
- Valid JSON format
- Contains all match details

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 11. Draw Generation & Bracket Testing

### Test Case Draw-001: Generate Single Elimination Draw (No Seeds)

**Priority**: HIGH
**Feature**: Draw Generation

**Test Steps**:
1. Login to Admin UI
2. Navigate to Tournaments page
3. Click "Generate Draw" icon for "City Open"
4. Select category: "Men's Singles"
5. Leave seeds empty
6. Click "Generate"

**Expected Results**:
- HTTP 200 OK
- Success message: "Draw generated successfully"
- Bracket created with single elimination format
- Number of matches = (participants - 1)
- BYEs added if participants not power of 2
- Matches visible in Matches page
- Bracket visible in Brackets page

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-002: Generate Draw with Seeds

**Priority**: MEDIUM
**Feature**: Draw Generation - Seeding

**Test Steps**:
1. Click "Generate Draw"
2. Select category: "Men's Singles"
3. Provide seeds:
```json
[
  {"registrationId": 1, "seedNumber": 1},
  {"registrationId": 2, "seedNumber": 2}
]
```
4. Click "Generate"

**Expected Results**:
- HTTP 200 OK
- Seeded players placed in correct bracket positions
- Seed 1 and Seed 2 placed to meet in final (if both win)
- Other participants distributed fairly

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-003: BYE Handling

**Priority**: HIGH
**Feature**: Draw Generation - BYE Logic

**Test Steps**:
1. Create category with 6 participants (not power of 2)
2. Generate draw

**Expected Results**:
- Bracket size rounds up to next power of 2 (8 in this case)
- 2 BYEs added in Round 1
- BYE matches auto-complete
- Winners advance to Round 2 automatically
- Proper BYE placement (top/bottom seeds)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-004: Cannot Regenerate In-Progress Tournament

**Priority**: HIGH
**Feature**: Draw Generation - Validation

**Test Steps**:
1. Generate draw for category
2. Start a match (status = IN_PROGRESS)
3. Attempt to regenerate draw without overwriteIfDraft flag

**Expected Results**:
- HTTP 409 Conflict
- Error: "Cannot regenerate draw with matches in progress"
- Existing bracket preserved

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-005: Overwrite Draft Bracket

**Priority**: MEDIUM
**Feature**: Draw Generation - Overwrite

**Test Steps**:
1. Generate draw for category
2. Do NOT start any matches
3. Regenerate draw with overwriteIfDraft=true

**Expected Results**:
- HTTP 200 OK
- Old matches deleted
- New bracket created
- Success message

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-006: Insufficient Registrations

**Priority**: HIGH
**Feature**: Draw Generation - Validation

**Test Steps**:
1. Create category with only 1 registration
2. Attempt to generate draw

**Expected Results**:
- HTTP 400 Bad Request
- Error: "At least 2 registrations required to generate draw"
- No bracket created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-007: Round Robin Not Implemented

**Priority**: LOW
**Feature**: Draw Generation - Round Robin

**Test Steps**:
1. Select "Winter Cup" tournament
2. Select "Men's Singles" category (configured as ROUND_ROBIN)
3. Attempt to generate draw

**Expected Results**:
- HTTP 501 Not Implemented
- Error: "Round robin format is not yet implemented (V2 feature)"
- No bracket created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-008: View Bracket (Admin UI)

**Priority**: HIGH
**Feature**: Bracket Visualization

**Test Steps**:
1. Generate draw for "Men's Singles"
2. Navigate to Brackets page
3. Select tournament: "City Open"
4. Select category: "Men's Singles"

**Expected Results**:
- Interactive bracket tree displayed
- Shows all rounds (Round 1, Round 2, Semifinals, Final)
- Shows participant names
- Shows match scores (if available)
- Shows BYEs clearly
- Winner progression visible
- Upcoming matches list below bracket

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-009: View Bracket (User UI)

**Priority**: HIGH
**Feature**: Bracket Visualization - Public Access

**Test Steps**:
1. Open User UI (no login required)
2. Navigate to Brackets page
3. Select tournament and category

**Expected Results**:
- Same bracket view as Admin UI
- No authentication required (public access)
- Read-only view

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-010: Winner Progression in Bracket

**Priority**: HIGH
**Feature**: Bracket Progression

**Test Steps**:
1. Generate draw
2. Complete a Round 1 match (Saina defeats Sindhu)
3. View bracket

**Expected Results**:
- Round 1 match shows winner (Saina)
- Round 2 match automatically populated with winner (Saina)
- Loser (Sindhu) eliminated from bracket
- Next match shows Saina as participant

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-011: Delete Draft Bracket

**Priority**: LOW
**Feature**: Bracket Management

**Test Steps**:
1. Generate draw (no matches started)
2. DELETE /api/v1/categories/{categoryId}/bracket

**Expected Results**:
- HTTP 204 No Content
- All matches for category deleted
- Bracket view shows empty state

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Draw-012: Doubles Draw Generation

**Priority**: MEDIUM
**Feature**: Draw Generation - Doubles

**Test Steps**:
1. Select "Men's Doubles" category
2. Generate draw

**Expected Results**:
- Bracket uses TEAMS instead of individual players
- Team names displayed (e.g., "Srikanth/Lakshya")
- Proper handling of team registrations
- Winner progression works for teams

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 12. Registration & Check-In Testing

### Test Case Reg-001: Create Registration (API)

**Priority**: HIGH
**Feature**: Registration Management

**Test Steps**:
1. Open Swagger UI
2. POST /api/v1/registrations
3. Request body:
```json
{
  "tournamentId": 1,
  "playerId": 1,
  "categoryId": 1
}
```
4. Execute

**Expected Results**:
- HTTP 201 Created
- Response contains registration ID
- Registration appears in Admin UI
- Player now registered for tournament/category

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-002: Duplicate Registration Validation

**Priority**: HIGH
**Feature**: Registration Management - Validation

**Test Steps**:
1. Register player for specific category
2. Attempt to register same player for same category again

**Expected Results**:
- HTTP 409 Conflict or HTTP 400
- Error: "Player already registered for this category"
- No duplicate registration created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-003: List All Registrations (Admin UI)

**Priority**: MEDIUM
**Feature**: Registration Management

**Test Steps**:
1. Login to Admin UI
2. Navigate to Registrations page

**Expected Results**:
- DataGrid displays all registrations
- Columns: ID, Tournament, Player/Team, Category, Checked In, Scheduled Time, Actions
- Check-in status visible
- "New" button available

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-004: Check-In Within Time Window

**Priority**: HIGH
**Feature**: Check-In System

**Test Steps**:
1. Ensure registration has scheduled time set
2. Ensure current time is within ±2 hours of scheduled time
3. POST /api/v1/registrations/{id}/check-in

**Expected Results**:
- HTTP 200 OK
- Response: `{"checkedIn": true, "checkedInAt": "2025-11-10T09:30:00"}`
- Registration marked as checked in
- Timestamp recorded

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-005: Check-In Outside Time Window

**Priority**: HIGH
**Feature**: Check-In System - Validation

**Test Steps**:
1. Registration scheduled for 10:00 AM
2. Current time: 7:00 AM (more than 2 hours before)
3. Attempt check-in

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Check-in only allowed within 2 hours of scheduled time"
- Registration NOT checked in

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-006: Undo Check-In

**Priority**: MEDIUM
**Feature**: Check-In System

**Test Steps**:
1. Check in a player
2. POST /api/v1/registrations/{id}/undo-check-in

**Expected Results**:
- HTTP 200 OK
- `checkedIn` flag reset to false
- `checkedInAt` timestamp cleared
- Success message

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-007: Batch Check-In

**Priority**: MEDIUM
**Feature**: Check-In System - Batch Operations

**Test Steps**:
1. POST /api/v1/registrations/batch-check-in
2. Request body:
```json
{
  "registrationIds": [1, 2, 3]
}
```
3. Execute

**Expected Results**:
- HTTP 200 OK
- Response shows success/failure for each ID
- Valid check-ins processed
- Invalid check-ins return error with reason

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-008: QR Code Generation

**Priority**: MEDIUM
**Feature**: Check-In System - QR Code

**Test Steps**:
1. GET /api/v1/registrations/{id}/qrcode
2. Execute

**Expected Results**:
- HTTP 200 OK
- Response is PNG image
- QR code encodes registration ID or check-in URL
- Image can be saved/displayed

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-009: QR Code Check-In

**Priority**: MEDIUM
**Feature**: Check-In System - QR Code

**Test Steps**:
1. Generate QR code for registration
2. Scan QR code (or extract data)
3. POST /api/v1/registrations/qrcode/check-in
4. Request body contains registration ID from QR

**Expected Results**:
- HTTP 200 OK (if within time window)
- Player checked in automatically
- Same validation as manual check-in

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-010: Sync Scheduled Time from Match

**Priority**: LOW
**Feature**: Check-In System - Time Sync

**Test Steps**:
1. Player registered for category
2. Match scheduled with this player
3. PUT /api/v1/registrations/{id}/sync-scheduled-time

**Expected Results**:
- HTTP 200 OK
- Registration's `scheduledTime` updated to match earliest match time
- Enables check-in based on match schedule

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-011: Export Check-Ins to CSV

**Priority**: LOW
**Feature**: Check-In System - Export

**Test Steps**:
1. GET /api/v1/registrations/export/csv?tournamentId=1

**Expected Results**:
- HTTP 200 OK
- CSV file downloaded
- Contains: Registration ID, Player Name, Category, Checked In, Checked In At, Scheduled Time
- Proper CSV formatting

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-012: Export Check-Ins to PDF

**Priority**: LOW
**Feature**: Check-In System - Export

**Test Steps**:
1. GET /api/v1/registrations/export/pdf?tournamentId=1

**Expected Results**:
- HTTP 200 OK
- PDF file downloaded
- Contains check-in report with proper formatting
- Player names, categories, status visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-013: Delete Registration

**Priority**: MEDIUM
**Feature**: Registration Management

**Test Steps**:
1. Create test registration
2. DELETE /api/v1/registrations/{id}

**Expected Results**:
- HTTP 204 No Content
- Registration deleted
- Player removed from category

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Reg-014: User Registration Workflow (User UI)

**Priority**: HIGH
**Feature**: Registration - User UI

**Test Steps**:
1. Open User UI
2. Navigate to Tournaments page
3. Find "City Open" tournament
4. Click "Register" button
5. Login if prompted
6. Select player from dropdown
7. Select category
8. Submit

**Expected Results**:
- Login prompt if not authenticated
- After login, registration form appears
- Player and category dropdowns populated
- Success message after submission
- Registration visible in "My Registrations"

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 13. Role-Based Access Control Testing

### Test Case RBAC-001: SYSTEM_ADMIN Full Access

**Priority**: HIGH
**Feature**: RBAC

**Test Steps**:
1. Login as admin@example.com (SYSTEM_ADMIN)
2. Test access to:
   - Create tournament
   - Create player
   - Create court
   - Generate draw
   - Schedule matches
   - Score matches
   - Check-in players

**Expected Results**:
- All operations succeed
- HTTP 200/201 for all requests
- No permission errors

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-002: USER Can Create Tournament

**Priority**: HIGH
**Feature**: RBAC

**Test Steps**:
1. Register new user (gets USER role)
2. Login as that user
3. POST /api/v1/tournaments (create tournament)

**Expected Results**:
- HTTP 201 Created
- Tournament created successfully
- User becomes tournament OWNER automatically

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-003: USER Cannot Create Player

**Priority**: HIGH
**Feature**: RBAC

**Test Steps**:
1. Login as regular USER
2. POST /api/v1/players

**Expected Results**:
- HTTP 403 Forbidden
- Error: "Access Denied" or "Insufficient permissions"
- Player NOT created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-004: USER Cannot Update Others' Tournaments

**Priority**: HIGH
**Feature**: RBAC

**Test Steps**:
1. Login as user A
2. User A creates tournament X
3. Login as user B
4. User B attempts to update tournament X

**Expected Results**:
- HTTP 403 Forbidden
- Tournament NOT updated
- Only SYSTEM_ADMIN or tournament OWNER/ADMIN can update

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-005: Tournament OWNER Can Assign Roles

**Priority**: HIGH
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Login as tournament OWNER
2. POST /api/v1/tournaments/{id}/roles
3. Assign user as ADMIN

**Expected Results**:
- HTTP 201 Created
- Role assignment recorded
- Assigned user now has ADMIN permissions for this tournament

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-006: Tournament ADMIN Cannot Assign OWNER Role

**Priority**: MEDIUM
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Login as tournament ADMIN (not OWNER)
2. Attempt to assign another user as OWNER

**Expected Results**:
- HTTP 403 Forbidden
- Error: "Only OWNER can assign OWNER role"
- Role NOT assigned

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-007: Tournament STAFF Can Check-In Players

**Priority**: MEDIUM
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Assign user as tournament STAFF
2. Login as that user
3. POST /api/v1/registrations/{id}/check-in

**Expected Results**:
- HTTP 200 OK
- Player checked in successfully
- STAFF has permission for check-in operations

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-008: Tournament REFEREE Can Score Matches

**Priority**: HIGH
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Assign user as tournament REFEREE
2. Login as that user
3. PUT /api/v1/matches/{id}/score

**Expected Results**:
- HTTP 200 OK
- Match score updated
- REFEREE has permission to score matches

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-009: Tournament REFEREE Cannot Generate Draw

**Priority**: MEDIUM
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Login as tournament REFEREE
2. POST /api/v1/tournaments/{id}/categories/{catId}/draw:generate

**Expected Results**:
- HTTP 403 Forbidden
- Error: "Insufficient permissions"
- Only SYSTEM_ADMIN or tournament OWNER/ADMIN can generate draw

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-010: Public Can View Tournaments

**Priority**: HIGH
**Feature**: RBAC - Public Access

**Test Steps**:
1. Do NOT login (unauthenticated request)
2. GET /api/v1/tournaments

**Expected Results**:
- HTTP 200 OK
- List of tournaments returned
- Public read access allowed

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-011: Public Can View Brackets

**Priority**: HIGH
**Feature**: RBAC - Public Access

**Test Steps**:
1. Unauthenticated request
2. GET /api/v1/categories/{id}/bracket

**Expected Results**:
- HTTP 200 OK
- Bracket data returned
- Public can view brackets

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-012: Public Cannot Create Tournament

**Priority**: HIGH
**Feature**: RBAC - Public Access

**Test Steps**:
1. Unauthenticated request
2. POST /api/v1/tournaments

**Expected Results**:
- HTTP 401 Unauthorized
- Error: "Authentication required"
- Tournament NOT created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-013: Get My Tournament Roles

**Priority**: MEDIUM
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Login as user with tournament roles
2. GET /api/v1/tournaments/{id}/roles/me

**Expected Results**:
- HTTP 200 OK
- Response lists user's roles for this tournament
- Shows: OWNER, ADMIN, STAFF, REFEREE (as applicable)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-014: Remove Role Assignment

**Priority**: LOW
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. Login as tournament OWNER
2. DELETE /api/v1/tournaments/{id}/roles/{assignmentId}

**Expected Results**:
- HTTP 204 No Content
- Role assignment removed
- User loses permissions for tournament

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-015: Admin UI Route Protection

**Priority**: HIGH
**Feature**: RBAC - Frontend

**Test Steps**:
1. Logout from Admin UI
2. Attempt to access protected route (e.g., /tournaments) directly via URL

**Expected Results**:
- Redirected to login page
- Cannot access protected routes without authentication
- RequireAuth component working

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-016: Conditional UI Rendering Based on Role

**Priority**: MEDIUM
**Feature**: RBAC - Frontend

**Test Steps**:
1. Login as USER (not SYSTEM_ADMIN)
2. Navigate Admin UI
3. Check if "New Player" button visible

**Expected Results**:
- "New Player" button hidden (or disabled)
- Only SYSTEM_ADMIN can create players
- UI respects role permissions

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case RBAC-017: Get Users by Tournament Role

**Priority**: LOW
**Feature**: RBAC - Tournament Roles

**Test Steps**:
1. GET /api/v1/tournaments/{id}/roles/by-role/REFEREE

**Expected Results**:
- HTTP 200 OK
- List of users with REFEREE role for this tournament
- Useful for assigning referees to matches

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 14. User UI Workflow Testing

### Test Case UserUI-001: Browse Tournaments (No Login)

**Priority**: HIGH
**Feature**: User UI - Public Access

**Test Steps**:
1. Open User UI: http://localhost:5174
2. Navigate to Tournaments page (no login)

**Expected Results**:
- List of tournaments displayed
- Shows name, location, dates
- "Register" button visible on each tournament
- No authentication required to view

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-002: Search Tournaments by Name

**Priority**: MEDIUM
**Feature**: User UI - Search/Filter

**Test Steps**:
1. Navigate to Tournaments page
2. Enter "City" in search box

**Expected Results**:
- Only "City Open" tournament displayed
- Other tournaments filtered out
- Search is case-insensitive

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-003: Filter Tournaments by Location

**Priority**: MEDIUM
**Feature**: User UI - Search/Filter

**Test Steps**:
1. Navigate to Tournaments page
2. Select "Hyderabad" from location dropdown

**Expected Results**:
- Only tournaments in Hyderabad displayed
- Filter works correctly

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-004: View Matches (Public)

**Priority**: HIGH
**Feature**: User UI - Public Access

**Test Steps**:
1. Navigate to Matches page (no login required)

**Expected Results**:
- List of matches displayed as cards
- Shows: Tournament name, Court, Player1 vs Player2, Scores, Status, Scheduled time
- Pagination available
- Tournament filter dropdown

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-005: Filter Matches by Tournament

**Priority**: MEDIUM
**Feature**: User UI - Search/Filter

**Test Steps**:
1. Navigate to Matches page
2. Select "City Open" from tournament filter

**Expected Results**:
- Only matches for City Open displayed
- Filter works correctly

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-006: View Brackets (Public)

**Priority**: HIGH
**Feature**: User UI - Public Access

**Test Steps**:
1. Navigate to Brackets page (no login required)
2. Select tournament and category

**Expected Results**:
- Interactive bracket tree displayed
- Same visualization as Admin UI
- Shows all rounds, participants, scores
- No authentication required

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-007: Register for Tournament (Login Required)

**Priority**: HIGH
**Feature**: User UI - Registration

**Test Steps**:
1. Navigate to Tournaments page
2. Click "Register" button on a tournament
3. Observe login prompt

**Expected Results**:
- Login dialog appears (or redirect to login page)
- After login, registration form shown
- User can select player and category
- Submit creates registration

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-008: View My Registrations

**Priority**: HIGH
**Feature**: User UI - My Registrations

**Test Steps**:
1. Login as user
2. Navigate to "My Registrations" page

**Expected Results**:
- List of user's registrations displayed
- Shows: Tournament name, Category, Player name, Check-in status
- Only current user's registrations visible

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-009: Login Functionality

**Priority**: HIGH
**Feature**: User UI - Authentication

**Test Steps**:
1. Click "Login" in navbar
2. Enter valid credentials
3. Submit

**Expected Results**:
- Login successful
- Navbar shows "Logout" button
- User name displayed (if implemented)
- JWT token stored

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-010: Logout Functionality

**Priority**: MEDIUM
**Feature**: User UI - Authentication

**Test Steps**:
1. Login as user
2. Click "Logout"

**Expected Results**:
- User logged out
- Token removed
- Navbar shows "Login" button
- Redirected to home page

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-011: Pagination on Tournaments

**Priority**: LOW
**Feature**: User UI - Pagination

**Test Steps**:
1. Create 20+ tournaments
2. Navigate to Tournaments page
3. Click "Next Page"

**Expected Results**:
- Page 2 tournaments displayed
- Pagination controls work
- HTTP request with page parameter

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case UserUI-012: Responsive Design (Mobile View)

**Priority**: LOW
**Feature**: User UI - Responsive Design

**Test Steps**:
1. Resize browser to mobile width (375px)
2. Navigate through pages

**Expected Results**:
- UI adapts to mobile screen
- Material-UI responsive components work
- Navigation menu collapses to hamburger icon
- Content readable and functional

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 15. Integration & End-to-End Testing

### Test Case E2E-001: Complete Tournament Lifecycle

**Priority**: HIGH
**Feature**: End-to-End Workflow

**Test Steps**:
1. Admin creates tournament
2. Admin creates categories
3. Users register for tournament
4. Admin generates draw
5. Admin schedules matches
6. Referee scores matches
7. Winners progress through bracket
8. Final match completed
9. Champion determined

**Expected Results**:
- All steps complete successfully
- No data integrity issues
- Bracket progression works correctly
- Final winner recorded

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case E2E-002: User Registration to Match Participation

**Priority**: HIGH
**Feature**: End-to-End Workflow

**Test Steps**:
1. User registers for tournament via User UI
2. Admin generates draw
3. User's match appears in schedule
4. User checks in via QR code
5. Match is played and scored
6. User views result in bracket

**Expected Results**:
- Registration flows through entire system
- User can see their matches
- Check-in works
- Results visible in User UI

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case E2E-003: Concurrent Admin and User Actions

**Priority**: MEDIUM
**Feature**: End-to-End Workflow

**Test Steps**:
1. Admin schedules matches (Admin UI)
2. Simultaneously, users browse tournaments (User UI)
3. Referee scores match (Admin UI or API)
4. Users view updated bracket (User UI)

**Expected Results**:
- No conflicts
- Real-time updates visible (if WebSocket implemented)
- Database consistency maintained

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case E2E-004: Multi-Tournament Management

**Priority**: MEDIUM
**Feature**: End-to-End Workflow

**Test Steps**:
1. Create 3 tournaments with overlapping dates
2. Register different players for each
3. Generate draws for all
4. Schedule matches across all tournaments
5. Verify no player conflicts across tournaments

**Expected Results**:
- System handles multiple tournaments
- Player conflict detection works across tournaments
- No data mixing between tournaments

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case E2E-005: Export and Import Data

**Priority**: LOW
**Feature**: End-to-End Workflow

**Test Steps**:
1. Export registrations to CSV
2. Export matches to JSON
3. Verify data completeness
4. Import functionality (if available)

**Expected Results**:
- Exports contain all relevant data
- Data can be used for external processing
- No data loss

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case E2E-006: Full Bracket with BYEs and Progression

**Priority**: HIGH
**Feature**: End-to-End Workflow

**Test Steps**:
1. Create category with 6 participants
2. Generate draw (2 BYEs expected)
3. Complete all matches round by round
4. Verify winner progression at each stage
5. Complete final match

**Expected Results**:
- BYE participants auto-advance
- All matches progress correctly
- Final winner determined
- No orphaned matches

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 16. Edge Cases & Error Handling

### Test Case Edge-001: Empty Tournaments List

**Priority**: LOW
**Feature**: Edge Cases

**Test Steps**:
1. Delete all tournaments
2. Navigate to Tournaments page

**Expected Results**:
- Empty state message displayed
- No errors in console
- "Create New Tournament" prompt shown

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-002: Tournament with No Registrations

**Priority**: MEDIUM
**Feature**: Edge Cases

**Test Steps**:
1. Create tournament and categories
2. Do NOT register any players
3. Attempt to generate draw

**Expected Results**:
- HTTP 400 Bad Request
- Error: "At least 2 registrations required"
- No bracket created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-003: Match with No Court Assigned

**Priority**: LOW
**Feature**: Edge Cases

**Test Steps**:
1. Create match without court assignment
2. View match in Matches page

**Expected Results**:
- Match displayed
- Court shows "TBD" or similar placeholder
- No crash or error

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-004: Match with No Scheduled Time

**Priority**: LOW
**Feature**: Edge Cases

**Test Steps**:
1. Create match without scheduled time
2. View match

**Expected Results**:
- Match displayed
- Scheduled time shows "TBD" or blank
- No error

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-005: Bracket with All BYEs (2 Participants)

**Priority**: MEDIUM
**Feature**: Edge Cases

**Test Steps**:
1. Create category with only 2 participants
2. Generate draw

**Expected Results**:
- Bracket size = 2 (no BYEs needed)
- Single match created (final)
- Both participants in final match

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-006: Very Large Tournament (100+ Participants)

**Priority**: LOW
**Feature**: Edge Cases - Performance

**Test Steps**:
1. Create category with 100+ registrations
2. Generate draw
3. Run auto-scheduler

**Expected Results**:
- Draw generation completes (may take time)
- Correct number of matches created (127 for 128 bracket)
- Auto-scheduler handles large dataset
- No timeout errors

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-007: Special Characters in Names

**Priority**: LOW
**Feature**: Edge Cases - Validation

**Test Steps**:
1. Create player with name: "O'Connor-Smith"
2. Create tournament with location: "São Paulo"

**Expected Results**:
- Special characters accepted (apostrophes, hyphens, accents)
- Data stored correctly
- Display correct in UI

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-008: Invalid JWT Token

**Priority**: MEDIUM
**Feature**: Edge Cases - Security

**Test Steps**:
1. Manually edit JWT token in localStorage
2. Attempt API request

**Expected Results**:
- HTTP 401 Unauthorized
- Error: "Invalid token"
- Redirected to login

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-009: Network Failure During Registration

**Priority**: LOW
**Feature**: Edge Cases - Error Handling

**Test Steps**:
1. Start registration process
2. Disconnect network mid-request
3. Observe UI behavior

**Expected Results**:
- Error message displayed: "Network error, please try again"
- Registration NOT created (no partial data)
- User can retry

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-010: SQL Injection Attempt

**Priority**: HIGH
**Feature**: Edge Cases - Security

**Test Steps**:
1. Attempt SQL injection in tournament name field:
   - `"; DROP TABLE tournament; --`

**Expected Results**:
- Input treated as literal string
- No SQL execution
- Validation may reject special characters
- Database NOT affected

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-011: XSS Attempt in Player Name

**Priority**: HIGH
**Feature**: Edge Cases - Security

**Test Steps**:
1. Create player with name: `<script>alert('XSS')</script>`

**Expected Results**:
- Input sanitized or escaped
- Script does NOT execute when viewing player
- XSS protection working

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Edge-012: Delete Player with Existing Matches

**Priority**: MEDIUM
**Feature**: Edge Cases - Data Integrity

**Test Steps**:
1. Player has completed matches with scores
2. Attempt to delete player

**Expected Results**:
- HTTP 409 Conflict or HTTP 400
- Error: "Cannot delete player with existing matches"
- Foreign key constraint prevents deletion
- Data integrity maintained

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 17. Performance & Load Testing

### Test Case Perf-001: API Response Time - List Tournaments

**Priority**: MEDIUM
**Feature**: Performance

**Test Steps**:
1. Measure response time for GET /api/v1/tournaments
2. Repeat 10 times and calculate average

**Expected Results**:
- Average response time < 200ms
- No significant variation between requests

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Perf-002: Draw Generation Performance (Large Tournament)

**Priority**: MEDIUM
**Feature**: Performance

**Test Steps**:
1. Create category with 64 participants
2. Measure time to generate draw

**Expected Results**:
- Draw generation completes in < 5 seconds
- 63 matches created
- No timeout

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Perf-003: Auto-Scheduler Performance

**Priority**: MEDIUM
**Feature**: Performance

**Test Steps**:
1. Tournament with 100+ matches
2. Run auto-scheduler simulation
3. Measure time

**Expected Results**:
- Simulation completes in < 10 seconds
- Algorithm handles large dataset
- No timeout

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Perf-004: Concurrent User Load (10 Users)

**Priority**: LOW
**Feature**: Performance - Load Testing

**Test Steps**:
1. Simulate 10 concurrent users browsing tournaments
2. Use JMeter or similar tool
3. Measure response times and error rate

**Expected Results**:
- All requests succeed
- Average response time < 500ms
- No server errors
- Database handles concurrent connections

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Perf-005: Database Query Performance

**Priority**: LOW
**Feature**: Performance

**Test Steps**:
1. Enable SQL query logging
2. Perform common operations
3. Check for N+1 query problems

**Expected Results**:
- No N+1 queries
- Proper use of JPA eager/lazy loading
- Indexes used for frequently queried fields

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Perf-006: Frontend Initial Load Time

**Priority**: LOW
**Feature**: Performance - Frontend

**Test Steps**:
1. Clear browser cache
2. Navigate to Admin UI
3. Measure time to interactive

**Expected Results**:
- Page loads in < 3 seconds
- No unnecessary bundle size
- Lazy loading implemented where appropriate

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 18. Security Testing

### Test Case Sec-001: Password Hashing

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Register new user with password "TestPass123"
2. Check database: `SELECT password_hash FROM users WHERE email = 'testuser@example.com'`

**Expected Results**:
- Password stored as BCrypt hash (starts with $2a$ or $2b$)
- NOT plain text
- Hash is 60 characters long

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-002: JWT Secret Security

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Check application.yml
2. Verify JWT secret configuration

**Expected Results**:
- JWT secret NOT hardcoded in repository
- Uses environment variable: ${JWT_SECRET}
- Secret is strong (at least 256 bits)

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-003: CORS Configuration

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Check SecurityConfig.java
2. Verify CORS settings
3. Attempt cross-origin request from unauthorized domain

**Expected Results**:
- CORS allows only specific origins (localhost:5173, localhost:5174 in dev)
- Unauthorized origins blocked
- Proper CORS headers in response

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-004: Prevent Unauthenticated Access to Protected Routes

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Do NOT login
2. Attempt POST /api/v1/tournaments (create tournament)

**Expected Results**:
- HTTP 401 Unauthorized
- Request blocked
- No tournament created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-005: Prevent Privilege Escalation

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Login as regular USER
2. Attempt to modify user roles in database or via API
3. Try to access SYSTEM_ADMIN endpoints

**Expected Results**:
- HTTP 403 Forbidden
- Role modification blocked
- Users cannot escalate their own privileges

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-006: Session Timeout

**Priority**: MEDIUM
**Feature**: Security

**Test Steps**:
1. Login and obtain JWT token
2. Wait for token expiration (default: 3 days, can be reduced for testing)
3. Attempt API request with expired token

**Expected Results**:
- HTTP 401 Unauthorized
- Error: "Token expired"
- User must re-login

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-007: Rate Limiting (If Implemented)

**Priority**: LOW
**Feature**: Security

**Test Steps**:
1. Send 20 login requests rapidly
2. Observe response

**Expected Results**:
- After threshold (e.g., 5 attempts), rate limit triggered
- HTTP 429 Too Many Requests
- Prevents brute force attacks

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-008: Input Validation (Email Format)

**Priority**: MEDIUM
**Feature**: Security - Validation

**Test Steps**:
1. Attempt to register with invalid email: "notanemail"

**Expected Results**:
- HTTP 400 Bad Request
- Error: "Invalid email format"
- No user created

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-009: Parameterized Queries (SQL Injection Prevention)

**Priority**: HIGH
**Feature**: Security

**Test Steps**:
1. Review repository code
2. Verify all queries use JPA or parameterized queries
3. No string concatenation in SQL

**Expected Results**:
- All queries use JPA methods or @Query with parameters
- No SQL injection vulnerabilities
- Spring Data JPA handles parameterization

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

### Test Case Sec-010: HTTPS Only (Production)

**Priority**: MEDIUM
**Feature**: Security

**Test Steps**:
1. In production configuration, verify SSL/TLS settings
2. Attempt HTTP request
3. Verify redirect to HTTPS

**Expected Results**:
- HTTP requests redirected to HTTPS
- SSL certificate valid
- Secure communication enforced

**Actual Results**: _[Tester fills in]_

**Status**: ☐ Pass ☐ Fail ☐ Blocked

---

## 19. Bug Reporting Template

When a test fails, use the following template to report the bug:

---

**Bug ID**: BUG-[Number]
**Test Case ID**: [e.g., Auth-002]
**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2 / P3

**Environment**:
- Backend Version: [e.g., 1.0.0]
- Browser: [e.g., Chrome 120.0]
- OS: [e.g., Ubuntu 22.04]

**Summary**: [One-line description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Screenshots/Logs**: [Attach if available]

**Additional Context**: [Any other relevant information]

**Suggested Fix**: [Optional - if tester has insight]

---

## 20. Appendices

### Appendix A: API Endpoint Reference

**Authentication**:
- POST /api/v1/auth/register
- POST /api/v1/auth/login

**Tournaments**:
- GET /api/v1/tournaments
- GET /api/v1/tournaments/{id}
- POST /api/v1/tournaments
- PUT /api/v1/tournaments/{id}
- DELETE /api/v1/tournaments/{id}

**Players**:
- GET /api/v1/players
- GET /api/v1/players/{id}
- POST /api/v1/players
- PUT /api/v1/players/{id}
- DELETE /api/v1/players/{id}

**Courts**:
- GET /api/v1/courts
- GET /api/v1/courts/{id}
- POST /api/v1/courts
- PUT /api/v1/courts/{id}
- DELETE /api/v1/courts/{id}

**Categories**:
- GET /api/v1/tournaments/{tournamentId}/categories
- GET /api/v1/categories/{id}
- POST /api/v1/categories
- PUT /api/v1/categories/{id}
- DELETE /api/v1/categories/{id}

**Matches**:
- GET /api/v1/matches
- GET /api/v1/matches/{id}
- POST /api/v1/matches
- PUT /api/v1/matches/{id}
- DELETE /api/v1/matches/{id}
- POST /api/v1/matches/{id}/start
- POST /api/v1/matches/{id}/complete
- POST /api/v1/matches/{id}/walkover
- POST /api/v1/matches/{id}/retired
- PUT /api/v1/matches/{id}/score
- PUT /api/v1/matches/{id}/schedule
- PUT /api/v1/matches/{id}/lock
- PUT /api/v1/matches/{id}/unlock

**Scheduling**:
- POST /api/v1/scheduling/simulate
- POST /api/v1/scheduling/apply
- GET /api/v1/scheduling/matches

**Brackets**:
- POST /api/v1/tournaments/{tournamentId}/categories/{categoryId}/draw:generate
- GET /api/v1/categories/{categoryId}/bracket
- DELETE /api/v1/categories/{categoryId}/bracket

**Registrations**:
- GET /api/v1/registrations
- GET /api/v1/registrations/{id}
- POST /api/v1/registrations
- PUT /api/v1/registrations/{id}
- DELETE /api/v1/registrations/{id}
- POST /api/v1/registrations/{id}/check-in
- POST /api/v1/registrations/{id}/undo-check-in
- POST /api/v1/registrations/batch-check-in
- POST /api/v1/registrations/batch-undo-check-in
- PUT /api/v1/registrations/{id}/sync-scheduled-time
- GET /api/v1/registrations/{id}/qrcode
- POST /api/v1/registrations/qrcode/check-in
- GET /api/v1/registrations/export/csv
- GET /api/v1/registrations/export/pdf

**Tournament Roles**:
- GET /api/v1/tournaments/{tournamentId}/roles
- POST /api/v1/tournaments/{tournamentId}/roles
- DELETE /api/v1/tournaments/{tournamentId}/roles/{assignmentId}
- GET /api/v1/tournaments/{tournamentId}/roles/by-role/{role}
- GET /api/v1/tournaments/{tournamentId}/roles/me

### Appendix B: Test Data Summary

**Users**: 1 (admin@example.com)
**Tournaments**: 2 (City Open, Winter Cup)
**Players**: 12
**Teams**: 10
**Courts**: 2
**Categories**: 6 (5 for City Open, 1 for Winter Cup)
**Registrations**: ~20 pre-populated

### Appendix C: Converting This Document to PDF

**Using Pandoc** (recommended):
```bash
# Install Pandoc
sudo apt install pandoc texlive-latex-base texlive-fonts-recommended

# Convert to PDF
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf --toc --number-sections

# With custom styling
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf \
  --toc \
  --number-sections \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=report
```

**Using VS Code Extension**:
1. Install "Markdown PDF" extension
2. Open this file in VS Code
3. Right-click → "Markdown PDF: Export (pdf)"

**Using Online Tools**:
- https://www.markdowntopdf.com/
- https://cloudconvert.com/md-to-pdf

### Appendix D: Test Execution Tracking

Use this table to track overall progress:

| Section | Total Tests | Passed | Failed | Blocked | % Complete |
|---------|-------------|--------|--------|---------|------------|
| Authentication | 8 | | | | |
| Tournament Management | 10 | | | | |
| Player Management | 8 | | | | |
| Court Management | 6 | | | | |
| Category Management | 7 | | | | |
| Match Management | 12 | | | | |
| Match Scheduling | 20 | | | | |
| Draw & Bracket | 12 | | | | |
| Registration & Check-In | 14 | | | | |
| RBAC | 17 | | | | |
| User UI | 12 | | | | |
| Integration & E2E | 6 | | | | |
| Edge Cases | 12 | | | | |
| Performance | 6 | | | | |
| Security | 10 | | | | |
| **TOTAL** | **160** | | | | |

---

## Summary

This manual testing guide provides comprehensive coverage of the Badminton Tournament Manager application with **160+ test cases** across all features. Testers should execute tests in the order presented, starting with setup and authentication, then progressing through core features, and finally edge cases and performance testing.

**Estimated Testing Effort**: 40-60 hours for complete execution

**Critical Path Tests** (must pass before production):
- All Authentication tests
- All RBAC tests
- Draw generation and bracket progression
- Match scheduling conflict detection
- All Security tests
- Integration E2E-001 through E2E-006

For questions or issues during testing, refer to:
- Swagger UI for API documentation
- Project CLAUDE.md files for technical context
- Backend logs for debugging

**Good luck with testing!**
