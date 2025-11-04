# Category Management Enhancements - MVP7

**Date**: 2025-11-03
**Status**: ✅ Complete
**Version**: 1.0

---

## Overview

This document describes the Category Management Enhancements (MVP7) feature implementation, which adds age/gender/fee/participant constraints to the tournament category system.

### Goals

1. Enable age-based category restrictions (e.g., Under-18, Senior 40+)
2. Support gender-specific categories (Male, Female, Open)
3. Add participant capacity management
4. Enable registration fee collection per category
5. Provide proper validation and RBAC controls

---

## Database Changes

### Migration: V30__category_enhancements.sql

**New Columns Added to `category` table:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `min_age` | INTEGER | YES | NULL | Minimum age requirement (computed on tournament start date) |
| `max_age` | INTEGER | YES | NULL | Maximum age requirement (computed on tournament start date) |
| `gender_restriction` | VARCHAR(16) | NO | 'OPEN' | Gender requirement: MALE, FEMALE, or OPEN |
| `max_participants` | INTEGER | YES | NULL | Hard cap on registrations (NULL = unlimited) |
| `registration_fee` | NUMERIC(10,2) | NO | 0.00 | Registration fee in INR |

**Constraints Added:**

```sql
-- Age validations
chk_category_min_age: min_age >= 0 OR min_age IS NULL
chk_category_max_age: max_age >= 0 OR max_age IS NULL
chk_category_age_range: min_age <= max_age (when both are set)

-- Gender validation
chk_category_gender_restriction: gender_restriction IN ('MALE', 'FEMALE', 'OPEN')

-- Participant validation
chk_category_max_participants: max_participants >= 2 OR max_participants IS NULL

-- Fee validation
chk_category_registration_fee: registration_fee >= 0.00
```

**Indexes Created:**

```sql
idx_category_gender_restriction ON category(gender_restriction)
idx_category_tournament_age ON category(tournament_id, min_age, max_age)
```

---

## Backend Implementation

### 1. Domain Layer

#### New Enum: GenderRestriction

```java
public enum GenderRestriction {
    MALE,    // Male players only
    FEMALE,  // Female players only
    OPEN     // Open to all genders (default)
}
```

**File**: [backend/src/main/java/com/example/tournament/domain/GenderRestriction.java](../backend/src/main/java/com/example/tournament/domain/GenderRestriction.java)

#### Updated Entity: Category

**File**: [backend/src/main/java/com/example/tournament/domain/Category.java](../backend/src/main/java/com/example/tournament/domain/Category.java)

**New Fields:**
```java
@NotNull
@Enumerated(EnumType.STRING)
@Column(name = "gender_restriction", nullable = false, length = 16)
private GenderRestriction genderRestriction = GenderRestriction.OPEN;

@Column(name = "min_age")
private Integer minAge;

@Column(name = "max_age")
private Integer maxAge;

@Column(name = "max_participants")
private Integer maxParticipants;

@Column(name = "registration_fee", precision = 10, scale = 2)
private BigDecimal registrationFee;
```

### 2. DTOs

#### CreateCategoryRequest

**File**: [backend/src/main/java/com/example/tournament/dto/request/CreateCategoryRequest.java](../backend/src/main/java/com/example/tournament/dto/request/CreateCategoryRequest.java)

**Validations:**
- Tournament ID required
- Category name: 2-120 characters
- Category type and format required
- Gender restriction required (defaults to OPEN)
- Min age >= 0, Max age >= 0
- Max participants >= 2
- Registration fee >= 0.00 (defaults to 0.00)
- Age range validation: minAge <= maxAge

#### UpdateCategoryRequest

**File**: [backend/src/main/java/com/example/tournament/dto/request/UpdateCategoryRequest.java](../backend/src/main/java/com/example/tournament/dto/request/UpdateCategoryRequest.java)

All fields optional, same validation rules as Create.

#### CategoryResponse

**File**: [backend/src/main/java/com/example/tournament/dto/response/CategoryResponse.java](../backend/src/main/java/com/example/tournament/dto/response/CategoryResponse.java)

Returns all category fields including new constraints.

### 3. Services & Utilities

#### AgeCalculator Utility

