import { create } from 'zustand'
import api from '../api/client'

export interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
}

interface TournamentState {
  tournaments: Tournament[]
  loading: boolean
  error: string | null

  fetchTournaments: () => Promise<void>
  createTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>
  updateTournament: (id: number, tournament: Partial<Tournament>) => Promise<void>
  deleteTournament: (id: number) => Promise<void>
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  loading: false,
  error: null,

  fetchTournaments: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get<Tournament[]>('/api/v1/tournaments')
      set({ tournaments: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch tournaments', loading: false })
      throw error
    }
  },

  createTournament: async (tournament) => {
    try {
      const response = await api.post<Tournament>('/api/v1/tournaments', tournament)
      set((state) => ({
        tournaments: [...state.tournaments, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateTournament: async (id, tournament) => {
    try {
      const response = await api.put<Tournament>(`/api/v1/tournaments/${id}`, tournament)
      set((state) => ({
        tournaments: state.tournaments.map((t) => (t.id === id ? response.data : t)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteTournament: async (id) => {
    try {
      await api.delete(`/api/v1/tournaments/${id}`)
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
