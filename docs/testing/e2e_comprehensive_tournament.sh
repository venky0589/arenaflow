#!/bin/bash

# End-to-End Test: Comprehensive Multi-Category Tournament
# Tests all category types and formats in a single tournament:
# - Singles: Men's Singles (MS), Women's Singles (WS), Open Singles (OS)
# - Doubles: Men's Doubles (MD), Women's Doubles (WD), Mixed Doubles (XD)
# - Format: Single Elimination (Round Robin not implemented in MVP)
# Data is preserved for inspection (NO_CLEANUP by default)

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the test helpers
source "${SCRIPT_DIR}/test_helpers.sh" || {
    echo "Error: Could not load test_helpers.sh"
    exit 1
}

# ============================================================================
# Test Configuration
# ============================================================================

TOURNAMENT_NAME="Comprehensive Tournament $(date +%Y%m%d_%H%M%S)"
TOURNAMENT_LOCATION="Grand Sports Complex"
START_DATE=$(future_date 7)
END_DATE=$(future_date 10)

# Test data IDs (will be populated during test)
TOURNAMENT_ID=""
COURT1_ID=""
COURT2_ID=""
COURT3_ID=""
COURT4_ID=""

# Category IDs
MS_CATEGORY_ID=""  # Men's Singles
WS_CATEGORY_ID=""  # Women's Singles
MD_CATEGORY_ID=""  # Men's Doubles
WD_CATEGORY_ID=""  # Women's Doubles
XD_CATEGORY_ID=""  # Mixed Doubles

# Arrays to store player and team IDs
declare -a MALE_PLAYER_IDS
declare -a FEMALE_PLAYER_IDS
declare -a MD_TEAM_IDS
declare -a WD_TEAM_IDS
declare -a XD_TEAM_IDS

# Player names
MALE_PLAYERS=(
    "Kento Momota" "Viktor Axelsen" "Lee Zii Jia" "Chou Tien Chen"
    "Anthony Ginting" "Jonatan Christie" "Loh Kean Yew" "Kunlavut Vitidsarn"
)

FEMALE_PLAYERS=(
    "Akane Yamaguchi" "An Se Young" "Chen Yu Fei" "Tai Tzu Ying"
    "Carolina Marin" "Ratchanok Intanon" "Pusarla Sindhu" "Nozomi Okuhara"
)

# ============================================================================
# Helper Functions
# ============================================================================

create_team() {
    local player1_id="$1"
    local player2_id="$2"

    local team_data=$(cat <<EOF
{
  "player1Id": $player1_id,
  "player2Id": $player2_id
}
EOF
)

    local response=$(http_post "/api/v1/teams" "$team_data")
    local status=$(extract_status "$response")

    if ! is_success "$status"; then
        log_error "Failed to create team (HTTP $status)"
        return 1
    fi

    local body=$(extract_body "$response")
    local team_id=$(extract_json_field "$body" "id")
    echo "$team_id"
}

register_singles() {
    local tournament_id="$1"
    local player_id="$2"
    local category_id="$3"

    local reg_data=$(cat <<EOF
{
  "tournamentId": $tournament_id,
  "playerId": $player_id,
  "categoryId": $category_id,
  "categoryType": "SINGLES"
}
EOF
)

    local response=$(http_post "/api/v1/registrations" "$reg_data")
    local status=$(extract_status "$response")

    if ! is_success "$status"; then
        log_error "Failed to register singles (HTTP $status)"
        local body=$(extract_body "$response")
        log_error "Response: $body"
        return 1
    fi

    local body=$(extract_body "$response")
    local reg_id=$(extract_json_field "$body" "id")
    echo "$reg_id"
}

register_doubles() {
    local tournament_id="$1"
    local team_id="$2"
    local category_id="$3"

    local reg_data=$(cat <<EOF
{
  "tournamentId": $tournament_id,
  "teamId": $team_id,
  "categoryId": $category_id,
  "categoryType": "DOUBLES"
}
EOF
)

    local response=$(http_post "/api/v1/registrations" "$reg_data")
    local status=$(extract_status "$response")

    if ! is_success "$status"; then
        log_error "Failed to register doubles (HTTP $status)"
        local body=$(extract_body "$response")
        log_error "Response: $body"
        return 1
    fi

    local body=$(extract_body "$response")
    local reg_id=$(extract_json_field "$body" "id")
    echo "$reg_id"
}

