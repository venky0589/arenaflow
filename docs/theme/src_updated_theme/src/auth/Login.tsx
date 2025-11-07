import { useState } from 'react'
import { Button, Paper, TextField, Typography, Stack } from '@mui/material'
import api from '../api/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoginResponse } from '../types/auth'

export function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post<LoginResponse>('/api/v1/auth/login', { email, password })
      const { token, email: userEmail, roles } = res.data

      // Store authentication data
      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', userEmail)
      localStorage.setItem('userRoles', JSON.stringify(roles))

      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 6 }} elevation={3}>
      <Typography variant="h5" gutterBottom>Admin Login</Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained">Login</Button>
        </Stack>
      </form>
    </Paper>
  )
}
