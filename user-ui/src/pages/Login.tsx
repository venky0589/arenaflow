import { useState } from 'react'
import { Button, Paper, TextField, Typography, Stack } from '@mui/material'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('user1@example.com')
  const [password, setPassword] = useState('pass123')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 6 }} elevation={3}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained">Login</Button>
        </Stack>
      </form>
    </Paper>
  )
}
