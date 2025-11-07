chmod +x arena_openapi_e2e.sh

# Custom credentials per role
BASE_URL="http://localhost:8080" \
REFEREE_EMAIL="ref@example.com" REFEREE_PASS="Ref#123" \
USER_EMAIL="user@example.com" USER_PASS="User#123" \
REGISTER_USERS=1 \



# Admin must already exist:
BASE_URL="http://localhost:8080" \
ADMIN_EMAIL="admin@example.com" ADMIN_PASS="password123" \

# Register ref/user (not admin) if your API allows self-signup:
REGISTER_REFEREE=1 REGISTER_USER=1 \

# If role assignment requires a numeric userId for the referee:
USER_ID_REFEREE=42 \


./arena_openapi_e2e.sh