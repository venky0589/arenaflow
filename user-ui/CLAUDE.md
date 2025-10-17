# User UI - AI Context (React + Vite)

**Component**: User-Facing Tournament Portal
**Framework**: React 18 + Vite + TypeScript + Material-UI
**Purpose**: Tournament browsing, registration, and match viewing for players and spectators

---

## Quick Reference

### Start Development Server
```bash
# 1. Setup (first time only)
cp .env.example .env
npm install

# 2. Start dev server
npm run dev

# Access: http://localhost:5174
```

### Test Login
- **Option 1**: Use admin credentials (admin@example.com / admin123)
- **Option 2**: Register new user via backend `/api/v1/auth/register`

### Build for Production
```bash
npm run build      # Output: dist/
npm run preview    # Preview production build
```

---

## Project Structure

```
user-ui/
├── src/
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Root component with routes
│   │
│   ├── pages/                  # Feature pages (6 files)
│   │   ├── Home.tsx            # Landing/welcome page
│   │   ├── Login.tsx           # User login
│   │   ├── Tournaments.tsx     # Browse & register for tournaments
│   │   ├── Matches.tsx         # View match schedules and scores
│   │   ├── Brackets.tsx        # Bracket visualization (placeholder)
│   │   └── Registrations.tsx   # My registrations (currently shows all)
│   │
│   ├── components/             # Reusable components (1 file)
│   │   └── Layout.tsx          # App bar + navigation
│   │
│   ├── api/                    # API integration (1 file)
│   │   └── client.ts           # Axios instance with JWT interceptor
│   │
│   └── vite-env.d.ts           # TypeScript definitions
│
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── .env.example                # Environment template
├── .env                        # Environment variables (not in git)
└── README.md                   # Quick start guide
```

---

## Architecture

### Component Hierarchy

```
App (Routes)
  ├─ Layout (App Bar + Outlet)
      ├─ / → Home
      ├─ /login → Login
      ├─ /tournaments → Tournaments
      ├─ /matches → Matches
      ├─ /brackets → Brackets (placeholder)
      └─ /registrations → Registrations
```

**Note**: Unlike Admin UI, User UI does NOT have protected routes (all pages accessible without login for browsing). Only registration actions require authentication.

### Authentication Flow

```
1. User browses tournaments (no auth required)
   ↓
2. User clicks "Register" button
   ↓
3. Check localStorage.token
   ↓
4. If no token → show message or redirect to /login
   ↓
5. User logs in
   ↓
6. POST /api/v1/auth/login
   ↓
7. Store token in localStorage
   ↓
8. Redirect back to tournaments
   ↓
9. User completes registration
```

### Navigation Structure