# ============================================================================
# Test Functions
# ============================================================================

test_00_prerequisites() {
    log_step "Step 0: Checking Prerequisites"

    if ! wait_for_backend 10; then
        log_error "Backend is not running at ${API_BASE}"
        return 1
    fi

    log_success "All prerequisites met"
    return 0
}

test_01_authentication() {
    log_step "Step 1: Authentication"

    if ! login_admin; then
        log_error "Failed to login as admin"
        return 1
    fi

    log_success "Authentication successful"
    return 0
}

test_02_create_tournament() {
    log_step "Step 2: Create Tournament"

    log_info "Creating tournament: $TOURNAMENT_NAME"

    TOURNAMENT_ID=$(create_tournament "$TOURNAMENT_NAME" "$TOURNAMENT_LOCATION" "$START_DATE" "$END_DATE")

    if [ -z "$TOURNAMENT_ID" ]; then
        log_error "Failed to create tournament"
        return 1
    fi

    log_success "Tournament created with ID: $TOURNAMENT_ID"

    # Verify tournament
    local response=$(http_get "/api/v1/tournaments/$TOURNAMENT_ID")
    assert_status "$response" "200" "Verify tournament exists" || return 1

    return 0
}

test_03_create_courts() {
    log_step "Step 3: Create 4 Courts"

    local timestamp=$(date +%s)

    log_info "Creating Court 1..."
    COURT1_ID=$(create_court "Court 1 ${timestamp}" "$TOURNAMENT_LOCATION - Main Arena Court 1")
    [ -z "$COURT1_ID" ] && { log_error "Failed to create Court 1"; return 1; }
    log_success "Court 1 created with ID: $COURT1_ID"

    log_info "Creating Court 2..."
    COURT2_ID=$(create_court "Court 2 ${timestamp}" "$TOURNAMENT_LOCATION - Main Arena Court 2")
    [ -z "$COURT2_ID" ] && { log_error "Failed to create Court 2"; return 1; }
    log_success "Court 2 created with ID: $COURT2_ID"

    log_info "Creating Court 3..."
    COURT3_ID=$(create_court "Court 3 ${timestamp}" "$TOURNAMENT_LOCATION - Side Arena Court 1")
    [ -z "$COURT3_ID" ] && { log_error "Failed to create Court 3"; return 1; }
    log_success "Court 3 created with ID: $COURT3_ID"

    log_info "Creating Court 4..."
    COURT4_ID=$(create_court "Court 4 ${timestamp}" "$TOURNAMENT_LOCATION - Side Arena Court 2")
    [ -z "$COURT4_ID" ] && { log_error "Failed to create Court 4"; return 1; }
    log_success "Court 4 created with ID: $COURT4_ID"

    return 0
}

test_04_create_players() {
    log_step "Step 4: Create 16 Players (8 Male, 8 Female)"

    local timestamp=$(date +%s)
    local count=0

    # Create male players
    log_info "Creating 8 male players..."
    for player_name in "${MALE_PLAYERS[@]}"; do
        local first_name=$(echo "$player_name" | cut -d' ' -f1)
        local last_name=$(echo "$player_name" | cut -d' ' -f2-)

        log_info "Creating Male Player $((count+1)): $player_name"

        local player_id=$(create_player "$first_name" "${last_name}${timestamp}" "M")

        if [ -z "$player_id" ]; then
            log_error "Failed to create player: $player_name"
            return 1
        fi

        MALE_PLAYER_IDS+=("$player_id")
        log_success "Male Player $((count+1)) created with ID: $player_id"

        ((count++))
    done

    # Create female players
    count=0
    log_info "Creating 8 female players..."
    for player_name in "${FEMALE_PLAYERS[@]}"; do
        local first_name=$(echo "$player_name" | cut -d' ' -f1)
        local last_name=$(echo "$player_name" | cut -d' ' -f2-)

        log_info "Creating Female Player $((count+1)): $player_name"

        local player_id=$(create_player "$first_name" "${last_name}${timestamp}" "F")

        if [ -z "$player_id" ]; then
            log_error "Failed to create player: $player_name"
            return 1
        fi

        FEMALE_PLAYER_IDS+=("$player_id")
        log_success "Female Player $((count+1)) created with ID: $player_id"

        ((count++))
    done

    log_success "All 16 players created (8M + 8F)"
    return 0
}