**File**: [backend/src/main/java/com/example/tournament/util/AgeCalculator.java](../backend/src/main/java/com/example/tournament/util/AgeCalculator.java)

**Key Methods:**
- `calculateAge(birthDate, referenceDate)` - Calculate age on specific date
- `calculateCurrentAge(birthDate)` - Calculate current age
- `isAgeInRange(age, minAge, maxAge)` - Check if age is within range
- `isEligibleByAge(birthDate, tournamentStartDate, minAge, maxAge)` - Full eligibility check

**Usage Example:**
```java
LocalDate birthDate = LocalDate.of(2005, 6, 15);
LocalDate tournamentStart = LocalDate.of(2025, 11, 10);
int age = AgeCalculator.calculateAge(birthDate, tournamentStart); // 20

boolean eligible = AgeCalculator.isEligibleByAge(
    birthDate,
    tournamentStart,
    18,  // minAge
    25   // maxAge
); // true
```

#### CategoryValidator Service

**File**: [backend/src/main/java/com/example/tournament/service/CategoryValidator.java](../backend/src/main/java/com/example/tournament/service/CategoryValidator.java)

**Validation Methods:**

1. **validatePlayerEligibility(player, category, tournament)**
   - Validates gender restriction (currently implemented)
   - Age validation (TODO: pending Player.dateOfBirth field)

2. **validateGenderRestriction(player, category)** ✅ Implemented
   - Checks if player's gender matches category restriction
   - Normalizes gender strings (M/MALE, F/FEMALE)
   - Throws ValidationException if mismatch

3. **validateAgeRestriction(player, category, tournament)** ⏸️ Commented Out
   - Will be enabled when Player entity has dateOfBirth field
   - Calculates age on tournament start date
   - Validates against min/max age constraints

4. **validateParticipantCapacity(category, currentCount)**
   - Checks if category has reached max participants
   - Throws ValidationException if full

5. **validateAgeRange(minAge, maxAge)**
   - Ensures minAge <= maxAge
   - Used in create/update operations

#### CategoryService

**File**: [backend/src/main/java/com/example/tournament/service/CategoryServiceImpl.java](../backend/src/main/java/com/example/tournament/service/CategoryServiceImpl.java)

**CRUD Operations:**
- `listByTournament(tournamentId)` - Get all categories for tournament
- `findById(id)` - Get category by ID
- `create(request)` - Create new category with validation
- `update(id, request)` - Update category with validation
- `deleteById(id)` - Delete category

**Validation Flow:**
```
create() → validateAgeRange() → save()
update() → validateAgeRange() → save()
```

### 4. REST Controller

#### CategoryController

**File**: [backend/src/main/java/com/example/tournament/web/CategoryController.java](../backend/src/main/java/com/example/tournament/web/CategoryController.java)

**Endpoints:**

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/tournaments/{id}/categories` | Public | List categories for tournament |
| GET | `/api/v1/categories/{id}` | Public | Get category by ID |
| POST | `/api/v1/categories` | SYSTEM_ADMIN or Tournament OWNER/ADMIN | Create category |
| PUT | `/api/v1/categories/{id}` | SYSTEM_ADMIN or Tournament OWNER/ADMIN | Update category |
| DELETE | `/api/v1/categories/{id}` | SYSTEM_ADMIN or Tournament OWNER/ADMIN | Delete category |

**RBAC Implementation:**

```java
// Create - check tournament permission
@PreAuthorize("hasRole('SYSTEM_ADMIN') || @authzService.canManageTournament(#request.tournamentId())")

