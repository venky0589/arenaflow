import { CssBaseline, Container } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Tournaments } from './pages/Tournaments'
import { Matches } from './pages/Matches'
import { Registrations } from './pages/Registrations'
import { Brackets } from './pages/Brackets'
import { Login } from './pages/Login'

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