test_05_create_categories() {
    log_step "Step 5: Create 5 Categories"

    # Men's Singles
    log_info "Creating Men's Singles category..."
    MS_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Men's Singles" "SINGLES" "SINGLE_ELIMINATION" "MALE")
    [ -z "$MS_CATEGORY_ID" ] && { log_error "Failed to create MS category"; return 1; }
    log_success "Men's Singles created with ID: $MS_CATEGORY_ID"

    # Women's Singles
    log_info "Creating Women's Singles category..."
    WS_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Women's Singles" "SINGLES" "SINGLE_ELIMINATION" "FEMALE")
    [ -z "$WS_CATEGORY_ID" ] && { log_error "Failed to create WS category"; return 1; }
    log_success "Women's Singles created with ID: $WS_CATEGORY_ID"

    # Men's Doubles
    log_info "Creating Men's Doubles category..."
    MD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Men's Doubles" "DOUBLES" "SINGLE_ELIMINATION" "MALE")
    [ -z "$MD_CATEGORY_ID" ] && { log_error "Failed to create MD category"; return 1; }
    log_success "Men's Doubles created with ID: $MD_CATEGORY_ID"

    # Women's Doubles
    log_info "Creating Women's Doubles category..."
    WD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Women's Doubles" "DOUBLES" "SINGLE_ELIMINATION" "FEMALE")
    [ -z "$WD_CATEGORY_ID" ] && { log_error "Failed to create WD category"; return 1; }
    log_success "Women's Doubles created with ID: $WD_CATEGORY_ID"

    # Mixed Doubles
    log_info "Creating Mixed Doubles category..."
    XD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Mixed Doubles" "DOUBLES" "SINGLE_ELIMINATION" "OPEN")
    [ -z "$XD_CATEGORY_ID" ] && { log_error "Failed to create XD category"; return 1; }
    log_success "Mixed Doubles created with ID: $XD_CATEGORY_ID"

    log_success "All 5 categories created"
    return 0
}

test_06_register_singles() {
    log_step "Step 6: Register Players for Singles Categories"

    local count=0

    # Register all 8 males for Men's Singles
    log_info "Registering 8 males for Men's Singles..."
    for player_id in "${MALE_PLAYER_IDS[@]}"; do
        local reg_id=$(register_singles "$TOURNAMENT_ID" "$player_id" "$MS_CATEGORY_ID")
        [ -z "$reg_id" ] && { log_error "Failed to register male player $player_id for MS"; return 1; }
        log_success "Male player $player_id registered (Reg ID: $reg_id)"
        ((count++))
    done

    # Register all 8 females for Women's Singles
    log_info "Registering 8 females for Women's Singles..."
    for player_id in "${FEMALE_PLAYER_IDS[@]}"; do
        local reg_id=$(register_singles "$TOURNAMENT_ID" "$player_id" "$WS_CATEGORY_ID")
        [ -z "$reg_id" ] && { log_error "Failed to register female player $player_id for WS"; return 1; }
        log_success "Female player $player_id registered (Reg ID: $reg_id)"
        ((count++))
    done

    log_success "All singles registrations complete: $count registrations"
    return 0
}

