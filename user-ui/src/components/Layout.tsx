import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'

export function Layout({ children }:{ children: React.ReactNode }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">Tournament App</Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/tournaments">Tournaments</Button>
          <Button color="inherit" component={Link} to="/matches">Matches</Button>
          <Button color="inherit" component={Link} to="/brackets">Brackets</Button>
          <Button color="inherit" component={Link} to="/registrations">My Registrations</Button>
          {!token ? (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          ) : (
            <Button color="inherit" onClick={logout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  )
}