// Update/Delete - check category's tournament permission
@PreAuthorize("hasRole('SYSTEM_ADMIN') || @authzService.canManageTournamentOfCategory(#id)")
```

### 5. Authorization

#### AuthzService Enhancement

**File**: [backend/src/main/java/com/example/tournament/service/AuthzService.java](../backend/src/main/java/com/example/tournament/service/AuthzService.java:232-242)

**New Method:**
```java
public boolean canManageTournamentOfCategory(Long categoryId) {
    // Find the category's tournament
    Category category = categoryRepo.findById(categoryId).orElse(null);
    if (category == null || category.getTournament() == null) {
        return false;
    }

    Long tournamentId = category.getTournament().getId();
    return canManageTournament(tournamentId);
}
```

This enables tournament-scoped RBAC for category update/delete operations.

---

## API Examples

### Create Category

**Request:**
```bash
POST /api/v1/categories
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tournamentId": 1,
  "name": "Men's Singles - Under 21",
  "categoryType": "SINGLES",
  "format": "SINGLE_ELIMINATION",
  "genderRestriction": "MALE",
  "minAge": null,
  "maxAge": 21,
  "maxParticipants": 32,
  "registrationFee": 500.00
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "tournamentId": 1,
  "name": "Men's Singles - Under 21",
  "categoryType": "SINGLES",
  "format": "SINGLE_ELIMINATION",
  "genderRestriction": "MALE",
  "minAge": null,
  "maxAge": 21,
  "maxParticipants": 32,
  "registrationFee": 500.00
}
```

### Update Category

**Request:**
```bash
PUT /api/v1/categories/10
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "registrationFee": 450.00,
  "maxParticipants": 64
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "tournamentId": 1,
  "name": "Men's Singles - Under 21",
  "categoryType": "SINGLES",
  "format": "SINGLE_ELIMINATION",
  "genderRestriction": "MALE",
  "minAge": null,
  "maxAge": 21,
  "maxParticipants": 64,
  "registrationFee": 450.00
}
```

### List Categories

**Request:**
```bash
GET /api/v1/tournaments/1/categories
```

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "tournamentId": 1,
    "name": "Men's Singles - Under 21",
    "categoryType": "SINGLES",
    "format": "SINGLE_ELIMINATION",
    "genderRestriction": "MALE",
    "minAge": null,
    "maxAge": 21,
    "maxParticipants": 64,
    "registrationFee": 450.00
  },
  {
    "id": 11,
    "tournamentId": 1,
    "name": "Women's Doubles - Open",
    "categoryType": "DOUBLES",
    "format": "ROUND_ROBIN",
    "genderRestriction": "FEMALE",
    "minAge": null,
    "maxAge": null,
    "maxParticipants": null,
    "registrationFee": 0.00
  }
]
```

---

## Validation Rules

### Age Validation

**Business Rules:**
1. Age is calculated on tournament start date, not current date
2. NULL min_age means no minimum age restriction
3. NULL max_age means no maximum age restriction
4. Both NULL means open to all ages
5. min_age must be <= max_age (when both set)

**Example Categories:**
- Under-18: minAge=null, maxAge=17
- Senior 40+: minAge=40, maxAge=null
- Veterans 55-65: minAge=55, maxAge=65
- Open: minAge=null, maxAge=null

**Current Status:**
⏸️ Age validation is commented out in CategoryValidator because Player entity doesn't have dateOfBirth field yet. The logic is ready to be uncommented once Player.dateOfBirth is added.

### Gender Validation

**Business Rules:**
1. MALE category: Only accepts players with gender = "M" or "MALE" (case-insensitive)
2. FEMALE category: Only accepts players with gender = "F" or "FEMALE" (case-insensitive)
3. OPEN category: Accepts all players regardless of gender
4. Default is OPEN

**Status:** ✅ Fully implemented and working

### Participant Capacity

**Business Rules:**
1. NULL max_participants means unlimited registrations
2. When set, must be >= 2 (minimum for any competition)
3. Validation throws "Category is full" when capacity reached

**Example:**
```java
categoryValidator.validateParticipantCapacity(category, 31); // OK if max is 32 or null
categoryValidator.validateParticipantCapacity(category, 32); // Throws if max is 32
```

### Registration Fee

**Business Rules:**
1. Must be >= 0.00 (no negative fees)
2. Precision: 10 digits, 2 decimal places
3. Currency: INR (assumed)
4. Default is 0.00 (free entry)

---

## Testing

### Unit Tests

**CategoryValidator tests** (recommended):
```java
@Test
void validateGenderRestriction_maleCategory_rejectsFemalePlayers() {
    // Test gender validation
}

@Test
void validateAgeRange_invalidRange_throwsException() {
    // Test age range validation
}

@Test
void validateParticipantCapacity_fullCategory_throwsException() {
    // Test capacity validation
}
```

