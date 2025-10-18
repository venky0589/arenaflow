import { create } from 'zustand'
import api from '../api/client'

export interface Court {
  id: number
  name: string
  locationNote: string
}

interface CourtState {
  courts: Court[]
  loading: boolean
  error: string | null

  fetchCourts: () => Promise<void>
  createCourt: (court: Omit<Court, 'id'>) => Promise<void>
  updateCourt: (id: number, court: Partial<Court>) => Promise<void>
  deleteCourt: (id: number) => Promise<void>
}

export const useCourtStore = create<CourtState>((set, get) => ({
  courts: [],
  loading: false,
  error: null,

  fetchCourts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get<Court[]>('/api/v1/courts')
      set({ courts: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch courts', loading: false })
      throw error
    }
  },

  createCourt: async (court) => {
    try {
      const response = await api.post<Court>('/api/v1/courts', court)
      set((state) => ({
        courts: [...state.courts, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateCourt: async (id, court) => {
    try {
      const response = await api.put<Court>(`/api/v1/courts/${id}`, court)
      set((state) => ({
        courts: state.courts.map((c) => (c.id === id ? response.data : c)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteCourt: async (id) => {
    try {
      await api.delete(`/api/v1/courts/${id}`)
      set((state) => ({
        courts: state.courts.filter((c) => c.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
