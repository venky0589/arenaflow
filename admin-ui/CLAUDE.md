# Admin UI - AI Context (React + Vite)

**Component**: Admin Management Interface
**Framework**: React 18 + Vite + TypeScript + Material-UI
**Purpose**: Tournament and player management for administrators

---

## Quick Reference

### Start Development Server
```bash
# 1. Setup (first time only)
cp .env.example .env
npm install

# 2. Start dev server
npm run dev

# Access: http://localhost:5173
```

### Default Login
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Build for Production
```bash
npm run build      # Output: dist/
npm run preview    # Preview production build
```

---

## Project Structure

```
admin-ui/
├── src/
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Root component with routes
│   │
│   ├── auth/                   # Authentication components
│   │   ├── Login.tsx           # Login page
│   │   └── RequireAuth.tsx     # Route protection HOC
│   │
│   ├── pages/                  # Feature pages (5 files)
│   │   ├── Tournaments.tsx     # Tournament CRUD
│   │   ├── Players.tsx         # Player CRUD
│   │   ├── Courts.tsx          # Court CRUD
│   │   ├── Matches.tsx         # Match CRUD
│   │   └── Registrations.tsx   # Registration CRUD
│   │
│   ├── components/             # Reusable components (3 files)
│   │   ├── Layout.tsx          # App bar + navigation
│   │   ├── CrudTable.tsx       # MUI DataGrid wrapper
│   │   └── FormDialog.tsx      # Generic dialog for forms
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
  ├─ /login → Login
  │
  └─ RequireAuth (Protected)
      └─ Layout (App Bar + Outlet)
          ├─ /tournaments → Tournaments
          ├─ /players → Players
          ├─ /courts → Courts
          ├─ /matches → Matches
          └─ /registrations → Registrations
```

### Authentication Flow

```
1. User visits protected route
   ↓
2. RequireAuth checks localStorage.token
   ↓
3. If no token → redirect to /login
   ↓
4. User submits login form
   ↓
5. POST /api/v1/auth/login
   ↓
6. Store token in localStorage
   ↓
7. Redirect to original route
   ↓
8. All API requests include "Authorization: Bearer {token}"
```

### Data Flow Pattern (Example: Tournaments)

```
Component State (useState)
  ↓
Load Data (useEffect) → API Call (axios) → Backend
  ↓
Update State (setRows)
  ↓
Render DataGrid
  ↓
User Action (double-click row)
  ↓
Open Form Dialog
  ↓
User Edits & Saves
  ↓
API Call (PUT /tournaments/{id})
  ↓
Reload Data
  ↓
Update State & Re-render
```

---

## Key Components

### 1. App.tsx (Root Component)

**Purpose**: Defines application routes

```tsx
export default function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/tournaments" />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/players" element={<Players />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/registrations" element={<Registrations />} />
        </Route>
      </Routes>
    </>
  )
}
```

**Key Features**:
- React Router v6 for navigation
- CssBaseline for consistent styling
- RequireAuth wrapper for protected routes
- Default redirect to /tournaments

### 2. auth/RequireAuth.tsx (Route Guard)

**Purpose**: Protects routes from unauthenticated access

```tsx
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const loc = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }
  return <>{children}</>
}
```

**Behavior**:
- Checks for JWT token in localStorage
- Redirects to /login if no token
- Preserves original location for post-login redirect

### 3. auth/Login.tsx (Authentication)

**Purpose**: User login form

**Features**:
- Email and password inputs
- Form validation (Formik + Yup)
- API call to `/api/v1/auth/login`
- Token storage in localStorage
- Redirect to dashboard after successful login

**API Integration**:
```tsx
const handleSubmit = async (values: LoginFormValues) => {
  const res = await api.post('/api/v1/auth/login', values)
  localStorage.setItem('token', res.data.token)
  navigate('/tournaments')
}
```

### 4. components/Layout.tsx (Navigation)

**Purpose**: App bar with navigation and logout

```tsx
export function Layout() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography>Admin Panel</Typography>
          <Button component={Link} to="/tournaments">Tournaments</Button>
          <Button component={Link} to="/players">Players</Button>
          <Button component={Link} to="/courts">Courts</Button>
          <Button component={Link} to="/matches">Matches</Button>
          <Button component={Link} to="/registrations">Registrations</Button>
          <Button onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Outlet />  {/* Child routes render here */}
      </Container>
    </>
  )
}
```

