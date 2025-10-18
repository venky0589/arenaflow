import { create } from 'zustand'
import api from '../api/client'

export interface Player {
  id: number
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  phone?: string
}

interface PlayerState {
  players: Player[]
  loading: boolean
  error: string | null

  fetchPlayers: () => Promise<void>
  createPlayer: (player: Omit<Player, 'id'>) => Promise<void>
  updatePlayer: (id: number, player: Partial<Player>) => Promise<void>
  deletePlayer: (id: number) => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],
  loading: false,
  error: null,

  fetchPlayers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get<Player[]>('/api/v1/players')
      set({ players: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch players', loading: false })
      throw error
    }
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
