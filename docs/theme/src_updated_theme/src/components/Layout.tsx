import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip } from '@mui/material'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  EmojiEvents,
  Category as CategoryIcon,
  Person,
  SportsBasketball,
  SportsScore,
  HowToReg,
  Schedule,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Science as DemoIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../theme/ThemeProvider'
import { RoleGuard } from './common/RoleGuard'
import { RoleBadge } from './common/RoleBadge'

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggleTheme } = useThemeMode()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Badminton Admin
          </Typography>

          {/* Dashboard - Everyone */}
          <Button
            color="inherit"
            component={Link}
            to="/dashboard"
            startIcon={<DashboardIcon />}
            sx={{
              backgroundColor: isActive('/dashboard') ? 'primary.main' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/dashboard') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Dashboard
          </Button>

          {/* Demo - Everyone */}
          <Button
            color="inherit"
            component={Link}
            to="/demo"
            startIcon={<DemoIcon />}
            sx={{
              backgroundColor: location.pathname.startsWith('/demo') ? 'primary.main' : 'transparent',
              '&:hover': {
                backgroundColor: location.pathname.startsWith('/demo') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Demo
          </Button>

          {/* Admin-only navigation */}
          <RoleGuard roles={['SYSTEM_ADMIN']}>
            <Button
              color="inherit"
              component={Link}
              to="/tournaments"
              startIcon={<EmojiEvents />}
              sx={{
                backgroundColor: isActive('/tournaments') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/tournaments') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Tournaments
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/categories"
              startIcon={<CategoryIcon />}
              sx={{
                backgroundColor: isActive('/categories') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/categories') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Categories
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/players"
              startIcon={<Person />}
              sx={{
                backgroundColor: isActive('/players') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/players') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Players
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/courts"
              startIcon={<SportsBasketball />}
              sx={{
                backgroundColor: isActive('/courts') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/courts') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Courts
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/scheduler"
              startIcon={<Schedule />}
              sx={{
                backgroundColor: isActive('/scheduler') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/scheduler') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Scheduler
            </Button>
          </RoleGuard>

          {/* Admin or Referee navigation */}
          <RoleGuard roles={['SYSTEM_ADMIN', 'REFEREE']}>
            <Button
              color="inherit"
              component={Link}
              to="/matches"
              startIcon={<SportsScore />}
              sx={{
                backgroundColor: isActive('/matches') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/matches') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Matches
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/registrations"
              startIcon={<HowToReg />}
              sx={{
                backgroundColor: isActive('/registrations') ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('/registrations') ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Registrations
            </Button>
          </RoleGuard>

          {/* Role Badge */}
          <RoleBadge />

          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutIcon />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