### 5. components/CrudTable.tsx (Data Grid)

**Purpose**: Reusable MUI DataGrid wrapper

```tsx
export function CrudTable({ rows, columns, onRowClick }) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[5, 10, 25]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      onRowDoubleClick={(params) => onRowClick && onRowClick(params.row)}
      getRowId={(row) => row.id}
    />
  )
}
```

**Features**:
- Pagination (5, 10, 25 rows per page)
- Double-click to edit
- Sortable columns
- Auto-sizing

### 6. components/FormDialog.tsx (Reusable Modal)

**Purpose**: Generic dialog for create/edit forms

**Props**:
- `open` - Controls visibility
- `title` - Dialog title (e.g., "Edit Tournament")
- `onClose` - Close handler
- `onSave` - Save handler
- `children` - Form fields (passed as children)

**Usage Example**:
```tsx
<FormDialog
  open={open}
  title="Edit Tournament"
  onClose={() => setOpen(false)}
  onSave={save}
>
  <TextField label="Name" value={form.name} onChange={handleChange} />
  <TextField label="Location" value={form.location} onChange={handleChange} />
</FormDialog>
```

### 7. api/client.ts (HTTP Client)

**Purpose**: Configured Axios instance with JWT injection

```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080'
})

// Automatically add JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
```

**Usage**:
```tsx
import api from '../api/client'

// All requests include JWT automatically
const tournaments = await api.get('/tournaments')
const player = await api.post('/players', { firstName: 'John', lastName: 'Doe' })
```

---

## CRUD Pages Pattern

All CRUD pages follow the same pattern. Example: **Tournaments.tsx**

### State Management
```tsx
const [rows, setRows] = useState<Tournament[]>([])         // Table data
const [open, setOpen] = useState(false)                    // Dialog visibility
const [form, setForm] = useState({ name: '', location: '', ... })  // Form data
const [editingId, setEditingId] = useState<number | null>(null)    // Edit mode flag
```

### Data Loading
```tsx
const load = async () => {
  const res = await api.get('/tournaments')
  setRows(res.data)
}

useEffect(() => { load() }, [])  // Load on mount
```

### Column Definition
```tsx
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'startDate', headerName: 'Start Date', flex: 1 },
  { field: 'endDate', headerName: 'End Date', flex: 1 }
]
```

### Create/Edit Handlers
```tsx
const onNew = () => {
  setEditingId(null)
  setForm({ name: '', location: '', startDate: '', endDate: '' })
  setOpen(true)
}

const onEdit = (row: Tournament) => {
  setEditingId(row.id)
  setForm(row)
  setOpen(true)
}
```

### Save Handler
```tsx
const save = async () => {
  if (editingId) {
    await api.put(`/tournaments/${editingId}`, form)  // Update
  } else {
    await api.post('/tournaments', form)               // Create
  }
  setOpen(false)
  await load()  // Refresh data
}
```

### Delete Handler
```tsx
const del = async (row: Tournament) => {
  await api.delete(`/tournaments/${row.id}`)
  await load()
}
```

### Render
```tsx
return (
  <Stack spacing={2}>
    <Typography variant="h5">Tournaments</Typography>
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={onNew}>New</Button>
      <Button onClick={load}>Refresh</Button>
    </Stack>
    <Paper>
      <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
    </Paper>

    <FormDialog open={open} title={editingId ? 'Edit' : 'New'} onClose={() => setOpen(false)} onSave={save}>
      <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
      {/* More fields... */}
    </FormDialog>
  </Stack>
)
```

---

## Page-Specific Details

### Tournaments Page
**File**: `src/pages/Tournaments.tsx`

**Columns**: Name, Location, Start Date, End Date

**Form Fields**:
- Name (text)
- Location (text)
- Start Date (text - should be date picker)
- End Date (text - should be date picker)

**API**: `/tournaments`

### Players Page
**File**: `src/pages/Players.tsx`

**Columns**: First Name, Last Name, Gender, Phone

**Form Fields**:
- First Name (text)
- Last Name (text)
- Gender (text - should be M/F select)
- Phone (text)

**API**: `/players`

### Courts Page
**File**: `src/pages/Courts.tsx`

**Columns**: Name, Location Note

**Form Fields**:
- Name (text)
- Location Note (text)

**API**: `/courts`

### Matches Page
**File**: `src/pages/Matches.tsx`

