# User UI (React + Vite + TS + MUI)

## Setup
1. Copy `.env.example` to `.env` and set your backend URL (default assumes http://localhost:8080).
2. Install & run:
   ```bash
   npm i
   npm run dev
   ```

## Features
- Browse tournaments and **register** (select player & category).
- View **matches** with schedule/status/score.
- See **My Registrations** (currently all registrations; filter by player in future).
- Simple **Brackets** placeholder page.
- Login page (JWT) compatible with backend `/auth/login`.

> Note: This is a user-facing shell; refine UX and authorization rules per your needs.
