Awesome — here’s a concise, copy-pasteable checklist to bring up everything locally and test it end-to-end.

# 0) Prereqs

* **Java 17+**, **Maven 3.9+**, **Node 18+**, **Docker** (for Postgres), **Git**.
* (Mobile) **Android Studio** or **Expo Go** app on phone.

---

# 1) Backend (Spring Boot, Maven)

1. Unzip **backend.zip** and open a terminal in that folder.
2. Start DB:

```bash
docker compose up -d
```

3. Run backend:

```bash
mvn spring-boot:run
```

4. Verify:

* Swagger: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
* Default admin: `admin@example.com` / `password123`
* Postman: import `postman_collection.json` (in backend zip)

### Quick API smoke test (no Postman)

```bash
# login (admin)
curl -s -X POST http://localhost:8080/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}' | jq .
# copy token value to TOKEN variable:
TOKEN=PASTE_TOKEN_HERE
# list players
curl -s http://localhost:8080/players -H "Authorization: Bearer $TOKEN" | jq .
```

---

# 2) Admin UI (React + Vite)

1. Unzip **admin-ui.zip** → open a terminal in that folder.
2. Create `.env`:

```bash
cp .env.example .env
# Ensure the URL points to backend:
# VITE_API_BASE=http://localhost:8080
```

3. Install & run:

```bash
npm i
npm run dev
```

4. Open: [http://localhost:5173](http://localhost:5173)
5. Login with **[admin@example.com](mailto:admin@example.com) / password123**.
6. Try CRUD (Players/Tournaments/etc.). Double-click a row to edit.

---

# 3) User UI (React + Vite)

1. Unzip **user-ui.zip**, open terminal in that folder.
2. `.env`:

```bash
cp .env.example .env
# VITE_API_BASE=http://localhost:8080
```

3. Install & run:

```bash
npm i
npm run dev
```

4. Open: [http://localhost:5174](http://localhost:5174)
5. Use **Login** page (you can register user via backend `/auth/register`, or reuse admin for testing).
6. Go to **Tournaments** → **Register** (select player & category).

---

# 4) Mobile App (Expo React Native)

1. Unzip **mobile-app.zip**, open terminal.
2. Install deps:

```bash
npm i
```

3. Set backend URL (Android emulator uses 10.0.2.2):

```bash
# Option A: default (Android emulator): http://10.0.2.2:8080
npm start

# Option B: your machine IP (for physical device / Expo Go):
EXPO_PUBLIC_API_BASE=http://YOUR_LAN_IP:8080 npm start
```

4. In Expo:

* **Press a** for Android emulator, or scan QR with Expo Go (same Wi-Fi).

5. Login → **Tournaments** → Register (SINGLES) → **Scoring** → increment scores.

---

# 5) Seed Data (already included)

* 2 tournaments, 4 players, 2 courts.
* Admin user pre-seeded (`admin@example.com` / `password123`).

---

# 6) Common pitfalls & quick fixes

* **Java version**: app requires **Java 17+**.
* **Port busy**: change admin/user UI ports in `vite.config.ts` if needed.
* **CORS**: current backend allows same-origin via token; if you moved ports or hosts, and see CORS in browser, we can add `@Bean CorsConfigurationSource` (tell me your origins).
* **JWT invalid**: ensure `Authorization: Bearer <token>` header is sent (admin & user UIs do this automatically once logged in).
* **DB auth**: if Postgres failed, `docker compose logs -f postgres`. Verify env matches `application.yml`.
* **Emulator networking**:

  * Android emulator → backend = `http://10.0.2.2:8080`
  * iOS simulator → `http://localhost:8080`
  * Physical device → `http://<your_lan_ip>:8080`

---

# 7) Minimal end-to-end flow (sanity)

1. **Backend up** (`mvn spring-boot:run`) + **DB up** (`docker compose up -d`).
2. **Admin UI** → create a new player & a new tournament.
3. **User UI** → Login → Tournaments → Register the player in the tournament.
4. **Admin UI** → Create a Match (choose tournament, set player1/player2).
5. **Mobile** → Scoring → pick the first match → press **P1+ / P2+** → verify score reflects in **Admin UI** (refresh **Matches** page) and **User UI**.

---

# 8) Next tickets I can prep for you

* **Relations UI**: replace raw ID text fields with selects (players, tournaments, courts).
* **Match Scheduler**: generate draws & court assignment; status transitions.
* **Live updates**: WebSocket/SSE to push scores live to user UI.
* **Auth roles**: restrict Admin pages; add **Referee** role for mobile scoring only.
* **Payments** (optional): Razorpay/Stripe integration on user registration.
* **Bulk import/export**: CSV import for players; export results.
* **Tests**: JUnit + Testcontainers; Cypress/Playwright for web UIs.
* **Deploy**: Dockerfiles + GitHub Actions; render.com/fly.io/EC2.

Tell me which ticket you want first, and I’ll drop the code/diffs.
