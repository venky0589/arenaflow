# Admin UI (React + Vite + TS + MUI)

## Setup
1. Copy `.env.example` to `.env` and set your backend URL:
   ```env
   VITE_API_BASE=http://localhost:8080
   ```

2. Install & run:
   ```bash
   npm i
   npm run dev
   ```

3. Login with backend seeded user:
   - Email: `admin@example.com`
   - Password: `admin123`

## Pages
- Tournaments, Players, Courts, Matches, Registrations (CRUD)
- Double‑click a row to edit; use **New** to create.

## Notes
- Relations are input by id for now (tournament, player, court).
- API client injects `Authorization: Bearer <token>` from `localStorage.token`.
