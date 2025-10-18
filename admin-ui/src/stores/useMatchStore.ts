import { create } from 'zustand'
import api from '../api/client'

export interface Match {
  id: number
  tournament: any
  court: any
  player1: any
  player2: any
  score1?: number
  score2?: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  scheduledAt: string
}

interface MatchState {
  matches: Match[]
  loading: boolean
  error: string | null

  fetchMatches: () => Promise<void>
  createMatch: (match: any) => Promise<void>
  updateMatch: (id: number, match: any) => Promise<void>
  deleteMatch: (id: number) => Promise<void>
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get<Match[]>('/api/v1/matches')
      set({ matches: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch matches', loading: false })
      throw error
    }
  },

  createMatch: async (match) => {
    try {
      const response = await api.post<Match>('/api/v1/matches', match)
      set((state) => ({
        matches: [...state.matches, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateMatch: async (id, match) => {
    try {
      const response = await api.put<Match>(`/api/v1/matches/${id}`, match)
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteMatch: async (id) => {
    try {
      await api.delete(`/api/v1/matches/${id}`)
      set((state) => ({
        matches: state.matches.filter((m) => m.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
