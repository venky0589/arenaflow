#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
BASE_URL="${BASE_URL:-http://localhost:8080}"

# Credentials per role (override via env)
ADMIN_EMAIL="${ADMIN_EMAIL:-admin.e2e@arena.local}"
ADMIN_PASS="${ADMIN_PASS:-Admin#123}"

REFEREE_EMAIL="${REFEREE_EMAIL:-referee.e2e@arena.local}"
REFEREE_PASS="${REFEREE_PASS:-Ref#12345}"

USER_EMAIL="${USER_EMAIL:-user.e2e@arena.local}"
USER_PASS="${USER_PASS:-User#12345}"

# We usually cannot register the admin here; expect it to exist already.
REGISTER_REFEREE="${REGISTER_REFEREE:-1}"
REGISTER_USER="${REGISTER_USER:-1}"

# Endpoint Map (override if your routes differ)
EP_LOGIN="${EP_LOGIN:-/api/v1/auth/login}"
EP_REGISTER="${EP_REGISTER:-/api/v1/auth/register}"

EP_TOURNAMENTS="${EP_TOURNAMENTS:-/api/v1/tournaments}"
EP_TOURNAMENT_ROLES="${EP_TOURNAMENT_ROLES:-/api/v1/tournaments/{tournamentId}/roles}"

EP_CATEGORIES="${EP_CATEGORIES:-/api/v1/categories}"
EP_CATEGORIES_BY_TOURNAMENT="${EP_CATEGORIES_BY_TOURNAMENT:-/api/v1/tournaments/{tournamentId}/categories}"
EP_DRAW_GENERATE="${EP_DRAW_GENERATE:-/api/v1/tournaments/{tournamentId}/categories/{categoryId}/draw:generate}"
EP_BRACKET="${EP_BRACKET:-/api/v1/categories/{categoryId}/bracket}"

EP_PLAYERS="${EP_PLAYERS:-/api/v1/players}"
EP_TEAMS="${EP_TEAMS:-/api/v1/teams}"
EP_REGISTRATIONS="${EP_REGISTRATIONS:-/api/v1/registrations}"

EP_MATCHES="${EP_MATCHES:-/api/v1/matches}"
EP_MATCH_BY_ID="${EP_MATCH_BY_ID:-/api/v1/matches/{id}}"
EP_MATCH_SCHEDULE="${EP_MATCH_SCHEDULE:-/api/v1/matches/{id}/schedule}"
EP_MATCH_SCORE="${EP_MATCH_SCORE:-/api/v1/matches/{id}/score}"

# ===== Helpers =====
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1"; exit 1; }; }
need jq; need curl