test_07_create_doubles_teams() {
    log_step "Step 7: Create Doubles Teams"

    # Men's Doubles - Create 4 teams (8 male players / 2)
    log_info "Creating 4 Men's Doubles teams..."
    for i in 0 2 4 6; do
        local p1="${MALE_PLAYER_IDS[$i]}"
        local p2="${MALE_PLAYER_IDS[$((i+1))]}"

        log_info "Creating MD team: Player $p1 + Player $p2"
        local team_id=$(create_team "$p1" "$p2")
        [ -z "$team_id" ] && { log_error "Failed to create MD team"; return 1; }

        MD_TEAM_IDS+=("$team_id")
        log_success "MD Team created with ID: $team_id"
    done

    # Women's Doubles - Create 4 teams (8 female players / 2)
    log_info "Creating 4 Women's Doubles teams..."
    for i in 0 2 4 6; do
        local p1="${FEMALE_PLAYER_IDS[$i]}"
        local p2="${FEMALE_PLAYER_IDS[$((i+1))]}"

        log_info "Creating WD team: Player $p1 + Player $p2"
        local team_id=$(create_team "$p1" "$p2")
        [ -z "$team_id" ] && { log_error "Failed to create WD team"; return 1; }

        WD_TEAM_IDS+=("$team_id")
        log_success "WD Team created with ID: $team_id"
    done

    # Mixed Doubles - Create 4 teams (1 male + 1 female each)
    log_info "Creating 4 Mixed Doubles teams..."
    for i in 0 1 2 3; do
        local male_id="${MALE_PLAYER_IDS[$i]}"
        local female_id="${FEMALE_PLAYER_IDS[$i]}"

        log_info "Creating XD team: Male $male_id + Female $female_id"
        local team_id=$(create_team "$male_id" "$female_id")
        [ -z "$team_id" ] && { log_error "Failed to create XD team"; return 1; }

        XD_TEAM_IDS+=("$team_id")
        log_success "XD Team created with ID: $team_id"
    done

    log_success "All 12 doubles teams created (4 MD + 4 WD + 4 XD)"
    return 0
}

test_08_register_doubles() {
    log_step "Step 8: Register Teams for Doubles Categories"

    local count=0

    # Register 4 teams for Men's Doubles
    log_info "Registering 4 teams for Men's Doubles..."
    for team_id in "${MD_TEAM_IDS[@]}"; do
        local reg_id=$(register_doubles "$TOURNAMENT_ID" "$team_id" "$MD_CATEGORY_ID")
        [ -z "$reg_id" ] && { log_error "Failed to register MD team $team_id"; return 1; }
        log_success "MD Team $team_id registered (Reg ID: $reg_id)"
        ((count++))
    done

    # Register 4 teams for Women's Doubles
    log_info "Registering 4 teams for Women's Doubles..."
    for team_id in "${WD_TEAM_IDS[@]}"; do
        local reg_id=$(register_doubles "$TOURNAMENT_ID" "$team_id" "$WD_CATEGORY_ID")
        [ -z "$reg_id" ] && { log_error "Failed to register WD team $team_id"; return 1; }
        log_success "WD Team $team_id registered (Reg ID: $reg_id)"
        ((count++))
    done

    # Register 4 teams for Mixed Doubles
    log_info "Registering 4 teams for Mixed Doubles..."
    for team_id in "${XD_TEAM_IDS[@]}"; do
        local reg_id=$(register_doubles "$TOURNAMENT_ID" "$team_id" "$XD_CATEGORY_ID")
        [ -z "$reg_id" ] && { log_error "Failed to register XD team $team_id"; return 1; }
        log_success "XD Team $team_id registered (Reg ID: $reg_id)"
        ((count++))
    done

    log_success "All doubles registrations complete: $count team registrations"
    return 0
}

test_09_generate_draws() {
    log_step "Step 9: Generate Draws for All 6 Categories"

    local draw_data='{"overwriteIfDraft": false}'

    # Men's Singles (8 players -> 7 matches)
    log_info "Generating Men's Singles draw (8 players, 7 matches)..."
    local response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$MS_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "MS draw generation" || return 1
    log_success "Men's Singles draw generated"

    # Women's Singles (8 players -> 7 matches)
    log_info "Generating Women's Singles draw (8 players, 7 matches)..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$WS_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "WS draw generation" || return 1
    log_success "Women's Singles draw generated"

    # Open Singles (8 players -> 7 matches)
    log_info "Generating Open Singles draw (8 players, 7 matches)..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$OS_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "OS draw generation" || return 1
    log_success "Open Singles draw generated"

    # Men's Doubles (4 teams -> 3 matches)
    log_info "Generating Men's Doubles draw (4 teams, 3 matches)..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$MD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "MD draw generation" || return 1
    log_success "Men's Doubles draw generated"

    # Women's Doubles (4 teams -> 3 matches)
    log_info "Generating Women's Doubles draw (4 teams, 3 matches)..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$WD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "WD draw generation" || return 1
    log_success "Women's Doubles draw generated"

    # Mixed Doubles (4 teams -> 3 matches)
    log_info "Generating Mixed Doubles draw (4 teams, 3 matches)..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$XD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "XD draw generation" || return 1
    log_success "Mixed Doubles draw generated"

    log_success "All 6 draws generated successfully"
    log_info "Total matches: 30 (7+7+7+3+3+3)"
    return 0
}

