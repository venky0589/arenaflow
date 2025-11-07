import { create } from 'zustand'
import api from '../api/client'

interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
  status?: string
}

interface DashboardStats {
  ongoingTournaments: number
  upcomingTournaments: number
  completedTournaments: number
  totalPlayers: number
  totalMatches: number
}

interface DashboardState {
  stats: DashboardStats
  recentTournaments: Tournament[]
  loading: boolean
  error: string | null

  fetchDashboardData: () => Promise<void>
  clearError: () => void
}

// Helper function to determine tournament status based on dates
const getTournamentStatus = (startDate: string, endDate: string): string => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) {
    return 'UPCOMING'
  } else if (now >= start && now <= end) {
    return 'ONGOING'
  } else {
    return 'COMPLETED'
  }
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    ongoingTournaments: 0,
    upcomingTournaments: 0,
    completedTournaments: 0,
    totalPlayers: 0,
    totalMatches: 0,
  },
  recentTournaments: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null })
    try {
      // Fetch all required data in parallel
      const [tournamentsRes, playersRes, matchesRes] = await Promise.all([
        api.get('/api/v1/tournaments'),
        api.get('/api/v1/players'),
        api.get('/api/v1/matches'),
      ])

      const tournaments = tournamentsRes.data
      const players = playersRes.data
      const matches = matchesRes.data

      // Calculate stats
      let ongoingCount = 0
      let upcomingCount = 0
      let completedCount = 0

      const tournamentsWithStatus = tournaments.map((t: Tournament) => {
        const status = getTournamentStatus(t.startDate, t.endDate)

        // Count tournaments by status
        if (status === 'ONGOING') ongoingCount++
        if (status === 'UPCOMING') upcomingCount++
        if (status === 'COMPLETED') completedCount++

        return { ...t, status }
      })

      // Sort tournaments by start date (most recent first)
      const sortedTournaments = [...tournamentsWithStatus].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })

      // Get recent tournaments (last 5)
      const recentTournaments = sortedTournaments.slice(0, 5)

      set({
        stats: {
          ongoingTournaments: ongoingCount,
          upcomingTournaments: upcomingCount,
          completedTournaments: completedCount,
          totalPlayers: Array.isArray(players) ? players.length : 0,
          totalMatches: Array.isArray(matches) ? matches.length : 0,
        },
        recentTournaments,
        loading: false,
      })
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      set({
        error: error.response?.data?.message || 'Failed to load dashboard data',
        loading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))