**Columns**: Tournament ID, Court ID, Player1 ID, Player2 ID, Score1, Score2, Status, Scheduled At

**Form Fields** (❌ **ISSUE: Uses raw IDs instead of dropdowns**):
- Tournament ID (text input - should be dropdown)
- Court ID (text input - should be dropdown)
- Player1 ID (text input - should be dropdown)
- Player2 ID (text input - should be dropdown)
- Score1 (number)
- Score2 (number)
- Status (select: SCHEDULED, IN_PROGRESS, COMPLETED)
- Scheduled At (text - should be datetime picker)

**API**: `/matches`

### Registrations Page
**File**: `src/pages/Registrations.tsx`

**Columns**: Tournament ID, Player ID, Category Type

**Form Fields** (❌ **ISSUE: Uses raw IDs instead of dropdowns**):
- Tournament ID (text input - should be dropdown)
- Player ID (text input - should be dropdown)
- Category Type (select: SINGLES, DOUBLES)

**API**: `/registrations`

---

## Known Issues & Improvements Needed

### 1. Raw ID Inputs (HIGH PRIORITY)

**Problem**: Forms use text inputs for foreign keys instead of user-friendly dropdowns.

**Current (Bad UX)**:
```tsx
<TextField label="Tournament ID" value={form.tournamentId} onChange={...} />
```

**Needed (Good UX)**:
```tsx
<Autocomplete
  options={tournaments}
  getOptionLabel={(option) => option.name}
  value={selectedTournament}
  onChange={(e, newValue) => setForm({ ...form, tournamentId: newValue?.id })}
  renderInput={(params) => <TextField {...params} label="Tournament" />}
/>
```

**Files to Fix**:
- `src/pages/Matches.tsx` (tournament, court, player1, player2)
- `src/pages/Registrations.tsx` (tournament, player)

**Implementation Steps**:
1. Load options on form open:
   ```tsx
   useEffect(() => {
     if (open) {
       loadTournaments()
       loadPlayers()
       loadCourts()
     }
   }, [open])
   ```

2. Replace TextField with Autocomplete:
   ```tsx
   <Autocomplete
     options={tournaments}
     getOptionLabel={(t) => t.name}
     value={tournaments.find(t => t.id === form.tournamentId)}
     onChange={(e, val) => setForm({ ...form, tournamentId: val?.id })}
     renderInput={(params) => <TextField {...params} label="Tournament" />}
   />
   ```

### 2. Date Inputs (MEDIUM PRIORITY)

**Problem**: Date fields use text inputs instead of date pickers.

**Current**:
```tsx
<TextField label="Start Date" value={form.startDate} onChange={...} />
```

**Needed**:
```tsx
<DatePicker
  label="Start Date"
  value={form.startDate}
  onChange={(date) => setForm({ ...form, startDate: date })}
/>
```

**Requires**: Install `@mui/x-date-pickers` and `dayjs`

### 3. No Validation Feedback

**Problem**: No visual indication of validation errors.

**Solution**: Use Formik's error handling:
```tsx
<TextField
  label="Name"
  value={form.name}
  onChange={handleChange}
  error={Boolean(errors.name)}
  helperText={errors.name}
/>
```

### 4. No Loading States

**Problem**: No indication when data is loading or saving.

**Solution**: Add loading state:
```tsx
const [loading, setLoading] = useState(false)

const load = async () => {
  setLoading(true)
  const res = await api.get('/tournaments')
  setRows(res.data)
  setLoading(false)
}

return <CrudTable rows={rows} columns={columns} loading={loading} />
```

### 5. No Error Handling

**Problem**: API errors crash the app or go unnoticed.

**Solution**: Add try-catch with user feedback:
```tsx
const save = async () => {
  try {
    if (editingId) {
      await api.put(`/tournaments/${editingId}`, form)
    } else {
      await api.post('/tournaments', form)
    }
    setOpen(false)
    await load()
    // Show success message
  } catch (error) {
    console.error('Failed to save:', error)
    // Show error message to user
  }
}
```

### 6. No Confirmation for Delete

**Problem**: Records can be accidentally deleted.

**Solution**: Add confirmation dialog:
```tsx
const del = async (row: Tournament) => {
  if (window.confirm(`Delete ${row.name}?`)) {
    await api.delete(`/tournaments/${row.id}`)
    await load()
  }
}
```

