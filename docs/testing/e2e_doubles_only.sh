#!/bin/bash

# End-to-End Test: Doubles Categories Only
# Tests Men's Doubles, Women's Doubles, and Mixed Doubles
# Simpler focused test to debug doubles registration

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

TOURNAMENT_NAME="Doubles Tournament $(date +%Y%m%d_%H%M%S)"
TOURNAMENT_LOCATION="Doubles Arena"
START_DATE=$(future_date 7)
END_DATE=$(future_date 10)

# Test data IDs
TOURNAMENT_ID=""
MD_CATEGORY_ID=""
WD_CATEGORY_ID=""
XD_CATEGORY_ID=""

# Player arrays
declare -a MALE_PLAYER_IDS
declare -a FEMALE_PLAYER_IDS
declare -a MD_TEAM_IDS
declare -a WD_TEAM_IDS
declare -a XD_TEAM_IDS

# ============================================================================
# Test Functions
# ============================================================================

test_00_prerequisites() {
    log_step "Step 0: Prerequisites"
    wait_for_backend 10 || { log_error "Backend not ready"; return 1; }
    log_success "Prerequisites met"
    return 0
}

test_01_authentication() {
    log_step "Step 1: Authentication"
    login_admin || { log_error "Login failed"; return 1; }
    log_success "Authenticated"
    return 0
}

test_02_create_tournament() {
    log_step "Step 2: Create Tournament"
    TOURNAMENT_ID=$(create_tournament "$TOURNAMENT_NAME" "$TOURNAMENT_LOCATION" "$START_DATE" "$END_DATE")
    [ -z "$TOURNAMENT_ID" ] && { log_error "Tournament creation failed"; return 1; }
    log_success "Tournament ID: $TOURNAMENT_ID"
    return 0
}

test_03_create_players() {
    log_step "Step 3: Create 8 Players (4M + 4F)"

    local ts=$(date +%s)

    # 4 male players
    for i in 1 2 3 4; do
        local id=$(create_player "Male$i" "Player${ts}" "M")
        [ -z "$id" ] && { log_error "Failed to create male $i"; return 1; }
        MALE_PLAYER_IDS+=("$id")
        log_success "Male $i: ID $id"
    done

    # 4 female players
    for i in 1 2 3 4; do
        local id=$(create_player "Female$i" "Player${ts}" "F")
        [ -z "$id" ] && { log_error "Failed to create female $i"; return 1; }
        FEMALE_PLAYER_IDS+=("$id")
        log_success "Female $i: ID $id"
    done

    log_success "All players created"
    return 0
}

test_04_create_categories() {
    log_step "Step 4: Create 3 Doubles Categories"

    MD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Men's Doubles" "DOUBLES" "SINGLE_ELIMINATION" "MALE")
    [ -z "$MD_CATEGORY_ID" ] && { log_error "MD category failed"; return 1; }
    log_success "MD Category: $MD_CATEGORY_ID"

    WD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Women's Doubles" "DOUBLES" "SINGLE_ELIMINATION" "FEMALE")
    [ -z "$WD_CATEGORY_ID" ] && { log_error "WD category failed"; return 1; }
    log_success "WD Category: $WD_CATEGORY_ID"

    XD_CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Mixed Doubles" "DOUBLES" "SINGLE_ELIMINATION" "OPEN")
    [ -z "$XD_CATEGORY_ID" ] && { log_error "XD category failed"; return 1; }
    log_success "XD Category: $XD_CATEGORY_ID"

    return 0
}

