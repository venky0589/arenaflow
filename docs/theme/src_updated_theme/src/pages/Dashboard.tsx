import { useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  IconButton,
} from '@mui/material'
import {
  EmojiEvents,
  CalendarToday,
  CheckCircle,
  People,
  SportsHandball,
  Refresh,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/dashboard/StatCard'
import { useDashboardStore } from '../stores/useDashboardStore'

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Get status chip color
const getStatusColor = (status: string): 'primary' | 'info' | 'success' | 'default' => {
  switch (status?.toUpperCase()) {
    case 'ONGOING':
      return 'primary' // Orange
    case 'UPCOMING':
      return 'info' // Blue
    case 'COMPLETED':
      return 'success' // Green
    default:
      return 'default'
  }
}

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'ONGOING':
      return 'Ongoing'
    case 'UPCOMING':
      return 'Upcoming'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

export function Dashboard() {
  const { stats, recentTournaments, loading, error, fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <IconButton onClick={fetchDashboardData} disabled={loading} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Ongoing Tournaments"
            value={stats.ongoingTournaments}
            icon={<EmojiEvents sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Upcoming Tournaments"
            value={stats.upcomingTournaments}
            icon={<CalendarToday sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Completed Tournaments"
            value={stats.completedTournaments}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Registered Players"
            value={stats.totalPlayers}
            icon={<People sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Matches Played"
            value={stats.totalMatches}
            icon={<SportsHandball sx={{ fontSize: 40 }} />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Recent Tournament Activity */}
      <Box>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Recent Tournament Activity
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>TOURNAMENT NAME</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DATES</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>NO. OF PLAYERS</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : recentTournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No tournaments found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recentTournaments.map((tournament) => (
                  <TableRow
                    key={tournament.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(254, 248, 232, 0.05)',
                      },
                    }}
                  >
                    <TableCell>{tournament.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(tournament.status || 'Unknown')}
                        color={getStatusColor(tournament.status || '')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/tournaments`}
                        size="small"
                        sx={{
                          color: 'primary.main',
                          textTransform: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
