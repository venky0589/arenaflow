import { CssBaseline, Container } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './auth/Login'
import { RequireAuth } from './auth/RequireAuth'
import { Tournaments } from './pages/Tournaments'
import { Players } from './pages/Players'
import { Courts } from './pages/Courts'
import { Matches } from './pages/Matches'
import { Registrations } from './pages/Registrations'
import { GlobalSnackbar } from './components/GlobalSnackbar'

export default function App() {
  return (
    <>
      <CssBaseline />
      <GlobalSnackbar />
      <Routes>
        <Route path="/login" element={<Container maxWidth="sm"><Login /></Container>} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/tournaments" replace />} />
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