Or use MUI Dialog for better UX.

### 7. No Role-Based UI

**Problem**: All features visible to all authenticated users.

**Solution**: Hide admin features based on user role:
```tsx
const userRole = localStorage.getItem('role')  // Need backend to return this

{userRole === 'ADMIN' && (
  <Button onClick={onDelete}>Delete</Button>
)}
```

### 8. No Optimistic Updates

**Problem**: UI waits for server response before updating.

**Solution**: Update UI immediately, rollback on error:
```tsx
const del = async (row: Tournament) => {
  setRows(rows.filter(r => r.id !== row.id))  // Optimistic update
  try {
    await api.delete(`/tournaments/${row.id}`)
  } catch (error) {
    await load()  // Rollback on error
  }
}
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
- `@mui/x-data-grid` (v6.20.2) - Data grid component
- `@emotion/react` (v11.13.3) - CSS-in-JS (required by MUI)
- `@emotion/styled` (v11.13.0) - Styled components

### Forms
- `formik` (v2.4.6) - Form management
- `yup` (v1.4.0) - Schema validation

### HTTP
- `axios` (v1.7.2) - HTTP client

### Dev Dependencies
- `typescript` (v5.5.3) - Type checking
- `vite` (v4.5.3) - Build tool
- `@vitejs/plugin-react` (v4.3.1) - React plugin for Vite
- `@types/react`, `@types/react-dom`, `@types/node` - TypeScript definitions

---

## Configuration Files

### .env (Environment Variables)
```bash
VITE_API_BASE=http://localhost:8080  # Backend API URL
```

**Note**: Vite requires `VITE_` prefix for env vars to be exposed to client code.

### vite.config.ts (Build Configuration)
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

### tsconfig.json (TypeScript Configuration)
Standard React + Vite TypeScript config with:
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled

---

## Common Development Tasks

### Adding a New Page

1. **Create Page Component**:
   ```tsx
   // src/pages/Categories.tsx
   export function Categories() {
     const [rows, setRows] = useState([])
     // CRUD logic...
     return <CrudTable rows={rows} columns={columns} />
   }
   ```

2. **Add Route**:
   ```tsx
   // src/App.tsx
   <Route path="/categories" element={<Categories />} />
   ```

3. **Add Navigation**:
   ```tsx
   // src/components/Layout.tsx
   <Button component={Link} to="/categories">Categories</Button>
   ```

### Adding a New Field to Existing Form

1. **Update Form State**:
   ```tsx
   const [form, setForm] = useState({
     name: '',
     location: '',
     newField: ''  // Add this
   })
   ```

2. **Add Form Input**:
   ```tsx
   <TextField
     label="New Field"
     name="newField"
     value={form.newField}
     onChange={handleChange}
   />
   ```

3. **Update Column Definition** (if showing in table):
   ```tsx
   const columns = [
     // existing columns...
     { field: 'newField', headerName: 'New Field', flex: 1 }
   ]
   ```

### Customizing Table Columns

```tsx
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },  // Flexible width
  { field: 'status', headerName: 'Status', width: 120 },  // Fixed width
  {
    field: 'startDate',
    headerName: 'Start Date',
    flex: 1,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString()  // Format
  },
  {
    field: 'actions',
    headerName: 'Actions',
    renderCell: (params) => (
      <Button onClick={() => handleAction(params.row)}>Action</Button>
    )
  }
]
```

### Adding Search/Filter

```tsx
const [searchTerm, setSearchTerm] = useState('')

const filteredRows = rows.filter(row =>
  row.name.toLowerCase().includes(searchTerm.toLowerCase())
)

return (
  <>
    <TextField
      label="Search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <CrudTable rows={filteredRows} columns={columns} />
  </>
)
```

---

## Testing Strategy (To Implement)

### Unit Tests (Component Tests)
```tsx
import { render, screen } from '@testing-library/react'
import { Tournaments } from './Tournaments'

test('renders tournaments page', () => {
  render(<Tournaments />)
  expect(screen.getByText('Tournaments')).toBeInTheDocument()
})
```

### Integration Tests (API Mocking)
```tsx
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/tournaments', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'City Open' }]))
  })
)

