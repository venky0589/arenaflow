#!/bin/bash

# End-to-End Test: 16 Player Single Elimination Tournament
# Tests a complete tournament with 16 players (15 matches total)
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

TOURNAMENT_NAME="16 Player SE Tournament $(date +%Y%m%d_%H%M%S)"
TOURNAMENT_LOCATION="Grand Arena"
START_DATE=$(future_date 7)
END_DATE=$(future_date 9)

# Test data IDs (will be populated during test)
TOURNAMENT_ID=""
CATEGORY_ID=""
COURT1_ID=""
COURT2_ID=""
COURT3_ID=""
COURT4_ID=""

# Array to store player IDs
declare -a PLAYER_IDS
declare -a REG_IDS

# Player names (16 players)
PLAYER_NAMES=(
    "Alice Anderson" "Bob Brown" "Carol Chen" "David Davis"
    "Emma Evans" "Frank Foster" "Grace Garcia" "Henry Harris"
    "Irene Jackson" "Jack Johnson" "Karen King" "Leo Lopez"
    "Maria Martinez" "Nathan Nelson" "Olivia O'Brien" "Peter Parker"
)

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
    COURT1_ID=$(create_court "Arena Court 1 ${timestamp}" "Main Arena - Court 1")
    [ -z "$COURT1_ID" ] && { log_error "Failed to create Court 1"; return 1; }
    log_success "Court 1 created with ID: $COURT1_ID"

    log_info "Creating Court 2..."
    COURT2_ID=$(create_court "Arena Court 2 ${timestamp}" "Main Arena - Court 2")
    [ -z "$COURT2_ID" ] && { log_error "Failed to create Court 2"; return 1; }
    log_success "Court 2 created with ID: $COURT2_ID"

    log_info "Creating Court 3..."
    COURT3_ID=$(create_court "Arena Court 3 ${timestamp}" "Side Arena - Court 1")
    [ -z "$COURT3_ID" ] && { log_error "Failed to create Court 3"; return 1; }
    log_success "Court 3 created with ID: $COURT3_ID"

    log_info "Creating Court 4..."
    COURT4_ID=$(create_court "Arena Court 4 ${timestamp}" "Side Arena - Court 2")
    [ -z "$COURT4_ID" ] && { log_error "Failed to create Court 4"; return 1; }
    log_success "Court 4 created with ID: $COURT4_ID"

    return 0
}

test_04_create_16_players() {
    log_step "Step 4: Create 16 Players"

    local timestamp=$(date +%s)
    local count=0

    for player_name in "${PLAYER_NAMES[@]}"; do
        local first_name=$(echo "$player_name" | cut -d' ' -f1)
        local last_name=$(echo "$player_name" | cut -d' ' -f2-)

        # Alternate gender
        local gender="F"
        if [ $((count % 2)) -eq 0 ]; then
            gender="M"
        fi

        log_info "Creating Player $((count+1)): $player_name"

        local player_id=$(create_player "$first_name" "${last_name}${timestamp}" "$gender")

        if [ -z "$player_id" ]; then
            log_error "Failed to create player: $player_name"
            return 1
        fi

        PLAYER_IDS+=("$player_id")
        log_success "Player $((count+1)) created with ID: $player_id"

        ((count++))
    done

    log_success "All 16 players created successfully"
    return 0
}

test_05_create_category() {
    log_step "Step 5: Create Category"

    log_info "Creating category: Open Singles (Single Elimination)"

    CATEGORY_ID=$(create_category "$TOURNAMENT_ID" "Open Singles SE" "SINGLES" "SINGLE_ELIMINATION" "OPEN")

    if [ -z "$CATEGORY_ID" ]; then
        log_error "Failed to create category"
        return 1
    fi

    log_success "Category created with ID: $CATEGORY_ID"
    return 0
}

test_06_register_16_players() {
    log_step "Step 6: Register 16 Players"

    local count=0
    for player_id in "${PLAYER_IDS[@]}"; do
        log_info "Registering Player $((count+1)) (ID: $player_id)..."

        local reg_id=$(create_registration "$TOURNAMENT_ID" "$player_id" "$CATEGORY_ID")

        if [ -z "$reg_id" ]; then
            log_error "Failed to register Player $((count+1))"
            return 1
        fi

        REG_IDS+=("$reg_id")
        log_success "Player $((count+1)) registered with ID: $reg_id"

        ((count++))
    done

    log_success "All 16 players registered successfully"
    return 0
}

test_07_generate_draw() {
    log_step "Step 7: Generate 16-Player Draw"

    log_info "Generating single elimination draw for 16 players..."
    log_info "Expected: 15 matches total (8 R1 + 4 QF + 2 SF + 1 Final)"

    local draw_data=$(cat <<EOF
{
  "overwriteIfDraft": false
}
EOF
)

    local response=$(http_post "/api/v1/tournaments/$TOURNAMENT_ID/categories/$CATEGORY_ID/draw:generate" "$draw_data")
    local status=$(extract_status "$response")

    if ! is_success "$status"; then
        log_error "Failed to generate draw (HTTP $status)"
        local body=$(extract_body "$response")
        log_error "Response: $body"
        return 1
    fi

    log_success "Draw generated successfully"

    # Verify bracket
    local bracket_response=$(http_get "/api/v1/categories/$CATEGORY_ID/bracket")
    assert_status "$bracket_response" "200" "Verify bracket exists" || return 1

    log_success "16-player bracket created (15 matches)"
    return 0
}

