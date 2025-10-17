import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export function Layout() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin</Typography>
          <Button color="inherit" component={Link} to="/tournaments">Tournaments</Button>
          <Button color="inherit" component={Link} to="/players">Players</Button>
          <Button color="inherit" component={Link} to="/courts">Courts</Button>
          <Button color="inherit" component={Link} to="/matches">Matches</Button>
          <Button color="inherit" component={Link} to="/registrations">Registrations</Button>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