test('loads and displays tournaments', async () => {
  render(<Tournaments />)
  expect(await screen.findByText('City Open')).toBeInTheDocument()
})
```

### E2E Tests (Cypress)
```js
describe('Tournaments CRUD', () => {
  it('creates new tournament', () => {
    cy.visit('/')
    cy.contains('New').click()
    cy.get('input[name="name"]').type('Summer Cup')
    cy.contains('Save').click()
    cy.contains('Summer Cup').should('be.visible')
  })
})
```

---

## Performance Optimization Tips

### 1. Memoize Expensive Computations
```tsx
const filteredRows = useMemo(() =>
  rows.filter(row => row.status === 'ACTIVE'),
  [rows]
)
```

### 2. Prevent Unnecessary Re-renders
```tsx
const handleChange = useCallback((e) => {
  setForm(f => ({ ...f, [e.target.name]: e.target.value }))
}, [])
```

### 3. Code Splitting
```tsx
const Tournaments = lazy(() => import('./pages/Tournaments'))

<Suspense fallback={<Loading />}>
  <Tournaments />
</Suspense>
```

### 4. Virtualize Large Lists
For tables with 1000+ rows, use `react-window` or MUI's virtualization features.

---

## Debugging Tips

### React DevTools
Install React DevTools browser extension to:
- Inspect component hierarchy
- View component props and state
- Profile performance

### Axios Interceptor for Debugging
```tsx
api.interceptors.response.use(
  response => {
    console.log('API Response:', response)
    return response
  },
  error => {
    console.error('API Error:', error.response?.data)
    return Promise.reject(error)
  }
)
```

### Check Token
```tsx
console.log('Token:', localStorage.getItem('token'))
```

### Network Tab
Use browser DevTools Network tab to:
- Verify API requests
- Check request/response payloads
- Debug CORS issues

---

## Deployment Checklist

- [ ] Update `VITE_API_BASE` to production backend URL
- [ ] Run `npm run build` to generate `dist/` folder
- [ ] Configure web server to serve `dist/index.html` for all routes (SPA)
- [ ] Enable HTTPS
- [ ] Configure CORS on backend for production domain
- [ ] Test login and all CRUD operations
- [ ] Setup CI/CD pipeline (GitHub Actions)

---

## Related Documentation

- **Main Project Context**: [../CLAUDE.md](../CLAUDE.md)
- **Backend Context**: [../backend/CLAUDE.md](../backend/CLAUDE.md)
- **User UI Context**: [../user-ui/CLAUDE.md](../user-ui/CLAUDE.md)

---

## AI Assistant Guidelines for Admin UI

1. **Follow existing CRUD pattern** - All pages use same structure
2. **Use MUI components** - Don't introduce new UI libraries
3. **Add error handling** - Wrap API calls in try-catch
4. **Show loading states** - Indicate when data is loading
5. **Validate inputs** - Use Formik + Yup for forms
6. **Use TypeScript** - Define types for all data structures
7. **Replace raw IDs with dropdowns** - This is a high priority fix
8. **Add confirmation dialogs** - For destructive actions (delete)
9. **Test in browser** - Always verify in running app
10. **Keep components focused** - One responsibility per component

---

## Implementation Improvements Roadmap

Based on the comprehensive implementation improvement documents (v1-v4) in `../docs/`, the following enhancements are recommended for the Admin UI:

### 1. **State Management Enhancement** (HIGH PRIORITY)
**Current**: Local component state with useState, prop drilling
**Issue**: No centralized state management, repeated API calls, state synchronization issues

**Recommended Solutions**:

#### Option A: Context API (Simpler, built-in)
```typescript
// contexts/TournamentContext.tsx
interface TournamentContextType {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  fetchTournaments: () => Promise<void>;
  selectTournament: (id: number) => void;
  createTournament: (data: CreateTournamentRequest) => Promise<void>;
  updateTournament: (id: number, data: UpdateTournamentRequest) => Promise<void>;
  deleteTournament: (id: number) => Promise<void>;
}

export const TournamentProvider: React.FC<{children: ReactNode}> = ({children}) => {
  // State management logic
  return (
    <TournamentContext.Provider value={/* ... */}>
      {children}
    </TournamentContext.Provider>
  );
};
```

#### Option B: Zustand (Recommended - simpler, better performance)
```typescript
// stores/useTournamentStore.ts
import create from 'zustand';