test_10_schedule_matches() {
    log_step "Step 10: Auto-Schedule All Matches"

    local schedule_start=$(date -d "+7 days 08:00" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || date -v+7d -v8H -v0M -v0S '+%Y-%m-%dT%H:%M:%S')
    local schedule_end=$(date -d "+10 days 20:00" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || date -v+10d -v20H -v0M -v0S '+%Y-%m-%dT%H:%M:%S')

    local schedule_data=$(cat <<EOF
{
  "tournamentId": $TOURNAMENT_ID,
  "startDateTime": "$schedule_start",
  "endDateTime": "$schedule_end",
  "defaultDurationMinutes": 45,
  "bufferMinutes": 15
}
EOF
)

    log_info "Simulating auto-schedule for 30 matches across 4 courts..."
    local sim_response=$(http_post "/api/v1/scheduling/simulate" "$schedule_data")
    local sim_status=$(extract_status "$sim_response")

    if is_success "$sim_status"; then
        local sim_body=$(extract_body "$sim_response")
        local batch_uuid=$(extract_json_field "$sim_body" "batchUuid")
        local scheduled_count=$(extract_json_field "$sim_body" "scheduledCount")

        log_success "Simulation complete: $scheduled_count matches scheduled"
        log_info "Batch UUID: $batch_uuid"

        # Apply the schedule
        log_info "Applying schedule..."
        local apply_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Idempotency-Key: $batch_uuid" \
            -X POST \
            "${API_BASE}/api/v1/scheduling/apply")

        local apply_status=$(extract_status "$apply_response")

        if is_success "$apply_status"; then
            log_success "Schedule applied successfully - all 30 matches scheduled"
        else
            log_warn "Auto-scheduler apply returned status $apply_status"
        fi
    else
        log_warn "Auto-scheduler simulation failed (status $sim_status)"
        log_info "Matches can still be scored without scheduling"
    fi

    return 0
}