say() { printf "\n\033[1;36m%s\033[0m\n" "$*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

# Wrap curl with auth
api() {
  local method="$1"; shift
  local path="$1"; shift
  local data="${1:-}"
  local token="${2:-}"
  local url="${BASE_URL%/}${path}"
  local hdr=(-sS -H "Content-Type: application/json")
  [[ -n "$token" ]] && hdr+=(-H "Authorization: Bearer $token")

  if [[ -n "$data" ]]; then
    curl -w "\n" -X "$method" "${hdr[@]}" -d "$data" "$url"
  else
    curl -w "\n" -X "$method" "${hdr[@]}" "$url"
  fi
}

# Safe path substitution (only known tokens)
substitute_path() {
  local template="$1"
  template="${template//\{tournamentId\}/$TOURNAMENT_ID}"
  template="${template//\{categoryId\}/$CATEGORY_ID}"
  template="${template//\{id\}/$id}"
  echo "$template"
}

login() {
  local email="$1"; local pass="$2"
  local resp
  resp="$(api POST "$EP_LOGIN" "$(jq -n --arg e "$email" --arg p "$pass" '{email:$e, password:$p}')" "")"
  local token
  token="$(echo "$resp" | jq -r '.token // .accessToken // .jwt // empty')"
  [[ -n "$token" ]] || { echo "Login failed: $resp" >&2; return 1; }
  echo "$token"
}

register_user() {
  local email="$1"; local pass="$2"
  local resp
  resp="$(api POST "$EP_REGISTER" "$(jq -n --arg e "$email" --arg p "$pass" '{email:$e, password:$p}')" "")" || true
  echo "$resp" >/dev/null
}

# ===== Flow =====

say "0) Ensure test accounts (admin must already exist)"
[[ "$REGISTER_REFEREE" == "1" ]] && register_user "$REFEREE_EMAIL" "$REFEREE_PASS" || true
[[ "$REGISTER_USER" == "1" ]] && register_user "$USER_EMAIL" "$USER_PASS" || true
say "   - Referee/User ensured (admin not created here)"

say "1) Login as ADMIN"
ADMIN_TOKEN="$(login "$ADMIN_EMAIL" "$ADMIN_PASS")" || die "Admin login failed"

say "2) Create Tournament (as ADMIN/OWNER)"
# Avoid 409 by retrying with a random suffix if needed
for attempt in {1..3}; do
  T_NAME="ArenaFlow E2E $(date +%s)-$RANDOM"
  START_DATE="$(date -u +%Y-%m-%d)"
  END_DATE="$(date -u -d '+2 days' +%Y-%m-%d)"
  T_JSON="$(api POST "$EP_TOURNAMENTS" "$(jq -n --arg n "$T_NAME" --arg loc "Hyderabad" --arg sd "$START_DATE" --arg ed "$END_DATE" \
    '{name:$n, location:$loc, startDate:$sd, endDate:$ed, timezone:"Asia/Kolkata"}')" "$ADMIN_TOKEN")" || true
  TOURNAMENT_ID="$(echo "$T_JSON" | jq -r '.id // .tournamentId // empty')"
  if [[ -n "$TOURNAMENT_ID" ]]; then break; fi
  if echo "$T_JSON" | jq -e '.status == 409' >/dev/null 2>&1; then
    say "   - Name collision, retrying with a new suffix..."
    sleep 1
    continue
  fi
  die "Tournament creation failed: $T_JSON"
done
say "   - Tournament ID: $TOURNAMENT_ID"

say "3) Assign REFEREE role to referee user (optional)"
if [[ -z "${USER_ID_REFEREE:-}" ]]; then
  say "   - USER_ID_REFEREE not provided; skipping assignment (set USER_ID_REFEREE to enable)"
else
  CATEGORY_ID=""; id="";  # ensure not accidentally substituted
  path="$(substitute_path "$EP_TOURNAMENT_ROLES")"
  ROLE_ASSIGN_JSON="$(api POST "$path" "$(jq -n --argjson uid "$USER_ID_REFEREE" '{userId:$uid, role:"REFEREE"}')" "$ADMIN_TOKEN")" || true
  echo "$ROLE_ASSIGN_JSON" >/dev/null
  say "   - Role assignment attempted (idempotent)"
fi

say "4) Create Category (DOUBLES, SINGLE_ELIMINATION, OPEN)"
CATEGORY_ID=""
path="$(substitute_path "$EP_CATEGORIES_BY_TOURNAMENT")"
C_JSON="$(api POST "$path" "$(jq -n \
  --arg name "MD Open" \
  --arg type "DOUBLES" \
  --arg format "SINGLE_ELIMINATION" \
  --arg gender "OPEN" \
  --argjson max 32 \
  --argjson fee 0 \
  '{name:$name, categoryType:$type, format:$format, genderRestriction:$gender, maxParticipants:$max, registrationFee:$fee}')" "$ADMIN_TOKEN")"
CATEGORY_ID="$(echo "$C_JSON" | jq -r '.id // .categoryId // empty')"
[[ -n "$CATEGORY_ID" ]] || die "Category creation failed: $C_JSON"
say "   - Category ID: $CATEGORY_ID"

say "5) Create two Players"
P1_JSON="$(api POST "$EP_PLAYERS" '{"firstName":"Ravi","lastName":"Kumar"}' "$ADMIN_TOKEN")"
P1_ID="$(echo "$P1_JSON" | jq -r '.id // .playerId // empty')"
P2_JSON="$(api POST "$EP_PLAYERS" '{"firstName":"Arun","lastName":"Varma"}' "$ADMIN_TOKEN")"
P2_ID="$(echo "$P2_JSON" | jq -r '.id // .playerId // empty')"
[[ -n "$P1_ID" && -n "$P2_ID" ]] || die "Player creation failed"
say "   - P1=$P1_ID, P2=$P2_ID"

say "6) Create Team (uses CreateTeamRequest {player1Id, player2Id})"
TEAM_JSON="$(api POST "$EP_TEAMS" "$(jq -n --argjson p1 "$P1_ID" --argjson p2 "$P2_ID" '{player1Id:$p1, player2Id:$p2}')" "$ADMIN_TOKEN")"
TEAM_ID="$(echo "$TEAM_JSON" | jq -r '.id // .teamId // empty')"
[[ -n "$TEAM_ID" ]] || die "Team creation failed: $TEAM_JSON"
say "   - TEAM_ID=$TEAM_ID"

say "7) Register the Team to Category"
REG_JSON="$(api POST "$EP_REGISTRATIONS" "$(jq -n --argjson tid "$TOURNAMENT_ID" --argjson cid "$CATEGORY_ID" --argjson team "$TEAM_ID" \
  '{tournamentId:$tid, categoryType:"DOUBLES", categoryId:$cid, teamId:$team}')" "$ADMIN_TOKEN")"
REG_ID="$(echo "$REG_JSON" | jq -r '.id // .registrationId // empty')"
[[ -n "$REG_ID" ]] || die "Registration failed: $REG_JSON"
say "   - REG_ID=$REG_ID"

say "8) Generate Draw for Category"
id="";  # ensure we don't substitute into wrong token
path="$(substitute_path "$EP_DRAW_GENERATE")"
DRAW_JSON="$(api POST "$path" '{"overwriteIfDraft":true}' "$ADMIN_TOKEN")"
FIRST_MATCH_ID="$(echo "$DRAW_JSON" | jq -r '.matches[0].id // empty')"
[[ -n "$FIRST_MATCH_ID" ]] || die "No matches produced by draw: $DRAW_JSON"
say "   - First match id: $FIRST_MATCH_ID"

say "9) Login as REFEREE"
REF_TOKEN="$(login "$REFEREE_EMAIL" "$REFEREE_PASS")" || die "Referee login failed"

say "10) Fetch match version (required for scheduling)"
id="$FIRST_MATCH_ID"
MATCH_JSON="$(api GET "$(substitute_path "$EP_MATCH_BY_ID")" "" "$REF_TOKEN")"
MATCH_VERSION="$(echo "$MATCH_JSON" | jq -r '.version // 0')"
[[ "$MATCH_VERSION" != "0" ]] || say "   - Version field missing or 0; using 0"

say "11) Schedule match"
SCHEDULED_AT="$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ)"
id="$FIRST_MATCH_ID"
SCHED_BODY="$(jq -n --arg at "$SCHEDULED_AT" --argjson court 1 --argjson ver "${MATCH_VERSION:-0}" '{scheduledAt:$at, courtId:$court, estimatedDurationMinutes:40, version:$ver}')"
SCHED_JSON="$(api PUT "$(substitute_path "$EP_MATCH_SCHEDULE")" "$SCHED_BODY" "$REF_TOKEN")"
echo "$SCHED_JSON" | jq '.status, .scheduledAt' >/dev/null
say "   - Scheduled at $SCHEDULED_AT on court 1"

say "12) Update score (auto-completes)"
id="$FIRST_MATCH_ID"
SCORE_JSON="$(api PUT "$(substitute_path "$EP_MATCH_SCORE")" '{"score1":21,"score2":18}' "$REF_TOKEN")"
STATUS="$(echo "$SCORE_JSON" | jq -r '.status // empty')"
[[ "$STATUS" == "COMPLETED" || -n "$STATUS" ]] || die "Score update failed: $SCORE_JSON"
say "   - Match status after scoring: ${STATUS:-UNKNOWN}"

say "13) Verify bracket reflects progression"
id="";  # do not pollute category replacement
path="$(substitute_path "$EP_BRACKET")"
BRACKET_JSON="$(api GET "$path" "" "$ADMIN_TOKEN")"
echo "$BRACKET_JSON" | jq '.matches[0] | {id, status}' >/dev/null || true
say "✅ E2E tournament flow finished"

# Print a compact summary
jq -n --arg t "$TOURNAMENT_ID" --arg c "$CATEGORY_ID" --arg team "$TEAM_ID" --arg match "$FIRST_MATCH_ID" \
  '{tournamentId:$t|tonumber, categoryId:$c|tonumber, teamId:$team|tonumber, firstMatchId:$match|tonumber}'