interface TournamentStore {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  fetchTournaments: () => Promise<void>;
  createTournament: (data: CreateTournamentRequest) => Promise<void>;
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournaments: [],
  loading: false,
  error: null,
  fetchTournaments: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Tournament[]>('/tournaments');
      set({ tournaments: data, loading: false, error: null });
    } catch (err) {
      set({ error: 'Failed to fetch tournaments', loading: false });
    }
  },
  createTournament: async (data) => {
    await api.post('/tournaments', data);
    // Optimistically update or refetch
  }
}));
```

**Benefits**:
- Eliminates prop drilling
- Centralized state updates
- Easier testing
- Better performance (fewer re-renders)
- Type-safe

**Files to Create**:
- `src/stores/useTournamentStore.ts`
- `src/stores/usePlayerStore.ts`
- `src/stores/useMatchStore.ts`
- `src/stores/useCourtStore.ts`
- `src/stores/useRegistrationStore.ts`

### 2. **API Client Architecture Refactor** (HIGH PRIORITY)
**Current**: Axios instance in `api/client.ts` with basic interceptor
**Issue**: No type safety, inconsistent error handling, scattered API calls

**Recommended Structure**:

```typescript
// api/client.ts - Enhanced base client
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE,
      timeout: 10000,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: any): ApiError {
    // Transform backend error to typed frontend error
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// api/tournaments.ts - Domain-specific API
export const tournamentsApi = {
  getAll: () => apiClient.get<Tournament[]>('/api/v1/tournaments'),
  getById: (id: number) => apiClient.get<Tournament>(`/api/v1/tournaments/${id}`),
  create: (data: CreateTournamentRequest) =>
    apiClient.post<Tournament>('/api/v1/tournaments', data),
  update: (id: number, data: UpdateTournamentRequest) =>
    apiClient.put<Tournament>(`/api/v1/tournaments/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<void>(`/api/v1/tournaments/${id}`),
  generateDraw: (id: number) =>
    apiClient.post<void>(`/api/v1/tournaments/${id}/generate-draw`)
};

// api/players.ts
export const playersApi = {
  getAll: () => apiClient.get<Player[]>('/api/v1/players'),
  // ... similar structure
};
```

**Benefits**:
- Type-safe API calls
- Centralized error handling
- Consistent error transformation
- Easier mocking for tests
- Single source of truth for endpoints

**Files to Create/Modify**:
- `src/api/client.ts` (enhance existing)
- `src/api/tournaments.ts` (new)
- `src/api/players.ts` (new)
- `src/api/courts.ts` (new)
- `src/api/matches.ts` (new)
- `src/api/registrations.ts` (new)
- `src/types/api.ts` (new - for error types)

### 3. **Custom Hooks for Reusability** (MEDIUM PRIORITY)
**Current**: Direct API calls in components
**Issue**: Code duplication, inconsistent loading/error states

**Recommended Hooks**:

```typescript
// hooks/useTournaments.ts
export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tournamentsApi.getAll();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const createTournament = async (data: CreateTournamentRequest) => {
    await tournamentsApi.create(data);
    await fetchTournaments(); // Refresh
  };

  const updateTournament = async (id: number, data: UpdateTournamentRequest) => {
    await tournamentsApi.update(id, data);
    await fetchTournaments();
  };

  const deleteTournament = async (id: number) => {
    await tournamentsApi.delete(id);
    await fetchTournaments();
  };

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament
  };
}

// hooks/usePlayers.ts
export function usePlayers() {
  // Similar pattern
}

// hooks/useFormDialog.ts
export function useFormDialog<T>(initialData: T) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<T>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(initialData);
    setOpen(true);
  };

  const openEdit = (id: number, data: T) => {
    setEditingId(id);
    setForm(data);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return {
    open, form, editingId,
    openNew, openEdit, close, handleChange, setForm
  };
}
```

**Files to Create**:
- `src/hooks/useTournaments.ts`
- `src/hooks/usePlayers.ts`
- `src/hooks/useCourts.ts`
- `src/hooks/useMatches.ts`
- `src/hooks/useRegistrations.ts`
- `src/hooks/useFormDialog.ts`
- `src/hooks/useConfirmDialog.ts`

### 4. **Form Handling with React Hook Form + Zod** (MEDIUM PRIORITY)
**Current**: Formik + Yup (only in Login)
**Issue**: Inconsistent validation across forms, verbose form code

**Recommended Approach**:

```typescript
// types/schemas.ts
import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  location: z.string().min(2, 'Location is required'),
  startDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'Start date must be in the future'),
  endDate: z.string(),
}).refine(data => {
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const playerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.enum(['M', 'F'], { errorMap: () => ({ message: 'Gender is required' }) }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;
export type PlayerFormData = z.infer<typeof playerSchema>;

// components/TournamentForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function TournamentForm({ onSave }: { onSave: (data: TournamentFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <TextField
        {...register('name')}
        label="Tournament Name"
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        {...register('location')}
        label="Location"
        error={!!errors.location}
        helperText={errors.location?.message}
      />
      <TextField
        {...register('startDate')}
        type="date"
        label="Start Date"
        error={!!errors.startDate}
        helperText={errors.startDate?.message}
      />
      <TextField
        {...register('endDate')}
        type="date"
        label="End Date"
        error={!!errors.endDate}
        helperText={errors.endDate?.message}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

**Benefits**:
- Better TypeScript integration
- Automatic type inference
- Comprehensive validation
- Less boilerplate
- Better error messages

**Dependencies to Add**:
```bash
npm install react-hook-form @hookform/resolvers zod
```

**Files to Create/Modify**:
- `src/types/schemas.ts` (new)
- `src/pages/Tournaments.tsx` (refactor to use react-hook-form)
- `src/pages/Players.tsx` (refactor)
- `src/pages/Courts.tsx` (refactor)
- `src/pages/Matches.tsx` (refactor)
- `src/pages/Registrations.tsx` (refactor)

### 5. **Enhanced Error Handling** (HIGH PRIORITY)
**Current**: Inconsistent error handling, no user feedback
**Issue**: Errors logged to console but not shown to users

**Recommended Approach**:

```typescript
// types/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response?.data) {
    const { code, message, details } = error.response.data;
    return new ApiError(
      code || 'UNKNOWN_ERROR',
      message || 'An error occurred',
      error.response.status,
      details
    );
  }

  if (error.request) {
    return new ApiError('NETWORK_ERROR', 'Network error occurred', 0);
  }

  return new ApiError('UNKNOWN_ERROR', error.message || 'Unknown error', 0);
}

// contexts/ErrorContext.tsx
interface ErrorContextType {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearError: () => void;
}

export const ErrorProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const clearError = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, clearError }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={clearError}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

