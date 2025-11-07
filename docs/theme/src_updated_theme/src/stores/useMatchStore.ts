import { create } from 'zustand'
import api from '../api/client'
import { Match, PageableResponse } from '../types'

interface MatchState {
  matches: Match[]
  loading: boolean
  error: string | null
  // Pagination state
  page: number
  size: number
  totalPages: number
  totalElements: number

  fetchMatches: (page?: number, size?: number) => Promise<void>
  createMatch: (match: any) => Promise<void>
  updateMatch: (id: number, match: any) => Promise<void>
  deleteMatch: (id: number) => Promise<void>
  setPage: (page: number) => void
  setSize: (size: number) => void

  // Match Status Workflow methods
  startMatch: (id: number) => Promise<Match>
  updateScore: (id: number, score1: number, score2: number) => Promise<Match>
  completeMatch: (id: number) => Promise<Match>
  markWalkover: (id: number, reason: string, winnerId: number) => Promise<Match>
  markRetired: (id: number, reason: string, winnerId: number) => Promise<Match>
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchMatches: async (page?: number, size?: number) => {
    const currentPage = page ?? get().page
    const currentSize = size ?? get().size

    set({ loading: true, error: null })
    try {
      const response = await api.get<PageableResponse<Match>>(
        `/api/v1/matches?page=${currentPage}&size=${currentSize}`
      )
      set({
        matches: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
        size: response.data.size,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch matches', loading: false })
      throw error
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchMatches(page)
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
    get().fetchMatches(0, size)
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

  // Match Status Workflow methods
  startMatch: async (id) => {
    try {
      const response = await api.post<Match>(`/api/v1/matches/${id}/start`)
      // Update match in store
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateScore: async (id, score1, score2) => {
    try {
      const response = await api.put<Match>(`/api/v1/matches/${id}/score`, {
        score1,
        score2
      })
      // Update match in store
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
      return response.data
    } catch (error: any) {
      // Handle optimistic lock conflict
      if (error.response?.status === 409) {
        const errorData = error.response.data
        if (errorData.code === 'OPTIMISTIC_LOCK') {
          // Re-fetch the match to get latest version
          try {
            const refreshed = await api.get<Match>(`/api/v1/matches/${id}`)
            set((state) => ({
              matches: state.matches.map((m) => (m.id === id ? refreshed.data : m)),
            }))
          } catch (refreshError) {
            // Ignore refresh errors
          }
        }
      }
      throw error
    }
  },

  completeMatch: async (id) => {
    try {
      const response = await api.post<Match>(`/api/v1/matches/${id}/complete`)
      // Update match in store
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
      return response.data
    } catch (error) {
      throw error
    }
  },

  markWalkover: async (id, reason, winnerId) => {
    try {
      const response = await api.post<Match>(`/api/v1/matches/${id}/walkover`, {
        reason,
        winnerId
      })
      // Update match in store
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
      return response.data
    } catch (error) {
      throw error
    }
  },

  markRetired: async (id, reason, winnerId) => {
    try {
      const response = await api.post<Match>(`/api/v1/matches/${id}/retired`, {
        reason,
        winnerId
      })
      // Update match in store
      set((state) => ({
        matches: state.matches.map((m) => (m.id === id ? response.data : m)),
      }))
      return response.data
    } catch (error) {
      throw error
    }
  },
}))