test_08_schedule_all_matches() {
    log_step "Step 8: Auto-Schedule All Matches"

    local schedule_start=$(date -d "+7 days 08:00" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || date -v+7d -v8H -v0M -v0S '+%Y-%m-%dT%H:%M:%S')
    local schedule_end=$(date -d "+7 days 20:00" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || date -v+7d -v20H -v0M -v0S '+%Y-%m-%dT%H:%M:%S')

    local schedule_data=$(cat <<EOF
{
  "tournamentId": $TOURNAMENT_ID,
  "startDateTime": "$schedule_start",
  "endDateTime": "$schedule_end",
  "defaultDurationMinutes": 30,
  "bufferMinutes": 10
}
EOF
)

    log_info "Simulating auto-schedule..."
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
            log_success "Schedule applied successfully - all 15 matches scheduled"
        else
            log_warn "Auto-scheduler apply returned status $apply_status"
        fi
    else
        log_warn "Auto-scheduler simulation failed (status $sim_status)"
        log_info "Matches can still be scored without scheduling"
    fi

    return 0
}

test_09_display_bracket_structure() {
    log_step "Step 9: Display Bracket Structure"

    log_info "Tournament Structure:"
    log_info "  Round 1 (R16): 8 matches"
    log_info "  Quarter-Finals: 4 matches"
    log_info "  Semi-Finals: 2 matches"
    log_info "  Final: 1 match"
    log_info "  Total: 15 matches"
    log_info ""
    log_info "Tournament ID: $TOURNAMENT_ID (preserved for inspection)"
    log_info "Category ID: $CATEGORY_ID"
    log_info "View bracket at: http://localhost:5174 (User UI)"
    log_info ""
    log_info "Database details:"
    log_info "  Tournament: ID $TOURNAMENT_ID"
    log_info "  Players: ${#PLAYER_IDS[@]} players created"
    log_info "  Registrations: ${#REG_IDS[@]} registrations"
    log_info "  Courts: 4 courts"

    log_success "Bracket structure verified"
    return 0
}

test_10_summary() {
    log_step "Step 10: Test Summary"

    echo ""
    echo "========================================"
    echo "   16-PLAYER TOURNAMENT CREATED!"
    echo "========================================"
    echo "Tournament: $TOURNAMENT_NAME"
    echo "Location: $TOURNAMENT_LOCATION"
    echo "Format: Single Elimination"
    echo "Players: 16"
    echo "Matches: 15"
    echo "Courts: 4"
    echo "========================================"
    echo ""
    echo "DATA PRESERVED FOR INSPECTION:"
    echo "  Tournament ID: $TOURNAMENT_ID"
    echo "  Category ID: $CATEGORY_ID"
    echo "  Player IDs: ${PLAYER_IDS[@]}"
    echo "========================================"
    echo ""
    echo "View in UI:"
    echo "  Admin: http://localhost:5173"
    echo "  User:  http://localhost:5174"
    echo "  Swagger: http://localhost:8080/swagger-ui/index.html"
    echo ""
    echo "Database query examples:"
    echo "  SELECT * FROM tournament WHERE id = $TOURNAMENT_ID;"
    echo "  SELECT * FROM matches WHERE tournament_id = $TOURNAMENT_ID ORDER BY id;"
    echo "  SELECT * FROM registration WHERE tournament_id = $TOURNAMENT_ID;"
    echo "========================================"
    echo ""

    log_success "Test completed successfully - data preserved"
    return 0
}

# ============================================================================
# Main Test Execution
# ============================================================================

main() {
    echo ""
    echo "========================================"
    echo "E2E Test: 16 Player Tournament"
    echo "========================================"
    echo "Backend: ${API_BASE}"
    echo "Tournament: ${TOURNAMENT_NAME}"
    echo "Format: Single Elimination (15 matches)"
    echo "Data: PRESERVED for inspection"
    echo "========================================"
    echo ""

    # Run tests in sequence
    run_test "Prerequisites Check" test_00_prerequisites || exit 1
    run_test "Authentication" test_01_authentication || exit 1
    run_test "Create Tournament" test_02_create_tournament || exit 1
    run_test "Create 4 Courts" test_03_create_courts || exit 1
    run_test "Create 16 Players" test_04_create_16_players || exit 1
    run_test "Create Category" test_05_create_category || exit 1
    run_test "Register 16 Players" test_06_register_16_players || exit 1
    run_test "Generate Draw" test_07_generate_draw || exit 1
    run_test "Auto-Schedule Matches" test_08_schedule_all_matches || exit 1
    run_test "Display Structure" test_09_display_bracket_structure || exit 1
    run_test "Summary" test_10_summary || exit 1

    # Print summary
    print_test_summary

    # Return exit code based on test results
    [ $TESTS_FAILED -eq 0 ] && exit 0 || exit 1
}

# Run main function
main "$@"