// Usage in components
function TournamentPage() {
  const { showError, showSuccess } = useError();

  const handleSave = async (data: TournamentFormData) => {
    try {
      await tournamentsApi.create(data);
      showSuccess('Tournament created successfully');
    } catch (err) {
      const apiError = handleApiError(err);
      showError(apiError.message);
    }
  };
}
```

**Files to Create**:
- `src/types/errors.ts`
- `src/contexts/ErrorContext.tsx`
- `src/hooks/useError.ts`

### 6. **Component Organization Refactor** (MEDIUM PRIORITY)
**Current**: Flat structure
**Recommended**: Domain-driven organization

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/
│   │   ├── DataTable/
│   │   ├── FormField/
│   │   ├── ConfirmDialog/
│   │   └── LoadingSpinner/
│   ├── tournaments/         # Domain-specific
│   │   ├── TournamentList/
│   │   ├── TournamentForm/
│   │   └── TournamentDetail/
│   ├── players/
│   │   ├── PlayerList/
│   │   ├── PlayerForm/
│   │   └── PlayerCard/
│   ├── matches/
│   │   ├── MatchList/
│   │   ├── MatchForm/
│   │   └── MatchCard/
│   └── layout/              # Layout components
│       ├── Layout.tsx
│       ├── Navbar/
│       └── Sidebar/
├── pages/                   # Page components
├── hooks/                   # Custom hooks
├── api/                     # API clients
├── stores/                  # State management
├── types/                   # TypeScript types
│   ├── models.ts
│   ├── schemas.ts
│   └── errors.ts
├── utils/                   # Utility functions
└── contexts/                # React contexts
```

### 7. **Loading States & Skeletons** (LOW PRIORITY)
**Current**: No loading indicators
**Recommended**: Add loading states with skeleton screens

```typescript
// components/common/LoadingSpinner.tsx
export function LoadingSpinner() {
  return <CircularProgress />;
}

// components/common/TableSkeleton.tsx
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} />
      ))}
    </Stack>
  );
}

// Usage in pages
function TournamentsPage() {
  const { tournaments, loading } = useTournaments();

  if (loading) {
    return <TableSkeleton />;
  }

  return <CrudTable rows={tournaments} columns={columns} />;
}
```

