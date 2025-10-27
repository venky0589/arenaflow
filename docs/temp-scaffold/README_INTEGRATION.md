# Tailored Draw Generation Backend (Single-Elimination)

## You already have these entities
- `Tournament`, `Player`, `Court`, `Registration`, `Match`, `MatchStatus`, `CategoryType` in package `com.example.tournament.domain`.

## Required minimal changes to your existing entities

### 1) Registration.java
Add a link to Category for per-category registration.
```java
// inside com.example.tournament.domain.Registration
@ManyToOne
private Category category;
```
Populate it when creating a registration and in migration V4 we add `registration.category_id`.

### 2) Match.java
Add bracket columns so we can persist the tree.
```java
// inside com.example.tournament.domain.Match
@Column private Long categoryId;
@Column private Integer round;
@Column private Integer position;
@Column private Long nextMatchId;
@Column private Short winnerAdvancesAs; // 1 or 2
@Column private Long participant1RegistrationId;
@Column private Long participant2RegistrationId;
@Column private Boolean isBye = false;

public void setCategoryId(Long v){ this.categoryId = v; } public Long getCategoryId(){ return categoryId; }
public void setRound(Integer v){ this.round = v; } public Integer getRound(){ return round; }
public void setPosition(Integer v){ this.position = v; } public Integer getPosition(){ return position; }
public void setNextMatchId(Long v){ this.nextMatchId = v; } public Long getNextMatchId(){ return nextMatchId; }
public void setWinnerAdvancesAs(Short v){ this.winnerAdvancesAs = v; } public Short getWinnerAdvancesAs(){ return winnerAdvancesAs; }
public void setParticipant1RegistrationId(Long v){ this.participant1RegistrationId = v; } public Long getParticipant1RegistrationId(){ return participant1RegistrationId; }
public void setParticipant2RegistrationId(Long v){ this.participant2RegistrationId = v; } public Long getParticipant2RegistrationId(){ return participant2RegistrationId; }
public void setBye(Boolean v){ this.isBye = v; } public Boolean getBye(){ return isBye; }
```
> Note: Keeping existing `player1/player2` fields is fine for legacy, but bracket will use registration-based IDs to unify Singles/Doubles later.

## New classes included
- `Category.java` and `TournamentFormat.java` in `domain`
- `Seed.java` in `domain`
- repositories under `repository`
- DTOs under `api.dto`
- `BracketService` + `BracketServiceImpl`
- `BracketController`

## Apply Migrations
- Place `sql/*.sql` into your Flyway migrations folder; renumber if needed.
- Run migrations; then build.

## Wire Security
- Controller uses `@PreAuthorize`. Ensure method security is enabled.

## Try with Postman
- Import `postman/tournament-bracket-api.postman_collection.json`
- Set `{{baseUrl}}` and IDs; hit generate, then get.
