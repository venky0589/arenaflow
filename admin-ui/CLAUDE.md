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

**For Questions**: See main project context at [../CLAUDE.md](../CLAUDE.md)