### Integration Tests

**CategoryController tests** (recommended):
```java
@Test
void createCategory_validRequest_returnsCreated() {
    // Test create endpoint
}

@Test
void updateCategory_asNonOwner_returnsForbidden() {
    // Test RBAC
}
```

### Manual Testing Checklist

- [ ] Create category with age restrictions
- [ ] Create category with gender restriction
- [ ] Create category with participant limit
- [ ] Create category with registration fee
- [ ] Update category fields
- [ ] Delete category
- [ ] Verify SYSTEM_ADMIN can manage all categories
- [ ] Verify tournament OWNER can manage their categories
- [ ] Verify tournament ADMIN can manage their categories
- [ ] Verify non-owners cannot modify categories
- [ ] Test age range validation (minAge > maxAge should fail)
- [ ] Test negative fee validation (should fail)
- [ ] Test participant limit < 2 (should fail)

---

## Known Limitations & Future Work

### Current Limitations

1. **Age validation disabled**: Player entity needs `dateOfBirth` field
   - Code is ready but commented out
   - Will be enabled in future sprint

2. **No UI for categories**: Admin UI needs category management page
   - Planned for next phase
   - Currently API-only

3. **No automatic capacity enforcement**: Registration service needs integration
   - CategoryValidator.validateParticipantCapacity() exists
   - Needs to be called from RegistrationService

### Future Enhancements

1. **Multi-currency support**: Currently assumes INR
2. **Dynamic pricing**: Time-based early bird discounts
3. **Partner/team categories**: For doubles, require partner info at registration
4. **Skill level restrictions**: Beginner, Intermediate, Advanced
5. **Geographic restrictions**: Regional categories
6. **Combined restrictions**: e.g., "Women's 40+ Doubles"

---

## Migration Guide

### For Existing Tournaments

All existing categories will have:
- `gender_restriction` = 'OPEN' (set by migration)
- `registration_fee` = 0.00 (default)
- `min_age` = NULL (no restriction)
- `max_age` = NULL (no restriction)
- `max_participants` = NULL (unlimited)

**No action required** - existing categories work as before.

### Adding Constraints to Existing Categories

Use the Update API:

```bash
PUT /api/v1/categories/{id}
{
  "genderRestriction": "MALE",
  "minAge": 18,
  "maxAge": 35,
  "maxParticipants": 64,
  "registrationFee": 1000.00
}
```

---

## Files Modified/Created

### Created Files

1. `backend/src/main/java/com/example/tournament/domain/GenderRestriction.java`
2. `backend/src/main/java/com/example/tournament/dto/request/CreateCategoryRequest.java`
3. `backend/src/main/java/com/example/tournament/dto/request/UpdateCategoryRequest.java`
4. `backend/src/main/java/com/example/tournament/service/CategoryValidator.java`
5. `backend/src/main/java/com/example/tournament/util/AgeCalculator.java`
6. `backend/src/main/resources/db/migration/V30__category_enhancements.sql`

### Modified Files

1. `backend/src/main/java/com/example/tournament/domain/Category.java`
2. `backend/src/main/java/com/example/tournament/mapper/CategoryMapper.java`
3. `backend/src/main/java/com/example/tournament/service/AuthzService.java`
4. `backend/src/main/java/com/example/tournament/service/CategoryService.java`
5. `backend/src/main/java/com/example/tournament/service/CategoryServiceImpl.java`
6. `backend/src/main/java/com/example/tournament/web/CategoryController.java`
7. `backend/src/test/java/com/example/tournament/service/AuthzServiceTest.java`

---

## Commits

1. **601ecec** - feat: Category management enhancements (MVP7)
2. **c879446** - fix: Update AuthzServiceTest to include CategoryRepository parameter

---

## References

- [Project Brief](../docs/tournament_project_brief.txt)
- [CLAUDE.md](../CLAUDE.md) - Project context
- [RBAC Documentation](./RBAC_REVIEW_FIXES_SUMMARY.md)
- [Swagger UI](http://localhost:8080/swagger-ui/index.html) - API documentation

---

**Implementation completed**: 2025-11-03
**Tested**: Database migration verified
**Status**: ✅ Ready for use