test_05_create_teams() {
    log_step "Step 5: Create 6 Teams"

    # MD: 2 teams
    log_info "Creating Men's Doubles teams..."
    local team_id

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${MALE_PLAYER_IDS[0]},\"player2Id\":${MALE_PLAYER_IDS[1]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "MD team 1 failed"; return 1; }
    MD_TEAM_IDS+=("$team_id")
    log_success "MD Team 1: $team_id"

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${MALE_PLAYER_IDS[2]},\"player2Id\":${MALE_PLAYER_IDS[3]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "MD team 2 failed"; return 1; }
    MD_TEAM_IDS+=("$team_id")
    log_success "MD Team 2: $team_id"

    # WD: 2 teams
    log_info "Creating Women's Doubles teams..."

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${FEMALE_PLAYER_IDS[0]},\"player2Id\":${FEMALE_PLAYER_IDS[1]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "WD team 1 failed"; return 1; }
    WD_TEAM_IDS+=("$team_id")
    log_success "WD Team 1: $team_id"

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${FEMALE_PLAYER_IDS[2]},\"player2Id\":${FEMALE_PLAYER_IDS[3]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "WD team 2 failed"; return 1; }
    WD_TEAM_IDS+=("$team_id")
    log_success "WD Team 2: $team_id"

    # XD: 2 teams
    log_info "Creating Mixed Doubles teams..."

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${MALE_PLAYER_IDS[0]},\"player2Id\":${FEMALE_PLAYER_IDS[0]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "XD team 1 failed"; return 1; }
    XD_TEAM_IDS+=("$team_id")
    log_success "XD Team 1: $team_id"

    team_id=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
        -X POST -d "{\"player1Id\":${MALE_PLAYER_IDS[1]},\"player2Id\":${FEMALE_PLAYER_IDS[1]}}" \
        "${API_BASE}/api/v1/teams" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    [ -z "$team_id" ] && { log_error "XD team 2 failed"; return 1; }
    XD_TEAM_IDS+=("$team_id")
    log_success "XD Team 2: $team_id"

    log_success "All 6 teams created"
    return 0
}

test_06_register_doubles() {
    log_step "Step 6: Register Teams"

    log_info "Registering MD teams..."
    for team_id in "${MD_TEAM_IDS[@]}"; do
        local reg_data="{\"tournamentId\":$TOURNAMENT_ID,\"teamId\":$team_id,\"categoryId\":$MD_CATEGORY_ID,\"categoryType\":\"DOUBLES\"}"
        local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
            -X POST -d "$reg_data" "${API_BASE}/api/v1/registrations")
        local status=$(extract_status "$response")

        if ! is_success "$status"; then
            log_error "MD registration failed (HTTP $status)"
            log_error "Response: $(extract_body "$response")"
            return 1
        fi
        log_success "MD Team $team_id registered"
    done

    log_info "Registering WD teams..."
    for team_id in "${WD_TEAM_IDS[@]}"; do
        local reg_data="{\"tournamentId\":$TOURNAMENT_ID,\"teamId\":$team_id,\"categoryId\":$WD_CATEGORY_ID,\"categoryType\":\"DOUBLES\"}"
        local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
            -X POST -d "$reg_data" "${API_BASE}/api/v1/registrations")
        local status=$(extract_status "$response")

        if ! is_success "$status"; then
            log_error "WD registration failed (HTTP $status)"
            log_error "Response: $(extract_body "$response")"
            return 1
        fi
        log_success "WD Team $team_id registered"
    done

    log_info "Registering XD teams..."
    for team_id in "${XD_TEAM_IDS[@]}"; do
        local reg_data="{\"tournamentId\":$TOURNAMENT_ID,\"teamId\":$team_id,\"categoryId\":$XD_CATEGORY_ID,\"categoryType\":\"DOUBLES\"}"
        local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" \
            -X POST -d "$reg_data" "${API_BASE}/api/v1/registrations")
        local status=$(extract_status "$response")

        if ! is_success "$status"; then
            log_error "XD registration failed (HTTP $status)"
            log_error "Response: $(extract_body "$response")"
            return 1
        fi
        log_success "XD Team $team_id registered"
    done

    log_success "All 6 teams registered"
    return 0
}

test_07_generate_draws() {
    log_step "Step 7: Generate Draws"

    local draw_data='{"overwriteIfDraft":false}'

    log_info "Generating MD draw..."
    local response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$MD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "MD draw" || return 1

    log_info "Generating WD draw..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$WD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "WD draw" || return 1

    log_info "Generating XD draw..."
    response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$XD_CATEGORY_ID/draw:generate" "$draw_data")
    assert_status "$response" "200" "XD draw" || return 1

    log_success "All draws generated"
    return 0
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    echo ""
    echo "========================================================================"
    echo "E2E Test: Doubles Categories (MD, WD, XD)"
    echo "========================================================================"
    echo ""

    run_test "Prerequisites" test_00_prerequisites || exit 1
    run_test "Authentication" test_01_authentication || exit 1
    run_test "Create Tournament" test_02_create_tournament || exit 1
    run_test "Create Players" test_03_create_players || exit 1
    run_test "Create Categories" test_04_create_categories || exit 1
    run_test "Create Teams" test_05_create_teams || exit 1
    run_test "Register Doubles" test_06_register_doubles || exit 1
    run_test "Generate Draws" test_07_generate_draws || exit 1

    print_test_summary

    [ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1
}

main "$@"
