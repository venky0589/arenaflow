import { Container } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './auth/Login'
import { RequireAuth } from './auth/RequireAuth'
import { Dashboard } from './pages/Dashboard'
import { Tournaments } from './pages/Tournaments'
import { Categories } from './pages/Categories'
import { Players } from './pages/Players'
import { Courts } from './pages/Courts'
import { Matches } from './pages/Matches'
import { Registrations } from './pages/Registrations'
import { MatchScheduler } from './pages/MatchScheduler'
import { GlobalSnackbar } from './components/GlobalSnackbar'
import { Unauthorized } from './pages/Unauthorized'
import TournamentPeople from './pages/TournamentPeople'
import DemoHome from './pages/demo/index'
import TeamRegistrationDemo from './pages/demo/TeamRegistrationDemo'
import RegistrationsGridDemo from './pages/demo/RegistrationsGridDemo'
import TeamLabelsDemo from './pages/demo/TeamLabelsDemo'
import BracketsDemo from './pages/demo/BracketsDemo'
import DesignTokensDemo from './pages/demo/DesignTokensDemo'

export default function App() {
  return (
    <>
      <GlobalSnackbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Container maxWidth="sm"><Login /></Container>} />

        {/* Auth-only routes (no role restriction) */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Demo routes - accessible to all authenticated users */}
          <Route path="/demo" element={<DemoHome />} />
          <Route path="/demo/team-registration" element={<TeamRegistrationDemo />} />
          <Route path="/demo/registrations-grid" element={<RegistrationsGridDemo />} />
          <Route path="/demo/team-labels" element={<TeamLabelsDemo />} />
          <Route path="/demo/brackets" element={<BracketsDemo />} />
          <Route path="/demo/design-tokens" element={<DesignTokensDemo />} />
        </Route>

        {/* SYSTEM_ADMIN-only routes */}
        <Route element={<RequireAuth roles={['SYSTEM_ADMIN']}><Layout /></RequireAuth>}>
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/players" element={<Players />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/scheduler" element={<MatchScheduler />} />
        </Route>

        {/* Tournament People - requires tournament-scoped permission check */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/tournaments/:tournamentId/people" element={<TournamentPeople />} />
        </Route>

        {/* SYSTEM_ADMIN or REFEREE routes */}
        <Route element={<RequireAuth roles={['SYSTEM_ADMIN', 'REFEREE']}><Layout /></RequireAuth>}>
          <Route path="/matches" element={<Matches />} />
          <Route path="/registrations" element={<Registrations />} />
        </Route>
      </Routes>
    </>
  )
}
