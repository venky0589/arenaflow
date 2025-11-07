import { create } from 'zustand'
import api from '../api/client'
import { Tournament, PageableResponse } from '../types'

interface TournamentState {
  tournaments: Tournament[]
  loading: boolean
  error: string | null
  // Pagination state
  page: number
  size: number
  totalPages: number
  totalElements: number

  fetchTournaments: (page?: number, size?: number) => Promise<void>
  createTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>
  updateTournament: (id: number, tournament: Partial<Tournament>) => Promise<void>
  deleteTournament: (id: number) => Promise<void>
  setPage: (page: number) => void
  setSize: (size: number) => void
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchTournaments: async (page?: number, size?: number) => {
    const currentPage = page ?? get().page
    const currentSize = size ?? get().size

    set({ loading: true, error: null })
    try {
      const response = await api.get<PageableResponse<Tournament>>(
        `/api/v1/tournaments?page=${currentPage}&size=${currentSize}`
      )
      set({
        tournaments: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
        size: response.data.size,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch tournaments', loading: false })
      throw error
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchTournaments(page)
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
    get().fetchTournaments(0, size)
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
