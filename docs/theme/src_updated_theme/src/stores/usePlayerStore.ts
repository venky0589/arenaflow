import { create } from 'zustand'
import api from '../api/client'
import { Player, PageableResponse } from '../types'

interface PlayerState {
  players: Player[]
  loading: boolean
  error: string | null
  // Pagination state
  page: number
  size: number
  totalPages: number
  totalElements: number

  fetchPlayers: (page?: number, size?: number) => Promise<void>
  createPlayer: (player: Omit<Player, 'id'>) => Promise<void>
  updatePlayer: (id: number, player: Partial<Player>) => Promise<void>
  deletePlayer: (id: number) => Promise<void>
  setPage: (page: number) => void
  setSize: (size: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchPlayers: async (page?: number, size?: number) => {
    const currentPage = page ?? get().page
    const currentSize = size ?? get().size

    set({ loading: true, error: null })
    try {
      const response = await api.get<PageableResponse<Player>>(
        `/api/v1/players?page=${currentPage}&size=${currentSize}`
      )
      set({
        players: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
        size: response.data.size,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch players', loading: false })
      throw error
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchPlayers(page)
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
    get().fetchPlayers(0, size)
  },

  createPlayer: async (player) => {
    try {
      const response = await api.post<Player>('/api/v1/players', player)
      set((state) => ({
        players: [...state.players, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updatePlayer: async (id, player) => {
    try {
      const response = await api.put<Player>(`/api/v1/players/${id}`, player)
      set((state) => ({
        players: state.players.map((p) => (p.id === id ? response.data : p)),
      }))
    } catch (error) {
      throw error
    }
  },

  deletePlayer: async (id) => {
    try {
      await api.delete(`/api/v1/players/${id}`)
      set((state) => ({
        players: state.players.filter((p) => p.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