### 8. **Confirmation Dialogs** (MEDIUM PRIORITY)
**Current**: No delete confirmation
**Recommended**: Confirmation dialog for destructive actions

```typescript
// hooks/useConfirmDialog.ts
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const confirm = (title: string, message: string, onConfirm: () => void) => {
    setConfig({ title, message, onConfirm });
    setOpen(true);
  };

  const handleConfirm = () => {
    config.onConfirm();
    setOpen(false);
  };

  return { open, config, confirm, handleConfirm, setOpen };
}

// components/common/ConfirmDialog.tsx
export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

// Usage
function TournamentsPage() {
  const { confirm, ...dialogProps } = useConfirmDialog();

  const handleDelete = (tournament: Tournament) => {
    confirm(
      'Delete Tournament',
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
      async () => {
        await tournamentsApi.delete(tournament.id);
        refetch();
      }
    );
  };

  return (
    <>
      {/* ... */}
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
```

### 9. **Performance Optimizations** (LOW PRIORITY)
**Recommended Improvements**:

```typescript
// React.memo for expensive components
export const CrudTable = React.memo(({ rows, columns, onRowClick }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.rows === nextProps.rows;
});

// useCallback for event handlers
const handleRowClick = useCallback((row: Tournament) => {
  // Logic
}, [/* dependencies */]);

// useMemo for expensive computations
const sortedTournaments = useMemo(() => {
  return tournaments.sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}, [tournaments]);

// Lazy loading for routes
const TournamentsPage = lazy(() => import('./pages/Tournaments'));
const PlayersPage = lazy(() => import('./pages/Players'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/players" element={<PlayersPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 10. **TypeScript Type Improvements** (MEDIUM PRIORITY)
**Current**: Basic types
**Recommended**: Comprehensive type definitions

```typescript
// types/models.ts
export interface Tournament {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  phone?: string;
}

export interface Match {
  id: number;
  tournamentId: number;
  courtId: number;
  player1Id: number;
  player2Id: number;
  score1?: number;
  score2?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledAt: string;
}

// Request/Response DTOs
export interface CreateTournamentRequest {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> {}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## Implementation Priority

### Phase 1 (Week 1) - Critical Foundations
1. **Enhanced API Client Architecture** - Refactor api/client.ts and create domain-specific API files
2. **Error Handling System** - Implement ErrorContext and user-facing error messages
3. **State Management** - Choose and implement either Context API or Zustand

### Phase 2 (Week 2) - UX Improvements
4. **Custom Hooks** - Extract reusable logic from components
5. **Form Handling** - Migrate to React Hook Form + Zod
6. **Confirmation Dialogs** - Add delete confirmations
7. **Loading States** - Add skeleton screens

### Phase 3 (Week 3) - Polish & Performance
8. **Component Organization** - Restructure file/folder organization
9. **TypeScript Improvements** - Add comprehensive type definitions
10. **Performance Optimizations** - Add React.memo, useCallback, useMemo where needed

---

## Dependencies to Add

```bash
# State management (choose one)
npm install zustand

# Form handling
npm install react-hook-form @hookform/resolvers zod

# Performance
npm install react-window  # For large lists (optional)

# Date handling (if adding date pickers)
npm install @mui/x-date-pickers dayjs
```

---

## Testing Recommendations

### Component Tests (React Testing Library)
```typescript
// __tests__/TournamentList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentList } from '../components/tournaments/TournamentList';

describe('TournamentList', () => {
  it('should display tournaments after loading', async () => {
    jest.spyOn(tournamentsApi, 'getAll').mockResolvedValue([
      { id: 1, name: 'Summer Tournament', startDate: '2025-06-01', endDate: '2025-06-03', location: 'Stadium' }
    ]);

    render(<TournamentList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Summer Tournament')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/tournaments.spec.ts
import { test, expect } from '@playwright/test';

test('admin can create tournament', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await page.click('text=Tournaments');
  await page.click('text=New');

  await page.fill('[name="name"]', 'Winter Championship');
  await page.fill('[name="location"]', 'Arena');
  await page.fill('[name="startDate"]', '2025-12-01');
  await page.fill('[name="endDate"]', '2025-12-03');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=Winter Championship')).toBeVisible();
});
```

---

**For Questions**: See main project context at [../CLAUDE.md](../CLAUDE.md)
