#!/bin/bash

# Test Helper Functions for Badminton Tournament Manager E2E Tests
# Provides reusable utilities for API testing with curl

# ============================================================================
# Configuration
# ============================================================================

# API Base URL - can be overridden by environment variable
API_BASE="${API_BASE:-http://localhost:8080}"

# Colors for output
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

# Global variables
JWT_TOKEN=""
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"

# ============================================================================
# Output Functions
# ============================================================================

log_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[PASS]${COLOR_RESET} $1"
}

log_error() {
    echo -e "${COLOR_RED}[FAIL]${COLOR_RESET} $1"
}

log_warn() {
    echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $1"
}

log_step() {
    echo ""
    echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
    echo -e "${COLOR_BLUE}$1${COLOR_RESET}"
    echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
}

# ============================================================================
# HTTP Request Functions
# ============================================================================

# Make HTTP GET request
# Usage: http_get <url> [use_auth]
http_get() {
    local url="$1"
    local use_auth="${2:-true}"
    local headers=(-H "Content-Type: application/json")

    if [ "$use_auth" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        headers+=(-H "Authorization: Bearer $JWT_TOKEN")
    fi

    if [ -n "$DEBUG" ]; then
        log_info "GET ${API_BASE}${url}"
    fi

    curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "${headers[@]}" \
        "${API_BASE}${url}"
}

# Make HTTP POST request
# Usage: http_post <url> <json_data> [use_auth]
http_post() {
    local url="$1"
    local data="$2"
    local use_auth="${3:-true}"
    local headers=(-H "Content-Type: application/json")

    if [ "$use_auth" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        headers+=(-H "Authorization: Bearer $JWT_TOKEN")
    fi

    if [ -n "$DEBUG" ]; then
        log_info "POST ${API_BASE}${url}"
        log_info "Data: $data"
    fi

    curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "${headers[@]}" \
        -X POST \
        -d "$data" \
        "${API_BASE}${url}"
}

# Make HTTP PUT request
# Usage: http_put <url> <json_data> [use_auth]
http_put() {
    local url="$1"
    local data="$2"
    local use_auth="${3:-true}"
    local headers=(-H "Content-Type: application/json")

    if [ "$use_auth" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        headers+=(-H "Authorization: Bearer $JWT_TOKEN")
    fi

    if [ -n "$DEBUG" ]; then
        log_info "PUT ${API_BASE}${url}"
        log_info "Data: $data"
    fi

    curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "${headers[@]}" \
        -X PUT \
        -d "$data" \
        "${API_BASE}${url}"
}

# Make HTTP DELETE request
# Usage: http_delete <url> [use_auth]
http_delete() {
    local url="$1"
    local use_auth="${2:-true}"
    local headers=(-H "Content-Type: application/json")

    if [ "$use_auth" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        headers+=(-H "Authorization: Bearer $JWT_TOKEN")
    fi

    if [ -n "$DEBUG" ]; then
        log_info "DELETE ${API_BASE}${url}"
    fi

    curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "${headers[@]}" \
        -X DELETE \
        "${API_BASE}${url}"
}

# ============================================================================
# Response Parsing Functions
# ============================================================================

# Extract HTTP status code from response
# Usage: extract_status <response>
extract_status() {
    echo "$1" | grep -o "HTTP_STATUS:[0-9]*" | cut -d':' -f2
}

# Extract JSON body from response
# Usage: extract_body <response>
extract_body() {
    echo "$1" | sed 's/HTTP_STATUS:[0-9]*$//'
}

# Extract field from JSON using grep/sed (no jq dependency)
# Usage: extract_json_field <json> <field_name>
extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"${field}\":[^,}]*" | cut -d':' -f2- | sed 's/^"//; s/"$//' | sed 's/^ *//; s/ *$//'
}

# Check if response status is in 2xx range
# Usage: is_success <status_code>
is_success() {
    local status="$1"
    [[ "$status" =~ ^2[0-9][0-9]$ ]]
}

# ============================================================================
# Authentication Functions
# ============================================================================

# Login and obtain JWT token
# Usage: login <email> <password>
login() {
    local email="$1"
    local password="$2"

    log_info "Logging in as $email..."

    local login_data=$(cat <<EOF
{
  "email": "$email",
  "password": "$password"
}
EOF
)

    local response=$(http_post "/api/v1/auth/login" "$login_data" false)
    local status=$(extract_status "$response")
    local body=$(extract_body "$response")

    if is_success "$status"; then
        JWT_TOKEN=$(extract_json_field "$body" "token")
        if [ -n "$JWT_TOKEN" ]; then
            log_success "Login successful"
            if [ -n "$DEBUG" ]; then
                log_info "Token: ${JWT_TOKEN:0:50}..."
            fi
            return 0
        else
            log_error "Failed to extract token from response"
            return 1
        fi
    else
        log_error "Login failed with status $status"
        log_error "Response: $body"
        return 1
    fi
}

# Login as default admin user
# Usage: login_admin
login_admin() {
    login "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
}

# ============================================================================
# Validation Functions
# ============================================================================

# Assert HTTP status code
# Usage: assert_status <response> <expected_status> <error_message>
assert_status() {
    local response="$1"
    local expected="$2"
    local message="$3"
    local status=$(extract_status "$response")

    if [ "$status" = "$expected" ]; then
        log_success "$message (HTTP $status)"
        return 0
    else
        log_error "$message - Expected $expected, got $status"
        local body=$(extract_body "$response")
        log_error "Response: $body"
        return 1
    fi
}

# Assert field exists in JSON response
# Usage: assert_field_exists <response> <field_name> <error_message>
assert_field_exists() {
    local response="$1"
    local field="$2"
    local message="$3"
    local body=$(extract_body "$response")
    local value=$(extract_json_field "$body" "$field")

    if [ -n "$value" ]; then
        log_success "$message - $field=$value"
        return 0
    else
        log_error "$message - Field '$field' not found in response"
        log_error "Response: $body"
        return 1
    fi
}

# Assert field equals expected value
# Usage: assert_field_equals <response> <field_name> <expected_value> <error_message>
assert_field_equals() {
    local response="$1"
    local field="$2"
    local expected="$3"
    local message="$4"
    local body=$(extract_body "$response")
    local actual=$(extract_json_field "$body" "$field")

    if [ "$actual" = "$expected" ]; then
        log_success "$message - $field=$actual"
        return 0
    else
        log_error "$message - Expected $field='$expected', got '$actual'"
        log_error "Response: $body"
        return 1
    fi
}

# ============================================================================
# Wait/Retry Functions
# ============================================================================

# Wait for backend to be ready
# Usage: wait_for_backend [max_attempts]
wait_for_backend() {
    local max_attempts="${1:-30}"
    local attempt=1

    log_info "Waiting for backend to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "${API_BASE}/actuator/health" > /dev/null 2>&1; then
            log_success "Backend is ready"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done

    echo ""
    log_error "Backend did not become ready after $max_attempts seconds"
    return 1
}

# ============================================================================
# Data Creation Helper Functions
# ============================================================================

# Create tournament
# Usage: create_tournament <name> <location> <start_date> <end_date>
# Returns: Tournament ID
create_tournament() {
    local name="$1"
    local location="$2"
    local start_date="$3"
    local end_date="$4"

    local data=$(cat <<EOF
{
  "name": "$name",
  "location": "$location",
  "startDate": "$start_date",
  "endDate": "$end_date"
}
EOF
)

    local response=$(http_post "/api/v1/tournaments" "$data")
    local status=$(extract_status "$response")

    if is_success "$status"; then
        local body=$(extract_body "$response")
        local tournament_id=$(extract_json_field "$body" "id")
        echo "$tournament_id"
        return 0
    else
        return 1
    fi
}

# Create player
# Usage: create_player <first_name> <last_name> <gender>
# Returns: Player ID
create_player() {
    local first_name="$1"
    local last_name="$2"
    local gender="$3"

    local data=$(cat <<EOF
{
  "firstName": "$first_name",
  "lastName": "$last_name",
  "gender": "$gender"
}
EOF
)

    local response=$(http_post "/api/v1/players" "$data")
    local status=$(extract_status "$response")

    if is_success "$status"; then
        local body=$(extract_body "$response")
        local player_id=$(extract_json_field "$body" "id")
        echo "$player_id"
        return 0
    else
        return 1
    fi
}

# Create court
# Usage: create_court <name> <location_note>
# Returns: Court ID
create_court() {
    local name="$1"
    local location_note="$2"

    local data=$(cat <<EOF
{
  "name": "$name",
  "locationNote": "$location_note"
}
EOF
)

    local response=$(http_post "/api/v1/courts" "$data")
    local status=$(extract_status "$response")

    if is_success "$status"; then
        local body=$(extract_body "$response")
        local court_id=$(extract_json_field "$body" "id")
        echo "$court_id"
        return 0
    else
        return 1
    fi
}

# Create category
# Usage: create_category <tournament_id> <name> <type> <format> <gender_restriction>
# Returns: Category ID
create_category() {
    local tournament_id="$1"
    local name="$2"
    local type="$3"
    local format="$4"
    local gender_restriction="$5"

    local data=$(cat <<EOF
{
  "tournamentId": $tournament_id,
  "name": "$name",
  "categoryType": "$type",
  "format": "$format",
  "genderRestriction": "$gender_restriction",
  "registrationFee": 0,
  "maxParticipants": 32
}
EOF
)

    local response=$(http_post "/api/v1/categories" "$data")
    local status=$(extract_status "$response")

    if is_success "$status"; then
        local body=$(extract_body "$response")
        local category_id=$(extract_json_field "$body" "id")
        echo "$category_id"
        return 0
    else
        return 1
    fi
}

# Create registration
# Usage: create_registration <tournament_id> <player_id> <category_id>
# Returns: Registration ID
create_registration() {
    local tournament_id="$1"
    local player_id="$2"
    local category_id="$3"

    local data=$(cat <<EOF
{
  "tournamentId": $tournament_id,
  "playerId": $player_id,
  "categoryId": $category_id,
  "categoryType": "SINGLES"
}
EOF
)

    local response=$(http_post "/api/v1/registrations" "$data")
    local status=$(extract_status "$response")

    if is_success "$status"; then
        local body=$(extract_body "$response")
        local registration_id=$(extract_json_field "$body" "id")
        echo "$registration_id"
        return 0
    else
        return 1
    fi
}

# ============================================================================
# Cleanup Functions
# ============================================================================

# Delete tournament (and all associated data)
# Usage: delete_tournament <tournament_id>
delete_tournament() {
    local tournament_id="$1"

    log_info "Deleting tournament $tournament_id..."
    local response=$(http_delete "/api/v1/tournaments/$tournament_id")
    local status=$(extract_status "$response")

    if [ "$status" = "204" ]; then
        log_success "Tournament deleted"
        return 0
    else
        log_warn "Failed to delete tournament (status $status)"
        return 1
    fi
}

# Delete player
# Usage: delete_player <player_id>
delete_player() {
    local player_id="$1"

    local response=$(http_delete "/api/v1/players/$player_id")
    local status=$(extract_status "$response")

    if [ "$status" = "200" ] || [ "$status" = "204" ]; then
        return 0
    else
        log_warn "Failed to delete player $player_id (status $status)"
        return 1
    fi
}

# Delete court
# Usage: delete_court <court_id>
delete_court() {
    local court_id="$1"

    local response=$(http_delete "/api/v1/courts/$court_id")
    local status=$(extract_status "$response")

    if [ "$status" = "200" ] || [ "$status" = "204" ]; then
        return 0
    else
        log_warn "Failed to delete court $court_id (status $status)"
        return 1
    fi
}

# ============================================================================
# Utility Functions
# ============================================================================

# Check if command exists
# Usage: command_exists <command_name>
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pretty print JSON (if jq is available)
# Usage: pretty_json <json_string>
pretty_json() {
    if command_exists jq; then
        echo "$1" | jq '.'
    else
        echo "$1"
    fi
}

# Generate future date
# Usage: future_date <days_from_now>
future_date() {
    local days="$1"
    date -d "+${days} days" +%Y-%m-%d 2>/dev/null || date -v+${days}d +%Y-%m-%d 2>/dev/null
}

# ============================================================================
# Test Framework Functions
# ============================================================================

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Run a test and track results
# Usage: run_test <test_name> <test_function>
run_test() {
    local test_name="$1"
    local test_function="$2"

    ((TESTS_RUN++))
    log_info "Running: $test_name"

    if $test_function; then
        ((TESTS_PASSED++))
        log_success "$test_name passed"
        return 0
    else
        ((TESTS_FAILED++))
        log_error "$test_name failed"

        # Exit on first failure unless CONTINUE_ON_FAIL is set
        if [ -z "$CONTINUE_ON_FAIL" ]; then
            print_test_summary
            exit 1
        fi
        return 1
    fi
}

# Print test summary
# Usage: print_test_summary
print_test_summary() {
    echo ""
    echo "========================================"
    echo "Test Summary"
    echo "========================================"
    echo "Total:  $TESTS_RUN"
    echo -e "Passed: ${COLOR_GREEN}$TESTS_PASSED${COLOR_RESET}"
    echo -e "Failed: ${COLOR_RED}$TESTS_FAILED${COLOR_RESET}"
    echo "========================================"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${COLOR_GREEN}All tests passed!${COLOR_RESET}"
        return 0
    else
        echo -e "${COLOR_RED}Some tests failed!${COLOR_RESET}"
        return 1
    fi
}

# ============================================================================
# Export Functions
# ============================================================================

# Make functions available to scripts that source this file
export -f log_info log_success log_error log_warn log_step
export -f http_get http_post http_put http_delete
export -f extract_status extract_body extract_json_field is_success
export -f login login_admin
export -f assert_status assert_field_exists assert_field_equals
export -f wait_for_backend
export -f create_tournament create_player create_court create_category create_registration
export -f delete_tournament delete_player delete_court
export -f command_exists pretty_json future_date
export -f run_test print_test_summary

log_info "Test helpers loaded successfully"