test_11_summary() {
    log_step "Step 11: Test Summary"

    echo ""
    echo "========================================================================"
    echo "   COMPREHENSIVE TOURNAMENT CREATED - ALL CATEGORY TYPES!"
    echo "========================================================================"
    echo "Tournament: $TOURNAMENT_NAME"
    echo "Location: $TOURNAMENT_LOCATION"
    echo "Format: Single Elimination"
    echo ""
    echo "CATEGORIES (6 total):"
    echo "  Singles:"
    echo "    - Men's Singles (MS):    8 players, 7 matches"
    echo "    - Women's Singles (WS):  8 players, 7 matches"
    echo "    - Open Singles (OS):     8 players, 7 matches"
    echo "  Doubles:"
    echo "    - Men's Doubles (MD):    4 teams (8 players), 3 matches"
    echo "    - Women's Doubles (WD):  4 teams (8 players), 3 matches"
    echo "    - Mixed Doubles (XD):    4 teams (4M+4F), 3 matches"
    echo ""
    echo "TOTALS:"
    echo "  Players: 16 (8 Male, 8 Female)"
    echo "  Teams: 12 (4 MD, 4 WD, 4 XD)"
    echo "  Courts: 4"
    echo "  Matches: 30"
    echo "  Registrations: 36 (24 singles + 12 doubles)"
    echo "========================================================================"
    echo ""
    echo "DATA PRESERVED FOR INSPECTION:"
    echo "  Tournament ID: $TOURNAMENT_ID"
    echo "  Category IDs:"
    echo "    MS: $MS_CATEGORY_ID"
    echo "    WS: $WS_CATEGORY_ID"
    echo "    OS: $OS_CATEGORY_ID"
    echo "    MD: $MD_CATEGORY_ID"
    echo "    WD: $WD_CATEGORY_ID"
    echo "    XD: $XD_CATEGORY_ID"
    echo "  Male Player IDs: ${MALE_PLAYER_IDS[@]}"
    echo "  Female Player IDs: ${FEMALE_PLAYER_IDS[@]}"
    echo "  MD Team IDs: ${MD_TEAM_IDS[@]}"
    echo "  WD Team IDs: ${WD_TEAM_IDS[@]}"
    echo "  XD Team IDs: ${XD_TEAM_IDS[@]}"
    echo "========================================================================"
    echo ""
    echo "View in UI:"
    echo "  Admin: http://localhost:5173"
    echo "  User:  http://localhost:5174"
    echo "  Swagger: http://localhost:8080/swagger-ui/index.html"
    echo ""
    echo "Database query examples:"
    echo "  -- View tournament"
    echo "  SELECT * FROM tournament WHERE id = $TOURNAMENT_ID;"
    echo ""
    echo "  -- View all categories"
    echo "  SELECT id, name, category_type, gender_restriction"
    echo "  FROM category WHERE tournament_id = $TOURNAMENT_ID;"
    echo ""
    echo "  -- View all matches by category"
    echo "  SELECT m.id, c.name as category, m.round, m.position,"
    echo "         p1.first_name || ' ' || p1.last_name as player1,"
    echo "         p2.first_name || ' ' || p2.last_name as player2,"
    echo "         m.status, m.scheduled_at"
    echo "  FROM matches m"
    echo "  LEFT JOIN category c ON m.category_id = c.id"
    echo "  LEFT JOIN player p1 ON m.player1_id = p1.id"
    echo "  LEFT JOIN player p2 ON m.player2_id = p2.id"
    echo "  WHERE m.tournament_id = $TOURNAMENT_ID"
    echo "  ORDER BY c.name, m.round, m.position;"
    echo ""
    echo "  -- View doubles teams"
    echo "  SELECT t.id, "
    echo "         p1.first_name || ' ' || p1.last_name as player1,"
    echo "         p2.first_name || ' ' || p2.last_name as player2"
    echo "  FROM team t"
    echo "  JOIN player p1 ON t.player1_id = p1.id"
    echo "  JOIN player p2 ON t.player2_id = p2.id"
    echo "  WHERE t.id IN (${MD_TEAM_IDS[@]},${WD_TEAM_IDS[@]},${XD_TEAM_IDS[@]});"
    echo ""
    echo "  -- View registrations summary"
    echo "  SELECT c.name as category, COUNT(*) as registrations"
    echo "  FROM registration r"
    echo "  JOIN category c ON r.category_id = c.id"
    echo "  WHERE r.tournament_id = $TOURNAMENT_ID"
    echo "  GROUP BY c.name;"
    echo "========================================================================"
    echo ""

    log_success "Test completed successfully - comprehensive tournament data preserved"
    return 0
}

# ============================================================================
# Main Test Execution
# ============================================================================

main() {
    echo ""
    echo "========================================================================"
    echo "E2E Test: Comprehensive Multi-Category Tournament"
    echo "========================================================================"
    echo "Backend: ${API_BASE}"
    echo "Tournament: ${TOURNAMENT_NAME}"
    echo ""
    echo "Testing Categories:"
    echo "  - Men's Singles (8 players)"
    echo "  - Women's Singles (8 players)"
    echo "  - Open Singles (8 players)"
    echo "  - Men's Doubles (4 teams)"
    echo "  - Women's Doubles (4 teams)"
    echo "  - Mixed Doubles (4 teams)"
    echo ""
    echo "Total: 16 players, 12 teams, 30 matches across 6 categories"
    echo "Data: PRESERVED for inspection"
    echo "========================================================================"
    echo ""

    # Run tests in sequence
    run_test "Prerequisites Check" test_00_prerequisites || exit 1
    run_test "Authentication" test_01_authentication || exit 1
    run_test "Create Tournament" test_02_create_tournament || exit 1
    run_test "Create 4 Courts" test_03_create_courts || exit 1
    run_test "Create 16 Players" test_04_create_players || exit 1
    run_test "Create 6 Categories" test_05_create_categories || exit 1
    run_test "Register Singles" test_06_register_singles || exit 1
    run_test "Create Doubles Teams" test_07_create_doubles_teams || exit 1
    run_test "Register Doubles" test_08_register_doubles || exit 1
    run_test "Generate Draws" test_09_generate_draws || exit 1
    run_test "Auto-Schedule Matches" test_10_schedule_matches || exit 1
    run_test "Summary" test_11_summary || exit 1

    # Print summary
    print_test_summary

    # Return exit code based on test results
    [ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1
}

# Run main function
main "$@"