**App Bar Links**:
- Home
- Tournaments (browse & register)
- Matches (view schedules)
- Brackets (placeholder)
- My Registrations (user's registrations)
- Login/Logout (conditional based on token)

---

## Key Components

### 1. App.tsx (Root Component)

**Purpose**: Defines application routes

```tsx
export default function App() {
  return (
    <>
      <CssBaseline />
      <Layout>
        <Container sx={{ mt: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/brackets" element={<Brackets />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Layout>
    </>
  )
}
```

**Key Features**:
- React Router v6 for navigation
- Layout wrapper around all routes (always shows nav bar)
- Catch-all route redirects to home

### 2. components/Layout.tsx (Navigation)

**Purpose**: App bar with navigation and conditional login/logout

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>Tournament App</Typography>
          <Button component={Link} to="/">Home</Button>
          <Button component={Link} to="/tournaments">Tournaments</Button>
          <Button component={Link} to="/matches">Matches</Button>
          <Button component={Link} to="/brackets">Brackets</Button>
          <Button component={Link} to="/registrations">My Registrations</Button>
          {!token ? (
            <Button component={Link} to="/login">Login</Button>
          ) : (
            <Button onClick={logout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  )
}
```

**Behavior**:
- Shows "Login" button if no token
- Shows "Logout" button if logged in
- Logout clears token and redirects to /login

### 3. pages/Home.tsx (Landing Page)

**Purpose**: Welcome page with basic info

**Current Implementation**: Simple placeholder text

**Future Improvements**:
- Hero section with tournament highlights
- Upcoming tournaments preview
- Recent results
- Call-to-action buttons (Browse Tournaments, Register Now)

### 4. pages/Login.tsx (Authentication)

**Purpose**: User login form

```tsx
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.post('/api/v1/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    navigate('/tournaments')
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" value={email} onChange={...} />
        <TextField label="Password" type="password" value={password} onChange={...} />
        <Button type="submit">Login</Button>
      </form>
    </Paper>
  )
}
```

**Features**:
- Simple email/password form
- Stores JWT token on successful login
- Redirects to tournaments page after login

**Missing**:
- Registration link (user must register via backend API directly)
- Error handling
- Loading state
- Password reset functionality

### 5. pages/Tournaments.tsx (Browse & Register)

**Purpose**: Main tournament browsing and registration page

```tsx
export function Tournaments() {
  const [rows, setRows] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [open, setOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [playerId, setPlayerId] = useState<string>('')
  const [categoryType, setCategoryType] = useState<string>('SINGLES')

  const load = async () => {
    const ts = await api.get('/tournaments')
    setRows(ts.data)
    const ps = await api.get('/players')
    setPlayers(ps.data)
  }

  const register = async () => {
    if (!selectedTournament || !playerId) return
    await api.post('/registrations', {
      tournament: { id: selectedTournament },
      player: { id: Number(playerId) },
      categoryType
    })
    setOpen(false)
  }

  return (
    <>
      {rows.map(tournament => (
        <Card key={tournament.id}>
          <CardContent>
            <Typography variant="h6">{tournament.name}</Typography>
            <Typography>{tournament.location} • {tournament.startDate} – {tournament.endDate}</Typography>
            <Button onClick={() => { setSelectedTournament(tournament.id); setOpen(true) }}>
              Register
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <TextField select label="Player" value={playerId} onChange={...}>
            {players.map(p => (
              <MenuItem value={p.id}>{p.firstName} {p.lastName}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Category" value={categoryType} onChange={...}>
            <MenuItem value="SINGLES">SINGLES</MenuItem>
            <MenuItem value="DOUBLES">DOUBLES</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={register}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
```

**Features**:
- Lists all tournaments as cards
- Register button opens dialog
- Player dropdown (loads from `/players` API)
- Category selection (SINGLES/DOUBLES)
- Submits registration to `/registrations` API

**Key Difference from Admin UI**:
- Uses Cards instead of DataGrid (more user-friendly)
- Registration dialog instead of edit form
- Focus on browsing and action (not CRUD)

### 6. pages/Matches.tsx (Schedule Viewer)

**Purpose**: View match schedules, courts, and scores

```tsx
export function Matches() {
  const [matches, setMatches] = useState<Match[]>([])

  const load = async () => {
    const res = await api.get('/matches')
    setMatches(res.data)
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <Typography variant="h5">Matches</Typography>
      {matches.map(match => (
        <Card key={match.id}>
          <CardContent>
            <Typography>Court: {match.court?.name || 'TBD'}</Typography>
            <Typography>Status: {match.status}</Typography>
            <Typography>Score: {match.score1} - {match.score2}</Typography>
            <Typography>Time: {match.scheduledAt || 'TBD'}</Typography>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
```

**Features**:
- Lists all matches as cards
- Shows court assignment, status, and scores
- Displays scheduled time

**Missing**:
- Player names (currently only shows IDs - needs backend DTO with player info)
- Filter by tournament, court, or date
- Live score updates (needs WebSocket or polling)
- Match details page

### 7. pages/Brackets.tsx (Placeholder)

**Purpose**: Interactive bracket visualization

**Current State**: Placeholder with "Coming soon" message

**Needed Implementation**:
- Tournament selector
- Category filter
- Bracket tree visualization
- Round indicators
- Winner progression

**Recommended Libraries**:
- `react-brackets` - Tournament bracket component
- `d3` - Custom SVG bracket rendering

**Example Structure**:
```tsx
export function Brackets() {
  const [tournament, setTournament] = useState<number | null>(null)
  const [bracket, setBracket] = useState<BracketData | null>(null)

  const load = async () => {
    const res = await api.get(`/brackets?tournamentId=${tournament}`)
    setBracket(res.data)
  }

  return (
    <>
      <TournamentSelector onChange={setTournament} />
      {bracket && <BracketView data={bracket} />}
    </>
  )
}
```

**Backend API Required**: `GET /api/v1/brackets?tournamentId={id}` (doesn't exist yet)

### 8. pages/Registrations.tsx (My Registrations)

**Purpose**: View user's tournament registrations

```tsx
export function Registrations() {
  const [rows, setRows] = useState<Registration[]>([])

  const load = async () => {
    const res = await api.get('/registrations')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <Typography variant="h5">My Registrations</Typography>
      {rows.map(reg => (
        <Card key={reg.id}>
          <CardContent>
            <Typography>Tournament: {reg.tournament?.name}</Typography>
            <Typography>Player: {reg.player?.firstName} {reg.player?.lastName}</Typography>
            <Typography>Category: {reg.categoryType}</Typography>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
```

**Current Behavior**: Shows ALL registrations (not filtered by user)

**Issue**: No user-specific filtering (backend should filter by authenticated user)

**Fix Required**:
1. Backend: Get user ID from JWT token
2. Backend: Filter registrations by user's associated player ID
3. Or add user-player association to enable "my registrations" filtering

### 9. api/client.ts (HTTP Client)

**Purpose**: Configured Axios instance with JWT injection

```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
```

**Same as Admin UI** - JWT automatically added to all requests

---

## Page-by-Page Feature Summary

| Page | Path | Auth Required | Features | Status |
|------|------|---------------|----------|--------|
| Home | `/` | No | Welcome message | ✅ Placeholder |
| Login | `/login` | No | Email/password login | ✅ Basic |
| Tournaments | `/tournaments` | No (browsing)<br>Yes (registration) | Browse tournaments, register | ✅ Working |
| Matches | `/matches` | No | View schedules, courts, scores | ✅ Basic |
| Brackets | `/brackets` | No | Interactive bracket view | ❌ Placeholder |
| Registrations | `/registrations` | Yes | View my registrations | ⚠️ Shows all (not filtered) |

---

## Known Issues & Improvements Needed

### 1. Brackets Page Not Implemented (HIGH PRIORITY)

**Problem**: Only placeholder exists, no bracket visualization.

**Implementation Steps**:
1. **Backend**: Create `BracketController` with endpoint:
   ```java
   GET /api/v1/brackets?tournamentId={id}&categoryType={type}
   ```
   Returns bracket tree structure with matches and rounds.

2. **Frontend**: Add bracket visualization:
   ```bash
   npm install react-brackets
   ```
   ```tsx
   import { Bracket } from 'react-brackets'

   export function Brackets() {
     const [bracket, setBracket] = useState(null)
     // Load bracket from API
     return <Bracket rounds={bracket.rounds} />
   }
   ```

### 2. Registrations Shows All Records (MEDIUM PRIORITY)

**Problem**: `/registrations` page shows all registrations, not just the logged-in user's.

**Solution**:
- **Backend**: Filter by authenticated user
  ```java
  @GetMapping("/registrations")
  public List<Registration> getUserRegistrations(@AuthenticationPrincipal UserDetails user) {
      // Get player associated with user
      // Return only that player's registrations
  }
  ```

- **Alternative**: Add query parameter:
  ```tsx
  const userId = getCurrentUserId() // from JWT
  const res = await api.get(`/registrations?userId=${userId}`)
  ```

### 3. Matches Missing Player Information (MEDIUM PRIORITY)

**Problem**: Match cards show player IDs instead of names.

**Solution**: Backend should return DTO with player info:
```java
// MatchDTO.java
public class MatchDTO {
    private Long id;
    private String player1Name;  // Not just player1Id
    private String player2Name;
    private String courtName;
    // ...
}
```

Frontend displays names:
```tsx
<Typography>
  {match.player1Name} vs {match.player2Name}
</Typography>
```

### 4. No Registration Link on Login Page (LOW PRIORITY)

**Problem**: Users must register via backend API directly (no UI for registration).

**Solution**: Add registration form:
```tsx
<Link to="/register">Don't have an account? Register</Link>
```

Create `pages/Register.tsx`:
```tsx
const handleRegister = async () => {
  await api.post('/api/v1/auth/register', { email, password })
  navigate('/login')
}
```

### 5. No Error Handling (MEDIUM PRIORITY)

**Problem**: API errors crash the app or go unnoticed.

**Solution**: Add try-catch with user feedback:
```tsx
const register = async () => {
  try {
    await api.post('/registrations', {...})
    alert('Registered successfully!')
    setOpen(false)
  } catch (error) {
    alert('Registration failed: ' + error.response?.data?.message)
  }
}
```

### 6. No Loading States (LOW PRIORITY)

**Problem**: No indication when data is loading.

**Solution**:
```tsx
const [loading, setLoading] = useState(false)

const load = async () => {
  setLoading(true)
  const res = await api.get('/tournaments')
  setRows(res.data)
  setLoading(false)
}

return loading ? <CircularProgress /> : <TournamentList />
```

### 7. No Search/Filter on Tournaments (MEDIUM PRIORITY)

**Problem**: All tournaments shown, no way to filter by date, location, status.

**Solution**: Add filters:
```tsx
<TextField label="Search" onChange={(e) => setSearch(e.target.value)} />
<Select label="Location" onChange={(e) => setLocation(e.target.value)}>
  <MenuItem value="Hyderabad">Hyderabad</MenuItem>
  <MenuItem value="Bengaluru">Bengaluru</MenuItem>
</Select>

const filteredTournaments = tournaments.filter(t =>
  t.name.includes(search) &&
  (location === '' || t.location === location)
)
```

### 8. No Live Score Updates (LOW PRIORITY - V2 Feature)

**Problem**: Scores don't update automatically (requires page refresh).

**Solution**: Implement polling or WebSocket:

**Polling**:
```tsx
useEffect(() => {
  const interval = setInterval(load, 5000) // Refresh every 5 seconds
  return () => clearInterval(interval)
}, [])
```

**WebSocket** (better):
```tsx
useEffect(() => {
  const socket = new WebSocket('ws://localhost:8080/matches')
  socket.onmessage = (event) => {
    const updatedMatch = JSON.parse(event.data)
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m))
  }
  return () => socket.close()
}, [])
```

---

## Dependencies (package.json)

### Core
- `react` (v18.2.0) - UI library
- `react-dom` (v18.2.0) - React renderer
- `react-router-dom` (v6.26.0) - Routing

### UI Library
- `@mui/material` (v5.15.20) - Material Design components
- `@mui/icons-material` (v5.15.20) - Material icons
- `@emotion/react` (v11.13.3) - CSS-in-JS (required by MUI)
- `@emotion/styled` (v11.13.0) - Styled components

### HTTP
- `axios` (v1.7.2) - HTTP client

### Dev Dependencies
- `typescript` (v5.5.3) - Type checking
- `vite` (v5.2.0) - Build tool
- `@vitejs/plugin-react` (v4.3.1) - React plugin for Vite
- `@types/react`, `@types/react-dom`, `@types/node` - TypeScript definitions

**Note**: User UI has fewer dependencies than Admin UI (no Formik, no DataGrid)

---

## Configuration Files

### .env (Environment Variables)
```bash
VITE_API_BASE=http://localhost:8080  # Backend API URL
```

### vite.config.ts (Build Configuration)
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174  // Different from Admin UI (5173)
  }
})
```

### tsconfig.json (TypeScript Configuration)
Standard React + Vite TypeScript config

---

## Common Development Tasks

### Adding a New Page

1. **Create Page Component**:
   ```tsx
   // src/pages/Results.tsx
   export function Results() {
     return <Typography>Results page</Typography>
   }
   ```

2. **Add Route**:
   ```tsx
   // src/App.tsx
   <Route path="/results" element={<Results />} />
   ```

3. **Add Navigation**:
   ```tsx
   // src/components/Layout.tsx
   <Button component={Link} to="/results">Results</Button>
   ```

### Making API Call with Authentication

```tsx
import api from '../api/client'

const loadData = async () => {
  try {
    // Token automatically added by interceptor
    const response = await api.get('/tournaments')
    setData(response.data)
  } catch (error) {
    console.error('API Error:', error)
  }
}
```

### Checking if User is Logged In

```tsx
const isLoggedIn = !!localStorage.getItem('token')

{isLoggedIn ? (
  <Button onClick={register}>Register</Button>
) : (
  <Button component={Link} to="/login">Login to Register</Button>
)}
```

### Formatting Dates

```tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

<Typography>{formatDate(tournament.startDate)}</Typography>
```

---

## UX Best Practices for User-Facing Apps

1. **Clear Call-to-Actions**: Prominent "Register" buttons
2. **Visual Hierarchy**: Use typography variants (h4, h5, body1, body2)
3. **Feedback**: Show success/error messages after actions
4. **Loading States**: Indicate when data is loading
5. **Empty States**: Show helpful message when no data
6. **Responsive Design**: Use MUI Grid/Stack for layouts
7. **Accessible Colors**: High contrast, WCAG compliant
8. **Error Recovery**: Clear error messages with guidance

---

## Testing Strategy (To Implement)

### Component Tests
```tsx
import { render, screen } from '@testing-library/react'
import { Tournaments } from './Tournaments'

test('displays tournaments', async () => {
  render(<Tournaments />)
  expect(await screen.findByText('City Open')).toBeInTheDocument()
})
```

### User Flow Tests (Cypress)
```js
describe('Tournament Registration', () => {
  it('allows user to register for tournament', () => {
    cy.visit('/tournaments')
    cy.contains('Register').click()
    cy.get('select[name="player"]').select('Saina K')
    cy.get('select[name="category"]').select('SINGLES')
    cy.contains('Submit').click()
    cy.contains('Registered successfully').should('be.visible')
  })
})
```

---

## Performance Optimization

### Code Splitting
```tsx
const Brackets = lazy(() => import('./pages/Brackets'))

<Suspense fallback={<CircularProgress />}>
  <Brackets />
</Suspense>
```

### Image Optimization
```tsx
<img
  src="/tournament-banner.jpg"
  loading="lazy"
  alt="Tournament"
/>
```

### Reduce Bundle Size
- Remove unused dependencies
- Use tree-shaking (Vite does this automatically)
- Analyze bundle: `npm run build -- --analyze`

---

## Deployment Checklist

- [ ] Update `VITE_API_BASE` to production backend URL
- [ ] Run `npm run build`
- [ ] Test registration flow in production
- [ ] Verify CORS configuration on backend
- [ ] Setup HTTPS
- [ ] Add analytics (Google Analytics, Mixpanel)
- [ ] Add error tracking (Sentry)
- [ ] Test on mobile devices
- [ ] Verify SEO meta tags in index.html

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader friendly
- [ ] Focus indicators visible
- [ ] ARIA attributes where needed

---

## Differences from Admin UI

| Aspect | Admin UI | User UI |
|--------|----------|---------|
| **Purpose** | Management & CRUD | Browsing & viewing |
| **UI Components** | DataGrid, complex forms | Cards, simple forms |
| **Protection** | All routes protected | Only actions require auth |
| **Navigation** | CRUD-focused | User journey-focused |
| **Data Display** | Tables with many columns | Cards with key info |
| **Actions** | Create, Edit, Delete | Register, View |
| **Dependencies** | Formik, DataGrid | Minimal |

---

## Related Documentation

- **Main Project Context**: [../CLAUDE.md](../CLAUDE.md)
- **Backend Context**: [../backend/CLAUDE.md](../backend/CLAUDE.md)
- **Admin UI Context**: [../admin-ui/CLAUDE.md](../admin-ui/CLAUDE.md)

---

## AI Assistant Guidelines for User UI

1. **Focus on user experience** - Simple, intuitive interfaces
2. **Use Cards over Tables** - More visually appealing for users
3. **Clear CTAs** - "Register Now", "View Details" buttons
4. **Show relevant info only** - Don't overwhelm with data
5. **Mobile-first design** - Many users will be on phones
6. **Add empty states** - "No tournaments available" with helpful message
7. **Error recovery** - Clear error messages with next steps
8. **Optimize for speed** - Lazy load, code split
9. **Test as end user** - Walk through full registration flow
10. **Implement brackets ASAP** - This is a key missing feature

---

**For Questions**: See main project context at [../CLAUDE.md](../CLAUDE.md)
